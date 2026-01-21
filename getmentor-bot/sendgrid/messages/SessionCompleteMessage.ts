import { Mentor } from "../../../lib/models/Mentor";
import { MentorClientRequest } from "../../../lib/models/MentorClientRequest";
import { EmailMessage } from "./EmailMessage";

export class SessionCompleteMessage extends EmailMessage {
    public constructor(mentor: Mentor, request: MentorClientRequest){
        super(mentor, request, 'session-complete');
    }

    public props() {
        return {
            'first_name': this._request.name,
            'mentor_name': this._mentor.name,
            'request_id': this._request.id
        }
    }
}