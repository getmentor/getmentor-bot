import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { AirtableBase } from "./airtable/AirtableBase"
import { MentorContext } from "./bot/MentorContext"
import {MenuTemplate, MenuMiddleware, createBackMainMenuButtons} from "telegraf-inline-menu";

import { Context as TgContext, Markup, Telegraf } from 'telegraf'
import { getMentor } from "./commands/start";
import { getStatusCaption, isSet, setStatus } from "./commands/status";

const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS } = process.env;

const bot = new Telegraf<MentorContext>(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }});
const airtable = new AirtableBase(process.env["AIRTABLE_API_KEY"], process.env['AIRTABLE_BASE_ID']);

bot.telegram.setWebhook(WEBHOOK_ADDRESS);

const menu = new MenuTemplate<MentorContext>(getMentor);

menu.url('Profile', (ctx) => {
    return ctx.mentor ? ctx.mentor.url : 'https://getmentor.dev';
});

menu.toggle(getStatusCaption, 'status', {
	set: setStatus,
	isSet: isSet
})

const menuMiddleware = new MenuMiddleware('/', menu)
bot.command('start', ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware)

bot.on('message', (ctx) => processMessage(ctx, airtable));
bot.on('callback_query', (ctx) => processCallback(ctx, airtable));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const chat_id = req.body.callback_query ?
            req.body.callback_query.message.chat.id
            : req.body.message.chat.id;

        const mentor = await airtable.getMentorByTelegramId(chat_id);
        bot.context.mentor = mentor;
        bot.context.airtable = airtable;
        await bot.handleUpdate(req.body);
    } finally {
        context.res = {
            status: 200
        };
    }
}

async function processMessage(ctx: TgContext, base: AirtableBase) {
    let keyboard = Markup.inlineKeyboard([
        Markup.button.callback("One", "admin:text1"),
        Markup.button.callback("Two", "admin:text2"),
    ]);

    await airtable.getMentorByTelegramId(ctx.message.from.id)
    .then((mentor) => {
        ctx.reply('Hello ' + mentor.name)
    });
}

async function processCallback(ctx: TgContext, base: AirtableBase) {
    ctx.reply('callback ' + ctx.callbackQuery["data"]);
}

export default httpTrigger;