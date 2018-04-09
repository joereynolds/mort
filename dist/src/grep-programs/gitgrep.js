"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selectors_1 = require("../selectors");
class GitGrep {
    constructor() {
        this.executable = "git grep";
        this.ignoreCase = "-i";
        this.filesToIgnore = "'.' ':!*.css' ':!.*scss";
    }
    run(cssFilePath, searchOnly = ".") {
        const selectors = new selectors_1.Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return selectors.findUsages(this, searchOnly, cleanSelectors);
    }
    call(selector, path) {
        return;
    }
}
exports.GitGrep = GitGrep;
//# sourceMappingURL=gitgrep.js.map