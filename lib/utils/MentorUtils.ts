import { MentorExperience, MentorPrice, MentorStatus } from "../models/Mentor";
import { MentorClientRequestStatus } from "../models/MentorClientRequest";

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

    public static formatRequestStatus(status: MentorClientRequestStatus): string {
        switch (status) {
            case MentorClientRequestStatus.pending:
                return this.formatRequestStatusPrefix(status) + ' Новая';
            
            case MentorClientRequestStatus.contacted:
                return this.formatRequestStatusPrefix(status) + ' Связались';
            
            case MentorClientRequestStatus.working:
                return this.formatRequestStatusPrefix(status) + ' Запланирована';
    
            case MentorClientRequestStatus.done:
                return this.formatRequestStatusPrefix(status) + ' Состоялась';

            case MentorClientRequestStatus.reschedule:
                return this.formatRequestStatusPrefix(status) + ' Перенесена';

            case MentorClientRequestStatus.declined:
                return this.formatRequestStatusPrefix(status) + ' Отклонена';

            case MentorClientRequestStatus.unavailable:
                return this.formatRequestStatusPrefix(status) + ' Не удалось связаться';
        
            default:
                return this.formatRequestStatusPrefix(status) + ' Неизвестно';
        }
    }

    public static formatRequestStatusPrefix(status: MentorClientRequestStatus): string {
        switch (status) {
            case MentorClientRequestStatus.pending:
                return '⏳';
            
            case MentorClientRequestStatus.contacted:
                return '💬';
            
            case MentorClientRequestStatus.working:
                return '📅';
    
            case MentorClientRequestStatus.done:
                return '✅';

            case MentorClientRequestStatus.reschedule:
                return '🔄';

            case MentorClientRequestStatus.unavailable:
                return '🤷';

            case MentorClientRequestStatus.declined:
                return '❌';
        
            default:
                return '🤷';
        }
    }
}