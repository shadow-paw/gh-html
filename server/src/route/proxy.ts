import * as express from "express";
import * as mime from "mime-types";
import * as crypto from "crypto";
import { AppServer } from "../server";
import { GithubClient } from "../github";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /proxy/{owner}/{repo}/{branch}/{path}/{file} Access repo file
 * @apiVersion 0.0.1
 * @apiName get
 * @apiGroup repo
 * @apiDescription Fetch a file from repo, indicated by uri.
 */
function repo_proxy(req: express.Request, res: express.Response) {
    // const self: AppServer = this;
    // console.log(`repo_proxy: ${req.originalUrl}`);
    if (!req.session.gh_token) {
        // Redirect to github oauth if not logged in already
        req.session.returning_url = process.env.APP_SERVER_BASE + req.originalUrl;
        const gh = new GithubClient("");
        const secret = crypto.randomBytes(16);
        const oauth_state = Buffer.from(secret).toString("hex");
        req.session.oauth_state = oauth_state;
        res.redirect(gh.get_oauth_url(oauth_state));
        return;
    }

    // Fetch content from github and return with correct mimetype
    const fields = req.originalUrl.split("/");
    const owner = fields[2];
    const repo = fields[3];
    const branch = fields[4];
    const file = fields.slice(5).join("/");
    const gh = new GithubClient(req.session.gh_token);
    gh.user_file(owner, repo, branch, file, (data: any) => {
        if (data) {
            res.type(mime.lookup(file) || "text/html");
            res.send(data);
        } else {
            res.status(404).send("Not found");
        }
    });
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/proxy/*",
    "get": repo_proxy
};
}());
