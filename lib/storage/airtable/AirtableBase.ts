import { Mentor, MentorStatus } from "../../models/Mentor";

import Airtable from "airtable";
import Base from "airtable/lib/base";
import { MentorClientRequest, MentorClientRequestStatus } from "../../models/MentorClientRequest";
import { MentorStorage } from "../MentorStorage";
import NodeCache = require("node-cache");
import { reportError } from "../../utils/monitor";
import { resetWebCache } from "../../../getmentor-bot/utils/webcache";

export class AirtableBase implements MentorStorage {
    base: Base;
    airtable: Airtable;
    
    _mentorsCache: NodeCache;
    _activeRequestsCache: NodeCache;
    _archivedRequestsCache: NodeCache;
    
    constructor(apiKey: string, baseId: string) {
        this.airtable= new Airtable({
            endpointUrl: 'https://api.airtable.com',
            apiKey: apiKey
        });
        this.base = new Base(this.airtable, baseId);

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

    public async getMentorActiveRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>> {
        return this.getMentorRequests(mentor, {
            filterByFormula: `AND({Mentor Id}='${mentor.id}',Status!='done',Status!='declined',Status!='unavailable')`,
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
            "Level",
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

    private async getMentorByField(fieldName: string, fieldValue: any) : Promise<Mentor> {
        return this.base.table('Mentors').select({
            maxRecords: 1,
            view: "Grid view",
            fields: [
                "Name",
                "Email",
                "JobTitle",
                "Workplace",
                "Details",
                "Profile Url",
                "Alias",
                "Id",
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
                "AuthToken"
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

    public async setRequestStatus(request: MentorClientRequest, newStatus: MentorClientRequestStatus): Promise<MentorClientRequest> {
        if (!request) return;
        if (request.status === MentorClientRequestStatus.done || request.status === MentorClientRequestStatus.declined) {
            return request;
        }

        let newRequest = await this.updateMentorRequestField(request, 'Status', MentorClientRequestStatus[newStatus], this._activeRequestsCache);

        // Some mumbo jumbo when changing status to done or declined
        if (   newRequest.status === MentorClientRequestStatus.done
            || newRequest.status === MentorClientRequestStatus.declined
            || newRequest.status === MentorClientRequestStatus.unavailable) {
            this.swapRequestInCache(newRequest, this._activeRequestsCache, this._archivedRequestsCache);
        }
        if (request.status === MentorClientRequestStatus.unavailable && newRequest.status === MentorClientRequestStatus.contacted) {
            this.swapRequestInCache(newRequest, this._archivedRequestsCache, this._activeRequestsCache);
        }

        return newRequest;
    }

    private swapRequestInCache(request: MentorClientRequest, from: NodeCache, to: NodeCache): void {
        let fromRequests = from.get(request.mentorId) as Map<string, MentorClientRequest>;
        if (fromRequests) {
            fromRequests.delete(request.id);
            from.set(request.mentorId, fromRequests);
        }

        let toRequests = to.get(request.mentorId) as Map<string, MentorClientRequest>;
        if (toRequests) {
            toRequests.set(request.id, request)
            to.set(request.mentorId, toRequests);
        }
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

        return this.updateMentorFields(mentor, opts);
    }

    private async updateMentorFields(mentor: Mentor, fields: any): Promise<Mentor> {
        return this.base.table('Mentors')
            .update(mentor.id, fields)
            .then(record => {
                let newMentor = new Mentor(record);
                this._mentorsCache.set(newMentor.tg_chat_id, newMentor);
                resetWebCache()
                return newMentor;
            })
            .catch((e) => {
                reportError(e);
                return null;
            });
    }
}