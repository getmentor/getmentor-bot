import { senderEmail, senderName } from "../utils/const";
import { EmailMessage } from "./messages/EmailMessage";
import { MailService } from '@sendgrid/mail';

let ms = new MailService();
ms.setApiKey(process.env.SENDGRID_API_KEY);

export class SendGridEmailSender {
    public static send(msg: EmailMessage): void {
        const message = {
            to: msg.recipient,
            from: { 
                email: senderEmail,
                name: senderName
            },
            templateId: msg.templateId,
            dynamicTemplateData: msg.props(),
        };

        ms.send(message);
    }
}