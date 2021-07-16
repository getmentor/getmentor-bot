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

    singleRequestSubmenu.interact(stringsSingleRequest.buttonContacted, 'contacted', {
        do: async ctx => {
            const id = ctx.match![1]!;
            await ctx.answerCbQuery('Just a callback query')
            return true;
        },
        hide: ctx => isHidden(ctx)
    });

    singleRequestSubmenu.interact(stringsSingleRequest.buttonScheduled, 'scheduled', {
        do: async ctx => {
            const id = ctx.match![1]!;
            await ctx.answerCbQuery('Just a callback query')
            return true;
        },
        hide: ctx => isHidden(ctx)
    });

    singleRequestSubmenu.interact(stringsSingleRequest.buttonDone, 'done', {
        do: async ctx => {
            const id = ctx.match![1]!;
            await ctx.answerCbQuery('Just a callback query')
            return true;
        },
        hide: ctx => isHidden(ctx)
    });

    singleRequestSubmenu.submenu(
        stringsSingleRequest.buttonDecline,
        'confirm',
        confirmDeclineRequestMenu(),
        {
            hide: ctx => isHidden(ctx)
        }
    );

    singleRequestSubmenu.manualRow(backButtons);

    return singleRequestSubmenu;
}

function isHidden(ctx: MentorContext): boolean {
    const id = ctx.match![1]!;
    if (ctx.mentor.requests && ctx.mentor.requests.length !== 0) {
        let ids = ctx.mentor.requests.map( r => r.id);
        return ids.includes(id) ? false : true;
    }

    return true;
}

function confirmDeclineRequestMenu(): MenuTemplate<MentorContext> {
    const confirmDeclineMenu = new MenuTemplate<MentorContext>('Вы уверены?');

    confirmDeclineMenu.interact(stringsSingleRequest.buttonDeclineConfirm, 'yes', {
        do: async ctx => {
            const id = ctx.match![1]!;
            await ctx.answerCbQuery('Just a callback query')
            return true;
        }
    });

    confirmDeclineMenu.manualRow(backButtons);

    return confirmDeclineMenu;
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