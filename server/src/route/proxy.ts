import * as express from "express";
import * as mime from "mime-types";
import * as crypto from "crypto";
import { AppServer } from "../server";
import { GithubClient } from "../github";
import { SessionData } from "../model/session";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /proxy/{owner}/{repo}/{branch}/{path}/{file} Access repo file
 * @apiVersion 0.0.1
 * @apiName file
 * @apiGroup repo
 * @apiDescription Fetch a file from repo, indicated by uri.
 */
function proxy_get(req: express.Request, res: express.Response) {
    // console.log(`repo_proxy: ${req.originalUrl}`);
    // const self: AppServer = this;
    const session = SessionData.bind(req.session);

    if (!session.access_token) {
        // Redirect to github oauth if not logged in already
        session.returning_url = process.env.APP_SERVER_BASE + req.originalUrl;
        const github = new GithubClient();
        const secret = crypto.randomBytes(16);
        const oauth_state = Buffer.from(secret).toString("hex");
        session.oauth_state = oauth_state;
        res.redirect(github.oauth_url(oauth_state));
        return;
    }

    // parse url
    const fields = req.originalUrl.split("/");
    const owner = fields[2];
    const repo = fields[3];
    const branch = fields[4];
    const file = fields.slice(5).join("/");

    // check whitelist
    if (session.repo_restrict) {
        const allowed = session.repo_whitelist[`${owner}/${repo}`];
        if (allowed === undefined) {
            const github = new GithubClient(session.access_token);
            github.is_collaborator(owner, repo, (result: boolean) => {
                session.repo_whitelist[`${owner}/${repo}`] = result;
                if (result) {
                    proxy_get_fetchfile(res, session, owner, repo, branch, file);
                } else {
                    res.status(403).send("Forbidden");
                }
            });
        } else if (!allowed) {
            res.status(403).send("Forbidden");
        }
    } else {
        proxy_get_fetchfile(res, session, owner, repo, branch, file);
    }
}
function proxy_get_fetchfile(res: express.Response, session: SessionData, owner: string, repo: string, branch: string, file: string) {
    // Fetch content from github and return with correct mimetype
    const github = new GithubClient(session.access_token);
    github.get_user_file(owner, repo, branch, file, (code: number, data: any) => {
        if (data) {
            res.type(mime.lookup(file) || "text/html");
            res.status(code).send(data);
        } else {
            res.status(code).send("Not found");
        }
    });
}

// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/proxy/*",
    "get": proxy_get
};
}());
