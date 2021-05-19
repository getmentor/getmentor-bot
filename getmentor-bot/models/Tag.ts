export class Tag {
    airtable_id: string;
    name: string;
    
    constructor(record: any) {
        this.airtable_id = record.id;
        this.name = record.fields.Name;
    }
};