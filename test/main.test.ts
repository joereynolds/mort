import { GitGrep } from "../src/grep-programs/gitgrep";
import { RipGrep } from "../src/grep-programs/ripgrep";
import { Selector } from "../src/selector";
import { Selectors } from "../src/selectors";
const child_process = require("child_process");

test("jest is running correctly", () => {
  expect(2).toBe(2);
});

test("our grep program returns an object of results", () => {
    const ripgrep = new RipGrep();
    expect(typeof ripgrep.run("test/fixtures/test.css")).toEqual("object");
});

// TODO Rewrite now that we're using selector class
// Fixture data may need updating
// test("it ignores pseudoselectors", () => {
//     const selectorOne = new Selector("a-valid-id-with-pseudo:hover");
//     const expectedSelector= new Selector("a-valid-id");
//     const selectors = new Selectors();
//     const grepProgram = new RipGrep();

//     const actual = selectors.findUsages(
//         grepProgram,
//         "test/fixtures",
//         [expectedSelector],
//     );
//     expect(actual).toEqual(1);
// });

test("it strips out `#` and `.` from selectors", () => {
    const expectedId = "a-valid-id";
    const expectedClass = "a-valid-class";

    const selectorId = new Selector("#a-valid-id");
    expect(selectorId.cleanName).toEqual(expectedId);

    const selectorClass = new Selector(".a-valid-class");
    expect(selectorClass.cleanName).toEqual(expectedClass);
});

test("it only gets ids and classes", () => {
    const expected = ["#a-valid-id", ".a-valid-class"];
    const selectors = new Selectors();
    const actual = selectors.fromFile("test/fixtures/test.css").map(selector => {
        return selector.rawName;
    });

    expect(actual.sort()).toEqual(expected);
});

test("It strips out attribute selectors", () => {
    const expectedId = "a-valid-id";
    const expectedClass = "a-valid-class";

    const selectorId = new Selector("#a-valid-id[type=button]");
    expect(selectorId.cleanName).toEqual(expectedId);

    const selectorClass = new Selector(".a-valid-class[something]");
    expect(selectorClass.cleanName).toEqual(expectedClass);
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
    const actual = selectors.getFrom(input).map(selector => {
        return selector.rawName;
    });
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
    const actual = selectors.getFrom(input).map(selector => {
        return selector.rawName;
    });
    expect(actual.sort()).toEqual(expected);
});

test("It reports findings for a used selector using ripgrep", () => {
    const grepProgram = new RipGrep();
    const selectors = new Selectors();
    const expectedSelector = new Selector("#a-valid-id");

    const expected = [{
        foundIn: [
           "test/fixtures/identical-to-test.html",
           "test/fixtures/test.html",
        ],
        selector: expectedSelector,
        usages: 2,
    }];

    const actual = selectors.findUsages(
        grepProgram,
        "test/fixtures",
        [expectedSelector],
    );

    // Remove commandUsed so it doesn't clog our test
    delete actual[0].commandUsed;
    expect(actual).toEqual(expected);
});

test("It reports findings for a selector using gitgrep", () => {
    const grepProgram = new GitGrep();
    const selectors = new Selectors();
    const expectedSelector = new Selector(".a-valid-class");

    const expected = [{
        // @ts-ignore
        foundIn: [],
        selector: expectedSelector,
        usages: 0,
    }];

    const actual = selectors.findUsages(
        grepProgram,
        "test/fixtures",
        [expectedSelector],
    );

    // Remove commandUsed so it doesn't clog our test
    delete actual[0].commandUsed;
    expect(actual).toEqual(expected);
});

test("It reports findings for a selector using ripgrep", () => {
    const grepProgram = new RipGrep();
    const selectors = new Selectors();
    const expectedSelector = new Selector(".a-valid-class");

    const expected = [{
        // @ts-ignore
        foundIn: [],
        selector: expectedSelector,
        usages: 0,
    }];

    const actual = selectors.findUsages(
        grepProgram,
        "test/fixtures",
        [expectedSelector],
    );

    // Remove commandUsed so it doesn't clog our test
    delete actual[0].commandUsed;
    expect(actual).toEqual(expected);
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

    const actual = selectors.fromFile("test/bug-fixes/windows-line-endings.css").map(selector => {
        return selector.rawName;
    });

    expect(actual.sort()).toEqual(expected);
});

// https://github.com/joereynolds/mort/issues/7
test("it strips punctuation from the selector", () => {
    const expectedId = "id-with-comma";
    const expectedClass = "class-with-comma";

    const selectorId = new Selector("#id-with-comma,");
    expect(selectorId.cleanName).toEqual(expectedId);

    const selectorClass = new Selector(".class-with-comma,");
    expect(selectorClass.cleanName).toEqual(expectedClass);
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

    // In the future change the expected instead of doing this
    // this is temporary so we can port over to using the selector class
    const actual = selectors.getFrom(input).map(selector => {
        return selector.rawName;
    });

    expect(actual.sort()).toEqual(expected);
});

test("it returns the shell command as a string", () => {
    const ripgrep = new RipGrep();
    const selectors = new Selectors();
    const selector = new Selector("#a-selector");
    const expected = "rg -i --iglob=!*.{css,scss} a-selector test/fixtures/no-usages.css";

    const result = selectors.findUsages(
        ripgrep,
        "test/fixtures/no-usages.css",
        [selector],
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
//
// TODO
// test("It strips out all {'s and the content between them", () => {
//     const actual = ".highlight { color: #009999; }";
//     const expected = "highlight";

//     const selector = new Selector(actual);
//     expect(selector.cleanName).toEqual(expected);
// });
