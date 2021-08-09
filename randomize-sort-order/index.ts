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
        const mentors =
            await base('Mentors')
            .select({ fields: [ 'SortOrder' ] })
            .all();

        let updateRecords = new Array<any>();
        let batchCount = 0;
        let totalBatches = 0;

        mentors.forEach(async m => {
            updateRecords.push({
                id: m.id,
                fields: {
                    'SortOrder': Math.floor(Math.random() * 1000)
                }
            })
            batchCount++;

            if (batchCount == 10) {
                await base('Mentors').update(updateRecords);
                batchCount = 0;
                totalBatches++;
                updateRecords = new Array<any>();
            }
        });

        if (updateRecords.length > 0) {
            await base('Mentors').update(updateRecords);
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
