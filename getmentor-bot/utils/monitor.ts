import { appInsights } from "./appInsights";
import { Sentry } from "./sentry";

export function reportError(error: any) {
    console.error(error);
    Sentry.captureException(error);
    appInsights.defaultClient.trackException({ exception: error })
}