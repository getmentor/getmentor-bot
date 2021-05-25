import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MentorContext } from "./bot/MentorContext"
import { MenuMiddleware } from "telegraf-inline-menu";

import { Telegraf } from 'telegraf'
import { onStart } from "./commands/start";
import { mainMenu } from "./commands/main";
import { commonMiddleware } from "./bot/commonMiddleware";
import { onCode } from "./commands/code";
import { blockAnonymousMiddleware } from "./bot/blockAnonymousMiddleware";
import { AirtableBase } from "./storage/airtable/AirtableBase";

const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS } = process.env;
const airtable = new AirtableBase(process.env["AIRTABLE_API_KEY"], process.env['AIRTABLE_BASE_ID']);

const bot = new Telegraf<MentorContext>(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }});
bot.telegram.setWebhook(WEBHOOK_ADDRESS);

bot.use( (ctx, next) => commonMiddleware(airtable, ctx, next));

bot.command('start', ctx => onStart(ctx))
bot.hears(/[0-9a-zA-Z]{8}/i, ctx => onCode(ctx, ctx.message.text));

bot.use(blockAnonymousMiddleware);

const menuMiddleware = new MenuMiddleware('/', mainMenu())

bot.command('menu', ctx => menuMiddleware.replyToContext(ctx))

bot.use(menuMiddleware);

bot.catch(error => {
    console.error(error)
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        await bot.handleUpdate(req.body);
    } finally {
        context.res = {
            status: 200
        };
    }
}

export default httpTrigger;