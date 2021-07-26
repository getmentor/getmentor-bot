import { Mentor, MentorPrice, MentorStatus } from "../models/Mentor";
import { MentorClientRequest, MentorClientRequestStatus } from "../models/MentorClientRequest";
import { Tag } from "../models/Tag";

export interface MentorStorageRecord {
    id: string;
    get(fieldName: string): any;
}

export interface MentorStorage {
    getMentorByTelegramId(chatId: number | string): Promise<Mentor>;
    getMentorBySecretCode(code: string): Promise<Mentor>;
    setMentorStatus(mentor: Mentor, newStatus: MentorStatus): Promise<Mentor>;
    setMentorTags(mentor: Mentor, newTagIds: string[]): Promise<Mentor>;
    setMentorPrice(mentor: Mentor, price: MentorPrice): Promise<Mentor>;

    getMentorActiveRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>>;
    getMentorArchivedRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>>;
    setRequestStatus(request: MentorClientRequest, newStatus: MentorClientRequestStatus): Promise<MentorClientRequest>;
    getAllTags(): Promise<Map<string, Tag>>;
    setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor>;
    setMentorDescription(mentor: Mentor, newDescription: string): Promise<Mentor>;
}