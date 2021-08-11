import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons, editProfileHandler } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";
import { stringsCommon } from "../strings/common";
import { stringsProfile } from "../strings/profile";
import { makePriceMenu } from "./profile/price";
import { getStatusCaption, isStatusSet, setStatus } from "./profile/status";
import { makeTagsMenu } from "./profile/tags";

export function makeEditProfileMenu(): MenuTemplate<MentorContext> {
    const profileMenu = new MenuTemplate<MentorContext>('Редактировать профиль');

    // Status
    profileMenu.toggle(getStatusCaption, 'status', {
        set: setStatus,
        isSet: isStatusSet,
        formatState: (_, text, __) => text,
    })

    profileMenu.url('🔗 [BETA] Редактировать профиль онлайн', (ctx) => {
        return `${stringsCommon.baseUrl}/profile?id=${ctx.mentor.internalId}&token=${ctx.mentor.authToken}`
    }, {
        hide: (ctx) => process.env.SHOW_EDIT_PROFILE_ONLINE ? false : true
    });

    // Tags
    makeTagsMenu(profileMenu);

    // Price
    makePriceMenu(profileMenu);

    // Edit title
    profileMenu.interact('📝 Изменить должность', 'p_title', {
        do: async (ctx, _) => {
            await editProfileHandler.replyWithMarkdown(ctx, stringsProfile.editTitle(ctx.mentor), 'p_title');
            return false;
        }
    });

    // Edit description
    profileMenu.interact('📝 Изменить описание', 'p_desc', {
        do: async (ctx, _) => {
            await editProfileHandler.replyWithMarkdown(ctx, stringsProfile.editProfileDetails(), 'p_desc');
            return false;
        }
    });

    // Edit calendar
    profileMenu.interact('🗓 Изменить ссылку на календарь', 'p_cal', {
        do: async (ctx, _) => {
            await editProfileHandler.replyWithMarkdown(ctx, stringsProfile.editProfileCalendar(ctx.mentor), 'p_cal');
            return false;
        }
    });

    profileMenu.manualRow(backButtons);

    return profileMenu;
}