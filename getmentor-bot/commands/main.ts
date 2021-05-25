import { MenuTemplate } from "telegraf-inline-menu";
import { MentorContext } from "../bot/MentorContext"
import { makeEditProfileMenu } from "./profile";
import { makeRequestsMenu } from "./requests";

export function mainMenu(): MenuTemplate<MentorContext> {
    const menu = new MenuTemplate<MentorContext>(getMentor);

    // Requests
    makeRequestsMenu(menu);

    // Edit profile
    makeEditProfileMenu(menu);

    // calendly
    menu.switchToCurrentChat('📆 Calendly', 'calendly');

    return menu;
}

function getMentor(ctx: MentorContext): string {
    return 'Hello ' + ctx.mentor ? ctx.mentor.name : 'stranger';
}