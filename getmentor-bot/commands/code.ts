import { MentorContext } from "../bot/MentorContext"
import { stringsCode } from "../strings/code";

export async function onCode(ctx: MentorContext, code: string) {
    let re = /[0-9a-zA-Z]{8}/i;

    if ( re.test(code) ) {
        let mentor = await ctx.storage.getMentorBySecretCode(code);
        if (mentor) {
            let new_mentor = await ctx.storage.setMentorTelegramChatId(mentor.airtable_id, ctx.message.chat.id);
            if (new_mentor) {
                ctx.replyWithHTML(stringsCode.welcome(new_mentor));
                return;
            }
        }
    }

    ctx.reply(stringsCode.unknown());
}
