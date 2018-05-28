"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selector_1 = require("../src/selector");
test("it strips out `#` and `.` from selectors", () => {
    const expectedId = "a-valid-id";
    const expectedClass = "a-valid-class";
    const selectorId = new selector_1.Selector("#a-valid-id");
    expect(selectorId.cleanName).toEqual(expectedId);
    const selectorClass = new selector_1.Selector(".a-valid-class");
    expect(selectorClass.cleanName).toEqual(expectedClass);
});
test("it strips out attribute selectors", () => {
    const expectedId = "a-valid-id";
    const expectedClass = "a-valid-class";
    const selectorId = new selector_1.Selector("#a-valid-id[type=button]");
    expect(selectorId.cleanName).toEqual(expectedId);
    const selectorClass = new selector_1.Selector(".a-valid-class[something]");
    expect(selectorClass.cleanName).toEqual(expectedClass);
});
test("it is instantiated with a default line count of 0", () => {
    const selector = new selector_1.Selector("#something");
    expect(selector.lineCount).toEqual(0);
});
// TODO refactor this and use jest-each instead
test("it knows an invalid id when it sees one 1", () => {
    const invalidSelector = new selector_1.Selector("#34");
    expect(invalidSelector.isValidId(invalidSelector.rawName)).toEqual(false);
});
test("it knows an invalid id when it sees one 2", () => {
    const invalidSelector = new selector_1.Selector("#{animal}-type");
    expect(invalidSelector.isValidId(invalidSelector.rawName)).toEqual(false);
});
test("it knows an valid id when it sees one 2", () => {
    const validSelector = new selector_1.Selector("#some-id");
    expect(validSelector.isValidId(validSelector.rawName)).toEqual(true);
});
// https://github.com/joereynolds/mort/issues/7
test("it strips punctuation from the selector", () => {
    const expectedId = "id-with-comma";
    const expectedClass = "class-with-comma";
    const selectorId = new selector_1.Selector("#id-with-comma,");
    expect(selectorId.cleanName).toEqual(expectedId);
    const selectorClass = new selector_1.Selector(".class-with-comma,");
    expect(selectorClass.cleanName).toEqual(expectedClass);
});
//# sourceMappingURL=selector.test.js.map