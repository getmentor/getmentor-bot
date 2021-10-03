import {markdownv2 as format} from 'telegram-format';
import { Mentor } from '../../lib/models/Mentor';

export const stringsProfile = {
    currentDetails: (mentor: Mentor) => {
        return `Ваше текущее описание:

${format.monospaceBlock(format.escape(mentor.details))}`
    },

    editProfileDetails: () => {
        return "Введите новый текст для описания профиля. Можно использовать базовый HTML для форматирования";
    },

    editTitle: (mentor: Mentor) => {
        return `Текущая должность:

${mentor.job} @ ${mentor.workplace}

Введите новую информацию в формате 'Должность @ Компания'`;
    },

    editProfileCalendar: (mentor: Mentor) => {
        return `Вы можете использовать ссылку на внешний сервис календарей (например ${format.italic('Calendly')} или ${format.italic('Koalendar')}), чтобы облегчить своим менти выбор времени для встречи.

Текущая ссылка на календарь:
${mentor.calendar ? format.url(mentor.calendar, mentor.calendar) : 'Не задано'}

Введите новую ссылку в ответ на это сообщение ниже.`
    }
}