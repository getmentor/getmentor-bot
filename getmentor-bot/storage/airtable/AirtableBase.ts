import { Mentor, MentorPrice, MentorStatus } from "../../models/Mentor";

import Airtable from "airtable";
import Base from "airtable/lib/base";
import { MentorClientRequest, MentorClientRequestStatus } from "../../models/MentorClientRequest";
import { Tag } from "../../models/Tag";
import { MentorStorage } from "../MentorStorage";
import NodeCache = require("node-cache");
import { stringsContent } from "../../strings/content";
import { reportError } from "../../utils/sentry";

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
        if (mentor && mentor.tg_chat_id) {
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

    public async getMentorActiveRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>> {
        return this.getMentorRequests(mentor, {
            filterByFormula: `AND({Mentor Id}='${mentor.id}',Status!='done',Status!='declined')`,
            sort: [{field: "Created Time", direction: "asc"}]
        }, this._activeRequestsCache);
    }

    public async getMentorArchivedRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>> {
        return this.getMentorRequests(mentor, {
            view: "Grid view",
            filterByFormula: `AND({Mentor Id}='${mentor.id}',Status!='pending',Status!='working',Status!='contacted')`,
            sort: [{field: "Last Modified Time", direction: "desc"}]
        }, this._archivedRequestsCache);
    }

    private async getMentorRequests(mentor: Mentor, options: any, cache: NodeCache): Promise<Map<string, MentorClientRequest>> {
        let requests = cache.get(mentor.id) as Map<string, MentorClientRequest>;

        options.view = "Grid view";
        options.fields = [
            "Name",
            "Email",
            "Telegram",
            "Description",
            "Review",
            "Status",
            "Created Time",
            "Last Modified Time",
            "Scheduled At",
            "Last Status Change",
            "Mentor"
        ];

        if (!requests ) {
            requests = await this.base.table('Client Requests').select(options)
            .all()
            .then( records => {
                let rs = new Map<string, MentorClientRequest>();
                records.forEach(r => {
                    let req = new MentorClientRequest(r);
                    rs.set(req.id, req);
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
            }).all().then(tags => {
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
            fields: [
                "Title",
                "Email",
                "Description",
                "Details",
                "Profile Url",
                "Alias",
                "TgSecret",
                "Telegram",
                "Telegram Chat Id",
                "Price",
                "Status",
                "Tags Links",
                "Tags",
                "Image",
                "Experience",
                "Calendly Url",
            ],
            filterByFormula: `${fieldName}='${fieldValue}'`
        }).all().then(records => {
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

    public async setMentorPrice(mentor: Mentor, price: MentorPrice): Promise<Mentor> {
        if (!mentor) return;
        return this.updateMentorField(mentor, 'Price', price.toString());
    }

    public async setMentorDescription(mentor: Mentor, newDescription: string): Promise<Mentor> {
        if (!mentor) return;

        return this.updateMentorField(mentor, 'Details', newDescription);
    }

    public async setMentorTitle(mentor: Mentor, newDescription: string): Promise<Mentor> {
        if (!mentor) return;

        return this.updateMentorField(mentor, 'Description', newDescription);
    }

    public async setRequestStatus(request: MentorClientRequest, newStatus: MentorClientRequestStatus): Promise<MentorClientRequest> {
        if (!request) return;
        if (request.status === MentorClientRequestStatus.done || request.status === MentorClientRequestStatus.declined) {
            return request;
        }

        let newRequest = await this.updateMentorRequestField(request, 'Status', MentorClientRequestStatus[newStatus], this._activeRequestsCache);

        // Some mumbo jumbo when changing status to done or declined
        if (newRequest.status === MentorClientRequestStatus.done || newRequest.status === MentorClientRequestStatus.declined) {
            let requests = this._activeRequestsCache.get(request.mentorId) as Map<string, MentorClientRequest>;
            requests.delete(newRequest.id);
            this._activeRequestsCache.set(request.mentorId, requests);

            let archivedRequests = this._archivedRequestsCache.get(request.mentorId) as Map<string, MentorClientRequest>;
            if (archivedRequests) {
                archivedRequests.set(newRequest.id, newRequest)
                this._activeRequestsCache.set(request.mentorId, archivedRequests);
            }
        }

        return newRequest;
    }

    private async updateMentorRequestField(request: MentorClientRequest, fieldName: string, newValue: any, cache: NodeCache): Promise<MentorClientRequest> {
        if (!request) return;

        let opts = {};
        opts[fieldName] = newValue;

        return this.base.table('Client Requests').update(request.id, opts)
        .then(record => {
            let newRequest = new MentorClientRequest(record);
            let cachedRequests = cache.get(request.mentorId) as Map<string, MentorClientRequest>;
            if (cachedRequests) {
                cachedRequests.set(newRequest.id, newRequest);
                cache.set(request.mentorId, cachedRequests);
            }
            return newRequest;
        });
    }

    private async updateMentorField(mentor: Mentor, fieldName: string, newValue: any): Promise<Mentor> {
        if (!mentor) return;

        let opts = {};
        opts[fieldName] = newValue;

        return this.base.table('Mentors')
            .update(mentor.id, opts)
            .then(record => {
                let newMentor = new Mentor(record);
                this._mentorsCache.set(newMentor.tg_chat_id, newMentor);
                return newMentor;
            })
            .catch((e) => {
                reportError(e);
                return null;
            });
    }
}