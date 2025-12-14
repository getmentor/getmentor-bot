/**
 * Email templates for Yandex Postbox
 * Templates are defined as TypeScript objects for optimal performance
 * (no file I/O, no JSON parsing)
 *
 * TODO: Import actual template content from SendGrid
 */

import { SESSION_COMPLETE_TEMPLATE } from "./templates/session-complete";
import { SESSION_DECLINED_TEMPLATE } from "./templates/session-declined";

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
    /**
     * Session Complete - Sent when a mentoring session is marked as complete
     * Variables: first_name, mentor_name, mentee_name_url, mentee_email_url, mentor_name_url, request_id
     */
    'session-complete': SESSION_COMPLETE_TEMPLATE,

    /**
     * Session Declined - Sent when a mentor declines a session request
     * Variables: first_name, mentor_name
     */
    'session-declined': SESSION_DECLINED_TEMPLATE,
};

/**
 * Gets a template by name
 * @param templateName - The template identifier
 * @returns EmailTemplate object
 * @throws Error if template not found
 */
export function getTemplate(templateName: string): EmailTemplate {
    const template = EMAIL_TEMPLATES[templateName];
    if (!template) {
        throw new Error(`Template not found: ${templateName}`);
    }
    return template;
}
