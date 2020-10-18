import * as Docker from "../../src";

describe("Short syntax, type = volume", function() {
    const source = "./source/on/host";
    const target = "/target/in/container";
    const myVol = new Docker.Compose.Volume(source);
    
    it("is type bind", () => {
        expect(myVol.type).toBe("bind");
    });
    
    const myVolJson = myVol.toJsonService(target, "2.3");

    it("is on the form source:target", () => {
        expect(myVolJson.toString().split(":").length).toBe(2); 
    });

    it("has correct source and target", () => {
        const [source, target] = myVolJson.toString().split(":");
        expect(source).toBe(source);
        expect(target).toBe(target);
    });
});

describe("Short syntax with mode", function() {
    const source = "./source/on/host";
    const target = "/target/in/container";
    const myVol = new Docker.Compose.Volume(source);
    
    const myVolJsonRw = myVol.toJsonService(target, "2.3", {readOnly: false});
    const myVolJsonRo = myVol.toJsonService(target, "2.3", {readOnly: true});

    it("is on the form source:target:mode", () => {
        expect(myVolJsonRo.toString().split(":").length).toBe(3);
        expect(myVolJsonRw.toString().split(":").length).toBe(3);
    });

    it("has correct mode", () => {
        const [sourceRo, targetRo, modeRo] = myVolJsonRo.toString().split(":");
        expect(sourceRo).toBe(source);
        expect(targetRo).toBe(target);
        expect(modeRo).toBe("ro");

        const [sourceRw, targetRw, modeRw] = myVolJsonRw.toString().split(":");
        expect(sourceRw).toBe(source);
        expect(targetRw).toBe(target);
        expect(modeRw).toBe("rw");
    });
});

describe("Service Volume object format", function() {
    const source = "./source/on/host";
    const target = "/target/in/container";
    const myVol = new Docker.Compose.Volume(source);

    const optionsGivingLongSyntax: Partial<Docker.Compose.IVolumeOptions> = {
        bind: {
            propagation: "propvalue",
        },
        consistency: "consistent",
        readOnly: true,
        volume: {
            nocopy: true,
        },
    };

    it("to always use short syntax for version < 3.2", () => {
        const myVolJson = myVol.toJsonService(target, "3.1", optionsGivingLongSyntax);
        expect(typeof myVolJson).toBe("string");
    });

    it("to use long syntax for version >= 3.2 (when required)", () => {
        const myVolJson = myVol.toJsonService(target, "3.2", optionsGivingLongSyntax);
        expect(typeof myVolJson).toBe("object");
    });
});

/**
 * Check that loading a volume from JSON works.
 * 
 * First check that loading with short mode works, both with and without mode being set.
 * 
 * Then check that loading works with the long syntax. 
 */
describe("Loading from JSON", function() {
    const sourceIn = "./source/on/host";
    const targetIn = "/target/in/container";

    it("loads correctly using short syntax (without mode)", () => {
        const myVolJson: Docker.Compose.VolumeJsonShortSyntax = `${sourceIn}:${targetIn}`;
        const [volOut, targetOut, optionsOut] = Docker.Compose.Volume.fromJson(myVolJson);
        
        expect(volOut.source).toBe(sourceIn);
        expect(targetOut).toBe(targetIn);
        expect(optionsOut).toBe(undefined);
    });

    it("loads correctly using short syntax (with mode)", () => {
        for (const mode of ["rw", "ro"]) {
            const myVolJson: Docker.Compose.VolumeJsonShortSyntax = `${sourceIn}:${targetIn}:${mode}`;
            const [volOut, targetOut, optionsOut] = Docker.Compose.Volume.fromJson(myVolJson);
            
            expect(volOut.source).toBe(sourceIn);
            expect(targetOut).toBe(targetIn);
            expect(optionsOut).toBeDefined();
            expect(optionsOut?.readOnly).toBe(mode === "ro");
        }
    });

    it("loads correctly using long syntax", () => {
        const consistencies: Docker.Compose.VolumeConsistency[] = ["delegated", "consistent", "cached"];
        const volumeTypes: Docker.Compose.VolumeType[] = ["bind", "volume"];

        // Loop through all possible values to check that they are set properly.
        for (const consistency of consistencies) {
            for (const readOnly of [true, false]) {
                for (const nocopy of [true, false]) {
                    for (const type of volumeTypes) {
                        const myVolJson: Docker.Compose.IVolumeJsonLongSyntax = {
                            bind: {
                                propagation: "some_string_value",
                            },
                            consistency,
                            readOnly,
                            source: sourceIn,
                            target: targetIn,
                            tmpfs: {
                                size: 1234,
                            },
                            type,
                            volume: {
                                nocopy,
                            },
                        };
                        const [volOut, targetOut, optionsOut] = Docker.Compose.Volume.fromJson(myVolJson);
                        expect(volOut.source).toBe(sourceIn);
                        expect(targetOut).toBe(targetIn);

                        // The following keys are not parts of the volume options. Otherwise, the input JSON is the same as the options object.
                        delete myVolJson.source;
                        delete myVolJson.target;
                        delete myVolJson.type;
                        expect(optionsOut).toMatchObject(myVolJson);
                    }
                }
            }

        }
    });
});
