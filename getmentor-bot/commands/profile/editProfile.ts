import { menuMiddleware } from "../../bot/general";
import { MentorContext } from "../../bot/MentorContext";
import { mixpanel } from "../../utils/mixpanel";

export async function editProfile(ctx: MentorContext, additionalState: string) {
    if ('text' in ctx.message) {
        switch (additionalState) {
            case 'p_desc':
                ctx.mentor = await ctx.storage.setMentorDescription(ctx.mentor, ctx.message.text);

                await ctx.reply(`Все сделано! На сайте описание может обновиться не сразу, дайте роботам время :)`);

                mixpanel.track('profile_edit_description', {
                    distinct_id: ctx.chat.id,
                    mentor_id: ctx.mentor.id,
                    mentor_name: ctx.mentor.name,
                })
                break;

            default:
                break;
        }
    } else {
        console.log("No text");
    }

    menuMiddleware.replyToContext(ctx, '/edit_p/');
}