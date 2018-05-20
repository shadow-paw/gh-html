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
    res.json({"restrict_repo": session.restrict_repo});
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
    const restrict_repo = req.body["restrict_repo"];
    if (typeof restrict_repo === "boolean") {
        session.restrict_repo = restrict_repo as boolean;
    }
    res.json({"restrict_repo": session.restrict_repo});
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/rest/setting",
    "get": setting_get,
    "patch": setting_patch
};
}());
