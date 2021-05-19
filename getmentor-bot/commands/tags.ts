import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../bot/general";
import { MentorContext } from "../bot/MentorContext";

export function makeTagsMenu(menu: MenuTemplate<MentorContext>) {
    const tagsMenu = new MenuTemplate<MentorContext>('Ваши текущие тэги')

    let currentPage = 1;

    tagsMenu.select(
        'tag', 
        async (ctx) => {
            let tags = await ctx.airtable.getAllTags();
            let choices = new Map<string, string>();
            tags.forEach( (t) => choices.set(t.airtable_id, t.name) );
            return choices;
        }, 
        {
            columns: 2,
            getCurrentPage: _ => currentPage,
            setPage: (_, page) => {
                currentPage = page
            },
            isSet: async (ctx, key) => {
                return ctx.airtable.mentor.tag_ids.includes(key);
            },
            set: async (ctx, key, newState) => {
                if (newState) {
                    ctx.airtable.mentor.tag_ids.push(key);
                } else {
                    let idx = ctx.airtable.mentor.tag_ids.indexOf(key);
                    if (idx > -1) {
                        ctx.airtable.mentor.tag_ids.splice(idx, 1);
                    }
                }

                ctx.airtable.setMentorTags(ctx.airtable.mentor)
                return true
            }
        }
    );

    tagsMenu.manualRow(backButtons);

    menu.submenu('Тэги', 'tags', tagsMenu);
}