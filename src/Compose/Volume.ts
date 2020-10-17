/**
 * Interface for the definition of a volume in the overall compose file. This is always just an empty object
 * but this is kept for generality and keeping it similar as for networks.
 */
export interface IVolumeDefinition {
    
}

interface IVolumeJsonLongSyntax extends IVolumeOptions {
    type: VolumeType;
    target: string;
    source: string;
}

export type VolumeJson = string | IVolumeJsonLongSyntax;

export type VolumeType = "volume" | "bind";

export type VolumeConsistency = "consistent" | "cached" | "delegated";

export interface IVolumeOptions {
    readOnly: boolean;
    bind: Partial<{
        propagation: string;
    }>;
    volume: Partial<{
        nocopy: boolean;
    }>;
    tmpfs: Partial<{
        size: number;
    }>;
    consistency: VolumeConsistency;
}

function findVolumeType(source: string): VolumeType {
    if ([".", "/"].includes(source[0])) { // Starts with "." or "/" means it is a bind volume
        return "bind";
    } else {
        return "volume";
    }
}

export class Volume {
    readonly source: string;

    /**
     * Constructor.
     * @param type The volume type. If it's of type "volume", docker volume is used. If type is "bind", the volume is bound to a location on the host machine.
     * @param source If type === "bind", this has to be the location of the volume on the host machine. Else, an empty string must be used.
     */
    constructor(source: string) {
        this.source = source;
    }

    /**
     * Creates a JSON object to be inserted in the volumes section in the compose file.
     */
    public toJsonComposeFile() {
        return {
            [this.source]: {}
        };
    }

    /**
     * Creates a JSON object to be inserted in the volumes section for each service.
     * 
     * @param target The target volume inside the container.
     */
    public toJsonService(target: string, options?: Partial<IVolumeOptions>) {
        if (options) {
            return {
                type: this.type,
                source: this.source,
                target,
                ...options,
            };
        }
        return `${this.source}:${target}`;
    }

    /**
     * Return the volume type.
     * If it's of type "volume", docker volume is used. If type is "bind", the volume is bound to a location on the host machine.
     */
    get type(): VolumeType {
        return findVolumeType(this.source);
    }

    static fromJson(jsonObj: VolumeJson): [Volume, string, Partial<IVolumeOptions>?] {
        // For now, VolumeJson must be a string;
        if (typeof jsonObj === "string") {
            return this.fromJsonShortSyntax(jsonObj as string)
        } else {
            return this.fromJsonLongSyntax(jsonObj as IVolumeJsonLongSyntax);
        }
    }
    
    private static fromJsonShortSyntax(value: string): [Volume, string, Partial<IVolumeOptions>?] {
        if (typeof value !== "string" || value.split(":").length !== 2) {
            throw new Error("Volume only supports string with format 'from:to'");
        }

        const [source, to] = value.split(":");
        const ret = new Volume(source);
        return [ret, to, undefined];
    }

    private static fromJsonLongSyntax(value: IVolumeJsonLongSyntax): [Volume, string, Partial<IVolumeOptions>?] {
        if (typeof value !== "object") {
            throw new Error("Type was not object");
        }

        // The options object is equal to the value object with some elements deleted. See the definition of IVolumeJsonLongSyntax.
        let options = JSON.parse(JSON.stringify(value)) as Partial<IVolumeJsonLongSyntax>;
        delete options.type;
        delete options.target;
        delete options.source;

        const ret = new Volume(value.source);
        return [ret, value.target, options];
    }
}
