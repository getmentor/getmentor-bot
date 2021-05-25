import { MenuTemplate } from "telegraf-inline-menu";
import { MentorContext } from "../bot/MentorContext"
import { makeRequestsMenu } from "./requests";
import { getStatusCaption, isStatusSet, setStatus } from "./status";
import { makeTagsMenu } from "./tags";

export function mainMenu(): MenuTemplate<MentorContext> {
    const menu = new MenuTemplate<MentorContext>(getMentor);

    // Profile URL
    menu.url('Profile', (ctx) => {
        return ctx.mentor ? ctx.mentor.url : 'https://getmentor.dev';
    });
    // Status
    menu.toggle(getStatusCaption, 'status', {
        set: setStatus,
        isSet: isStatusSet
    })
    // Requests
    makeRequestsMenu(menu);
    // Tags
    makeTagsMenu(menu);
    // calendly
    menu.switchToCurrentChat('Calendly', 'calendly');

    return menu;
}

function getMentor(ctx: MentorContext): string {
    return 'Hello ' + ctx.mentor ? ctx.mentor.name : 'stranger';
}