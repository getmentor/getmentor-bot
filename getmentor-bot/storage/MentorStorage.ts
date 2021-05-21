import { Mentor, MentorStatus } from "../models/Mentor";
import { Tag } from "../models/Tag";

export interface MentorStorage {
    readonly mentor: Mentor;

    getMentorByTelegramId(chatId: number | string) : Promise<Mentor>;
    getMentorBySecretCode(code: string) : Promise<Mentor>;
    setMentorStatus(newStatus: MentorStatus);
    setMentorTags(mentor: Mentor);
    getMentorRequests(mentor: Mentor);
    getAllTags(): Promise<Map<string, Tag>>;
    setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor>;
}