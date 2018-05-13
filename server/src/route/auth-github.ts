import * as express from "express";
import * as request from "request";
import * as qs from "query-string";
import * as path from "path";
import * as crypto from "crypto";
import { AppServer } from "../server";
import { GithubClient } from "../github";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /auth-github OAuth callback
 * @apiVersion 0.0.1
 * @apiName gh-oauth
 * @apiGroup auth
 * @apiDescription Github OAuth callback, acquire access token then redirect back to session.returning_url or "./"
 */
function auth_github(req: express.Request, res: express.Response) {
    // const self: AppServer = this;
    if ("code" in req.query) {
        const code = req.query.code;
        const gh = new GithubClient("");
        gh.get_access_token(code, req.session.oauth_state, (access_token: string) => {
            if (access_token) {
                const returning_url = req.session.returning_url || "./";
                delete req.session.oauth_state;
                delete req.session.returning_url;
                req.session.gh_token = access_token;
                res.redirect(returning_url);
            } else {
                res.status(403).send("error");
            }
        });
    } else {
        const gh = new GithubClient("");
        const secret = crypto.randomBytes(16);
        const oauth_state = Buffer.from(secret).toString("hex");
        req.session.oauth_state = oauth_state;
        res.redirect(gh.get_oauth_url(oauth_state));
    }
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/auth-github",
    "get": auth_github
};
}());
