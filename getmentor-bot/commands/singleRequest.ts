import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { MentorClientRequestStatus } from "../models/MentorClientRequest";
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
            await setNewStatus(ctx, MentorClientRequestStatus.contacted);
            return true;
        },
        hide: ctx => isHidden(ctx)
    });

    singleRequestSubmenu.interact(stringsSingleRequest.buttonScheduled, 'scheduled', {
        do: async ctx => {
            await setNewStatus(ctx, MentorClientRequestStatus.working);
            return true;
        },
        hide: ctx => isHidden(ctx)
    });

    singleRequestSubmenu.interact(stringsSingleRequest.buttonDone, 'done', {
        do: async ctx => {
            await setNewStatus(ctx, MentorClientRequestStatus.done);
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

async function setNewStatus(ctx: MentorContext, newStatus: MentorClientRequestStatus) {
    const id = ctx.match![1]!;
    let request = ctx.mentor.requests.get(id);
    let newRequest = await ctx.storage.setRequestStatus(request, newStatus);
    if (newRequest) {
        ctx.mentor.requests.set(newRequest.id, newRequest);

        if (newRequest.status === MentorClientRequestStatus.done || newRequest.status === MentorClientRequestStatus.declined) {
            ctx.mentor.requests.delete(newRequest.id);
            ctx.mentor.archivedRequests?.set(newRequest.id, newRequest);
        }

        await ctx.answerCbQuery('Статус обновлен, спасибо!')
    }
}

function isHidden(ctx: MentorContext): boolean {
    const id = ctx.match![1]!;
    return ctx.mentor.requests?.get(id) ? false : true;
}

function confirmDeclineRequestMenu(): MenuTemplate<MentorContext> {
    const confirmDeclineMenu = new MenuTemplate<MentorContext>('Вы уверены?');

    confirmDeclineMenu.interact(stringsSingleRequest.buttonDeclineConfirm, 'yes', {
        do: async ctx => {
            await setNewStatus(ctx, MentorClientRequestStatus.declined);
            return true;
        }
    });

    confirmDeclineMenu.manualRow(backButtons);

    return confirmDeclineMenu;
}

export function requestButtonText(ctx: MentorContext, key: string): string {
    let request = ctx.mentor.requests.get(key);
    if (!request) {
        request = ctx.mentor.archivedRequests?.get(key);
    }

    if (!request) return 'unknown';

    return MentorUtils.formatRequestStatusPrefix(request.status)
        + ` ${request.name} (`
        + request.createdAt.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
        + ')';
}

function singleRequestText(ctx: MentorContext): string {
    const id = ctx.match![1]!;
    let request = ctx.mentor.requests.get(id);
    if (!request) {
        request = ctx.mentor.archivedRequests?.get(id);
    }
    return request ? stringsSingleRequest.requestDetails(request) : 'unknown';
}