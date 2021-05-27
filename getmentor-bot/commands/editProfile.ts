import { menuMiddleware } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";

export async function editProfile(ctx: MentorContext, additionalState: string) {
    if ('text' in ctx.message) {
        console.log(`Searching for ${ctx.message.text} to ${additionalState}`);
        await ctx.reply(`Searching for ${ctx.message.text}. Additional state: ${additionalState}`);
    } else {
        console.log("No text");
    }

    menuMiddleware.replyToContext(ctx);
}