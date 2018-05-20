import { Profile } from "./profile";


export class SessionData {
    // Github
    public oauth_state: string;
    public returning_url: string;
    public access_token: string;
    public profile: Profile;
    // Setting
    public repo_restrict: boolean;
    public repo_whitelist: any;

    constructor() {
        this.repo_restrict = true;
        this.repo_whitelist = {};
    }
    static bind(session: any): SessionData {
        if (!("data" in session)) {
            session["data"] = new SessionData();
        }
        return session["data"] as SessionData;
    }
}
