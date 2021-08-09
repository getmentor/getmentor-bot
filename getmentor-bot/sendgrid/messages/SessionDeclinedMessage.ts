import { Mentor } from "../../../lib/models/Mentor";
import { MentorClientRequest } from "../../../lib/models/MentorClientRequest";
import { EmailMessage } from "./EmailMessage";

export class SessionDeclinedMessage extends EmailMessage {
    public constructor(mentor: Mentor, request: MentorClientRequest){
        super(mentor, request, 'd-760b407e1f694442805abb931bd055b0');
    }

    public props() {
        return {
            'first_name': this._request.name,
            'mentor_name': this._mentor.name,
        }
    }
}