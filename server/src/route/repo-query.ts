import * as express from "express";
import { AppServer } from "../server";
import { GithubClient } from "../github";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /rest/repo-query query repo
 * @apiVersion 0.0.1
 * @apiName repo-query
 * @apiGroup repo
 * @apiDescription Query repository of user.
 *
 * @apiExample {json} Example
 *     {
 *     }
 *
 * @apiSuccessExample {json} SUCCESS
 *     HTTP/1.1 200 OK
 *     {
 *       "repos": [
 *          {
 *            "name": "user/repo-name"
 *          }
 *       ]
 *     }
 *
 * @apiError UNAUTHORIZED Unauthorized
 * @apiErrorExample {json} UNAUTHORIZED
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "error": "UNAUTHORIZED"
 *     }
 */
function repo_query(req: express.Request, res: express.Response) {
    const self: AppServer = this;
    if (!req.session.gh_token) {
        res.status(403).json({ "error": "UNAUTHORIZED"});
        return;
    }
    const gh = new GithubClient(req.session.gh_token);
    gh.user_repo(json => {
        json = json || [];
        const repos = json.map((repo: any) => {
                          return {
                            name: repo.full_name,
                            fork: repo.fork,
                          };
                      });
        res.json({
            "repos": repos
        });
    });
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/rest/repo-query",
    "get": repo_query
};
}());
