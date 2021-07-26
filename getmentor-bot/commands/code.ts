import { MentorContext } from "../bot/MentorContext"
import { stringsCode } from "../strings/code";
import { mixpanel } from "../utils/mixpanel";

export async function onCode(ctx: MentorContext, code: string) {
    if (ctx.mentor) {
        ctx.replyWithHTML(stringsCode.alreadyKnown(ctx.mentor));
        return;
    };

    let re = /^[0-9a-zA-Z]{8}$/i;

    if ( re.test(code) ) {
        let mentor = await ctx.storage.getMentorBySecretCode(code);
        if (mentor) {
            let new_mentor = await ctx.storage.setMentorTelegramChatId(mentor.id, ctx.message.chat.id);
            if (new_mentor) {
                ctx.replyWithHTML(stringsCode.welcome(new_mentor));

                mixpanel.track('tg_secret_code_accepted', {
                    distinct_id: ctx.chat.id,
                    mentor_id: new_mentor.id,
                    mentor_name: new_mentor.name,
                    code: code
                })
                return;
            }
        }
    }

    mixpanel.track('tg_secret_code_declined', {
        distinct_id: ctx.chat.id,
        code: code
    })

    ctx.reply(stringsCode.unknown());
}
