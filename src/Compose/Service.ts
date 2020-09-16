import { Network } from "./Network";
import { Volume } from "./Volume";

type Restart = "" | "no" | "on-failure" | "unless-stopped" | "always";

export class Service {
    private serviceName: string;
    private image: string;
    private ports: string[] = [];
    private envionmentVariables: {[name: string]: any} = {};
    private volumes: {volume: Volume, to: string}[] = [];
    
    public dependsOn: Service[] = [];
    public restart: Restart = "";
    public networks: Network[] = [];
    public command: string[] | string = "";
    public entrypoint: string[] | string = "";
    public containerName: string = "";

    constructor(serviceName: string, image: string) {
        this.serviceName = serviceName;
        this.image = image;
    }

    public addPort(from: string | number, to: string | number) {
        this.ports.push(`${from}:${to}`);
    }

    public addVolume(volume: Volume, locationInContainer: string) {
        this.volumes.push({volume, to: locationInContainer});
    }

    public getVolumes() {
        return this.volumes;
    }

    public setEnv(name: string, value: string) {
        this.envionmentVariables = {...this.envionmentVariables, [name]: value};
    }

    public getEnv(name: string): string | undefined {
        return this.envionmentVariables[name];
    }

    public toJson(): object {
        let config: any = {
            image: this.image,
        };
        if (this.containerName.length > 0)                    config.container_name = this.containerName;
        if (this.ports.length > 0)                            config.ports          = this.compilePorts();
        if (Object.keys(this.envionmentVariables).length > 0) config.environment    = this.envionmentVariables;
        if (this.dependsOn.length > 0)                        config.depends_on     = this.compileDependsOn();
        if (this.command.length > 0)                          config.command        = this.command;
        if (this.entrypoint.length > 0)                       config.entrypoint     = this.entrypoint;
        if (this.restart.length > 0)                          config.restart        = this.restart;
        if (this.networks.length > 0)                         config.networks       = this.compileNetworks();
        if (this.volumes.length > 0)                          config.volumes        = this.compileVolumes();
        return {
            [this.serviceName]: config
        };
    }

    private compileVolumes() {
        return this.volumes.map((v) => v.volume.toJsonService(v.to));
    }

    private compileNetworks() {
        return this.networks.map((v) => v.name);
    }

    private compilePorts() {
        return this.ports;
    }

    private compileDependsOn() {
        let dependsOn = [];
        for (const dep of this.dependsOn) {
            dependsOn.push(dep.name);
        }
        return dependsOn;
    }

    get name(): string {
        return this.serviceName;
    }
}