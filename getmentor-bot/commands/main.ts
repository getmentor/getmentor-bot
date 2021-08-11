import { MenuTemplate } from "telegraf-inline-menu";
import { MentorContext } from "../bot/MentorContext"
import { stringsMain } from "../strings/main";
import { makeEditProfileMenu } from "./profile";
import { makeRequestsMenu } from "./requests";
import { makeAdminMenu } from "./admin/admin";

export function mainMenu(): MenuTemplate<MentorContext> {
    const menu = new MenuTemplate<MentorContext>(ctx => stringsMain.welcomeMentor(ctx.mentor));

    // Requests
    if (process.env.TOGGLE_REQUESTS_MENU) {
        let allRequestsMenu = makeRequestsMenu();
        menu.submenu(
            '👉 Ваши заявки',
            'r',
            allRequestsMenu
        )
    }

    // Edit profile
    let profileMenu = makeEditProfileMenu();
    menu.submenu('📝 Редактировать профиль', 'edit_p', profileMenu);

    // Profile URL
    menu.url('🔗 Ссылка на профиль', (ctx) => {
        return ctx.mentor ? ctx.mentor.url : 'https://getmentor.dev';
    });

    // Admin
    let adminMenu = makeAdminMenu();
    menu.submenu('Админка', 'admin', adminMenu, {
        hide: ctx => !ctx.admin
    });

    // calendly
    //menu.switchToCurrentChat('📆 Calendly', 'calendly');

    return menu;
}