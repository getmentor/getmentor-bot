import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { AirtableBase } from "./airtable/AirtableBase"

import { Context as TgContext, Telegraf } from 'telegraf'

//const Telegraf = require('telegraf').Telegraf;
const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS } = process.env;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }});
const airtable = new AirtableBase(process.env["AIRTABLE_API_KEY"], process.env['AIRTABLE_BASE_ID']);

bot.telegram.setWebhook(WEBHOOK_ADDRESS);
bot.on('message', (ctx) => processMessage(ctx, airtable));
bot.on('callback_query', (ctx) => processCallback(ctx, airtable));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    return bot.handleUpdate(req.body);
}

async function processMessage(ctx: TgContext, base: AirtableBase) {
    await airtable.getMentorByTelegramId(ctx.message.from.id)
    .then((mentor) => {
        ctx.telegram.sendMessage(ctx.chat.id, "hello " + mentor.name);
    });
}

function processCallback(ctx: TgContext, base: AirtableBase) {
    ctx.telegram.sendCopy(ctx.chat.id, ctx.message);
}

export default httpTrigger;