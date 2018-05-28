const shelltest = require("shelltest");

const mort = "./dist/src/main.js";

test("it uses stdin if no file is passed", done => {
    // We need it to be random because otherwise mort ironically
    // finds the selector.
    const n = (Math.random() * 100000) + 100;
    shelltest()
        .cmd(`echo "#something-${n}" | ${mort}`)
        .expect("stdout", /0 usages found/)
        .end(done);
});

test("it displays the filename if verbose is 1 or higher", done => {
    shelltest()
        .cmd(`${mort} -v -f ./test/fixtures/no-usages.css`)
        .expect("stdout", /test\/fixtures\/no-usages\.css/)
        .end(done);
});

test("it displays line count if verbose is 1 or higher", done => {
    shelltest()
        .cmd(`${mort} -v -f ./test/fixtures/no-usages.css`)
        .expect("stdout", /\(.\slines\)/)
        .end(done);
});

test("it warns if it can't find a file", done => {
    shelltest()
        .cmd(`${mort} -f non-existent-file-here`)
        .expect("stdout", /Failed to open non-existent-file-here. Does it exist?/)
        .end(done);
});

test("it finds selectors with ripgrep", done => {
    shelltest()
        .cmd(`${mort} -vv -f ./test/fixtures/no-usages.css -p ripgrep`)
        .expect("stdout", /Command used was: rg -i/)
        .end(done);
});

test("it finds selectors with gitgrep", done => {
    shelltest()
        .cmd(`${mort} -vv -f ./test/fixtures/no-usages.css -p gitgrep`)
        .expect("stdout", /Command used was: git grep -i/)
        .end(done);
});
