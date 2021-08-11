import { mixpanel } from "../utils/mixpanel";
import { MentorContext } from "./MentorContext";

const moderators = [
    'glamcoder'
];

export function adminMiddleware(ctx: MentorContext, next) {
    ctx.admin = moderators.includes(ctx.message.from.username);
    mixpanel.track('admin_bot_access', {
        distinct_id: ctx.chat.id,
    })
    next();
};