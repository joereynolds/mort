"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const selectors_1 = require("../selectors");
class GitGrep {
    run(cssFilePath, searchOnly = "", printer = null) {
        const selectors = new selectors_1.Selectors();
        const cleanSelectors = selectors.fromFile(cssFilePath);
        return selectors.findUsages(this, searchOnly, cleanSelectors, printer);
    }
    call(selector, path) {
        const call = child_process.spawnSync("git", [
            "grep",
            "-i",
            selector,
            ":!*.css",
            ":!*.scss",
            path,
        ], {
            stdio: "pipe",
            encoding: "utf-8",
        });
        return call;
    }
}
exports.GitGrep = GitGrep;
//# sourceMappingURL=gitgrep.js.map