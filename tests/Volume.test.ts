import * as Docker from "../src";

describe('Volume type = "volume"', function() {
    const name = "myVolumeName";
    const myVol = new Docker.Compose.Volume(name, "volume", "");
    it("In compose file", () => {
        const myVolJson = myVol.toJsonComposeFile();
        const expected = {
            [name]: {}
        };
        expect(myVolJson).toMatchObject(expected);
    });

    it("In service", () => {
        const path = "/path/to/location";
        const myVolJson = myVol.toJsonService(path);
        expect(myVolJson).toBe(`${name}:${path}`);
    });
});


describe('Volume type = "bind"', function() {
    const name = "myVolumeName";
    const boundLoc = "./bound/location"
    const myVol = new Docker.Compose.Volume(name, "bind", boundLoc);
    it("In compose file", () => {
        const myVolJson = myVol.toJsonComposeFile();
        const expected = {
            [name]: {}
        };
        expect(myVolJson).toMatchObject(expected);
    });

    it("In service", () => {
        const path = "/path/to/location";
        const myVolJson = myVol.toJsonService(path);
        expect(myVolJson).toBe(`${boundLoc}:${path}`);
    });
});

describe('Wrong params', function() {
    it("Docker volume with bound location should throw error", () => {
        expect(() => {
            new Docker.Compose.Volume("some_name", "volume", "should_be_empty");
        }).toThrowError();
    });

    it("Name cannot contain white space", () => {
        expect(() => {
            new Docker.Compose.Volume("some name with space", "bind", "");
        }).toThrowError();
    });
});
