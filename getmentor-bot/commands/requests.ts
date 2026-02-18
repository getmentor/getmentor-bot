import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { requestButtonText, singleRequestSubmenu } from "./requests/singleRequest";

export function makeRequestsMenu(): MenuTemplate<MentorContext> {
    const allRequestsMenu = new MenuTemplate<MentorContext>('Ваши заявки');

    // Active requests
    const activeRequestsMenu = new MenuTemplate<MentorContext>('Ваши текущие заявки')
    activeRequestsMenu.chooseIntoSubmenu('request',
        (ctx) => {
            return Array.from(ctx.mentor.requests.entries())
                .sort((a, b) => b[1].createdAt.getTime() - a[1].createdAt.getTime())
                .map(([key]) => key)
        },
        singleRequestSubmenu(),
        {
            buttonText: requestButtonText,
            columns: 1,
            getCurrentPage: ctx => ctx.session.activeRequestsPage || 1,
            setPage: (ctx, page) => {
                ctx.session.activeRequestsPage = page
            },
        }
    );
    activeRequestsMenu.manualRow(backButtons);

    allRequestsMenu.submenu(ctx => '👉 Активные заявки ('+ctx.mentor.requests.size+')',
        'r_act',
        activeRequestsMenu, {
            hide: (ctx) => !ctx.mentor.requests || ctx.mentor.requests.size === 0
        }
    )

    // Past requests
    const archivedRequestsMenu = new MenuTemplate<MentorContext>('Прошедшие заявки')
    archivedRequestsMenu.chooseIntoSubmenu('request',
        async (ctx) => {
            ctx.mentor.archivedRequests = await ctx.storage.getMentorArchivedRequests(ctx.mentor);
            return Array.from(ctx.mentor.archivedRequests.entries())
                .sort((a, b) => b[1].createdAt.getTime() - a[1].createdAt.getTime())
                .map(([key]) => key)
        },
        singleRequestSubmenu(),
        {
            buttonText: requestButtonText,
            columns: 1,
            getCurrentPage: ctx => ctx.session.oldRequestsPage || 1,
            setPage: (ctx, page) => {
                ctx.session.oldRequestsPage = page
            },
        }
    );
    archivedRequestsMenu.manualRow(backButtons);

    allRequestsMenu.submenu(ctx => '🕗 Прошедшие заявки',
        'r_arch',
        archivedRequestsMenu
    )

    allRequestsMenu.manualRow(backButtons);

    return allRequestsMenu;
}