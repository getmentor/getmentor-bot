import { MentorContext } from "../bot/MentorContext"

export async function getMentor(ctx: MentorContext): Promise<string> {
    return 'Hello ' + ctx.airtable.mentor ? ctx.airtable.mentor.name : 'stranger';
}