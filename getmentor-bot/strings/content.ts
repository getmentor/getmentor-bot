import { Mentor, MentorStatus } from "../models/Mentor";
import { MentorUtils } from "../utils/MentorUtils";

export const stringsContent = {
    headline: (mentor: Mentor) => {
        return `<h3>${mentor.description}</h3>`;
    },

    description: (mentor: Mentor) => {
        return `${mentor.details}

<b>Цена:</b> ${MentorUtils.formatPrice(mentor.price)}
<b>Опыт:</b> ${MentorUtils.formatExperience(mentor.experience)}
<b>Теги:</b> ${mentor.tags}
                            
${mentor.status === MentorStatus.inactive ? '<em>Ментор временно не принимает новые заявки</em>': ''}`;
    },

    descriptionOptions: (mentor: Mentor) => {
        return `image=${mentor.image}
${mentor.status === MentorStatus.active ? 'button=Оставить заявку\nbutton link='+mentor.url: ''}`
    },

    footer: () => {
        return `<a href="https://t.me/getmentor_dev" target="_blank">Telegram</a> | <a href="https://www.facebook.com/getmentor.dev" target="_blank">Facebook</a> | <a href="mailto:hello@getmentor.dev">Email</a>

<a href="/privacy">Политика в отношении персональных данных</a>
                            
<a href="/disclaimer">Отказ от ответственности</a>`
    }
}
