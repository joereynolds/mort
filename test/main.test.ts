import { RipGrep } from "../src/grep-programs/ripgrep";
import { Selectors } from "../src/selectors";
const child_process = require("child_process");

test("jest is running correctly", () => {
  expect(2).toBe(2);
});

test("our grep program returns an object of results", () => {
    const ripgrep = new RipGrep();
    expect(typeof ripgrep.run("test/fixtures/test.css")).toEqual("object");
});

test("it ignores pseudoselectors", () => {
    const expected = ["a-valid-id"];
    const input = ["a-valid-id-with-pseudo:hover", "a-valid-id"];
    const selectors = new Selectors();
    const actual = selectors.clean(input);
    expect(expected).toEqual(actual);
});

test("it strips out `#` and `.` from selectors", () => {
    const expected = ["a-valid-id", "a-valid-class"];
    const input = ["#a-valid-id", ".a-valid-class"];
    const selectors = new Selectors();
    const actual = selectors.clean(input);
    expect(expected).toEqual(actual);
});

test("it only gets ids and classes", () => {
    const expected = ["#a-valid-id {", ".a-valid-class {"];
    const selectors = new Selectors();
    expect(selectors.fromFile("test/fixtures/test.css")).toEqual(expected);
});

const provider = [
    {
        input: "a-valid-id",
        expected: [
            {
                selector: "a-valid-id",
                usages: 2,
                foundIn: [
                    "test/fixtures/test.html",
                    "test/fixtures/identical-to-test.html",
                ],
            },
        ],
    },
    {
        input: "a-valid-class",
        expected: [
            {
                selector: "a-valid-class",
                usages: 0,
                foundIn: [],
            },
        ],
    },

];

provider.forEach(provide => {
    test(`it reports findings for selector: ${provide.input}`, () => {
        const ripgrep = new RipGrep();
        const actual = ripgrep.findUsagesOfSelectors(
            "test/fixtures",
            [provide.input],
        );
        expect(actual).toEqual(provide.expected);
    });

});

// Need a test that makes sure css files aren't in the list of found matches
