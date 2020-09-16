import { containsWhiteSpace } from "../utilities/containsWhiteSpace";

type VolumeType = "volume" | "bind";

export class Volume {
    readonly name: string;
    readonly from: string;
    readonly type: VolumeType;

    /**
     * Constructor.
     * @param name The name of the volume.
     * @param type The volume type. If it's of type "volume", docker volume is used. If type is "bind", the volume is bound to a location on the host machine.
     * @param from If type === "bind", this has to be the location of the volume on the host machine. Else, an empty string must be used.
     */
    constructor(name: string, type: VolumeType, from: string = "") {
        if (containsWhiteSpace(name)) throw new Error("Name cannot contain white space");

        this.name = name;
        this.from = from;
        this.type = type;

        // Set this.from to this.name when type is volume.
        if (this.type === "volume") {
            if (this.from.length > 0) throw new Error("from should be empty string when type is 'volume'");
            this.from = this.name;
        }
    }

    /**
     * Creates a JSON object to be inserted in the volumes section in the compose file.
     */
    public toJsonComposeFile() {
        return {
            [this.name]: {}
        };
    }

    /**
     * Creates a JSON object to be inserted in the volumes section for each service.
     * 
     * @param target The target volume inside the container.
     */
    public toJsonService(target: string) {
        return `${this.from}:${target}`;
    }
}
