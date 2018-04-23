import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";


export class AppServer {
    private id: number;
    private port: number;
    public app: express.Application;

    constructor(id: number) {
        this.id = id;
        this.port = 8080;
        if (process.env.APP_SERVER_PORT) {
            this.port = parseInt(process.env.APP_SERVER_PORT);
        }
        // -------------------------------------------------------------
        // SETUP EXPRESS
        // -------------------------------------------------------------
        this.app = express();
        this.app.use(bodyParser.json());
        // TODO: redis for session store
        if (this.app.get("env") === "production") {
            this.app.set("trust proxy", 1);
            this.app.use(session({
                secret: process.env.APP_SESSION_SECRET,
                resave: false,
                saveUninitialized: true,
                cookie: {
                    maxAge: 60000,
                    secure: true
                }
            }));
        } else {
            this.app.use(session({
                secret: process.env.APP_SESSION_SECRET,
                resave: false,
                saveUninitialized: true,
                cookie: {
                    maxAge: 60000
                }
            }));
        }
        // Remove useless header
        this.app.use(function (req: express.Request, res: express.Response, next: any) {
            res.removeHeader("X-Powered-By");
            next();
        });
        // Handle bad JSON request
        this.app.use(function(err: any, req: express.Request, res: express.Response, next: any) {
            if ((err.status === 400) && ("body" in err) && (err instanceof SyntaxError)) {
                res.status(403).json({"error": "INVALID_PARAM"});
            }
        });
        // Register URI Handlers
        fs.readdirSync(path.join(__dirname, "./route"))
          .filter(file => file.endsWith(".js"))
          .forEach((module) => {
             const mod = require("./route/" + module);
             const uri = mod["uri"] || "/" + module.slice(0, -path.extname(module).length);
             console.log(`[D] Register URI: ${uri}`);
             for (const method of Object.keys(mod)) {
                switch (method) {
                case "get"   : this.app.get(uri, mod[method].bind(this)); break;
                case "post"  : this.app.post(uri, mod[method].bind(this)); break;
                case "put"   : this.app.put(uri, mod[method].bind(this)); break;
                case "delete": this.app.delete(uri, mod[method].bind(this)); break;
                }
            }
        });
    }
    listen() {
        this.app.listen(this.port, function() { });
        console.log(`[D] Started server on port: ${this.port}, thread: ${this.id}`);
    }
}
