import { menuMiddleware } from "../../bot/general";
import { MentorContext } from "../../bot/MentorContext";
import { mixpanel } from "../../utils/mixpanel";

export async function editProfile(ctx: MentorContext, additionalState: string) {
    if ('text' in ctx.message) {
        switch (additionalState) {
            case 'p_desc':
                var newMentor = await ctx.storage.setMentorDescription(ctx.mentor, ctx.message.text);
                var failed = ''
                if (newMentor) {
                    ctx.mentor = newMentor
                    await ctx.reply(`Все сделано! На сайте описание может обновиться не сразу, дайте роботам время :)`);
                } else {
                    await ctx.reply(`Что-то пошло не так, попробуйте повторить позже`);
                    failed = '_failed'
                }

                mixpanel.track('profile_edit_description' + failed, {
                    distinct_id: ctx.chat.id,
                    mentor_id: ctx.mentor.id,
                    mentor_name: ctx.mentor.name,
                })
                break;

            case 'p_title':
                var newMentor = await ctx.storage.setMentorTitle(ctx.mentor, ctx.message.text);
                var failed = ''
                if (newMentor) {
                    ctx.mentor = newMentor
                    await ctx.reply(`Все сделано! На сайте описание может обновиться не сразу, дайте роботам время :)`);
                } else {
                    await ctx.reply(`Что-то пошло не так, попробуйте повторить позже`);
                    failed = '_failed'
                }

                mixpanel.track('profile_edit_title' + failed, {
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