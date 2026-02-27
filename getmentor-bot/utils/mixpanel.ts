const Mixpanel = require("mixpanel");

type AnalyticsProperties = Record<string, unknown>;

const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;
const EVENT_VERSION = process.env.MIXPANEL_EVENT_VERSION || "v1";
const SOURCE_SYSTEM = "bot";
const ENVIRONMENT = process.env.APP_ENV || process.env.NODE_ENV || "unknown";

const blockedPropertyFragments = [
    "email",
    "name",
    "telegram",
    "code",
    "description",
    "review",
];

const mixpanelClient = MIXPANEL_TOKEN
    ? Mixpanel.init(MIXPANEL_TOKEN, { protocol: "https" })
    : null;

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
    return blockedPropertyFragments.some((fragment) => normalized.includes(fragment));
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
    if (!mixpanelClient || !eventName) {
        return;
    }

    try {
        mixpanelClient.track(eventName, {
            ...sanitizeProperties(properties),
            distinct_id: distinctId(mentorId, chatId),
            source_system: SOURCE_SYSTEM,
            environment: ENVIRONMENT,
            event_version: EVENT_VERSION,
        });
    } catch (error) {
        console.warn("[Bot Analytics] Mixpanel track failed", eventName, error);
    }
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
