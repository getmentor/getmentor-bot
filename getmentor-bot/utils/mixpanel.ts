const Mixpanel = require("mixpanel");
const https = require("https");
const URLParser = require("url").URL;

type AnalyticsProperties = Record<string, unknown>;
type QueuedEvent = {
    eventName: string;
    payload: AnalyticsProperties;
};

type AnalyticsProvider = "none" | "mixpanel" | "posthog" | "dual";

const SOURCE_SYSTEM = "bot";
const ENVIRONMENT = process.env.APP_ENV || process.env.NODE_ENV || "unknown";
const EVENT_VERSION = process.env.ANALYTICS_EVENT_VERSION || process.env.MIXPANEL_EVENT_VERSION || "v1";
const MAX_QUEUE_SIZE = Number(process.env.ANALYTICS_QUEUE_SIZE || process.env.MIXPANEL_QUEUE_SIZE || process.env.POSTHOG_QUEUE_SIZE || 200);
const REQUEST_TIMEOUT_MS = Number(process.env.ANALYTICS_REQUEST_TIMEOUT_MS || process.env.POSTHOG_REQUEST_TIMEOUT_MS || 3000);

const MIXPANEL_TOKEN = (process.env.MIXPANEL_TOKEN || "").trim();

const POSTHOG_API_KEY = (process.env.POSTHOG_API_KEY || "").trim();
const POSTHOG_CAPTURE_ENDPOINT = buildPostHogCaptureEndpoint(
    process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    process.env.POSTHOG_CAPTURE_ENDPOINT || ""
);
const POSTHOG_DISABLE_GEOIP = (process.env.POSTHOG_DISABLE_GEOIP || "true").toLowerCase() !== "false";

const ANALYTICS_PROVIDER = (process.env.ANALYTICS_PROVIDER || "").trim().toLowerCase();

const trackQueue: QueuedEvent[] = [];
let isFlushingQueue = false;

const blockedPropertyKeys = new Set([
    "email",
    "mentoremail",
    "moderatoremail",
    "name",
    "mentorname",
    "moderatorname",
    "telegram",
    "telegramusername",
    "description",
    "review",
    "mentorreview",
    "platformreview",
    "improvements",
    "secretcode",
    "authcode",
    "loginurl",
]);

const mixpanelClient = MIXPANEL_TOKEN
    ? Mixpanel.init(MIXPANEL_TOKEN, { protocol: "https" })
    : null;

function resolveProvider(): AnalyticsProvider {
    const explicit = ANALYTICS_PROVIDER;
    const hasMixpanel = mixpanelClient !== null;
    const hasPostHog = POSTHOG_API_KEY !== "" && POSTHOG_CAPTURE_ENDPOINT !== "";

    if (explicit === "none") return "none";
    if (explicit === "mixpanel") return hasMixpanel ? "mixpanel" : "none";
    if (explicit === "posthog") return hasPostHog ? "posthog" : "none";
    if (explicit === "dual") {
        if (hasMixpanel && hasPostHog) return "dual";
        if (hasMixpanel) return "mixpanel";
        if (hasPostHog) return "posthog";
        return "none";
    }

    if (hasMixpanel && hasPostHog) return "dual";
    if (hasMixpanel) return "mixpanel";
    if (hasPostHog) return "posthog";
    return "none";
}

const provider = resolveProvider();

export const analyticsEvents = {
    BOT_MENU_OPENED: "bot_menu_opened",
    BOT_ANONYMOUS_ACCESS_BLOCKED: "bot_anonymous_access_blocked",
    BOT_STARTED: "bot_started",
    MENTOR_BOT_SECRET_CODE_SUBMITTED: "mentor_bot_secret_code_submitted",
    MENTOR_PROFILE_STATUS_CHANGED: "mentor_profile_status_changed",
    MENTOR_REQUEST_STATUS_UPDATED: "mentor_request_status_updated",
    MENTOR_REQUEST_REVIEW_VIEWED: "mentor_request_review_viewed",
    BOT_ERROR: "bot_error",
} as const;

function normalizePropertyKey(key: string): string {
    return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isBlockedProperty(key: string): boolean {
    const normalized = normalizePropertyKey(key);
    return blockedPropertyKeys.has(normalized);
}

function sanitizeProperties(properties: AnalyticsProperties = {}): AnalyticsProperties {
    const sanitized: AnalyticsProperties = {};

    for (const [key, value] of Object.entries(properties)) {
        if (!key || value === undefined || value === null || isBlockedProperty(key)) {
            continue;
        }

        if (typeof value === "string") {
            const trimmed = value.trim();
            sanitized[key] = trimmed.length <= 512 ? trimmed : trimmed.slice(0, 512);
            continue;
        }

        sanitized[key] = value;
    }

    return sanitized;
}

function distinctId(mentorId: string | number | undefined, chatId: string | number): string {
    if (mentorId) {
        return `mentor:${mentorId}`;
    }
    return `tg_chat:${chatId}`;
}

function trackEvent(
    eventName: string,
    mentorId: string | number | undefined,
    chatId: string | number,
    properties: AnalyticsProperties = {}
): void {
    if (provider === "none" || !eventName) {
        return;
    }

    enqueueEvent({
        eventName: eventName,
        payload: {
            ...sanitizeProperties(properties),
            distinct_id: distinctId(mentorId, chatId),
            source_system: SOURCE_SYSTEM,
            environment: ENVIRONMENT,
            event_version: EVENT_VERSION,
        },
    });
}

function enqueueEvent(event: QueuedEvent): void {
    if (trackQueue.length >= MAX_QUEUE_SIZE) {
        trackQueue.shift();
        console.warn("[Bot Analytics] Queue is full, dropping oldest event");
    }
    trackQueue.push(event);
    scheduleFlush();
}

function scheduleFlush(): void {
    if (isFlushingQueue) {
        return;
    }
    isFlushingQueue = true;
    setImmediate(() => {
        void flushQueue();
    });
}

async function flushQueue(): Promise<void> {
    try {
        while (trackQueue.length > 0) {
            const nextEvent = trackQueue.shift();
            if (!nextEvent) {
                break;
            }

            await sendEvent(nextEvent);
        }
    } finally {
        isFlushingQueue = false;
        if (trackQueue.length > 0) {
            scheduleFlush();
        }
    }
}

async function sendEvent(event: QueuedEvent): Promise<void> {
    if (provider === "mixpanel") {
        await sendMixpanelEvent(event);
        return;
    }

    if (provider === "posthog") {
        await sendPostHogEvent(event);
        return;
    }

    if (provider === "dual") {
        await Promise.allSettled([
            sendMixpanelEvent(event),
            sendPostHogEvent(event),
        ]);
    }
}

function sendMixpanelEvent(event: QueuedEvent): Promise<void> {
    if (!mixpanelClient) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        try {
            mixpanelClient.track(event.eventName, event.payload, (error: unknown) => {
                if (error) {
                    console.warn("[Bot Analytics] Mixpanel track failed", event.eventName, error);
                }
                resolve();
            });
        } catch (error) {
            console.warn("[Bot Analytics] Mixpanel track failed", event.eventName, error);
            resolve();
        }
    });
}

