import { MentorStorage } from "../storage/MentorStorage";
import { MentorContext } from "./MentorContext";

export async function commonMiddleware(storage: MentorStorage, ctx: MentorContext, next) {
    const chat_id = ctx.chat.id;

    ctx.storage = storage;
    ctx.mentor = await storage.getMentorByTelegramId(chat_id);
    if ( ctx.mentor && !ctx.mentor.requests ) {
        ctx.mentor.requests = await storage.getMentorRequests(ctx.mentor);
    }

    return next();
};