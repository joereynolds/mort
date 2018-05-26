"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Selector {
    constructor(rawName) {
        this.id = "#";
        this.class = ".";
        this.rawName = rawName;
        this.cleanName = this.clean(rawName);
        this.lineCount = 0;
    }
    clean(name) {
        const re = new RegExp("("
            + "#" // Remove #'s
            + "|\\." // Remove .'s
            + "|," // Remove ,'s
            + "|\\s*\\{" // Remove all spaces and {'s
            + "|\\[(\\S*)\\]" + // remove [ and ] and everything inside []
            ")", "g");
        return name.replace(re, "");
    }
    hasPseudoSelector() {
        const pseudoSelectorMatch = /(:+.*)/g;
        return Boolean(this.rawName.match(pseudoSelectorMatch));
    }
    isIdOrClass() {
        return (this.rawName.startsWith(this.id) || this.rawName.startsWith(this.class));
    }
    /**
     * Set the highest count found for a selector
     */
    setLineCount(lineCount) {
        if (lineCount > this.lineCount) {
            this.lineCount = lineCount;
        }
    }
}
exports.Selector = Selector;
//# sourceMappingURL=selector.js.map