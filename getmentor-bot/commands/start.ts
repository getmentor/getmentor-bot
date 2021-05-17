import { MentorContext } from "../bot/MentorContext"

export async function getMentor(ctx: MentorContext): Promise<string> {
    return 'Hello ' + ctx.mentor ? ctx.mentor.name : 'stranger';
}