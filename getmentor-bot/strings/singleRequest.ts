import {html as format} from 'telegram-format';
import { Mentor, MentorPrice } from '../../lib/models/Mentor';
import { MentorClientRequest } from '../../lib/models/MentorClientRequest';
import { MentorUtils } from '../../lib/utils/MentorUtils';
import { stringsCommon } from './common';

export const stringsSingleRequest = {
    requestDetails: (request: MentorClientRequest) => {
        return `
${format.bold('Имя:')} ${request.name}
${format.bold('Email:')} ${request.email}
${format.bold('Telegram:')} @${request.telegram}
${format.bold('Статус:')} ${MentorUtils.formatRequestStatus(request.status)}
${format.bold('Уровень: ') + (request.level ? request.level : 'Не указал')}

${format.bold('Запрос:')}
${format.monospace(format.escape(request.details.substring(0, 3500)))}

Ссылка на заявку: ${stringsCommon.baseUrl}/mentor/requests/${request.id}`
    },

    buttonContacted: '💬 Связался с менти',
    buttonScheduled: '📅 Встреча запланирована',
    buttonDone: '✅ Встреча состоялась',
    buttonDecline: '❌ Отклонить...',
    buttonDeclineConfirm: '❌ Да! Отклонить.',
    buttonUnavailable: '🤷 Не удалось связаться',
    buttonAvailable: '👋 Связались',
    buttonViewReview: '✍️ Посмотреть отзыв',

    requestCompletedByMentor: (mentor: Mentor, request: MentorClientRequest) => {
        let donateText;
        if( mentor.price !== MentorPrice.free && mentor.price !== MentorPrice.custom ) {
            donateText = 'Наш проект существует на добровольных началах и не берёт за свои услуги денег. ' +
                'Согласно вашему профилю, ваша сессия менторинга была не бесплатной. ' +
                'Нам было бы очень полезно, если бы часть заработанных вами денег пошла на развитие GetMentor. ' +
                'Вы можете пожертвовать любую сумму переводом на ' +
                format.url('карту',"https://www.tinkoff.ru/sl/sVXu3fk6nL") + ', ' +
                format.url('PayPal', "https://paypal.me/glamcoder") + ' или оформив месячный взнос через ' +
                format.url('Patreon', "https://www.patreon.com/getmentor") + '. Все подробности тут: ' +
                format.url("https://getmentor.dev/donate", "https://getmentor.dev/donate") + '.';
        } else {
            donateText = format.italic("🍩 Наш проект существует на добровольных началах и не берёт за свои услуги денег ни с менторов, ни с учеников. Если вы хотите помочь поддержать проект, то мы с радостью примем от вас донат. Все подробности тут: https://getmentor.dev/donate")
        }
        return `Мы очень рады, что вы смогли помочь ещё одному человеку. Спасибо вам за это! ❤️

Мы всегда хотим улучшаться, а поэтому нам очень важно знать, как мы справились со своей задачей. Пожалуйста, ответьте на простой опрос о том, как прошла ваша встреча, и что мы как сервис можем сделать лучше.
        
${format.url(' = Опрос тут = ', 'https://docs.google.com/forms/d/e/1FAIpQLSd7Z7hCBVRIkTggDaiO7LmWTIY8IZiH4YsSYUNajf-yl-bH2w/viewform?usp=pp_url&entry.1704286527='+encodeURI(mentor.name)+'&entry.1855614712='+encodeURI(mentor.email)+'&entry.661937121='+encodeURI(request.name)+'&entry.1372017714=%D0%94%D0%B0')}
        
${format.italic('Ссылка на обратную связь о сессии была отправлена на почту вашему менти, поэтому напомните ему/ей об этом, если хотите получить отзыв. Вот она:')}
${format.url('Обратная связь для менти', request.review_url)}
        
${format.bold('Поддержите проект')}
${ donateText }
        
Спасибо, что вы с нами!`
    },

    requestDeclinedByMentor: `Жаль, что у вас не получится помочь c этой заявкой. Мы напишем менти об этом сами, но было бы здорово, если бы вы написали ему (или ей) тоже, чтобы дать больше подробностей и сохранить личный контакт.\nСпасибо!`
}