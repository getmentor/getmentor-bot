import { Mentor } from "../../lib/models/Mentor";
import { stringsCommon } from "./common";
import {html as format} from 'telegram-format';
import { MentorUtils } from "../../lib/utils/MentorUtils";

export const stringsCode = {
    unknown: () => {
        return `Извините, но я такой код не знаю. Попробуйте снова или напишите нам на почту ${stringsCommon.contactEmail}`;
    },

    welcome: (mentor: Mentor) => {
return `Привет ${mentor.name}!

Спасибо, что присоединились к нашей команде менторов!
Для управления своим профилем и работой с заявками, напишите мне команду /menu.
        
Вот информация, которую мы о вас знаем:
==========
${format.bold('Должность')}
${format.escape(mentor.job)}

${format.bold('Компания')}
${format.escape(mentor.workplace)}

${format.bold('Чем можете помочь')}
${format.escape(mentor.details.substr(0, 3500))}
        
${format.bold('Опыт')}
${mentor.experience}
        
${format.bold('Стоимость')}
${mentor.price}
==========
        
Если у вас есть какие-то вопросы, напишите нам на ${stringsCommon.contactEmail} и мы обязательно поможем!

Для перехода в главное меню нажмите /menu.`
    },

    alreadyKnown: (mentor: Mentor) => {
        return `Мы вас уже знаем, ${mentor.name}.

Для перехода в главное меню нажмите /menu.`
    }
}
