import {markdownv2 as format} from 'telegram-format';
import { Mentor } from '../models/Mentor';

export const stringsProfile = {
    currentDetails: (mentor: Mentor) => {
        return `Ваше текущее описание:

${format.monospaceBlock(format.escape(mentor.details))}`
    },

    editProfileDetails: () => {
        return "Введите новый текст для описания профиля. Можно использовать базовый HTML для форматирования";
    }
}