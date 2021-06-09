import { menuMiddleware } from "../bot/general";
import { MentorContext } from "../bot/MentorContext"
import { stringsStart } from "../strings/start";
import { onCode } from "./code";

export async function onStart(ctx: MentorContext) {
    if (ctx.mentor) {
        menuMiddleware.replyToContext(ctx);
        return;
    }

    let re = /^(\/start\s){0,1}([0-9a-zA-Z]{8}){1}$/i;
    
    let matches = re.exec(ctx.message["text"]);
    if (matches && matches.length > 2) {
        onCode(ctx, matches[2]);
    } else {
        ctx.replyWithHTML(stringsStart.welcomeAnonymous());
    }
}
