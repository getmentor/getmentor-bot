import {createBackMainMenuButtons, MenuMiddleware} from 'telegraf-inline-menu';
import { mainMenu } from '../commands/main';
import { MentorContext } from './MentorContext';

export const backButtons = createBackMainMenuButtons<MentorContext>(
	'🔙 назад',
	'🔝 В главное меню'
);

export const menuMiddleware = new MenuMiddleware('/', mainMenu())