function sendPostHogEvent(event: QueuedEvent): Promise<void> {
    if (!POSTHOG_API_KEY || !POSTHOG_CAPTURE_ENDPOINT) {
        return Promise.resolve();
    }

    const payload = {
        api_key: POSTHOG_API_KEY,
        event: event.eventName,
        distinct_id: event.payload.distinct_id,
        timestamp: new Date().toISOString(),
        disable_geoip: POSTHOG_DISABLE_GEOIP,
        properties: {
            ...event.payload,
        },
    };

    return postJSON(POSTHOG_CAPTURE_ENDPOINT, payload, event.eventName);
}

function postJSON(endpoint: string, payload: Record<string, unknown>, eventName: string): Promise<void> {
    return new Promise((resolve) => {
        try {
            const url = new URLParser(endpoint);
            const body = JSON.stringify(payload);
            const request = https.request(
                {
                    protocol: url.protocol,
                    hostname: url.hostname,
                    port: url.port || undefined,
                    path: `${url.pathname}${url.search}`,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(body),
                        "Accept": "application/json",
                    },
                    timeout: REQUEST_TIMEOUT_MS,
                },
                (response: any) => {
                    if (response.statusCode && response.statusCode >= 300) {
                        console.warn("[PostHog] Non-success response", response.statusCode, eventName);
                    }
                    response.resume();
                    resolve();
                }
            );

            request.on("timeout", () => {
                request.destroy(new Error("request timeout"));
            });

            request.on("error", (error: unknown) => {
                console.warn("[PostHog] Failed to send event", eventName, error);
                resolve();
            });

            request.write(body);
            request.end();
        } catch (error) {
            console.warn("[PostHog] Failed to send event", eventName, error);
            resolve();
        }
    });
}

function buildPostHogCaptureEndpoint(host: string, endpoint: string): string {
    const override = (endpoint || "").trim();
    if (override) {
        return override;
    }

    const normalizedHost = (host || "").trim();
    if (!normalizedHost) {
        return "";
    }

    return `${normalizedHost.replace(/\/+$/, "")}/capture/`;
}

export const botAnalytics = {
    trackMenuOpened(chatId: number, mentorId: string | number | undefined, menu: string): void {
        trackEvent(analyticsEvents.BOT_MENU_OPENED, mentorId, chatId, {
            menu: menu,
        });
    },

    trackAnonymousAccessBlocked(chatId: number): void {
        trackEvent(analyticsEvents.BOT_ANONYMOUS_ACCESS_BLOCKED, undefined, chatId, {
            outcome: "blocked",
        });
    },

    trackStart(chatId: number, hasCode: boolean): void {
        trackEvent(analyticsEvents.BOT_STARTED, undefined, chatId, {
            has_code: hasCode,
        });
    },

    trackSecretCodeSubmitted(
        chatId: number,
        mentorId: string | number | undefined,
        outcome: "accepted" | "declined"
    ): void {
        trackEvent(analyticsEvents.MENTOR_BOT_SECRET_CODE_SUBMITTED, mentorId, chatId, {
            outcome: outcome,
        });
    },

    trackProfileStatusChanged(
        chatId: number,
        mentorId: string | number,
        newStatus: "active" | "inactive",
        success: boolean
    ): void {
        trackEvent(analyticsEvents.MENTOR_PROFILE_STATUS_CHANGED, mentorId, chatId, {
            status: newStatus,
            outcome: success ? "success" : "failed",
        });
    },

    trackRequestStatusUpdated(
        chatId: number,
        mentorId: string | number,
        requestId: string | number,
        status: string,
        outcome: "success" | "failed"
    ): void {
        trackEvent(analyticsEvents.MENTOR_REQUEST_STATUS_UPDATED, mentorId, chatId, {
            request_id: requestId,
            status: status,
            outcome: outcome,
        });
    },

    trackRequestReviewViewed(
        chatId: number,
        mentorId: string | number,
        requestId: string | number
    ): void {
        trackEvent(analyticsEvents.MENTOR_REQUEST_REVIEW_VIEWED, mentorId, chatId, {
            request_id: requestId,
        });
    },

    trackBotError(chatId: number, mentorId: string | number | undefined, errorType: string): void {
        trackEvent(analyticsEvents.BOT_ERROR, mentorId, chatId, {
            error_type: errorType,
        });
    },
};
