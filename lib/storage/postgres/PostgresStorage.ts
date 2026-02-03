import { Pool } from 'pg';
import { Mentor, MentorStatus } from "../../models/Mentor";
import { MentorClientRequest, MentorClientRequestStatus } from "../../models/MentorClientRequest";
import { MentorStorage, MentorStorageRecord } from "../MentorStorage";
import NodeCache = require("node-cache");
import { reportError } from "../../utils/monitor";

/**
 * PostgreSQL row adapter that implements MentorStorageRecord interface
 * Maps snake_case PostgreSQL columns to Airtable field names for backwards compatibility
 */
class PgRowAdapter implements MentorStorageRecord {
    id: string;
    private row: any;

    // Field mapping: Airtable field name -> PostgreSQL column name
    private static fieldMapping: Record<string, string> = {
        // Mentor fields
        'Id': 'legacy_id',
        'Name': 'name',
        'Email': 'email',
        'Status': 'status',
        'Telegram': 'telegram',
        'Telegram Chat Id': 'telegram_chat_id',
        'Price': 'price',
        'JobTitle': 'job_title',
        'Workplace': 'workplace',
        'Details': 'details',
        'TgSecret': 'tg_secret',
        'Alias': 'slug',
        'Experience': 'experience',
        'Calendly Url': 'calendar_url',
        'AuthToken': 'login_token',

        // Client Request fields
        'Description': 'description',
        'Level': 'level',
        'Created Time': 'created_at',
        'Last Modified Time': 'updated_at',
        'Scheduled At': 'scheduled_at',
        'Last Status Change': 'status_changed_at',
        'Mentor': 'mentor_id',
    };

    constructor(row: any) {
        this.row = row;
        this.id = row.id;
    }

    get(fieldName: string): any {
        // Handle computed fields
        if (fieldName === 'Profile Url') {
            const slug = this.row['slug'];
            return slug ? `https://getmentor.dev/mentor/${slug}` : undefined;
        }
        if (fieldName === 'Tags') {
            return this.row['tags_joined'] || '';
        }
        if (fieldName === 'Image') {
            const slug = this.row['slug'];
            return slug ? { url: `https://${process.env.AZURE_STORAGE_DOMAIN}/${slug}/large` } : {};
        }
        if (fieldName === 'ReviewFormUrl') {
            return `https://getmentor.dev/review/${this.row['id']}`;
        }

        const pgColumn = PgRowAdapter.fieldMapping[fieldName];
        if (pgColumn) {
            const value = this.row[pgColumn];

            // Special handling for Mentor field (returns array with single ID in Airtable)
            if (fieldName === 'Mentor' && value) {
                return [value];
            }

            return value;
        }

        // If no mapping found, try the field name as-is
        return this.row[fieldName];
    }
}

/**
 * PostgreSQL implementation of MentorStorage interface
 * Provides the same caching behavior as AirtableBase
 */
export class PostgresStorage implements MentorStorage {
    private pool: Pool;

    _mentorsCache: NodeCache;
    _activeRequestsCache: NodeCache;
    _archivedRequestsCache: NodeCache;

    constructor(databaseUrl: string) {
        this.pool = new Pool({
            connectionString: databaseUrl,
        });

        this._mentorsCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
        this._activeRequestsCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
        this._archivedRequestsCache = new NodeCache({ stdTTL: 6000, checkperiod: 600 });
    }

    public async getMentorByTelegramId(chatId: number | string): Promise<Mentor> {
        let mentor = this._mentorsCache.get(chatId) as Mentor;

        if (!mentor) {
            const result = await this.pool.query(
                `SELECT m.*,
                        COALESCE(
                          (SELECT string_agg(t.name, ', ')
                           FROM mentor_tags mt
                           JOIN tags t ON t.id = mt.tag_id
                           WHERE mt.mentor_id = m.id),
                          ''
                        ) AS tags_joined
                 FROM mentors m
                 WHERE m.telegram_chat_id = $1`,
                [chatId]
            );

            if (result.rows.length > 0) {
                mentor = new Mentor(new PgRowAdapter(result.rows[0]));
                this._mentorsCache.set(chatId, mentor);
            }
        }

        return mentor;
    }

