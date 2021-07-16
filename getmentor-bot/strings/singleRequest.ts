import {html as format} from 'telegram-format';
import { MentorClientRequest } from '../models/MentorClientRequest';
import { MentorUtils } from '../utils/MentorUtils';

export const stringsSingleRequest = {
    requestDetails: (request: MentorClientRequest) => {
        return `
${format.bold('Имя:')} ${request.name}
${format.bold('Email:')} ${request.email}
${format.bold('Telegram:')} @${request.telegram}
${format.bold('Статус:')} ${MentorUtils.formatRequestStatus(request.status)}

${format.bold('Запрос:')}
${request.details}`
    }
}