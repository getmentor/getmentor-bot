import { MentorStorageRecord } from "../storage/MentorStorage";

export enum MentorClientRequestStatus {
    pending = "pending",
    contacted = "contacted",
    working = "working",
    done = "done",
    reschedule = "reschedule",
    declined = "declined"
}

export class MentorClientRequest {
    id: string;
    email: string;
    name: string;
    telegram: string;
    details: string;
    createdAt: Date;
    modifiedAt: Date;
    statusChangedAt: Date;
    scheduledAt: Date;
    review: string;
    status: MentorClientRequestStatus;

    constructor(record: MentorStorageRecord) {
        this.id = record.id;
        this.name = record.get("Name");
        this.email = record.get("Email");
        this.telegram = (record.get("Telegram") as string).replace('@','');
        this.details = record.get("Description");
        this.review = record.get("Review");
        this.status = record.get("Status") as MentorClientRequestStatus;
        this.createdAt = new Date(record.get("Created Time"));
        this.modifiedAt = new Date(record.get("Last Modified Time"));
        this.scheduledAt = new Date(record.get("Scheduled At"));
        this.statusChangedAt = new Date(record.get("Last Status Change"));
    };
};