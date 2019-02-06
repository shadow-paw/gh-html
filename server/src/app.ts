import * as cluster from "cluster";
import * as fs from "fs";
import { appConfig, AppConfig } from "./appconfig";
import { AppServer } from "./server";


function start_server(id: number, config: AppConfig) {
    const server = new AppServer(id, config);
    server.listen();
}
function main() {
    if (!appConfig || !appConfig.is_valid()) {
        process.exit(0);
    }
    if (cluster.isMaster) {
        if (appConfig.threads == 1) {
            appConfig.remove_secret_from_env();
            start_server(1, appConfig);
        } else {
            for (let i = 1; i <= appConfig.threads; i++) {
                cluster.fork();
            }
            appConfig.remove_secret_from_env();
        }
    } else {
        appConfig.remove_secret_from_env();
        start_server(cluster.worker.id, appConfig);
    }
}

main();
