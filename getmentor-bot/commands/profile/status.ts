import { MentorContext } from "../../bot/MentorContext";
import { MentorStatus } from "../../../lib/models/Mentor";
import { MentorUtils } from "../../../lib/utils/MentorUtils";
import { mixpanel } from "../../utils/mixpanel";

export function getStatusCaption(ctx: MentorContext): string {
    return 'Статус: ' + MentorUtils.formatStatus(ctx.mentor.status);
}

export async function setStatus(ctx: MentorContext, newState: boolean): Promise<boolean> {
    let newMentor = await ctx.storage.setMentorStatus(
        ctx.mentor,
        newState ? MentorStatus.active : MentorStatus.inactive
    );

    let failed = '';
    if (newMentor) {
        ctx.mentor = newMentor
    } else {
        failed = '_failed'
    }

    mixpanel.track('profile_edit_status' + failed, {
        distinct_id: ctx.chat.id,
        mentor_id: ctx.mentor.id,
        mentor_name: ctx.mentor.name,
        status: newState
    })

    return true
}

export function isStatusSet(context: MentorContext): boolean {
    return context.mentor.status === MentorStatus.active
}