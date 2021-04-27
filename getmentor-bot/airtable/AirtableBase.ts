import { Mentor } from "../models/Mentor";

import Airtable from "airtable";
import Base from "airtable/lib/base";

//var Airtable = require('airtable');

export class AirtableBase {
    base: Base;
    airtable: Airtable;
    
    constructor(apiKey: string, baseId: string) {
        this.airtable= new Airtable({
            endpointUrl: 'https://api.airtable.com',
            apiKey: apiKey
        });
        this.base = new Base(this.airtable, baseId);
    }

    public async getMentorByTelegramId(chatId: number | string) : Promise<Mentor> {
        return new Promise<Mentor>((resolve, reject) => {
            this.base.table('Mentors').select({
                maxRecords: 1,
                view: "Grid view",
                filterByFormula: "{Telegram Chat Id}='" + chatId + "'"
            }).firstPage()
            .then( (records) => {
                records.forEach( record => {
                    var mentor = new Mentor(record);
                    resolve(mentor);
                });
            });        
        });
    }
}