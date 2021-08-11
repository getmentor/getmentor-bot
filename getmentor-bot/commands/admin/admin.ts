import { MenuTemplate } from "telegraf-inline-menu";
import { MentorContext } from "../../bot/MentorContext"

export function makeAdminMenu(): MenuTemplate<MentorContext> {
    const menu = new MenuTemplate<MentorContext>(ctx => 'Админка');

    return menu;
}