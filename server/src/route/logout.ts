import * as express from "express";
import { AppServer } from "../server";
import { SessionData } from "../model/session";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /rest/logout Logout
 * @apiVersion 0.0.1
 * @apiName logout
 * @apiGroup user
 * @apiDescription Logout current session.
 */
function logout_get(req: express.Request, res: express.Response) {
    // const self: AppServer = this;
    const session = SessionData.bind(req.session);
    delete session.access_token;
    delete session.profile;
    session.repo_whitelist = {};
    res.json({});
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/rest/logout",
    "get": logout_get
};
}());
