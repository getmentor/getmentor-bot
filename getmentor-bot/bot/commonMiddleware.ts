import { AirtableBase } from "../storage/airtable/AirtableBase";
import { MentorContext } from "./MentorContext";

export async function commonMiddleware(airtable: AirtableBase, ctx: MentorContext, next) {
    const chat_id = ctx.chat.id;

    ctx.storage = airtable;
    ctx.mentor = await airtable.getMentorByTelegramId(chat_id);

    return next();
};