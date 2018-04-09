"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const selectors_1 = require("../selectors");
class RipGrep {
    constructor() {
        this.executable = "rg";
        this.ignoreCase = "-i";
        this.filesToIgnore = "--iglob=!*.{css,scss}";
    }
    run(cssFilePath, searchOnly = ".") {
        const selectors = new selectors_1.Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return selectors.findUsages(this, searchOnly, cleanSelectors);
    }
    call(selector, path) {
        const call = child_process.spawnSync(this.executable, [
            this.ignoreCase,
            this.filesToIgnore,
            selector,
            path,
        ], {
            stdio: "pipe",
            encoding: "utf-8",
        });
        return call;
    }
}
exports.RipGrep = RipGrep;
//# sourceMappingURL=ripgrep.js.map