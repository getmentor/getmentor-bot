/**
 * Unified email sender that automatically switches between providers
 * based on environment configuration
 */

import { EmailMessage } from '../sendgrid/messages/EmailMessage';
import { SendGridEmailSender } from '../sendgrid/SendGridEmailSender';
import { PostboxEmailSender } from '../postbox/PostboxEmailSender';
import { getCurrentProvider, EmailProvider } from './TemplateMapping';

export class EmailSender {
    /**
     * Sends an email using the configured provider
     * Provider selection logic:
     * - If YANDEX_POSTBOX_ACCESS_KEY_ID and YANDEX_POSTBOX_SECRET_ACCESS_KEY are set → Yandex Postbox
     * - Otherwise → SendGrid
     *
     * @param msg EmailMessage instance
     * @returns Provider-specific response
     */
    public static send(msg: EmailMessage): void | Promise<any> {
        const provider = getCurrentProvider();

        console.log(`[EmailSender] Using provider: ${provider}`);

        if (provider === 'yandex') {
            return PostboxEmailSender.send(msg);
        } else {
            return SendGridEmailSender.send(msg);
        }
    }

    /**
     * Gets the current email provider
     * Useful for logging and debugging
     */
    public static getProvider(): EmailProvider {
        return getCurrentProvider();
    }

    /**
     * Checks if Yandex Postbox is configured
     */
    public static isYandexConfigured(): boolean {
        return getCurrentProvider() === 'yandex';
    }

    /**
     * Checks if SendGrid is configured
     */
    public static isSendGridConfigured(): boolean {
        return getCurrentProvider() === 'sendgrid';
    }
}
