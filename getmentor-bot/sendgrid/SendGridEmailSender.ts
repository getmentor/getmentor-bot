import { EmailMessage } from "./messages/EmailMessage";
import { MailService } from '@sendgrid/mail';
import { stringsCommon } from "../strings/common";

let ms = new MailService();
ms.setApiKey(process.env.SENDGRID_API_KEY);

export class SendGridEmailSender {
    public static send(msg: EmailMessage): void {
        const message = {
            to: msg.recipient,
            from: { 
                email: stringsCommon.senderEmail,
                name: stringsCommon.senderName
            },
            templateId: msg.templateId,
            dynamicTemplateData: msg.props(),
        };

        ms.send(message);
    }
}