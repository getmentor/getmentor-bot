import { AirtableBase } from "../storage/airtable/AirtableBase";
import { MentorContext } from "./MentorContext";

export async function commonMiddleware(ctx: MentorContext, next) {
    const chat_id = ctx.chat.id;

    let airtable = new AirtableBase(process.env["AIRTABLE_API_KEY"], process.env['AIRTABLE_BASE_ID'], chat_id);
    await airtable.getMentorByTelegramId(chat_id);
    ctx.airtable = airtable;

    return next();
};