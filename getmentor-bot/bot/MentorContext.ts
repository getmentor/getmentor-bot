import { Context as TgContext} from 'telegraf';
import { AirtableBase } from '../airtable/AirtableBase';
import { Mentor } from "../models/Mentor";

export interface MentorContext extends TgContext {
	mentor: Mentor | undefined;
    airtable: AirtableBase;
    match: RegExpExecArray | undefined;
}