import { Context as TgContext} from 'telegraf';
import { Mentor } from '../models/Mentor';
import { MentorStorage } from '../storage/MentorStorage';

export interface MentorContext extends TgContext {
    storage: MentorStorage;
    mentor: Mentor;
    match: RegExpExecArray | undefined;
}