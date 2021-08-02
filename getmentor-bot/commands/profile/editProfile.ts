import { menuMiddleware } from "../../bot/general";
import { MentorContext } from "../../bot/MentorContext";
import { mixpanel } from "../../utils/mixpanel";

import { URL } from 'url';
import { stringsCommon } from "../../strings/common";

export async function editProfile(ctx: MentorContext, additionalState: string) {
    if ('text' in ctx.message) {
        switch (additionalState) {
            case 'p_desc':
                var newMentor = await ctx.storage.setMentorDescription(ctx.mentor, ctx.message.text);
                var failed = ''
                if (newMentor) {
                    ctx.mentor = newMentor
                    await ctx.reply(`✅ Все сделано!`);
                } else {
                    await ctx.reply(stringsCommon.error);
                    failed = '_failed'
                }

                track_event('profile_edit_description' + failed, ctx);
                break;

            case 'p_title':
                var newMentor = await ctx.storage.setMentorTitle(ctx.mentor, ctx.message.text);
                var failed = ''
                if (newMentor) {
                    ctx.mentor = newMentor
                    await ctx.reply(`✅ Все сделано!`);
                } else {
                    await ctx.reply(stringsCommon.error);
                    failed = '_failed'
                }

                track_event('profile_edit_title' + failed, ctx);
                break;

            case 'p_cal':
                var url: URL;

                try {
                    url = new URL(ctx.message.text);
                } catch (err) {
                    await ctx.reply(`⚠️ Я такую ссылку не понимаю, простите`);
                    track_event('profile_edit_calendar_invalid_url', ctx);
                }

                if (url) {
                    var failed = '';
                    var newMentor = await ctx.storage.setMentorCalendar(ctx.mentor, url.toString());

                    if (newMentor) {
                        ctx.mentor = newMentor
                        await ctx.reply(`✅ Все сделано!`);
                    } else {
                        await ctx.reply(stringsCommon.error);
                        failed = '_failed'
                    }

                    track_event('profile_edit_calendar' + failed, ctx);
                }
                break;

            default:
                break;
        }
    } else {
        console.log("No text");
    }

    menuMiddleware.replyToContext(ctx, '/edit_p/');
}

function track_event(name: string, ctx: MentorContext) {
    mixpanel.track(name, {
        distinct_id: ctx.chat.id,
        mentor_id: ctx.mentor.id,
        mentor_name: ctx.mentor.name,
    })
}