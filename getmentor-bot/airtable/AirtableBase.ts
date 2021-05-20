import { Mentor, MentorStatus } from "../models/Mentor";

import Airtable from "airtable";
import Base from "airtable/lib/base";
import { MentorClientRequest } from "../models/MentorClientRequest";
import { Tag } from "../models/Tag";

//var Airtable = require('airtable');

export class AirtableBase {
    base: Base;
    airtable: Airtable;

    private _allTags: Map<string, Tag>;
    private _chatId : number;
    private _mentor: Mentor;
    public get mentor(): Mentor {
        return this._mentor;
    }
    
    constructor(apiKey: string, baseId: string, chatId: number) {
        this.airtable= new Airtable({
            endpointUrl: 'https://api.airtable.com',
            apiKey: apiKey
        });
        this.base = new Base(this.airtable, baseId);
        this._allTags = undefined;
        this._chatId = chatId;
    }

    public async getMentorByTelegramId(chatId: number | string) : Promise<Mentor> {
        this._mentor = await this.getMentorByField('{Telegram Chat Id}', chatId);
        return this._mentor;
    }

    public async getMentorBySecretCode(code: string) : Promise<Mentor> {
        return this.getMentorByField('{TgSecret}', code);
    }

    public async setMentorStatus(newStatus: MentorStatus) {
        if (!this._mentor) return;
        if (this._mentor.status === newStatus) return;

        await this.base.table('Mentors').update(this._mentor.airtable_id, {
            "Status": MentorStatus[newStatus]
        });

        this._mentor.status = newStatus;
    }

    public async setMentorTags(mentor: Mentor) {
        if (!mentor) return;

        let record = await this.base.table('Mentors').update(mentor.airtable_id, {
            "Tags Links": mentor.tag_ids
        });
        //this._mentor = new Mentor(record);
    }

    public async getMentorRequests(mentor: Mentor) {
        let requests = await this.base.table('Client Requests').select({
                view: "Grid view",
                filterByFormula: `AND({Mentor Id}='${mentor.airtable_id}',Status!='done',Status!='declined')`,
                sort: [{field: "Last Modified Time", direction: "asc"}]
        }).firstPage();

        requests.forEach(r => {
           mentor.requests.push(new MentorClientRequest(r));
        });

        return mentor;
    }

    public async getAllTags(): Promise<Map<string, Tag>> {
        if ( !this._allTags ) {
            this._allTags = new Map<string, Tag>();

            let tags = await this.base.table('Tags').select({
                    view: "General"
            }).firstPage();

            const tagObjects = tags.map( t => new Tag(t));
            tagObjects.forEach( t => this._allTags.set(t.airtable_id, t));
        }

        return this._allTags;
    }

    private async getMentorByField(fieldName: string, fieldValue: any) : Promise<Mentor> {
        let records = await this.base.table('Mentors').select({
            maxRecords: 1,
            view: "Grid view",
            filterByFormula: `${fieldName}='${fieldValue}'`
        }).firstPage();

        if (records.length === 0) return undefined;

        return new Mentor(records[0]);
    }

    public async setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor> {
        let record = await this.base.table('Mentors').update(mentorId, {
            "Telegram Chat Id": `${chatId}`
        });

        this._mentor = new Mentor(record);
        return this._mentor;
    }
}