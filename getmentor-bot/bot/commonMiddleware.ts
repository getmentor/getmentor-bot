import { MentorStorage } from "../../lib/storage/MentorStorage";
import { MentorContext } from "./MentorContext";

export async function commonMiddleware(storage: MentorStorage, ctx: MentorContext, next) {
    const chat_id = ctx.chat.id;

    ctx.storage = storage;
    ctx.mentor = await storage.getMentorByTelegramId(chat_id);
    if ( ctx.mentor && !ctx.mentor.requests ) {
        ctx.mentor.requests = await storage.getMentorActiveRequests(ctx.mentor);
    }
    ctx.session ??= { tagsPage: 1, activeRequestsPage: 1, oldRequestsPage: 1 };

    return next();
};