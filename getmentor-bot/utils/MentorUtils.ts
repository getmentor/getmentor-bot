import { MentorExperience, MentorPrice, MentorStatus } from "../models/Mentor";

export class MentorUtils {
    public static formatStatus(status: MentorStatus): string {
        switch (status) {
            case MentorStatus.active:
                return '✅ Активный';
            
            case MentorStatus.inactive:
                return '😴 Неактивный';
            
            case MentorStatus.pending:
                return '⏳ На рассмотрении';
    
            case MentorStatus.declined:
                return '❌ Отклонен';
        
            default:
                return '🤷 Неизвестно';
        }
    }

    public static formatPrice(price: MentorPrice): string {
        switch (price) {
            case MentorPrice.free:
                return '✅ Бесплатно';
            
            case MentorPrice.custom:
                return '🤝 По договоренности';
            
            default:
                return price;
        }
    }

    public static formatExperience(exp: MentorExperience): string {
        switch (exp) {
            case MentorExperience.junior:
                return '<2 лет';
            case MentorExperience.middle:
                return '😎2-5 лет';
            case MentorExperience.senior:
                return '😎5-10 лет';
            case MentorExperience.rockstar:
                return '🌟10+ лет';
        }
    }
}