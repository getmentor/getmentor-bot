export class MentorClientRequest {
    airtable_id: string;
    email: string;
    name: string;
    status: any;

    constructor(record: any) {
        this.airtable_id = record.id;
        this.name = record.fields.Name;
        this.email = record.fields.Email;
        this.status = record.fields.Status;
    };
};