import { MentorStorageRecord } from "../storage/MentorStorage";
import { MentorClientRequest } from "./MentorClientRequest";

export enum MentorStatus {
    pending = "pending",
    active = "active",
    inactive = "inactive",
    declined = "declined"
}

export enum MentorExperience {
    junior = "0-2",
    middle = "2-5",
    senior = "5-10",
    rockstar = "10+"
}

export enum MentorPrice {
    free = "Бесплатно",
    p1000 = "1000 руб",
    p2000 = "2000 руб",
    p3000 = "3000 руб",
    p4000 = "4000 руб",
    p5000 = "5000 руб",
    p6000 = "6000 руб",
    p7000 = "7000 руб",
    p8000 = "8000 руб",
    p9000 = "9000 руб",
    custom = "По договоренности"
}

export class Mentor {
    id: string;
    name: string;
    email: string;
    description: string;
    details: string;
    url: string;
    alias: string;
    tg_secret: string;
    tg_username: string;
    tg_chat_id: string;
    price: MentorPrice;
    status: MentorStatus;
    tag_ids: string[];
    tags: string;
    image: string;
    experience: MentorExperience;
    remarks: string;
    calendar: string;
    requests: Array<MentorClientRequest>;
    archivedRequests: Array<MentorClientRequest>;

    constructor(record: MentorStorageRecord) {
        this.id = record.id;
        this.name = record.get("Title");
        this.email = record.get("Email");
        this.description = record.get("Description");
        this.details = record.get("Details");
        this.url = record.get("Profile Url");
        this.alias = record.get("Alias");
        this.tg_secret = record.get("TgSecret");
        this.tg_username = record.get("Telegram");
        this.tg_chat_id = record.get("Telegram Chat Id");
        this.price = record.get("Price") as MentorPrice;
        this.status = record.get("Status") as MentorStatus;
        this.tag_ids = record.get("Tags Links");
        this.tags = record.get("Tags");
        this.image = record.get("Image");
        this.experience = record.get("Experience") as MentorExperience;
        this.remarks = record.get("Remarks");
        this.calendar = record.get("Calendly");
    };
}