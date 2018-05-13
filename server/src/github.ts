import * as request from "request";
import * as qs from "query-string";


export class GithubClient {
    private token: string;

    constructor(access_token: string) {
        this.token = access_token;
    }
    get_oauth_url(state: string): string {
        const client_id = encodeURIComponent(process.env.APP_GH_OAUTH_CLIENTID);
        const redirect = encodeURIComponent(process.env.APP_SERVER_BASE + "gh-oauth");
        const url = `https://github.com/login/oauth/authorize?scope=repo&client_id=${client_id}&redirect_uri=${redirect}&state=${state}`;
        return url;
    }
    get_access_token(code: string, state: string, cb: ((token: string) => void)) {
        const options = {
            url: "https://github.com/login/oauth/access_token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: {
                client_id: process.env.APP_GH_OAUTH_CLIENTID,
                client_secret: process.env.APP_GH_OAUTH_SECRET,
                code: code,
                state: state
            }
        };
        request(options, (err, response, body) => {
            if (err) {
                cb(undefined);
            } else {
                const result = qs.parse(body);
                if ("access_token" in result) {
                    cb(result["access_token"]);
                } else {
                    cb(undefined);
                }
            }
        });
    }
    user_repo(cb: ((json: any) => void)) {
        const options = {
            url: "https://api.github.com/user/repos",
            method: "GET",
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "shadow-paw/gh-html",
                "Authorization": "token " + this.token
            }
        };
        request(options, (err, response, body) => {
            if (err) {
                cb(undefined);
            } else {
                let repos = undefined;
                try {
                    repos = JSON.parse(body);
                } catch (e) {
                    // ignore
                }
                cb(repos);
            }
        });
    }
    user_file(owner: string, repo: string, branch: string, file: string, cb: ((data: any) => void)) {
        // console.log(`GITHUB GET FILE: owner: ${owner}, repo: ${repo}, branch: ${branch}, file: ${file}`);
        owner = encodeURIComponent(owner);
        repo = encodeURIComponent(repo);
        file = encodeURI(file).replace("@", "%40");
        branch = encodeURIComponent(branch);
        const options = {
            url: `https://api.github.com/repos/${owner}/${repo}/contents/${file}?ref=${branch}`,
            method: "GET",
            encoding: null as string,  // tslint:disable-line:no-null-keyword
            headers: {
                "Accept": "application/vnd.github.v3.raw",
                "User-Agent": "shadow-paw/gh-html",
                "Authorization": "token " + this.token
            }
        };
        request(options, (err, response, body) => {
            if (err) {
                cb("");
            } else {
                cb(body);
            }
        });
    }
}
