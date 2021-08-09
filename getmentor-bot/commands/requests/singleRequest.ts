import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons, menuMiddleware } from "../../bot/general";
import { MentorContext } from "../../bot/MentorContext";
import { MentorClientRequestStatus } from "../../../lib/models/MentorClientRequest";
import { stringsSingleRequest } from "../../strings/singleRequest";
import { MentorUtils } from "../../../lib/utils/MentorUtils";
import { SendGridEmailSender } from "../../sendgrid/SendGridEmailSender"
import { SessionCompleteMessage } from "../../sendgrid/messages/SessionCompleteMessage";
import { SessionDeclinedMessage } from "../../sendgrid/messages/SessionDeclinedMessage";
import { mixpanel } from "../../utils/mixpanel";

export function singleRequestSubmenu(): MenuTemplate<MentorContext> {
    const singleRequestSubmenu = new MenuTemplate<MentorContext>(ctx => {
        return {
            text: singleRequestText(ctx),
            parse_mode: "HTML"
        }
    })

    // Active requests menu
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

    // Unavailable mentee
    singleRequestSubmenu.interact(stringsSingleRequest.buttonUnavailable, 'unavailable', {
        do: async ctx => {
            await setNewStatus(ctx, MentorClientRequestStatus.unavailable);
            return true;
        },
        hide: ctx => isHidden(ctx)
    });

    singleRequestSubmenu.interact(stringsSingleRequest.buttonAvailable, 'available', {
        do: async ctx => {
            const id = ctx.match![1]!;
            let request = ctx.mentor.archivedRequests?.get(id);
            let newRequest = await ctx.storage.setRequestStatus(request, MentorClientRequestStatus.contacted);

            if (newRequest) {
                ctx.mentor.archivedRequests?.delete(newRequest.id);
                ctx.mentor.requests?.set(newRequest.id, newRequest);

                await ctx.answerCbQuery('Статус обновлен, спасибо!');
                menuMiddleware.replyToContext(ctx, '/r/');

                mixpanel.track('request_status_change', {
                    distinct_id: ctx.chat.id,
                    mentor_id: ctx.mentor.id,
                    mentor_name: ctx.mentor.name,
                    request_id: newRequest.id,
                    request_name: newRequest.name,
                    status: 'available'
                })
            }
            return true;
        },
        hide: ctx => {
            const id = ctx.match![1]!;
            return ctx.mentor.archivedRequests?.get(id)?.status === MentorClientRequestStatus.unavailable ? false : true;
        }
    });

    // Reviews
    singleRequestSubmenu.submenu(
        stringsSingleRequest.buttonViewReview,
        'review',
        reviewSubmenu(),
        {
            hide: ctx => {
                const id = ctx.match![1]!;
                return ctx.mentor.archivedRequests?.get(id)?.review ? false : true;
            }
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

        if (   newRequest.status === MentorClientRequestStatus.done
            || newRequest.status === MentorClientRequestStatus.declined
            || newRequest.status === MentorClientRequestStatus.unavailable ) {
            ctx.mentor.requests.delete(newRequest.id);
            ctx.mentor.archivedRequests?.set(newRequest.id, newRequest);
        }
        if (newRequest.status === MentorClientRequestStatus.done) {
            SendGridEmailSender.send(new SessionCompleteMessage(ctx.mentor, newRequest));
            await ctx.replyWithHTML(stringsSingleRequest.requestCompletedByMentor(ctx.mentor, newRequest))
        }
        if (newRequest.status === MentorClientRequestStatus.declined) {
            SendGridEmailSender.send(new SessionDeclinedMessage(ctx.mentor, newRequest));
            await ctx.replyWithHTML(stringsSingleRequest.requestDeclinedByMentor)
        }

        //await ctx.reply('Статус обновлен, спасибо!');
        await ctx.answerCbQuery('Статус обновлен, спасибо!');
        menuMiddleware.replyToContext(ctx, '/r/');

        mixpanel.track('request_status_change', {
            distinct_id: ctx.chat.id,
            mentor_id: ctx.mentor.id,
            mentor_name: ctx.mentor.name,
            request_id: newRequest.id,
            request_name: newRequest.name,
            status: newRequest.status.toString()
        })
    } else {
        await ctx.answerCbQuery('Что-то пошло не так! Попробуйте позже.')
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

function reviewSubmenu(): MenuTemplate<MentorContext> {
    const confirmDeclineMenu = new MenuTemplate<MentorContext>(ctx => {
        const id = ctx.match![1]!;
        let request = ctx.mentor.archivedRequests?.get(id);
        if (request && request.review) {
            return `${request.name} оставил следующий отзыв о вашей встрече:

-----
${request.review}
-----

Надеемся, что он поможет вам стать лучше. Удачи!`
        } else 'Отзыва нет';

        mixpanel.track('request_view_review', {
            distinct_id: ctx.chat.id,
            mentor_id: ctx.mentor.id,
            mentor_name: ctx.mentor.name,
            request_id: request.id,
            request_name: request.name
        })
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
        + request.createdAt.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })
        + ')'
        + (request.review ? ' + отзыв' : '');
}

function singleRequestText(ctx: MentorContext): string {
    const id = ctx.match![1]!;
    let request = ctx.mentor.requests.get(id);
    if (!request) {
        request = ctx.mentor.archivedRequests?.get(id);
    }
    return request ? stringsSingleRequest.requestDetails(request) : 'unknown';
}