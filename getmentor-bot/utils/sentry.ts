import { appInsights } from "./appInsights";

export const Sentry = require("@sentry/node");
Sentry.init({
    dsn: process.env["SENTRY_CLIENT_KEY"],
});

export function reportError(error: any) {
    console.error(error);
    Sentry.captureException(error);
    appInsights.defaultClient.trackException({ exception: error })
}