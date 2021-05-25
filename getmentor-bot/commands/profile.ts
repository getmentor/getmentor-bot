import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { getStatusCaption, isStatusSet, setStatus } from "./status";
import { makeTagsMenu } from "./tags";

export function makeEditProfileMenu(menu: MenuTemplate<MentorContext>) {
    const profileMenu = new MenuTemplate<MentorContext>('Редактировать профиль');

    // Profile URL
    menu.url('🔗 Ссылка на профиль', (ctx) => {
        return ctx.mentor ? ctx.mentor.url : 'https://getmentor.dev';
    });

    // Status
    profileMenu.toggle(getStatusCaption, 'status', {
        set: setStatus,
        isSet: isStatusSet,
        formatState: (_, text, __) => text,
    })

    // Tags
    makeTagsMenu(profileMenu);

    profileMenu.manualRow(backButtons);

    menu.submenu('📝 Редактировать профиль', 'editProfile', profileMenu);
}