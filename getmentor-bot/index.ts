import { AzureFunction, Context, HttpRequest } from "@azure/functions"

var Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env["AIRTABLE_API_KEY"]
});
var base = Airtable.base('app9RGcIg2p4LksJE');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    var responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    await base('Mentors').select({
        maxRecords: 1,
        view: "Grid view",
        filterByFormula: "{Email}='gmogelashvili@gmail.com'",
        fields: ["Id", "Title"]
    }).firstPage()
    .then(function(records, err) {
        if (err) { console.error(err); return; }
        records.forEach( record => {
            responseMessage = responseMessage + "\n" + record.get('Title');
        });
    });

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}

export default httpTrigger;