import * as assert from "assert";

export type IPortJson = string;

export class Port {
    private host: string;
    private container: string;

    constructor(host: string, container: string) {
        assert.ok(host.length > 0 && container.length > 0, "Invalid syntax. Ports must not be empty.");

        this.host = host;
        this.container = container;
    }

    public compile() {
        return `${this.host}:${this.container}`;
    }

    static create(portObject: IPortJson): Port {
        const ports = portObject.split(":");
        assert.ok(ports.length === 2, "Invalid argument");
        return new Port(ports[0], ports[1]);
    }
}
