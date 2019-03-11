import * as request from "request";
import * as qs from "query-string";
import { appConfig } from "./appconfig";
import { Profile } from "./model/profile";


export class GithubClient {
    private client_id: string;
    private client_secret: string;
    private access_token: string;

    constructor(access_token?: string, client_id?: string, client_secret?: string) {
        this.access_token = access_token;
        this.client_id = client_id || appConfig.gh_clientid;
        this.client_secret = client_secret || appConfig.gh_secret;
    }
    oauth_url(state: string): string {
        const client_id = encodeURIComponent(this.client_id);
        const redirect = encodeURIComponent(appConfig.server_base + "/auth/github");
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
                    this.access_token = result["access_token"] as string;
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
                    profile = Profile.fromJson(JSON.parse(body));
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
        const e_owner = encodeURIComponent(owner);
        const e_repo = encodeURIComponent(repo);
        const e_file = encodeURI(file).replace("@", "%40");
        const e_branch = encodeURIComponent(branch);
        const options = {
            url: `https://api.github.com/repos/${e_owner}/${e_repo}/contents/${e_file}?ref=${e_branch}`,
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
            } else if (response.statusCode == 403) {
                // github returns 403 on file larger than 1mb, try data api
                this.get_user_file_large(owner, repo, branch, file, cb);
            } else if (response.statusCode >= 200 && response.statusCode < 300) {
                cb(response.statusCode, body);
            } else {
                cb(response.statusCode, undefined);
            }
        });
    }
    private get_file_hash(owner: string, repo: string, branch: string, file: string, cb: ((hash: string) => void)) {
        const e_owner = encodeURIComponent(owner);
        const e_repo = encodeURIComponent(repo);
        const e_file = encodeURI(file).replace("@", "%40");
        const e_branch = encodeURIComponent(branch);
        const dir = ("/" + file).substr(0, ("/" + file).lastIndexOf("/"));
        const e_dir = encodeURI(dir).replace("@", "%40");
        const options = {
            url: `https://api.github.com/repos/${e_owner}/${e_repo}/contents/${e_dir}?ref=${e_branch}`,
            method: "GET",
            encoding: null as string,  // tslint:disable-line:no-null-keyword
            headers: {
                "Accept": "application/vnd.github.v3.json",
                "User-Agent": "shadow-paw/gh-html",
                "Authorization": "token " + this.access_token
            }
        };
        request(options, (err, response, body) => {
            if (err) {
                cb(undefined);
            } else if (response.statusCode >= 200 && response.statusCode < 300) {
                try {
                    const json = JSON.parse(body);
                    const entry = ("/" + file).substr(("/" + file).lastIndexOf("/") + 1);
                    let hash: string = undefined;
                    for (const item of json) {
                        if (item["name"] == entry) {
                            hash = item["sha"];
                            break;
                        }
                    }
                    cb(hash);
                } catch (e) {
                    cb(undefined);
                }
            } else {
                cb(undefined);
            }
        });
    }
    private get_file_blob(owner: string, repo: string, hash: string, cb: ((code: number, data: any) => void)) {
        const e_owner = encodeURIComponent(owner);
        const e_repo = encodeURIComponent(repo);
        const e_hash = encodeURIComponent(hash);
        const options = {
            url: `https://api.github.com/repos/${e_owner}/${e_repo}/git/blobs/${e_hash}`,
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
            } else if (response.statusCode >= 200 && response.statusCode < 300) {
                cb(response.statusCode, body);
            } else {
                cb(response.statusCode, undefined);
            }
        });
    }
    private get_user_file_large(owner: string, repo: string, branch: string, file: string, cb: ((code: number, data: any) => void)) {
        this.get_file_hash(owner, repo, branch, file, (hash: string) => {
            if (hash) {
                this.get_file_blob(owner, repo, hash, cb);
            } else {
                cb(404, undefined);
            }
        });
    }
}
