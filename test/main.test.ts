import { GitGrep } from "../src/grep-programs/gitgrep";
import { RipGrep } from "../src/grep-programs/ripgrep";
import { Selector } from "../src/selector";
import { Selectors } from "../src/selectors";

const child_process = require("child_process");
const fs = require("fs");

test("our grep program returns an object of results", () => {
    const ripgrep = new RipGrep();
    expect(typeof ripgrep.run("test/fixtures/test.css")).toEqual("object");
});

test("it only gets ids and classes", () => {
    const expected = ["#a-valid-id", ".a-valid-class"];
    const selectors = new Selectors();
    const actual = selectors.fromFile("test/fixtures/test.css").map(selector => {
        return selector.rawName;
    });

    expect(actual.sort()).toEqual(expected);
});

test("it strips whitespace when it gets a selector", () => {

    const selectors = new Selectors();

    const input = [
        "#not-indented",
        "   .tab-indented",
        " #some-spaces",
    ];

    const expected = [
        "#not-indented",
        "#some-spaces",
        ".tab-indented",
    ];

    const actual = selectors.getFrom(input).map(selector => {
        return selector.rawName;
    });

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
    const actual = selectors.getFrom(input).map(selector => {
        return selector.rawName;
    });
    expect(actual).toEqual(expected);
});

test("it gets all selectors for a rule that are ids or classes", () => {

    const input = [
        "#my-id-right-here .a-child #and-another-id",
        ".class tr #something",
    ];

    const expected = [
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

    const actual = selectors.fromFile("test/fixtures/windows-line-endings.css").map(selector => {
        return selector.rawName;
    });

    expect(actual.sort()).toEqual(expected);
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

// https://github.com/joereynolds/mort/issues/48
test("The length of selectors is returned is correct", () => {
    const selectors = new Selectors();
    const fileContents: string = fs.readFileSync("test/fixtures/test.css", "utf8");
    const actual = fileContents.split(selectors.fileSplitRegex).length;
    const expected = 11;
    expect(actual).toEqual(11);
});

test("it correctly splits on >", () => {
    const input = [
        ".btn-group>",
        ".multiselect-container>li",
        ".multiselect-container>li>a",
        ".multiselect-container>li>a>label",
    ];

    const expected = [
        ".btn-group",
        ".multiselect-container",
    ];

    const selectors = new Selectors();
    const actual = selectors.getFrom(input).map(selector => {
        return selector.rawName;
    });
    expect(actual.sort()).toEqual(expected);
});
