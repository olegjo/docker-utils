import * as Docker from "../src";

describe('to Json', function() {
    const name = "myName";
    
    for (const internal of [true, false]) {
        const myNet = new Docker.Compose.Network(name, internal);
        it("name", () => {
            expect(myNet.name).toBe(name);
        });
        it("internal", () => {
            expect(myNet.internal).toBe(internal);
        });
        it("toJson", () => {
            const myNetJson = myNet.toJson();
            expect(myNetJson).toMatchObject({ [name]: { internal } });
        });
    }
});
