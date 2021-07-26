import { MenuTemplate } from "telegraf-inline-menu";
import { backButtons } from "../../bot/general";
import { MentorContext } from "../../bot/MentorContext";
import { Mentor, MentorPrice } from "../../models/Mentor";
import { mixpanel } from "../../utils/mixpanel";

export function makePriceMenu(menu: MenuTemplate<MentorContext>) {
    const priceMenu = new MenuTemplate<MentorContext>('💰 Стоимость ваших услуг')

    priceMenu.select(
        'price', 
        async (ctx) => {            
            return [
                "Бесплатно",
                "По договоренности",
                "1000 руб",
                "2000 руб",
                "3000 руб",
                "4000 руб",
                "5000 руб",
                "6000 руб",
                "7000 руб",
                "8000 руб",
                "9000 руб"
            ];
        },
        {
            columns: 2,
            isSet: async (ctx, key) => {
                let price = key as MentorPrice;
                return price ? ctx.mentor.price === price : false;
            },
            set: async (ctx, key, newState) => {
                let price = key as MentorPrice;
                if (newState) {
                    ctx.mentor = await ctx.storage.setMentorPrice(ctx.mentor, price)

                    mixpanel.track('profile_edit_price', {
                        distinct_id: ctx.chat.id,
                        mentor_id: ctx.mentor.id,
                        mentor_name: ctx.mentor.name,
                        price: price.toString()
                    })
                }
                return true
            }
        }
    );

    priceMenu.manualRow(backButtons);

    menu.submenu('💰 Редактировать цену', 'price', priceMenu);
}