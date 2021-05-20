import { MentorContext } from "../bot/MentorContext"

export async function onStart(ctx: MentorContext) {
    if (ctx.airtable.mentor) {
        ctx.reply(`Hello ${ctx.airtable.mentor.name}.\nPlease use /menu command to navigate.`);
        return;
    }

    let re = /[\/start\s]?([0-9a-zA-Z]{8})/i;
    
    let matches = re.exec(ctx.message["text"]);
    if (matches && matches.length > 1) {
        let mentor = await ctx.airtable.getMentorBySecretCode(matches[1]);
        if (mentor) {
            let new_mentor = await ctx.airtable.setMentorTelegramChatId(mentor.airtable_id, ctx.message.chat.id);
            if (new_mentor) {
                ctx.reply(`Hooray! Мы тебя знаем, ${ctx.airtable.mentor.name}.`);
            } else {
                ctx.reply('wtf');
            }
        } else {
            ctx.reply('cant find mentor');
        }
    } else {
        ctx.reply('unknown code');
    }
}
