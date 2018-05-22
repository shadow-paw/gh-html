import * as request from "request";
import * as qs from "query-string";
import { Profile } from "./model/profile";


export class GithubClient {
    private client_id: string;
    private client_secret: string;
    private access_token: string;

    constructor(access_token?: string, client_id?: string, client_secret?: string) {
        this.access_token = access_token;
        this.client_id = client_id || process.env.APP_GH_CLIENTID;
        this.client_secret = client_secret || process.env.APP_GH_SECRET;
    }
    oauth_url(state: string): string {
        const client_id = encodeURIComponent(this.client_id);
        const redirect = encodeURIComponent(process.env.APP_SERVER_BASE + "/auth/github");
        return `https://github.com/login/oauth/authorize?scope=repo&client_id=${client_id}&redirect_uri=${redirect}&state=${state}`;
    }
    get_access_token(code: string, state: string, cb: ((token: string) => void)) {
        const options = {
            url: "https://github.com/login/oauth/access_token",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: {
                client_id: this.client_id,
                client_secret: this.client_secret,
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
                    this.access_token = result["access_token"];
                    cb(this.access_token);
                } else {
                    cb(undefined);
                }
            }
        });
    }
    get_me(cb: ((profile: Profile) => void)) {
        const options = {
            url: "https://api.github.com/user",
            method: "GET",
            headers: {
                "Accept": "application/json",
                "User-Agent": "shadow-paw/gh-html",
                "Authorization": "token " + this.access_token
            }
        };
        request(options, (err, response, body) => {
            if (err || response.statusCode < 200 || response.statusCode >= 300) {
                cb(undefined);
            } else {
                let profile: Profile = undefined;
                try {
                    profile = Profile.from(JSON.parse(body));
                } catch (e) {
                    // IGNORE
                }
                cb(profile);
            }
        });
    }
    is_private(owner: string, repo: string, cb: ((isprivate: boolean) => void)) {
        const options = {
            url: `https://api.github.com/repos/${owner}/${repo}`,
            method: "GET",
            headers: {
                "Accept": "application/json",
                "User-Agent": "shadow-paw/gh-html",
                "Authorization": "token " + this.access_token
            }
        };
        request(options, (err, response, body) => {
            if (err || response.statusCode < 200 || response.statusCode >= 300) {
                cb(false);
            } else {
                let isprivate = false;
                try {
                    const json = JSON.parse(body);
                    isprivate = json["private"] as boolean;
                } catch (e) {
                    // IGNORE
                }
                cb(isprivate);
            }
        });
    }
    is_collaborator(user: string, owner: string, repo: string, cb: ((iscollaborator: boolean) => void)) {
        const options = {
            url: `https://api.github.com/repos/${owner}/${repo}/collaborators/${user}`,
            method: "GET",
            headers: {
                "Accept": "application/vnd.github.hellcat-preview+json",
                "User-Agent": "shadow-paw/gh-html",
                "Authorization": "token " + this.access_token
            }
        };
        request(options, (err, response, body) => {
            if (err || response.statusCode < 200 || response.statusCode >= 300) {
                cb(false);
            } else {
                cb(true);
            }
        });
    }
    get_user_file(owner: string, repo: string, branch: string, file: string, cb: ((code: number, data: any) => void)) {
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
                "Authorization": "token " + this.access_token
            }
        };
        request(options, (err, response, body) => {
            if (err) {
                cb(404, undefined);
            } else if (response.statusCode < 200 || response.statusCode >= 300) {
                cb(response.statusCode, undefined);
            } else {
                cb(response.statusCode, body);
            }
        });
    }
}
