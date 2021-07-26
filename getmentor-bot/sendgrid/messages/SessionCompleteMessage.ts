import { Mentor } from "../../models/Mentor";
import { MentorClientRequest } from "../../models/MentorClientRequest";
import { EmailMessage } from "./EmailMessage";

export class SessionCompleteMessage extends EmailMessage {
    public constructor(mentor: Mentor, request: MentorClientRequest){
        super(mentor, request, 'd-751b5a275d424812b08bee19a20d1972');
    }

    public props() {
        return {
            'first_name': this._request.name,
            'mentor_name': this._mentor.name,
            'mentee_name_url': encodeURI(this._request.name),
            'mentee_email_url': encodeURI(this._request.email),
            'mentor_email_url': encodeURI(this._mentor.name)
        }
    }
}