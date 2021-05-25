import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";

export function makeRequestsMenu(menu: MenuTemplate<MentorContext>) {
    const requestsMenu = new MenuTemplate<MentorContext>('Ваши текушие заявки')

    const singleRequestSubmenu = new MenuTemplate<MentorContext>(singleRequestText)
    function singleRequestText(ctx: MentorContext): string {
        const id = ctx.match![1]!;
        let request = ctx.mentor.requests.find(r => r.airtable_id === id);
        return request ? request.name : 'unknown';
    }

    function requestButtonText(ctx: MentorContext, key: string): string {
        let request = ctx.mentor.requests.find(r => r.airtable_id === key);
        return request ? request.name : 'unknown';
    }

    singleRequestSubmenu.interact('test', 'randomButton', {
        do: async ctx => {
            const id = ctx.match![1]!;
            await ctx.answerCbQuery('Just a callback query answer')
            return true;
        }
    });

    singleRequestSubmenu.manualRow(backButtons);

    requestsMenu.chooseIntoSubmenu('request', 
        (ctx) => {
            return ctx.mentor.requests.map((r) => r.airtable_id)
        }
        , singleRequestSubmenu
        , {
            buttonText: requestButtonText,
            columns: 1
        });

    requestsMenu.manualRow(backButtons);
    menu.submenu(ctx => '👉 Ваши заявки (активных: '+ctx.mentor.requests.length+')',
        'requests',
        requestsMenu, {
            hide: (ctx) => !ctx.mentor.requests || ctx.mentor.requests.length === 0
        }
    )
}