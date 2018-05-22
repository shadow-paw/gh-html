import * as express from "express";
import { AppServer } from "../server";
import { GithubClient } from "../github";
import { SessionData } from "../model/session";
import { Profile } from "../model/profile";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /rest/me Get my profile
 * @apiVersion 0.0.1
 * @apiName me
 * @apiGroup user
 * @apiDescription Get my profile.
 */
function me_get(req: express.Request, res: express.Response) {
    // const self: AppServer = this;
    const session = SessionData.bind(req.session);
    if (session.profile) {
        res.json(session.profile);
    } else {
        res.status(403).json({"error": "UNAUTHORIZED"});
    }
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/rest/me",
    "get": me_get
};
}());
