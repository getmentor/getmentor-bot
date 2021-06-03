import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { requestButtonText, singleRequestSubmenu } from "./singleRequest";

export function makeRequestsMenu(menu: MenuTemplate<MentorContext>) {
    const allRequestsMenu = new MenuTemplate<MentorContext>('Ваши заявки');

    const activeRequestsMenu = new MenuTemplate<MentorContext>('Ваши текушие заявки')
    activeRequestsMenu.chooseIntoSubmenu('request', 
        (ctx) => {
            return ctx.mentor.requests.map((r) => r.id)
        },
        singleRequestSubmenu(),
        {
            buttonText: requestButtonText,
            columns: 1
        }
    );
    activeRequestsMenu.manualRow(backButtons);

    allRequestsMenu.submenu(ctx => '👉 Активные заявки ('+ctx.mentor.requests.length+')',
        'active_requests',
        activeRequestsMenu, {
            hide: (ctx) => !ctx.mentor.requests || ctx.mentor.requests.length === 0
        }
    )

    const archivedRequestsMenu = new MenuTemplate<MentorContext>('Прошедшие заявки')
    archivedRequestsMenu.chooseIntoSubmenu('request', 
        async (ctx) => {
            ctx.mentor.archivedRequests = await ctx.storage.getMentorArchivedRequests(ctx.mentor);

            return ctx.mentor.archivedRequests.map((r) => r.id)
        },
        singleRequestSubmenu(),
        {
            buttonText: requestButtonText,
            columns: 1
        }
    );
    archivedRequestsMenu.manualRow(backButtons);

    allRequestsMenu.submenu(ctx => 'Прошедшие заявки',
        'archived_requests',
        archivedRequestsMenu
    )

    allRequestsMenu.manualRow(backButtons);

    menu.submenu(ctx => '👉 Ваши заявки',
        'requests',
        allRequestsMenu
    )
}