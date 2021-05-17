import { MentorContext } from "../bot/MentorContext";
import { MentorStatus } from "../models/Mentor";

export function getStatusCaption(ctx: MentorContext): string {
    switch (ctx.mentor.status) {
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
    await context.airtable.setMentorStatus(context.mentor, newState ? MentorStatus.active : MentorStatus.inactive);
    // Update the menu afterwards
    return true
}

export function isSet(context: MentorContext): boolean {
    return context.mentor.status === MentorStatus.active
}