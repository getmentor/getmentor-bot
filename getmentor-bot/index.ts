import { appInsights } from "./utils/appInsights";
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env["SENTRY_CLIENT_KEY"],
});

appInsights.setup().start();

import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MentorContext } from "./bot/MentorContext"
import { Telegraf, session } from 'telegraf'
import { onStart } from "./commands/start";
import { commonMiddleware } from "./bot/commonMiddleware";
import { onCode } from "./commands/code";
import { blockAnonymousMiddleware } from "./bot/blockAnonymousMiddleware";
import { AirtableBase } from "./storage/airtable/AirtableBase";
import { editProfileHandler, menuMiddleware } from "./bot/general";

const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS } = process.env;
const airtable = new AirtableBase(process.env["AIRTABLE_API_KEY"], process.env['AIRTABLE_BASE_ID']);

const bot = new Telegraf<MentorContext>(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }});
bot.telegram.setWebhook(WEBHOOK_ADDRESS);

bot.use(session())
bot.use( (ctx, next) => commonMiddleware(airtable, ctx, next));

bot.command('start', ctx => onStart(ctx))
bot.hears(/^[0-9a-zA-Z]{8}$/i, ctx => onCode(ctx, ctx.message.text));

bot.use(blockAnonymousMiddleware);
bot.use(editProfileHandler.middleware());

bot.command('menu', ctx => menuMiddleware.replyToContext(ctx))

bot.use(menuMiddleware);

bot.catch( (error, ctx) => {
    console.error(error);
    ctx.reply('Произошла ошибка, простите')
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        await bot.handleUpdate(req.body);
    } catch (e) {
        Sentry.captureException(e);
        await Sentry.flush(2000);
    } finally {
        context.res = {
            status: 200
        };
    }
}

export default httpTrigger;