import { Mentor, MentorStatus } from "../../models/Mentor";

import Airtable from "airtable";
import Base from "airtable/lib/base";
import { MentorClientRequest } from "../../models/MentorClientRequest";
import { Tag } from "../../models/Tag";
import { MentorStorage } from "../MentorStorage";
import NodeCache = require("node-cache");

export class AirtableBase implements MentorStorage {
    base: Base;
    airtable: Airtable;
    
    _mentorsCache: NodeCache;
    _requestsCache: NodeCache;

    private _allTags: Map<string, Tag>;
    
    constructor(apiKey: string, baseId: string) {
        this.airtable= new Airtable({
            endpointUrl: 'https://api.airtable.com',
            apiKey: apiKey
        });
        this.base = new Base(this.airtable, baseId);
        this._allTags = undefined;

        this._mentorsCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
        this._requestsCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
    }

    public async getMentorByTelegramId(chatId: number | string) : Promise<Mentor> {
        let mentor = this._mentorsCache.get(chatId) as Mentor;

        if ( !mentor ) {
            mentor = await this.getMentorByField('{Telegram Chat Id}', chatId);
            this._mentorsCache.set(chatId, mentor);
        }

        return mentor;
    }

    public async getMentorBySecretCode(code: string) : Promise<Mentor> {
        let mentor = await this.getMentorByField('{TgSecret}', code);
        if (mentor) {
            this._mentorsCache.set(mentor.tg_chat_id, mentor);
        }
        return mentor;
    }

    public async setMentorStatus(mentor: Mentor, newStatus: MentorStatus): Promise<Mentor> {
        if (!mentor) return;
        if (mentor.status === newStatus) return;

        return this.base.table('Mentors').update(mentor.airtable_id, {
            "Status": MentorStatus[newStatus]
        }).then(record => {
            let newMentor = new Mentor(record);
            this._mentorsCache.set(newMentor.tg_chat_id, newMentor);
            return newMentor;
        });
    }

    public async setMentorTags(mentor: Mentor): Promise<Mentor> {
        if (!mentor) return;

        return this.base.table('Mentors').update(mentor.airtable_id, {
            "Tags Links": mentor.tag_ids
        }).then(record => {
            let newMentor = new Mentor(record);
            this._mentorsCache.set(newMentor.tg_chat_id, newMentor);
            return newMentor;
        });
    }

    public async getMentorRequests(mentor: Mentor): Promise<Array<MentorClientRequest>> {
        let requests = this._requestsCache.get(mentor.airtable_id) as MentorClientRequest[];

        if (!requests ) {
            requests = await this.base.table('Client Requests').select({
                    view: "Grid view",
                    filterByFormula: `AND({Mentor Id}='${mentor.airtable_id}',Status!='done',Status!='declined')`,
                    sort: [{field: "Last Modified Time", direction: "asc"}]
            })
            .firstPage()
            .then( records => {
                let rs = new Array<MentorClientRequest>();
                records.forEach(r => {
                    rs.push(new MentorClientRequest(r));
                 });
                 return rs;
            });

            this._requestsCache.set(mentor.airtable_id, requests);
        }

        return requests;
    }

    public async getAllTags(): Promise<Map<string, Tag>> {
        if ( !this._allTags ) {
            this._allTags = new Map<string, Tag>();

            await this.base.table('Tags').select({
                    view: "General"
            }).firstPage().then(tags => {
                let tagObjects = tags.map( t => new Tag(t));
                tagObjects.forEach(t => this._allTags.set(t.airtable_id, t));
            });
        }

        return this._allTags;
    }

    private async getMentorByField(fieldName: string, fieldValue: any) : Promise<Mentor> {
        return this.base.table('Mentors').select({
            maxRecords: 1,
            view: "Grid view",
            filterByFormula: `${fieldName}='${fieldValue}'`
        }).firstPage().then(records => {
            if (records.length === 0) return undefined;
            return new Mentor(records[0]);
        });
    }

    public async setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor> {
        return this.base.table('Mentors').update(mentorId, {
            "Telegram Chat Id": `${chatId}`
        }).then(r => {
            let mentor = new Mentor(r);
            this._mentorsCache.set(chatId, mentor);
            return mentor;
        });
    }
}