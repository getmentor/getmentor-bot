export const Sentry = require("@sentry/node");
Sentry.init({
    dsn: process.env["SENTRY_CLIENT_KEY"],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.3 : 1.0,
    release: "v0.1.0"
});