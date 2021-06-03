import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";

export function makeTagsMenu(menu: MenuTemplate<MentorContext>) {
    const tagsMenu = new MenuTemplate<MentorContext>('Ваши текущие тэги')

    let currentPage = 1;

    tagsMenu.select(
        'tag', 
        async (ctx) => {
            let tags = await ctx.storage.getAllTags();
            let choices = new Map<string, string>();
            tags.forEach( (t) => choices.set(t.airtable_id, t.name) );
            return choices;
        },
        {
            columns: 2,
            getCurrentPage: ctx => ctx.session.tagsPage || 1,
            setPage: (ctx, page) => {
                ctx.session.tagsPage = page
            },
            isSet: async (ctx, key) => {
                return ctx.mentor.tag_ids.includes(key);
            },
            set: async (ctx, key, newState) => {
                if (newState) {
                    ctx.mentor.tag_ids.push(key);
                } else {
                    let idx = ctx.mentor.tag_ids.indexOf(key);
                    if (idx > -1) {
                        ctx.mentor.tag_ids.splice(idx, 1);
                    }
                }

                ctx.mentor = await ctx.storage.setMentorTags(ctx.mentor, ctx.mentor.tag_ids)
                ctx.mentor.requests = await ctx.storage.getMentorActiveRequests(ctx.mentor);
                return true
            }
        }
    );

    tagsMenu.manualRow(backButtons);

    menu.submenu('Редактировать тэги', 'tags', tagsMenu);
}