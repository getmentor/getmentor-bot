import {createBackMainMenuButtons, MenuMiddleware} from 'telegraf-inline-menu';
import TelegrafStatelessQuestion from 'telegraf-stateless-question';
import { editProfile } from '../commands/editProfile';
import { mainMenu } from '../commands/main';
import { MentorContext } from './MentorContext';

export const backButtons = createBackMainMenuButtons<MentorContext>(
	'🔙 назад',
	'🔝 В главное меню'
);

export const menuMiddleware = new MenuMiddleware('/', mainMenu())

export const editProfileHandler = new TelegrafStatelessQuestion<MentorContext>('edit_profile', editProfile);