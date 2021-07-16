import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { stringsSingleRequest } from "../strings/singleRequest";
import { MentorUtils } from "../utils/MentorUtils";

export function singleRequestSubmenu(): MenuTemplate<MentorContext> {
    const singleRequestSubmenu = new MenuTemplate<MentorContext>(ctx => {
        return {
            text: singleRequestText(ctx),
            parse_mode: "HTML"
        }
    })

    singleRequestSubmenu.interact('test', 'randomButton', {
        do: async ctx => {
            const id = ctx.match![1]!;
            await ctx.answerCbQuery('Just a callback query answer')
            return true;
        }
    });

    singleRequestSubmenu.manualRow(backButtons);

    return singleRequestSubmenu;
}

export function requestButtonText(ctx: MentorContext, key: string): string {
    let request = ctx.mentor.requests.find(r => r.id === key);
    if (!request) {
        request = ctx.mentor.archivedRequests.find(r => r.id === key);
    }

    if (!request) return 'unknown';

    return MentorUtils.formatRequestStatusPrefix(request.status)
        + ` ${request.name} (`
        + request.createdAt.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
        + ')';
}

function singleRequestText(ctx: MentorContext): string {
    const id = ctx.match![1]!;
    let request = ctx.mentor.requests.find(r => r.id === id);
    if (!request) {
        request = ctx.mentor.archivedRequests.find(r => r.id === id);
    }
    return request ? stringsSingleRequest.requestDetails(request) : 'unknown';
}