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
    expect(actual).toEqual(expected);
});

test("it strips out `#` and `.` from selectors", () => {
    const expected = ["a-valid-id", "a-valid-class"];
    const input = ["#a-valid-id", ".a-valid-class"];
    const selectors = new Selectors();
    const actual = selectors.clean(input);
    expect(actual).toEqual(expected);
});

test("it only gets ids and classes", () => {
    const expected = ["#a-valid-id", ".a-valid-class"];
    const selectors = new Selectors();
    expect(selectors.fromFile("test/fixtures/test.css")).toEqual(expected);
});

test("it does not return duplicate elements", () => {

    const input = [
        "#a-test",
        "#a-test",
        "#a-test",
        ".some-class",
    ];

    const expected = ["#a-test", ".some-class"];

    const selectors = new Selectors();
    const actual = selectors.getFrom(input);
    expect(actual).toEqual(expected);
});

test("it gets all selectors for a rule that are ids or classes", () => {

    const input = [
        "#my-id-right-here .a-child #and-another-id",
        // "table #an-id-inside-a-normal-element",
        ".class tr #something",
    ];

    const expected = [
        // "#an-id-inside-a-normal-element",
        "#and-another-id",
        "#my-id-right-here",
        "#something",
        ".a-child",
        ".class",
    ];

    const selectors = new Selectors();
    const actual = selectors.getFrom(input);
    expect(actual).toEqual(expected);
});

// Bug fix:
// https://github.com/joereynolds/mort/issues/7
test("it strips punctuation from the selector", () => {
    const input = ["#id-with-comma,", ".class-with-comma,"];
    const expected = ["id-with-comma", "class-with-comma"];
    const selectors = new Selectors();
    const actual = selectors.clean(input);

    expect(actual).toEqual(expected);
});

const provider = [
    {
        input: "a-valid-id",
        expected: [
            {
                selector: "a-valid-id",
                usages: 2,
                foundIn: [
                    "test/fixtures/identical-to-test.html",
                    "test/fixtures/test.html",
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
        const selectors = new Selectors();
        const actual = selectors.findUsages(
            ripgrep,
            "test/fixtures",
            [provide.input],
        );

        expect(actual).toEqual(provide.expected);
    });

});

// Bug fix:
// https://github.com/joereynolds/mort/issues/6
test("It can handle unix and windows line endings", () => {
    const expected = [
        ".active",
        ".article",
        ".article-tag",
        ".hljs{",
        ".menu",
        ".song",
        ".text",
    ];
    const selectors = new Selectors();
    expect(selectors.fromFile("test/bug-fixes/windows-line-endings.css")).toEqual(expected);
});

// Need a test that makes sure css files aren't in the list of found matches
