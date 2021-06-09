import { Mentor, MentorStatus } from "../../models/Mentor";

import Airtable from "airtable";
import Base from "airtable/lib/base";
import { MentorClientRequest } from "../../models/MentorClientRequest";
import { Tag } from "../../models/Tag";
import { MentorStorage } from "../MentorStorage";
import NodeCache = require("node-cache");
import { stringsContent } from "../../strings/content";

export class AirtableBase implements MentorStorage {
    base: Base;
    airtable: Airtable;
    
    _mentorsCache: NodeCache;
    _activeRequestsCache: NodeCache;
    _archivedRequestsCache: NodeCache;

    private _allTags: Map<string, Tag>;
    
    constructor(apiKey: string, baseId: string) {
        this.airtable= new Airtable({
            endpointUrl: 'https://api.airtable.com',
            apiKey: apiKey
        });
        this.base = new Base(this.airtable, baseId);
        this._allTags = undefined;

        this._mentorsCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
        this._activeRequestsCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
        this._archivedRequestsCache = new NodeCache({ stdTTL: 6000, checkperiod: 600 });
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
        if (mentor.status === newStatus) return mentor;

        return this.updateMentorField(mentor, 'Status', MentorStatus[newStatus]);
    }

    public async setMentorTags(mentor: Mentor, newTagIds: string[]): Promise<Mentor> {
        if (!mentor) return;
        return this.updateMentorField(mentor, 'Tags Links', newTagIds);
    }

    public async getMentorActiveRequests(mentor: Mentor): Promise<Array<MentorClientRequest>> {
        return this.getMentorRequests(mentor, {
            view: "Grid view",
            filterByFormula: `AND({Mentor Id}='${mentor.id}',Status!='done',Status!='declined')`,
            sort: [{field: "Created Time", direction: "asc"}]
        }, this._activeRequestsCache);
    }

    public async getMentorArchivedRequests(mentor: Mentor): Promise<Array<MentorClientRequest>> {
        return this.getMentorRequests(mentor, {
            view: "Grid view",
            filterByFormula: `AND({Mentor Id}='${mentor.id}',Status!='pending',Status!='working',Status!='contacted')`,
            sort: [{field: "Created Time", direction: "asc"}]
        }, this._archivedRequestsCache);
    }

    private async getMentorRequests(mentor: Mentor, options: any, cache: NodeCache): Promise<Array<MentorClientRequest>> {
        let requests = cache.get(mentor.id) as MentorClientRequest[];

        if (!requests ) {
            requests = await this.base.table('Client Requests').select(options)
            .firstPage()
            .then( records => {
                let rs = new Array<MentorClientRequest>();
                records.forEach(r => {
                    rs.push(new MentorClientRequest(r));
                 });
                 return rs;
            });

            cache.set(mentor.id, requests);
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

    public async setMentorDescription(mentor: Mentor, newDescription: string): Promise<Mentor> {
        if (!mentor) return;

        return this.updateMentorField(mentor, 'Details', newDescription);
    }

    private async updateMentorField(mentor: Mentor, fieldName: string, newValue: any): Promise<Mentor> {
        if (!mentor) return;

        let opts = {};
        opts[fieldName] = newValue;

        return this.base.table('Mentors').update(mentor.id, opts)
        .then(record => {
            let newMentor = new Mentor(record);
            this._mentorsCache.set(newMentor.tg_chat_id, newMentor);
            return newMentor;
        }).then(async m => await this._recreateMentorProfilePage(m));
    }

    private async _recreateMentorProfilePage(mentor: Mentor): Promise<Mentor> {
        if (!mentor) return;

        return this.base.table('Content').select({
            view: "Grid view",
            filterByFormula: `Page='${mentor.alias}'`
        }).firstPage().then(async records => {
            if (records && records.length > 0) {
                return this.base.table('Content').destroy(
                    records.map(r => r.id)
                )
            }
            return;
        }).then(
            async _ => {
                let header = {
                    "fields": {
                        "Id": "header",
                        "Type": 'Hero',
                        "Text color": "#1A2238",
                        "Background color": "#fcf8f2",
                        "Title": mentor.name,
                        "Text": stringsContent.headline(mentor),
                        "Page": mentor.alias,
                        "Content Type": "mentor"
                    }
                };

                let body = {
                    "fields": {
                        "Id": "body",
                        "Type": 'Image left, text right',
                        "Text color": "#1A2238",
                        "Background color": "#fcf8f2",
                        "Text": stringsContent.description(mentor),
                        "Options": stringsContent.descriptionOptions(mentor),
                        "Page": mentor.alias,
                        "Content Type": "mentor"
                    }
                };

                let footer = {
                    "fields": {
                        "Id": "footer",
                        "Type": "Footer",
                        "Text color": "#1A2238",
                        "Background color": "#fcf8f2",
                        "Text": stringsContent.footer(),
                        "Page": mentor.alias,
                        "Content Type": "mentor"
                    }
                };

                return this.base.table('Content').create([
                    header,
                    body,
                    footer
                ])
        }).catch(
            error => console.log(error)
        ).then(
            _ => mentor
        )
    }
}