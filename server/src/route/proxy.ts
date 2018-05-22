import * as express from "express";
import * as mime from "mime-types";
import * as crypto from "crypto";
import * as async from "async";
import { AppServer } from "../server";
import { GithubClient } from "../github";
import { SessionData } from "../model/session";


module.exports = (function() {
// -----------------------------------------------------------------
function repo_access_allowed(session: SessionData, owner: string, repo: string, cb: ((allowed: boolean) => void)) {
    if (session.repo_restrict) {
        const isallowed = session.repo_whitelist[`${owner}/${repo}`];
        if (isallowed === undefined) {
            const github = new GithubClient(session.access_token);
            async.parallel({
                is_private: (callback: any) => {
                    github.is_private(owner, repo, (isprivate: boolean) => {
                        callback(undefined, isprivate);
                    });
                },
                is_collaborator: (callback: any) => {
                    github.is_collaborator(session.profile.name, owner, repo, (iscollaborator: boolean) => {
                        callback(undefined, iscollaborator);
                    });
                }
            }, (err, results) => {
                const is_private = results["is_private"] as boolean;
                const is_collaborator = results["is_collaborator"] as boolean;
                const allowed = (is_private || (!is_private && is_collaborator));
                session.repo_whitelist[`${owner}/${repo}`] = allowed;
                cb(allowed);
            });
        } else {
            cb(isallowed);
        }
    } else {
        cb(true);
    }
}

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
    repo_access_allowed(session, owner, repo, (allowed: boolean) => {
        if (allowed) {
            proxy_get_fetchfile(res, session, owner, repo, branch, file);
        } else {
            res.status(403).send("Forbidden");
        }
    });
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
