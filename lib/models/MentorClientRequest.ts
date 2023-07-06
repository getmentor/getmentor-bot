import { MentorStorageRecord } from "../storage/MentorStorage";

export enum MentorClientRequestStatus {
    pending = "pending",
    contacted = "contacted",
    working = "working",
    done = "done",
    reschedule = "reschedule",
    declined = "declined",
    unavailable = "unavailable"
}

export class MentorClientRequest {
    id: string;
    email: string;
    name: string;
    telegram: string;
    details: string;
    level: string;
    createdAt: Date;
    modifiedAt: Date;
    statusChangedAt: Date;
    scheduledAt: Date;
    review: string;
    status: MentorClientRequestStatus;
    mentorId: string;
    review_url: string;

    constructor(record: MentorStorageRecord) {
        this.id = record.id;
        this.name = record.get("Name");
        this.email = record.get("Email");
        this.telegram = (record.get("Telegram") as string).replace('@','') || '-';
        this.details = record.get("Description");
        this.level = record.get("Level");
        const review = record.get("Review") as string;
        const review_ng = record.get("Review2") as string;
        this.review = review_ng || review;
        this.status = record.get("Status") as MentorClientRequestStatus;
        this.createdAt = new Date(record.get("Created Time"));
        this.modifiedAt = new Date(record.get("Last Modified Time"));
        this.scheduledAt = new Date(record.get("Scheduled At"));
        this.statusChangedAt = new Date(record.get("Last Status Change"));
        this.mentorId = record.get("Mentor")[0];
        this.review_url = record.get("ReviewFormUrl");
    };
};