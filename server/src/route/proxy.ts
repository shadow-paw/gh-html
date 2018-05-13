import * as express from "express";
import * as mime from "mime-types";
import { AppServer } from "../server";
import { GithubClient } from "../github";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /proxy/{owner}/{repo}/{path}/{file} Access repo file
 * @apiVersion 0.0.1
 * @apiName get
 * @apiGroup repo
 * @apiDescription Fetch a file from repo, indicated by uri.
 */
function repo_proxy(req: express.Request, res: express.Response) {
    // const self: AppServer = this;
    if (!req.session.gh_token) {
        res.status(403).json({ "error": "UNAUTHORIZED"});
        return;
    }
    const fields = req.originalUrl.split("/");
    const owner = fields[2];
    const repo = fields[3];
    const branch = fields[4];
    const file = fields.slice(5).join("/");

    const gh = new GithubClient(req.session.gh_token);
    gh.user_file(owner, repo, branch, file, (data: any) => {
        res.type(mime.lookup(file) || "text/html");
        res.send(data);
    });
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/proxy/*",
    "get": repo_proxy
};
}());
