export class Profile {
    public user_id: number;
    public name: string;

    static from(json: any): Profile {
        const profile = new Profile();
        profile.user_id = json["id"] as number;
        profile.name = json["login"] as string;

        if (!profile.user_id || !profile.name) return undefined;
        return profile;
    }
}
