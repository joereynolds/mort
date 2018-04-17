import { GitGrep } from "../src/grep-programs/gitgrep";
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

test("It strips out attribute selectors", () => {
    const input = [
        "#a-valid-id[type=button]",
        ".a-valid-class[something]",
    ];

    const expected = ["a-valid-id", "a-valid-class"];

    const selectors = new Selectors();
    const actual = selectors.clean(input);
    expect(actual).toEqual(expected);
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
    test(`it reports findings for selector: ${provide.input} using ripgrep`, () => {
        const ripgrep = new RipGrep();
        const selectors = new Selectors();
        const actual = selectors.findUsages(
            ripgrep,
            "test/fixtures",
            [provide.input],
        );

        // Remove commandUsed so it doesn't clog our test
        delete actual[0].commandUsed;
        expect(actual).toEqual(provide.expected);
    });

});

provider.forEach(provide => {
    test(`it reports findings for selector: ${provide.input} using gitgrep`, () => {
        const gitgrep = new GitGrep();
        const selectors = new Selectors();
        const actual = selectors.findUsages(
            gitgrep,
            "test/fixtures",
            [provide.input],
        );

        // Remove commandUsed so it doesn't clog our test
        delete actual[0].commandUsed;
        expect(actual).toEqual(provide.expected);
    });

});

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

// https://github.com/joereynolds/mort/issues/7
test("it strips punctuation from the selector", () => {
    const input = ["#id-with-comma,", ".class-with-comma,"];
    const expected = ["id-with-comma", "class-with-comma"];
    const selectors = new Selectors();
    const actual = selectors.clean(input);

    expect(actual).toEqual(expected);
});

// https://github.com/joereynolds/mort/issues/8
test("it searches chained selectors separately", () => {
    const input = [
        ".a-class.chained-with-another",
        "#an-id-chained.with-a-class",
        ".a-class-chained#with-an-id",
        "#these-are#both-ids",
    ];

    const expected = [
        "#an-id-chained",
        "#both-ids",
        "#these-are",
        "#with-an-id",
        ".a-class",
        ".a-class-chained",
        ".chained-with-another",
        ".with-a-class",
    ];

    const selectors = new Selectors();
    const actual = selectors.getFrom(input);

    expect(actual).toEqual(expected);
});

test("it returns the shell command as a string", () => {
    const ripgrep = new RipGrep();
    const selectors = new Selectors();
    const expected = "rg -i --iglob=!*.{css,scss} #a-selector test/fixtures/no-usages.css";

    const result = selectors.findUsages(
        ripgrep,
        "test/fixtures/no-usages.css",
        ["#a-selector"],
    );

    const actual = result[0].commandUsed;
    expect(actual).toEqual(expected);
});

// TODO
// test("it finds selectors after HTML elements", () => {
    // const input = ["tr #an-id"];
    // const expected = ["#an-id"];
    // const selectors = new Selectors();
    // const actual = selectors.getFrom(input);

    // expect(actual).toEqual(expected);
// });

// TODO
// test("it displays the line number of the match in the output", () => {
// });
//

