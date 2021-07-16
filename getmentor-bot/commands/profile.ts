import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons, editProfileHandler } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { stringsProfile } from "../strings/profile";
import { getStatusCaption, isStatusSet, setStatus } from "./status";
import { makeTagsMenu } from "./tags";

export function makeEditProfileMenu(): MenuTemplate<MentorContext> {
    const profileMenu = new MenuTemplate<MentorContext>('Редактировать профиль');

    // Status
    profileMenu.toggle(getStatusCaption, 'status', {
        set: setStatus,
        isSet: isStatusSet,
        formatState: (_, text, __) => text,
    })

    // Tags
    makeTagsMenu(profileMenu);

    // Edit description
    profileMenu.interact('Изменить описание', 'p_desc', {
        do: async (ctx, _) => {
            await editProfileHandler.replyWithMarkdown(ctx, stringsProfile.editProfileDetails(), 'p_desc');
            return false;
        }
    });

    profileMenu.manualRow(backButtons);

    return profileMenu;
}