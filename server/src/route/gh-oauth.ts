import * as express from "express";
import * as request from "request";
import * as qs from "query-string";
import * as path from "path";
import { AppServer } from "../server";
import { GithubClient } from "../github";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /gh-oauth OAuth callback
 * @apiVersion 0.0.1
 * @apiName gh-oauth
 * @apiGroup auth
 * @apiDescription Github OAuth callback, acquire access token then redirect back to /.
 */
function gh_oauth_get(req: express.Request, res: express.Response) {
    const self: AppServer = this;
    if ("code" in req.query) {
        const code = req.query.code;
        const gh = new GithubClient("");
        gh.get_access_token(code, (access_token: string) => {
            if (access_token) {
                req.session.gh_token = access_token;
                res.redirect("./");
            } else {
                res.status(403).send("error");
            }
        });
    } else {
        const gh = new GithubClient("");
        res.redirect(gh.get_oauth_url());
    }
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/gh-oauth",
    "get": gh_oauth_get
};
}());
