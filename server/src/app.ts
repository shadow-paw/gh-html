import * as cluster from "cluster";
import * as fs from "fs";
import * as os from "os";
import { AppServer } from "./server";


function verify_config(threads: number) {
    if (!process.env.APP_REDIS) {
        if (threads != 1) {
            console.log("[E] Require redis for multiple cluster support");
            return false;
        }
    } return true;
}
function start_server(id: number) {
    const server = new AppServer(id);
    server.listen();
}
function main() {
    if (cluster.isMaster) {
        let threads = 1;
        if (process.env.APP_SERVER_THREADS) {
            threads = parseInt(process.env.APP_SERVER_THREADS);
        } else {
            threads = os.cpus().length;
        }
        if (!verify_config(threads)) {
            process.exit(0);
        }
        if (threads == 1) {
            start_server(1);
        } else {
            for (let i = 1; i <= threads; i++) {
                cluster.fork({"id": i});
            }
        }
    } else {
        start_server(cluster.worker.id);
    }
}

main();