    public async getMentorBySecretCode(code: string): Promise<Mentor> {
        const result = await this.pool.query(
            `SELECT m.*,
                    COALESCE(
                      (SELECT string_agg(t.name, ', ')
                       FROM mentor_tags mt
                       JOIN tags t ON t.id = mt.tag_id
                       WHERE mt.mentor_id = m.id),
                      ''
                    ) AS tags_joined
             FROM mentors m
             WHERE m.tg_secret = $1`,
            [code]
        );

        if (result.rows.length === 0) {
            return undefined;
        }

        const mentor = new Mentor(new PgRowAdapter(result.rows[0]));
        if (mentor && mentor.tg_chat_id) {
            this._mentorsCache.set(mentor.tg_chat_id, mentor);
        }

        return mentor;
    }

    public async setMentorStatus(mentor: Mentor, newStatus: MentorStatus): Promise<Mentor> {
        if (!mentor) return;
        if (mentor.status === newStatus) return mentor;

        const result = await this.pool.query(
            'UPDATE mentors SET status = $1 WHERE id = $2 RETURNING *',
            [MentorStatus[newStatus], mentor.id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const newMentor = new Mentor(new PgRowAdapter(result.rows[0]));
        this._mentorsCache.set(newMentor.tg_chat_id, newMentor);

        return newMentor;
    }

    public async getMentorActiveRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>> {
        let requests = this._activeRequestsCache.get(mentor.id) as Map<string, MentorClientRequest>;

        if (!requests) {
            const result = await this.pool.query(
                `SELECT cr.*,
                        r.mentor_review as review,
                        r.platform_review as review2
                 FROM client_requests cr
                 LEFT JOIN reviews r ON r.client_request_id = cr.id
                 WHERE cr.mentor_id = $1
                 AND cr.status NOT IN ('done', 'declined', 'unavailable')
                 ORDER BY cr.created_at ASC`,
                [mentor.id]
            );

            requests = new Map<string, MentorClientRequest>();
            result.rows.forEach(row => {
                const req = new MentorClientRequest(new PgRowAdapter(row));
                requests.set(req.id, req);
            });

            this._activeRequestsCache.set(mentor.id, requests);
        }

        return requests;
    }

    public async getMentorArchivedRequests(mentor: Mentor): Promise<Map<string, MentorClientRequest>> {
        let requests = this._archivedRequestsCache.get(mentor.id) as Map<string, MentorClientRequest>;

        if (!requests) {
            const result = await this.pool.query(
                `SELECT cr.*,
                        r.mentor_review as review,
                        r.platform_review as review2
                 FROM client_requests cr
                 LEFT JOIN reviews r ON r.client_request_id = cr.id
                 WHERE cr.mentor_id = $1
                 AND cr.status NOT IN ('pending', 'working', 'contacted')
                 ORDER BY cr.updated_at DESC`,
                [mentor.id]
            );

            requests = new Map<string, MentorClientRequest>();
            result.rows.forEach(row => {
                const req = new MentorClientRequest(new PgRowAdapter(row));
                requests.set(req.id, req);
            });

            this._archivedRequestsCache.set(mentor.id, requests);
        }

        return requests;
    }

    public async setMentorTelegramChatId(mentorId: string, chatId: number): Promise<Mentor> {
        const result = await this.pool.query(
            'UPDATE mentors SET telegram_chat_id = $1 WHERE id = $2 RETURNING *',
            [chatId, mentorId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const mentor = new Mentor(new PgRowAdapter(result.rows[0]));
        this._mentorsCache.set(chatId, mentor);

        return mentor;
    }

    public async setRequestStatus(request: MentorClientRequest, newStatus: MentorClientRequestStatus): Promise<MentorClientRequest> {
        if (!request) return;
        if (request.status === MentorClientRequestStatus.done || request.status === MentorClientRequestStatus.declined) {
            return request;
        }

        // Update status
        let result = await this.pool.query(
            'UPDATE client_requests SET status = $1, status_changed_at = NOW() WHERE id = $2 RETURNING *',
            [MentorClientRequestStatus[newStatus], request.id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const newRequest = new MentorClientRequest(new PgRowAdapter(result.rows[0]));

        // Update cache
        let cachedRequests = this._activeRequestsCache.get(request.mentorId) as Map<string, MentorClientRequest>;
        if (cachedRequests) {
            cachedRequests.set(newRequest.id, newRequest);
            this._activeRequestsCache.set(request.mentorId, cachedRequests);
        }

        // Handle cache swap when request is done/declined/unavailable
        if (newRequest.status === MentorClientRequestStatus.done
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
            toRequests.set(request.id, request);
            to.set(request.mentorId, toRequests);
        }
    }
}
