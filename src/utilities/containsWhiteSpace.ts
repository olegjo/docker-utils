/**
 * Returns true if string s contains whitespace. Otherwise, returns false.
 * @param s String to test
 */
export function containsWhiteSpace(s: string) {
    const whiteSpaceChars = [" ", "\n"];
    for (const char of whiteSpaceChars) {
        if (s.split(char).length > 1) return true;
    }
    return false;
}
