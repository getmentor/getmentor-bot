import { MentorStatus } from "../models/Mentor";
import { stringsStart } from "../strings/start";
import { mixpanel } from "../utils/mixpanel";
import { MentorContext } from "./MentorContext";

export function blockAnonymousMiddleware(ctx: MentorContext, next) {
    // Proceed next only if mentor defined
    if ( ctx.mentor ) {
        if (ctx.mentor.status === MentorStatus.active ||
            ctx.mentor.status === MentorStatus.inactive ) {
            // and if mentor is approved
            next();
        } else {
            ctx.replyWithHTML(stringsStart.denyInactiveMentors());
        }
    } else {
        ctx.replyWithHTML(stringsStart.denyAnonymous());

        mixpanel.track('anonymous_bot_access', {
            distinct_id: ctx.chat.id,
        })
    }
};