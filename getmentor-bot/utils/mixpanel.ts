// grab the Mixpanel factory
var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
export const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN, {
    protocol: 'https'
});
