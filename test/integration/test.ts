const shelltest = require("shelltest");

test("it warns us if no file has been passed", done => {
    shelltest()
        .cmd("./dist/src/main.js")
    .expect("stdout", "Please supply a css file\n")
    .end(done);
});
