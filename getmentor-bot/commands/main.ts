import { MenuTemplate } from "telegraf-inline-menu";
import { MentorContext } from "../bot/MentorContext"
import { stringsMain } from "../strings/main";
import { makeEditProfileMenu } from "./profile";
import { makeRequestsMenu } from "./requests";

export function mainMenu(): MenuTemplate<MentorContext> {
    const menu = new MenuTemplate<MentorContext>(ctx => stringsMain.welcomeMentor(ctx.mentor));

    // Requests
    let allRequestsMenu = makeRequestsMenu();
    if (process.env.NODE_ENV === 'development') {
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

    // calendly
    //menu.switchToCurrentChat('📆 Calendly', 'calendly');

    return menu;
}