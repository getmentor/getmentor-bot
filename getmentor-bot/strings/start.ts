import {html as format} from 'telegram-format';
import { stringsCommon } from './common';

export const stringsStart = {
    welcomeAnonymous: () => {
        return `Привет!

Я помогаю менторам сервиса GetMentor.dev. Для начала давайте познакомимся. Отправьте мне секретный код, который вы получили в письме после одобрения заявки. Он выглядит как восемь букв или цифр, например так: ${format.italic('Gm3Nt0rD')}.
        
Если вы ещё не оставили заявку чтобы стать ментором, вы можете сделать это по ссылке ниже:
${format.url(stringsCommon.beMentorUrl, stringsCommon.beMentorUrl)}
        
А если вы по какой-то причине не получили письмо или не можете найти секретный код, то напишите нам на ${stringsCommon.contactEmail}.
        
Спасибо!`
    }
};