import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { AirtableBase } from "./airtable/AirtableBase"
import { MentorContext } from "./bot/MentorContext"
import {MenuTemplate, MenuMiddleware, createBackMainMenuButtons} from "telegraf-inline-menu";

import { Context as TgContext, Markup, Telegraf } from 'telegraf'
import { onStart } from "./commands/start";
import { getMentor } from "./commands/menu";
import { getStatusCaption, isSet, setStatus } from "./commands/status";
import { makeRequestsMenu } from "./commands/requests";
import { makeTagsMenu } from "./commands/tags";

const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS } = process.env;

const bot = new Telegraf<MentorContext>(TELEGRAM_BOT_TOKEN, {telegram: { webhookReply: true }});
let airtable;

bot.telegram.setWebhook(WEBHOOK_ADDRESS);

const menu = new MenuTemplate<MentorContext>(getMentor);

// Profile URL
menu.url('Profile', (ctx) => {
    return ctx.airtable.mentor ? ctx.airtable.mentor.url : 'https://getmentor.dev';
});

// Status
menu.toggle(getStatusCaption, 'status', {
	set: setStatus,
	isSet: isSet
})

// Requests
makeRequestsMenu(menu);

makeTagsMenu(menu);

// calendly
menu.switchToCurrentChat('Calendly', 'calendly');

const menuMiddleware = new MenuMiddleware('/', menu)
bot.command('menu', ctx => menuMiddleware.replyToContext(ctx))
bot.command('start', ctx => onStart(ctx))
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
            : req.body.inline_query ?
                req.body.inline_query.from.id
                : req.body.edited_message ?
                    req.body.edited_message.chat.id
                    : req.body.message.chat.id;

        airtable = new AirtableBase(process.env["AIRTABLE_API_KEY"], process.env['AIRTABLE_BASE_ID'], chat_id);
        await airtable.getMentorByTelegramId(chat_id);
        // await airtable.getMentorRequests(mentor);

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

async function processInline(ctx: TgContext, base: AirtableBase) {
    ctx.reply('inline ' + ctx.inlineQuery.query);
}

export default httpTrigger;