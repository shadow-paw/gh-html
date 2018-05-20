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
    if (!session.profile) {
        const github = new GithubClient(session.access_token);
        github.get_me((profile: Profile) => {
            if (!profile) {
                res.status(401).json({"error": "UNAUTHORIZED"});
            } else {
                session.profile = profile;
                res.json(profile);
            }
        });
    } else {
        res.json(session.profile);
    }
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/rest/me",
    "get": me_get
};
}());
