import {html as format} from 'telegram-format';
import { Mentor } from '../models/Mentor';
import { stringsCommon } from './common';

export const stringsMain = {
    welcomeMentor: (mentor: Mentor) => {
        return `Привет ${mentor.name}! 👋

Чем я могу помочь?`
    }
}
