export class Network {
    readonly name: string;
    readonly internal: boolean;

    constructor(name: string, internal: boolean) {
        this.name = name;
        this.internal = internal;
    }

    public toJson() {
        return {
            [this.name]: {
                internal: this.internal,
            },
        };
    }
}
