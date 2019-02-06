import * as fs from "fs";
import * as path from "path";
import * as URL from "url";
import * as express from "express";
import * as express_session from "express-session";
import * as bodyParser from "body-parser";
import * as redis from "redis";
import * as redisConnect from "connect-redis";
import { AppConfig } from "./appconfig";


export class AppServer {
    private id: number;
    private port: number;
    public app: express.Application;

    constructor(id: number, config: AppConfig) {
        this.id = id;
        this.port = config.server_port;
        // -------------------------------------------------------------
        // SETUP EXPRESS
        // -------------------------------------------------------------
        this.app = express();
        this.app.set("trust proxy", 1);
        // session
        // -------------------------------------------------------------
        const session_options: any = {
            secret: config.session_secret,
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: config.session_ttl,
                secure: (this.app.get("env") === "production")
            }
        };
        // redis
        if (config.redis) {
            const url = URL.parse(config.redis);
            // const user = url.auth.split(':')[0];
            const host = url.hostname;
            const port = parseInt(url.port);
            const db = parseInt(url.path.substring(1) || "0");
            const pass = url.auth.split(":")[1];
            const redisStore = redisConnect(express_session);
            const store = new redisStore({
                db: db,
                pass: pass,
                client: redis.createClient({
                    host: host,
                    port: port
                }),
                ttl: config.session_ttl
            });
            session_options.store = store;
        }
        this.app.use(express_session(session_options));
        this.app.use(bodyParser.json())
                .use(express.static("html"));
        // Remove useless header
        // -------------------------------------------------------------
        this.app.use(function (req: express.Request, res: express.Response, next: any) {
            res.removeHeader("X-Powered-By");
            next();
        });
        // Handle bad JSON request
        // -------------------------------------------------------------
        this.app.use(function(err: any, req: express.Request, res: express.Response, next: any) {
            if ((err.status === 400) && ("body" in err) && (err instanceof SyntaxError)) {
                res.status(403).json({"error": "INVALID_PARAM"});
            }
        });
        // Register URI Handlers
        // -------------------------------------------------------------
        fs.readdirSync(path.join(__dirname, "./route"))
          .filter(file => file.endsWith(".js"))
          .forEach((file) => {
             const mod = require("./route/" + file);
             const uri = mod["uri"] || "/" + file.slice(0, -path.extname(file).length);
             console.log(`[D] Register URI: ${uri}`);
             for (const method of Object.keys(mod)) {
                switch (method) {
                case "get"   : this.app.get(uri, mod[method].bind(this)); break;
                case "post"  : this.app.post(uri, mod[method].bind(this)); break;
                case "put"   : this.app.put(uri, mod[method].bind(this)); break;
                case "delete": this.app.delete(uri, mod[method].bind(this)); break;
                case "patch": this.app.patch(uri, mod[method].bind(this)); break;
                }
            }
        });
    }
    listen() {
        this.app.listen(this.port, function() { });
        console.log(`[D] Started server on port: ${this.port}, thread: ${this.id}`);
    }
}
