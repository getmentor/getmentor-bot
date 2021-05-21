import { MentorContext } from "../bot/MentorContext";
import { MentorStatus } from "../models/Mentor";

export function getStatusCaption(ctx: MentorContext): string {
    switch (ctx.airtable.mentor.status) {
        case MentorStatus.active:
            return 'Статус: активный';
        
        case MentorStatus.inactive:
            return 'Статус: неактивный';
        
        case MentorStatus.pending:
            return 'Статус: на рассмотрении';

        case MentorStatus.declined:
            return 'Статус: отклонен';
    
        default:
            return 'Статус: неизвестен';
    }
}

export async function setStatus(context: MentorContext, newState: boolean): Promise<boolean> {
    await context.airtable.setMentorStatus(newState ? MentorStatus.active : MentorStatus.inactive);
    // Update the menu afterwards
    return true
}

export function isStatusSet(context: MentorContext): boolean {
    return context.airtable.mentor.status === MentorStatus.active
}