/**
 * Email template mapping for different providers
 * Maps template names to provider-specific identifiers
 */

// SendGrid Dynamic Template IDs
const SENDGRID_TEMPLATES: Record<string, string> = {
    'session-complete': 'd-751b5a275d424812b08bee19a20d1972',
    'session-declined': 'd-760b407e1f694442805abb931bd055b0',
};

// Yandex Postbox uses template names (matching TypeScript objects)
const YANDEX_TEMPLATES: Record<string, string> = {
    'session-complete': 'session-complete',
    'session-declined': 'session-declined',
};

export type TemplateName =
    | 'session-complete'
    | 'session-declined';

export type EmailProvider = 'sendgrid' | 'yandex';

/**
 * Determines which email provider to use based on environment variables
 * If both Yandex Postbox credentials are set, use Yandex; otherwise use SendGrid
 */
export function getCurrentProvider(): EmailProvider {
    const hasYandexCredentials =
        process.env.YANDEX_POSTBOX_ACCESS_KEY_ID &&
        process.env.YANDEX_POSTBOX_SECRET_ACCESS_KEY;

    return hasYandexCredentials ? 'yandex' : 'sendgrid';
}

/**
 * Gets the template identifier for the current provider
 * @param templateName - The template name (e.g., 'session-complete')
 * @returns Template ID for SendGrid or template name for Yandex
 */
export function getTemplateId(templateName: TemplateName): string {
    const provider = getCurrentProvider();

    if (provider === 'yandex') {
        const templateId = YANDEX_TEMPLATES[templateName];
        if (!templateId) {
            throw new Error(`Unknown template name for Yandex: ${templateName}`);
        }
        return templateId;
    } else {
        const templateId = SENDGRID_TEMPLATES[templateName];
        if (!templateId) {
            throw new Error(`Unknown template name for SendGrid: ${templateName}`);
        }
        return templateId;
    }
}

/**
 * Gets the template identifier for a specific provider (useful for testing)
 */
export function getTemplateIdForProvider(templateName: TemplateName, provider: EmailProvider): string {
    if (provider === 'yandex') {
        return YANDEX_TEMPLATES[templateName] || templateName;
    } else {
        const templateId = SENDGRID_TEMPLATES[templateName];
        if (!templateId) {
            throw new Error(`Unknown template name for SendGrid: ${templateName}`);
        }
        return templateId;
    }
}
