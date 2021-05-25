import { Mentor } from "../models/Mentor";
import { stringsCommon } from "./common";
import {html as format} from 'telegram-format';
import { MentorUtils } from "../utils/MentorUtils";

export const stringsCode = {
    unknown: () => {
        return `Извините, но я такой код не знаю. Попробуйте снова или напишите нам на почту ${stringsCommon.contactEmail}`;
    },

    welcome: (mentor: Mentor) => {
return `Привет ${mentor.name}!

Спасибо, что присоединились к нашей команде менторов!
        
Вот информация, которую мы о вас знаем:
${format.bold('Должность')}
${format.escape(mentor.description)}
        
${format.bold('Чем можете помочь')}
${format.escape(mentor.details)}
        
${format.bold('Опыт')}
${mentor.experience}
        
${format.bold('Стоимость')}
${mentor.price}
        
${format.bold('Статус:')} ${MentorUtils.formatStatus(mentor.status)}
        
Если у вас есть какие-то вопросы, напишите нам на ${stringsCommon.contactEmail} и мы обязательно поможем!`
    }
}
