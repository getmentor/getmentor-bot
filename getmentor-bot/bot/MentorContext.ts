import { Context as TgContext} from 'telegraf';
import { Mentor } from '../models/Mentor';
import { MentorStorage } from '../storage/MentorStorage';

interface MentorSession {
    tagsPage: number;
    activeRequestsPage: number;
    oldRequestsPage: number;
}

export interface MentorContext extends TgContext {
    storage: MentorStorage;
    mentor: Mentor;
    session?: MentorSession,
    match: RegExpExecArray | undefined;
}