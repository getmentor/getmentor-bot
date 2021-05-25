import { MentorContext } from "../bot/MentorContext";
import { MentorStatus } from "../models/Mentor";
import { MentorUtils } from "../utils/MentorUtils";

export function getStatusCaption(ctx: MentorContext): string {
    return 'Статус: ' + MentorUtils.formatStatus(ctx.mentor.status);
}

export async function setStatus(context: MentorContext, newState: boolean): Promise<boolean> {
    context.mentor = await context.storage.setMentorStatus(
        context.mentor,
        newState ? MentorStatus.active : MentorStatus.inactive
    );

    return true
}

export function isStatusSet(context: MentorContext): boolean {
    return context.mentor.status === MentorStatus.active
}