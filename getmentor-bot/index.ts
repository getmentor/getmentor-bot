import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { MentorContext } from "./bot/MentorContext"
import { MenuMiddleware } from "telegraf-inline-menu";

import { Telegraf } from 'telegraf'
import { onStart } from "./commands/start";
import { mainMenu } from "./commands/main";
import { commonMiddleware } from "./bot/commonMiddleware";

const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS } = process.env;

const bot = new Telegraf<MentorContext>(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }});
bot.telegram.setWebhook(WEBHOOK_ADDRESS);

bot.use(commonMiddleware);

const menuMiddleware = new MenuMiddleware('/', mainMenu())

bot.command('menu', ctx => menuMiddleware.replyToContext(ctx))
bot.command('start', ctx => onStart(ctx))

bot.use(menuMiddleware);

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