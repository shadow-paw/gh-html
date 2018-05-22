import * as express from "express";
import * as request from "request";
import * as qs from "query-string";
import * as path from "path";
import * as crypto from "crypto";
import { AppServer } from "../server";
import { GithubClient } from "../github";
import { SessionData } from "../model/session";
import { Profile } from "../model/profile";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /auth/github OAuth callback
 * @apiVersion 0.0.1
 * @apiName gh-oauth
 * @apiGroup auth
 * @apiDescription Github OAuth callback, acquire access token then redirect back to session.returning_url or "../"
 */
function auth_github(req: express.Request, res: express.Response) {
    const github = new GithubClient();
    const session = SessionData.bind(req.session);

    // const self: AppServer = this;
    if ("code" in req.query) {
        const code = req.query.code;
        github.get_access_token(code, session.oauth_state, (access_token: string) => {
            if (access_token) {
                const returning_url = session.returning_url || "../";
                delete session.oauth_state;
                delete session.returning_url;
                // get profile
                github.get_me((profile: Profile) => {
                    if (!profile) {
                        res.status(401).json({"error": "UNAUTHORIZED"});
                    } else {
                        session.access_token = access_token;
                        session.profile = profile;
                        res.redirect(returning_url);
                    }
                });
            } else {
                res.status(403).send("error");
            }
        });
    } else {
        const secret = crypto.randomBytes(16);
        const oauth_state = Buffer.from(secret).toString("hex");
        session.oauth_state = oauth_state;
        res.redirect(github.oauth_url(oauth_state));
    }
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/auth/github",
    "get": auth_github
};
}());
