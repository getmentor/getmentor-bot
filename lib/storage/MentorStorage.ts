import { Mentor, MentorPrice, MentorStatus } from "../models/Mentor";
import { MentorClientRequest, MentorClientRequestStatus } from "../models/MentorClientRequest";

export interface MentorStorageRecord {
    id: string;
    get(fieldName: string): any;
}

export interface MentorStorage {
    getMentorByTelegramId(chatId: number | string): Promise<Mentor>;
    getMentorBySecretCode(code: string): Promise<Mentor>;

    getMentorActiveRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>>;
    getMentorArchivedRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>>;
    setRequestStatus(request: MentorClientRequest, newStatus: MentorClientRequestStatus): Promise<MentorClientRequest>;

    setMentorStatus(mentor: Mentor, newStatus: MentorStatus): Promise<Mentor>;
    setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor>;
}