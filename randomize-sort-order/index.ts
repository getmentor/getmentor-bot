import { AzureFunction, Context } from "@azure/functions"
import Airtable from "airtable";

const Sentry = require("@sentry/node");
Sentry.init({
    dsn: process.env["SENTRY_CLIENT_KEY"],
});

let apiKey = process.env["AIRTABLE_API_KEY"];
let baseId = process.env['AIRTABLE_BASE_ID'];

let base= new Airtable({
    endpointUrl: 'https://api.airtable.com',
    apiKey: apiKey
}).base(baseId);

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    try {
        // get all mentors
        const mentors =
            await base('Mentors')
            .select({ fields: [ 'SortOrder' ] })
            .all();

        let updateRecords = new Array<any>();
        let batchCount = 0;
        let totalBatches = 0;

        for (var i = 0; i < mentors.length; i++) {
            updateRecords.push({
                id: mentors[i].id,
                fields: {
                    'SortOrder': Math.floor(Math.random() * 1000)
                }
            })
            batchCount++;

            // update can only work with 10 record batches
            if (batchCount === 10) {
                base('Mentors').update(updateRecords);
                await new Promise(r => setTimeout(r, 220));

                batchCount = 0;
                totalBatches++;
                updateRecords = new Array<any>();
            }
        };

        if (updateRecords.length > 0) {
            // update what's left
            base('Mentors').update(updateRecords);
            totalBatches++;
        }

        context.log(`Successfully updated ${mentors.length} records in ${totalBatches} batches`);
    } catch (e) {
        context.log('Error while running the timer: ', e);
        Sentry.captureException('Error while running the timer: ' + e);
        await Sentry.flush(2000);
    }
};

export default timerTrigger;
