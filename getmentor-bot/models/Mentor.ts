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
    airtable_id: string;
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

    constructor(record: any) {
        this.airtable_id = record.id;
        this.name = record.fields.Title;
        this.email = record.fields.Email;
        this.description = record.fields.Description;
        this.details = record.fields.Details;
        this.url = record.fields["Profile Url"];
        this.alias = record.fields.Alias;
        this.tg_secret = record.fields.TgSecret;
        this.tg_username = record.fields.Telegram;
        this.tg_chat_id = record.fields["Telegram Chat Id"];
        this.price = record.fields.Price as MentorPrice;
        this.status = record.fields.Status as MentorStatus;
        this.tag_ids = record.fields["Tags Links"];
        this.tags = record.fields.Tags;
        this.image = record.fields.Image;
        this.experience = record.fields.Experience as MentorExperience;
        this.remarks = record.fields.Remarks;
        this.calendar = record.fields.Calendly;
    };
}