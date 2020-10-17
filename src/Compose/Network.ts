
export interface INetworkDefinition {
    internal: boolean;
}

export type NetworkJson = string;

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

    static fromJson(name: string, definition: INetworkDefinition): Network {
        const ret = new Network(name, definition.internal);
        return ret;
    }
}
