import { EmailMessage } from "./messages/EmailMessage";
import { MailService } from '@sendgrid/mail';
import { stringsCommon } from "../strings/common";
import { getTemplateIdForProvider, TemplateName } from '../email/TemplateMapping';

let ms = new MailService();
ms.setApiKey(process.env.SENDGRID_API_KEY);

export class SendGridEmailSender {
    public static send(msg: EmailMessage): void {
        // Convert template name to SendGrid template ID
        const sendgridTemplateId = getTemplateIdForProvider(
            msg.templateId as TemplateName,
            'sendgrid'
        );

        const message = {
            to: msg.recipient,
            from: {
                email: stringsCommon.senderEmail,
                name: stringsCommon.senderName
            },
            templateId: sendgridTemplateId,
            dynamicTemplateData: msg.props(),
        };

        console.log(`[SendGrid] Sending email with template: ${msg.templateId} → ${sendgridTemplateId}`);

        ms.send(message);
    }
}