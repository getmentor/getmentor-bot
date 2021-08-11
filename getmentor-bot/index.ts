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
import { AirtableBase } from "../lib/storage/airtable/AirtableBase";
import { editProfileHandler, menuMiddleware } from "./bot/general";
import { mixpanel } from "./utils/mixpanel";

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

bot.command('menu', ctx => {
    mixpanel.track('on_menu_command', {
        distinct_id: ctx.chat.id,
        mentor_id: ctx.mentor?.id,
        mentor_name: ctx.mentor?.name
    })
    menuMiddleware.replyToContext(ctx)
})
bot.command('requests', ctx => {
    mixpanel.track('on_menu_requests', {
        distinct_id: ctx.chat.id,
        mentor_id: ctx.mentor?.id,
        mentor_name: ctx.mentor?.name
    })
    menuMiddleware.replyToContext(ctx, "/r/")
})
bot.command('profile', ctx => {
    mixpanel.track('on_menu_profile', {
        distinct_id: ctx.chat.id,
        mentor_id: ctx.mentor?.id,
        mentor_name: ctx.mentor?.name
    })
    menuMiddleware.replyToContext(ctx, "/edit_p/")
})

bot.use(menuMiddleware);

bot.catch( (error, ctx) => {
    mixpanel.track('on_bot_error', {
        distinct_id: ctx.chat.id,
        mentor_id: ctx.mentor?.id,
        mentor_name: ctx.mentor?.name,
        error: error
    })
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