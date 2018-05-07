const shelltest = require("shelltest");
const mort = "./dist/src/main.js";
test("it warns us if no file has been passed", done => {
    shelltest()
        .cmd(mort)
        .expect("stdout", "Please supply a css file\n")
        .end(done);
});
test("it displays the filename if verbose is 1 or higher", done => {
    shelltest()
        .cmd(`${mort} -v -f ./test/fixtures/no-usages.css`)
        .expect("stdout", /test\/fixtures\/no-usages\.css/)
        .end(done);
});
//# sourceMappingURL=test.js.map