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
//# sourceMappingURL=selector.test.js.map