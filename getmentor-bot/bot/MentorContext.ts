import { Context as TgContext} from 'telegraf';
import { MentorStorage } from '../storage/MentorStorage';

export interface MentorContext extends TgContext {
    airtable: MentorStorage;
    match: RegExpExecArray | undefined;
}