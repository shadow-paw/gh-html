import * as express from "express";
import { AppServer } from "../server";


module.exports = (function() {
// -----------------------------------------------------------------
/**
 * @api {get} /test test
 * @apiVersion 0.0.1
 * @apiName test
 * @apiGroup test
 * @apiDescription Test endpoint
 */
function get_test(req: express.Request, res: express.Response) {
    const self: AppServer = this;
    res.send("OK");
}
// EXPORTS
// -----------------------------------------------------------------
return {
    "uri": "/test",
    "get": get_test
};
}());
