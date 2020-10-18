import { ComposeFileVersion } from "./ComposeFile";
import { Network, NetworkJson, INetworkDefinition } from "./Network";
import { Port, IPortJson } from './Port';
import { Volume, VolumeJson, IVolumeDefinition, IVolumeOptions } from "./Volume";

type Restart = "" | "no" | "on-failure" | "unless-stopped" | "always";

export interface IServiceJson {
    image: string;
    ports?: IPortJson[];
    networks?: NetworkJson[];
    volumes?: VolumeJson[];
    restart?: Restart;
}

export class Service {
    private serviceName: string;
    private image: string;
    private envionmentVariables: {[name: string]: any} = {};
    private volumes: {volume: Volume, target: string, options?: Partial<IVolumeOptions>}[] = [];
    private ports: Port[] = [];
    
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

    public addPort(port: Port) {
        this.ports.push(port);
    }

    public setPorts(ports: Port[]) {
        this.ports = ports;
    }

    public addVolume(volume: Volume, locationInContainer: string, options?: Partial<IVolumeOptions>) {
        this.volumes.push({volume, target: locationInContainer, options});
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

    public toJson(version: ComposeFileVersion): object {
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
        if (this.volumes.length > 0)                          config.volumes        = this.compileVolumes(version);
        return {
            [this.serviceName]: config
        };
    }

    private compileVolumes(version: ComposeFileVersion) {
        return this.volumes.map((v) => v.volume.toJsonService(v.target, version, v.options));
    }

    private compileNetworks() {
        return this.networks.map((v) => v.name);
    }

    private compilePorts() {
        return this.ports.map((v) => v.compile());
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

    static create(name: string, serviceObject: IServiceJson, volumeDefinitions: {[name: string]: IVolumeDefinition}, networkDefinitions: {[name: string]: INetworkDefinition}): Service {
        const ret = new Service(name, serviceObject.image);
        
        if (serviceObject.ports && serviceObject.ports.length > 0) {
            for (const portObj of serviceObject.ports) {
                ret.addPort(Port.create(portObj));
            }
        }

        if (serviceObject.networks && serviceObject.networks.length > 0) {
            for (const item of serviceObject.networks) {
                ret.networks.push(Network.fromJson(item, networkDefinitions[item]));
            }
        }

        if (serviceObject.volumes && serviceObject.volumes.length > 0) {
            for (const item of serviceObject.volumes) {
                const V = Volume.fromJson(item);
                ret.addVolume(V[0], V[1], V[2]);
            }
        }

        if (serviceObject.restart) {
            // TODO: validate restart string
            ret.restart = serviceObject.restart;
        }

        return ret;
    }
}