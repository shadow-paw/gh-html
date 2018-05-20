import * as express from "express";
import { AppServer } from "../server";
import { GithubClient } from "../github";
import { SessionData } from "../model/session";
import { Profile } from "../model/profile";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /rest/setting Get setting
 * @apiVersion 0.0.1
 * @apiName get
 * @apiGroup setting
 * @apiDescription Get setting
 */
function setting_get(req: express.Request, res: express.Response) {
    // const self: AppServer = this;
    const session = SessionData.bind(req.session);
    res.json({"repo_restrict": session.repo_restrict});
}
// -----------------------------------------------------------------
/**
 * @api {patch} /rest/setting Update setting
 * @apiVersion 0.0.1
 * @apiName update
 * @apiGroup setting
 * @apiDescription Update setting
 */
function setting_patch(req: express.Request, res: express.Response) {
    // const self: AppServer = this;
    const session = SessionData.bind(req.session);
    const repo_restrict = req.body["repo_restrict"];
    if (typeof repo_restrict === "boolean") {
        session.repo_restrict = repo_restrict as boolean;
    }
    res.json({"repo_restrict": session.repo_restrict});
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/rest/setting",
    "get": setting_get,
    "patch": setting_patch
};
}());
