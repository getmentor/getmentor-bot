import { Mentor } from "../../models/Mentor";
import { MentorClientRequest } from "../../models/MentorClientRequest";

export abstract class EmailMessage {
    protected  _mentor: Mentor;
    protected  _request: MentorClientRequest;
    private _templateId: string;
    public get templateId(): string {
        return this._templateId;
    }

    protected constructor(mentor: Mentor, request: MentorClientRequest, templateId: string) {
        this._mentor = mentor;
        this._request = request;
        this._templateId = templateId;
    }

    public abstract props(): any;

    public get recipient(): string {
        return this._request.email;
    }
}