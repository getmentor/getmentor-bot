import {createBackMainMenuButtons} from 'telegraf-inline-menu';
import { MentorContext } from './MentorContext';

export const backButtons = createBackMainMenuButtons<MentorContext>(
	'🔙 назад',
	'🔝 В главное меню'
);