import * as os from "os";


class AppConfig {
    public threads: number;
    public server_port: number;
    public server_base: string;
    public session_secret: string;
    public session_ttl: number;
    public redis: string;
    public gh_clientid: string;
    public gh_secret: string;

    static from_env(delete_secret: boolean = true): AppConfig {
        const config = new AppConfig();
        if (process.env.APP_THREADS) {
            config.threads = parseInt(process.env.APP_THREADS);
        } else {
            config.threads = os.cpus().length;
        }
        config.server_port = parseInt(process.env.APP_SERVER_PORT || "8080");
        config.server_base = process.env.APP_SERVER_BASE;
        // strip trailing slash
        if (config.server_base.endsWith("/")) {
            config.server_base = config.server_base.slice(0, -1);
        }
        config.session_secret = process.env.APP_SESSION_SECRET;
        config.session_ttl = parseInt(process.env.APP_SESSION_TTL || "86400");
        config.redis = process.env.APP_REDIS;
        config.gh_clientid = process.env.APP_GH_CLIENTID;
        config.gh_secret = process.env.APP_GH_SECRET;
        if (!config.is_valid()) return undefined;
        // delete secret after load
        if (delete_secret) {
            delete process.env.APP_THREADS;
            delete process.env.APP_SERVER_PORT;
            delete process.env.APP_SERVER_BASE;
            delete process.env.APP_SESSION_SECRET;
            delete process.env.APP_SESSION_TTL;
            delete process.env.APP_REDIS;
            delete process.env.APP_GH_CLIENTID;
            delete process.env.APP_GH_SECRET;
        }
        return config;
    }
    is_valid(): boolean {
        if (!this.server_base) {
            console.log("[E] Missing config APP_SERVER_BASE.");
            return false;
        }
        if (!this.session_secret) {
            console.log("[E] Missing config APP_SESSION_SECRET.");
            return false;
        }
        if (!this.redis && this.threads != 1) {
            console.log("[E] Require redis for multiple cluster support.");
            return false;
        }
        if (!this.gh_clientid) {
            console.log("[E] Missing config APP_GH_CLIENTID.");
            return false;
        }
        if (!this.gh_secret) {
            console.log("[E] Missing config APP_GH_SECRET.");
            return false;
        }
        return true;
    }
}

const APPCONFIG = AppConfig.from_env(false);
export { APPCONFIG };
