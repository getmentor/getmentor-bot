import { MentorContext } from "../bot/MentorContext";
import { MentorStatus } from "../models/Mentor";
import { MentorUtils } from "../utils/MentorUtils";

export function getStatusCaption(ctx: MentorContext): string {
    return 'Статус: ' + MentorUtils.formatStatus(ctx.mentor.status);
}

export async function setStatus(ctx: MentorContext, newState: boolean): Promise<boolean> {
    ctx.mentor = await ctx.storage.setMentorStatus(
        ctx.mentor,
        newState ? MentorStatus.active : MentorStatus.inactive
    );
    ctx.mentor.requests = await ctx.storage.getMentorRequests(ctx.mentor);

    return true
}

export function isStatusSet(context: MentorContext): boolean {
    return context.mentor.status === MentorStatus.active
}