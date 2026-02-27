import { appInsights } from "../lib/utils/appInsights";
import { Sentry } from "../lib/utils/sentry";
import { reportError } from "../lib/utils/monitor";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MentorContext } from "./bot/MentorContext"
import { Telegraf, session } from 'telegraf'
import { onStart } from "./commands/start";
import { commonMiddleware } from "./bot/commonMiddleware";
import { onCode } from "./commands/code";
import { blockAnonymousMiddleware } from "./bot/blockAnonymousMiddleware";
import { PostgresStorage } from "../lib/storage/postgres/PostgresStorage";
import { menuMiddleware } from "./bot/general";
import { botAnalytics } from "./utils/mixpanel";

const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS, DATABASE_URL } = process.env;
const storage = new PostgresStorage(DATABASE_URL);

const bot = new Telegraf<MentorContext>(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }});
bot.telegram.setWebhook(WEBHOOK_ADDRESS);

bot.use(session())
bot.use( (ctx, next) => commonMiddleware(storage, ctx, next));

bot.command('start', ctx => onStart(ctx))
bot.hears(/^[0-9a-zA-Z]{8}$/i, ctx => onCode(ctx, ctx.message.text));

bot.use(blockAnonymousMiddleware);

bot.command('menu', ctx => {
    botAnalytics.trackMenuOpened(ctx.chat.id, ctx.mentor?.id, "menu");
    menuMiddleware.replyToContext(ctx)
})
bot.command('requests', ctx => {
    botAnalytics.trackMenuOpened(ctx.chat.id, ctx.mentor?.id, "requests");
    menuMiddleware.replyToContext(ctx, "/r/")
})
bot.command('profile', ctx => {
    botAnalytics.trackMenuOpened(ctx.chat.id, ctx.mentor?.id, "profile");
    menuMiddleware.replyToContext(ctx, "/edit_p/")
})

bot.use(menuMiddleware);

bot.catch( (error, ctx) => {
    const errorType = error instanceof Error ? error.name : "unknown_error";
    botAnalytics.trackBotError(ctx.chat.id, ctx.mentor?.id, errorType);
    reportError(error);
    ctx.reply('Произошла ошибка, простите')
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        await bot.handleUpdate(req.body);
    } catch (e) {
        reportError(e);
        context.log(e);
    } finally {
        context.res = {
            status: 200
        };
    }

    await Sentry.flush(2000);
}

export default httpTrigger;
