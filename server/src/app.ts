import * as cluster from "cluster";
import * as fs from "fs";
import { APPCONFIG } from "./appconfig";
import { AppServer } from "./server";


function start_server(id: number) {
    const server = new AppServer(id);
    server.listen();
}
function main() {
    if (!APPCONFIG || !APPCONFIG.is_valid()) {
        process.exit(0);
    }

    if (cluster.isMaster) {
        if (APPCONFIG.threads == 1) {
            start_server(1);
        } else {
            for (let i = 1; i <= APPCONFIG.threads; i++) {
                cluster.fork({"id": i});
            }
        }
    } else {
        start_server(cluster.worker.id);
    }
}

main();
