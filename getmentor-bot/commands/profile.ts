import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons, editProfileHandler } from "../bot/general";
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

    // Edit description
    profileMenu.interact('Изменить описание', 'edit_profile_description', {
        do: async (ctx, _) => {
            let text = "Введите новый текст для описания профиля. Можно использоаться базовый HTML для форматирования"
            await editProfileHandler.replyWithMarkdown(ctx, text, 'edit_profile_description');
            return false;
        }
    });

    profileMenu.manualRow(backButtons);

    menu.submenu('📝 Редактировать профиль', 'editProfile', profileMenu);
}