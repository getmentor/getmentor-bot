import { Mentor, MentorStatus } from "../models/Mentor";
import { MentorClientRequest } from "../models/MentorClientRequest";
import { Tag } from "../models/Tag";

export interface MentorStorageRecord {
    id: string;
    get(fieldName: string): any;
}

export interface MentorStorage {
    //readonly mentor: Mentor;

    getMentorByTelegramId(chatId: number | string): Promise<Mentor>;
    getMentorBySecretCode(code: string): Promise<Mentor>;
    setMentorStatus(mentor: Mentor, newStatus: MentorStatus): Promise<Mentor>;
    setMentorTags(mentor: Mentor, newTagIds: string[]): Promise<Mentor>;
    getMentorActiveRequests(mentor: Mentor): Promise<Array<MentorClientRequest>>;
    getMentorArchivedRequests(mentor: Mentor): Promise<Array<MentorClientRequest>>;
    getAllTags(): Promise<Map<string, Tag>>;
    setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor>;
    setMentorDescription(mentor: Mentor, newDescription: string): Promise<Mentor>;
}