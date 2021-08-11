import { reportError } from "../../lib/utils/monitor";

const fetch = require('node-fetch');

export function resetWebCache() {
    fetch(process.env.WEBCACHE_RESET_URL, {
        method: 'POST',
        headers: { 'AUTH_TOKEN': process.env.WEBCACHE_RESET_AUTH_TOKEN }
    })
    .then( r => {
        if (!r.ok) {
            reportError('Error while updating web cache. Status ' + r.status);
        } 
    })
    .catch((e) => {
        reportError('error while updating web cache: ' + e);
    })
}