import { Mentor } from "../../../lib/models/Mentor";
import { MentorClientRequest } from "../../../lib/models/MentorClientRequest";
import { EmailMessage } from "./EmailMessage";

export class SessionDeclinedMessage extends EmailMessage {
    public constructor(mentor: Mentor, request: MentorClientRequest){
        super(mentor, request, 'session-declined');
    }

    public props() {
        return {
            'first_name': this._request.name,
            'mentor_name': this._mentor.name,
        }
    }
}