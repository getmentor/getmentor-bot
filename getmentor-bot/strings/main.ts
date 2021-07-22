import {html as format} from 'telegram-format';
import { Mentor } from '../models/Mentor';
import { stringsCommon } from './common';

export const stringsMain = {
    welcomeMentor: (mentor: Mentor) => {
        return `ЭТОТ БОТ НАХОДИТСЯ С СТАДИИ БЕТА.
Если что-то не работает — напишите @glamcoder и воспользуйтесь @getmentor_bot.

Привет ${mentor.name}! 👋

Чем я могу помочь?`
    }
}
