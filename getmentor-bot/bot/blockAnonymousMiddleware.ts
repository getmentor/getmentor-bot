import { MentorContext } from "./MentorContext";

export function blockAnonymousMiddleware(ctx: MentorContext, next) {
    // Proceed next only if mentor defined
    if ( ctx.mentor ) next();
};