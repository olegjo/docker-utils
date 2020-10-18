import { ComposeFileVersion } from "./ComposeFile";
import compareVersions from "compare-versions";
import { isNullish } from "../utilities/maybe";

/**
 * Interface for the definition of a volume in the overall compose file. This is always just an empty object
 * but this is kept for generality and keeping it similar as for networks.
 */
export interface IVolumeDefinition {}

/**
 * Interface for how the volume object looks in the service object when long syntax is used.
 */
export interface IVolumeJsonLongSyntax extends IVolumeOptions {
    type: VolumeType;
    target: string;
    source: string;
}

/**
 * Volume Object in the Service Object when short syntax is used.
 */
export type VolumeJsonShortSyntax = string;

/**
 * The Volume Object in the Service Object can use either Short or Long syntax.
 */
export type VolumeJson = VolumeJsonShortSyntax | IVolumeJsonLongSyntax;

/**
 * The types of volumes that are supported. Type "volume" means using a docker volume, whereas type "bind"
 * will bind the volume to the host file system.
 */
export type VolumeType = "volume" | "bind";

/**
 * The consistency. See documentation of docker-compose for details.
 */
export type VolumeConsistency = "consistent" | "cached" | "delegated";

/**
 * Options to pass to the binding of a volume. These options can be different for each service even if the location
 * on host system disk is the same.
 */
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

/**
 * Returns whether the volume type is of type "bind" or "volume."
 * @param source The path/value of the source location on the host machine.
 */
function findVolumeType(source: string): VolumeType {
    // If it starts with "." or "/" means it is a bind volume
    if ([".", "/"].includes(source[0])) { 
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
     * @param source The source of the volume on the host machine.
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
    public toJsonService(target: string, version: ComposeFileVersion, options?: Partial<IVolumeOptions>) {
        let useLongSyntax = true;
        // Long syntax only supported for version >= 3.2
        if (compareVersions.compare(version, "3.2", "<")) useLongSyntax = false;
        
        // Don't use long syntax if we dont have to: if no options, or only element in options is readOnly.
        if (!options) useLongSyntax = false;
        if (options) {
            const keys = Object.keys(options);
            if (keys.length === 1 && keys.includes("readOnly")) useLongSyntax = false;
        }

        if (useLongSyntax) {
            return {
                type: this.type,
                source: this.source,
                target,
                ...options,
            };
        }

        if (options && !isNullish(options.readOnly)) {
            let mode = "";
            if (options.readOnly) mode = "ro";
            else mode = "rw";
            return `${this.source}:${target}:${mode}`
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

    /**
     * Generates a Volume object from the volume JSON object in the Service. Used when parsing a docker-compose file.
     * @param jsonObj The input json.
     * @returns Array containing of length 3 where the elements are:
     * 
     * | Index | Description                            |
     * |:------|:---------------------------------------|
     * | 0     | The new Volume                         |
     * | 1     | The location (target) inside container |
     * | 2     | Options                                |
     * 
     * Will automatically determine if long or short syntax is used. See fromJsonShortSyntax and fromJsonLongSyntax.
     */
    static fromJson(jsonObj: VolumeJson): [Volume, string, Partial<IVolumeOptions>?] {
        // For now, VolumeJson must be a string;
        if (typeof jsonObj === "string") {
            return this.fromJsonShortSyntax(jsonObj as string)
        } else {
            return this.fromJsonLongSyntax(jsonObj as IVolumeJsonLongSyntax);
        }
    }
    
    /**
     * Creates a Volume object form JSON when JSON is on the short format.
     * @param value A value on the form "source:target" or "source:target:mode".
     */
    private static fromJsonShortSyntax(value: VolumeJsonShortSyntax): [Volume, string, Partial<IVolumeOptions>?] {
        if (typeof value !== "string" || ![2, 3].includes(value.split(":").length)) {
            throw new Error("Volume only supports string with format 'from:to' or 'from:to:mode'");
        }

        const [source, to, mode] = value.split(":");
        const ret = new Volume(source);
        if (mode) {
            return [ret, to, {readOnly: mode === "ro"}];
        }        
        return [ret, to, undefined];
    }

    /**
     * Creates a volume object from JSON when JSON is using the long format.
     * @param value A JSON value containing the volume definition using the long format.
     */
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
