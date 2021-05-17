export enum MentorStatus {
    pending,
    active,
    inactive,
    declined
}

export enum MentorExperience {
    junior = "0-2",
    middle = "2-5",
    senior = "5-10",
    rockstar = "10+"
}

export enum MentorPrice {
    free = "Бесплатно",
    p1000 = "1000",
    p2000 = "2000",
    p3000 = "3000",
    p4000 = "4000",
    p5000 = "5000",
    p6000 = "6000",
    p7000 = "7000",
    p8000 = "8000",
    p9000 = "9000",
    custom = "По договоренности"
}

export class Mentor {
    airtable_id: string;
    name: string;
    email: string;
    description: string;
    details: string;
    url: string;
    tg_secret: string;
    tg_username: string;
    tg_chat_id: string;
    price: MentorPrice;
    status: MentorStatus;
    tags: string;
    image: string;
    experience: MentorExperience;
    remarks: string;
    calendar: string;

    constructor(record: any) {
        this.airtable_id = record.id;
        this.name = record.fields.Title;
        this.email = record.fields.Email;
        this.description = record.fields.Description;
        this.details = record.fields.Details;
        this.url = record.fields["Profile Url"];
        this.tg_secret = record.fields.TgSecret;
        this.tg_username = record.fields.Telegram;
        this.tg_chat_id = record.fields["Telegram Chat Id"];
        this.price = MentorPrice[record.fields.Price as keyof typeof MentorPrice];
        this.status = MentorStatus[record.fields.Status as keyof typeof MentorStatus];
        this.tags = record.fields.Tags;
        this.image = record.fields.Image;
        this.experience = MentorExperience[record.fields.Experience as keyof typeof MentorExperience];
        this.remarks = record.fields.Remarks;
        this.calendar = record.fields.Calendly;
    };
}