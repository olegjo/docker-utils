import { Service, IServiceJson } from "./Service";
import YAML from "yamljs";
import { INetworkDefinition } from './Network';
import { IVolumeDefinition } from "./Volume";
import * as fs from "fs";

export type ComposeFileVersion = string;

export interface IComposeFileJson {
    version: string;
    services: IServiceJson[];
    networks: {
        [name: string]: INetworkDefinition;
    };
    volumes: {
        [name: string]: IVolumeDefinition;
    }
}

/**
 * 
 */
export class ComposeFile {
    private services: Service[] = [];
    private version: ComposeFileVersion;

    constructor(version: ComposeFileVersion) {
        this.version = version;
    }

    /**
     * 
     * @param service 
     */
    public addService(service: Service) {
        this.services.push(service);
    }

    public toYaml(): string {
        let services = {};
        let networks = {};
        let volumes = {};
        for (const service of this.services) {
            services = {...services, ...service.toJson(this.version)};

            for (const network of service.networks) {
                if (!Object.keys(networks).includes(network.name)) {
                    networks = {...networks, ...network.toJson()}
                }
            }

            for (const volume of service.getVolumes()) {
                if (volume.volume.type !== "bind") {
                    volumes = {...volumes, ...volume.volume.toJsonComposeFile()};
                }
            }
        }

        let ret = {
            version: this.version.toString(),
            services,
            networks,
            volumes,
        };
        return YAML.stringify(ret, 7, 4);
    }

    public save(path: string) {
        fs.writeFileSync(path, this.toYaml());
    }

    static fromYaml(path: string): ComposeFile {
        const input = YAML.load(path) as IComposeFileJson;
        
        const ret = new ComposeFile(input.version);
        const volumeDefinitions = input.volumes;
        const networkDefinitions = input.networks;
        for (const serviceName in input.services) {
            ret.addService(Service.create(serviceName, input.services[serviceName], volumeDefinitions, networkDefinitions));
        }
        return ret;
    }
}
