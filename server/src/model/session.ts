export class SessionData {
    public oauth_state: string;
    public returning_url: string;
    public access_token: string;

    static bind(session: any): SessionData {
        if (!("data" in session)) {
            session["data"] = new SessionData();
        }
        return session["data"] as SessionData;
    }
}
