import { Context as TgContext} from 'telegraf';
import { AirtableBase } from '../airtable/AirtableBase';

export interface MentorContext extends TgContext {
    airtable: AirtableBase;
    match: RegExpExecArray | undefined;
}