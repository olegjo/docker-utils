import { containsWhiteSpace } from "../src/utilities/containsWhiteSpace";

describe("Test the containsWhiteSpace function", () => {
    it("Returns false when ok", () => {
        expect(containsWhiteSpace("no_space")).toBeFalsy();
    });

    it("Detects space", () => {
        expect(containsWhiteSpace("has space")).toBeTruthy();
    });

    it("Detects newline", () => {
        expect(containsWhiteSpace(`first_line
second_line
        `)).toBeTruthy();
    });

    it("Detects newline and space", () => {
        expect(containsWhiteSpace(`first line
second_line
        `)).toBeTruthy();
    });
});
