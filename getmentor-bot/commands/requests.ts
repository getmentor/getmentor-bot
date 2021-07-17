import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { requestButtonText, singleRequestSubmenu } from "./singleRequest";

export function makeRequestsMenu(): MenuTemplate<MentorContext> {
    const allRequestsMenu = new MenuTemplate<MentorContext>('Ваши заявки');

    // Active requests
    const activeRequestsMenu = new MenuTemplate<MentorContext>('Ваши текушие заявки')
    activeRequestsMenu.chooseIntoSubmenu('request', 
        (ctx) => {
            return Array.from(ctx.mentor.requests.keys())
        },
        singleRequestSubmenu(),
        {
            buttonText: requestButtonText,
            columns: 1
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
            return Array.from(ctx.mentor.archivedRequests.keys())
        },
        singleRequestSubmenu(),
        {
            buttonText: requestButtonText,
            columns: 1
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