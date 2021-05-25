import { Mentor, MentorStatus } from "../models/Mentor";
import { Tag } from "../models/Tag";

export interface MentorStorage {
    //readonly mentor: Mentor;

    getMentorByTelegramId(chatId: number | string): Promise<Mentor>;
    getMentorBySecretCode(code: string): Promise<Mentor>;
    setMentorStatus(mentor: Mentor, newStatus: MentorStatus): Promise<Mentor>;
    setMentorTags(mentor: Mentor): Promise<Mentor>;
    getMentorRequests(mentor: Mentor);
    getAllTags(): Promise<Map<string, Tag>>;
    setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor>;
}