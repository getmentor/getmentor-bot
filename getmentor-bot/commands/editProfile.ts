import { menuMiddleware } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";

export async function editProfile(ctx: MentorContext, additionalState: string) {
    if ('text' in ctx.message) {
        switch (additionalState) {
            case 'edit_profile_description':
                ctx.mentor = await ctx.storage.setMentorDescription(ctx.mentor, ctx.message.text);
                ctx.mentor.requests = await ctx.storage.getMentorRequests(ctx.mentor);

                await ctx.reply(`Все сделано! На сайте описание может обновиться не сразу, дайте роботам время :)`);
                break;

            default:
                break;
        }
    } else {
        console.log("No text");
    }

    menuMiddleware.replyToContext(ctx);
}