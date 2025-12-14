import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { EmailMessage } from '../sendgrid/messages/EmailMessage';
import { getTemplate } from './templates';
import { stringsCommon } from '../strings/common';

// Initialize SESv2 client for Yandex Postbox
const sesClient = new SESv2Client({
    region: process.env.YANDEX_POSTBOX_REGION,
    endpoint: process.env.YANDEX_POSTBOX_ENDPOINT,
    credentials: {
        accessKeyId: process.env.YANDEX_POSTBOX_ACCESS_KEY_ID,
        secretAccessKey: process.env.YANDEX_POSTBOX_SECRET_ACCESS_KEY,
    },
});

export class PostboxEmailSender {
    /**
     * Sends an email using Yandex Postbox via AWS SESv2 SDK with inline templates
     * Template rendering is performed server-side by Yandex Postbox
     * @param msg EmailMessage instance with recipient, templateId, and props
     * @returns AWS SDK response with MessageId
     */
    public static async send(msg: EmailMessage): Promise<any> {
        const startTime = Date.now();

        try {
            // Get template from compiled TypeScript (no file I/O, no JSON parsing)
            const template = getTemplate(msg.templateId);

            // Prepare email parameters with inline template
            // Server-side template rendering by Yandex Postbox using {{placeholder}} syntax
            const params = {
                FromEmailAddress: `${stringsCommon.senderName} <${stringsCommon.senderEmail}>`,
                Destination: {
                    ToAddresses: [msg.recipient],
                },
                Content: {
                    Template: {
                        TemplateContent: {
                            Subject: template.subject,
                            Html: template.html,
                            Text: template.text,
                        },
                        TemplateData: JSON.stringify(msg.props()),
                    },
                },
            };

            // Send email via Yandex Postbox
            const command = new SendEmailCommand(params);
            const response = await sesClient.send(command);

            const duration = Date.now() - startTime;
            console.log(`[Postbox] Email sent successfully in ${duration}ms to ${msg.recipient}`);

            return response;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[Postbox] Failed to send to ${msg.recipient} after ${duration}ms:`, error);
            throw error;
        }
    }
}
