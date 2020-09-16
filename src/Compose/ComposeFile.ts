import { Service } from "./Service";
import YAML from "yamljs";

/**
 * 
 */
export class ComposeFile {
    private services: Service[] = [];
    private version: string;

    constructor(version: string) {
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
            services = {...services, ...service.toJson()};

            for (const network of service.networks) {
                if (!Object.keys(networks).includes(network.name)) {
                    networks = {...networks, ...network.toJson()}
                }
            }

            for (const volume of service.getVolumes()) {
                if (volume.volume.type !== "bind") {
                    if (!Object.keys(volumes).includes(volume.volume.name)) {
                        volumes = {...volumes, ...volume.volume.toJsonComposeFile()};
                    }
                }
            }
        }

        let ret = {
            version: this.version,
            services,
            networks,
            volumes,
        };
        return YAML.stringify(ret, 7, 4);
    }
}
