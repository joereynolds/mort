"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class Selectors {
    constructor() {
        this.id = "#";
        this.class = ".";
        this.pseudoSelectors = [
            ":checked",
            ":disabled",
            ":focus",
            ":hover",
            ":invalid",
            ":read-only",
            ":required",
            ":valid",
        ];
    }
    fromFile(file) {
        const fileContents = fs.readFileSync(file, "utf8");
        const selectors = this.getFrom(fileContents.split(/(\r\n|\n)/g));
        return selectors;
    }
    /**
     * Returns the selectors from a given source.
     * It only gets ids and classes and child selectors
     * are returned as a separate item.
     */
    getFrom(selectors) {
        const filtered = selectors.filter(selector => {
            return (selector.startsWith(this.id) || selector.startsWith(this.class));
        });
        const allSelectors = [];
        // Goes through every selector from a stylesheet and
        // makes sure that child selectors are also included
        // For example
        // "#a-valid-id .with-child"
        // Is broken down into
        // [
        //     "#a-valid-id",
        //     ".with-child"
        // ]
        //
        // We also only push an element once, no duplicates.
        filtered.forEach(selector => {
            const elements = selector.split(" ");
            elements.forEach(element => {
                if (element.startsWith(this.id) || element.startsWith(this.class)) {
                    if (!allSelectors.includes(element)) {
                        allSelectors.push(element);
                    }
                }
            });
        });
        return allSelectors.sort();
    }
    clean(selectors) {
        selectors = this.removeNoiseFromSelectors(selectors);
        selectors = this.removePseudoSelectors(selectors);
        return selectors.filter(selector => selector !== "");
    }
    /**
     * Brings back an array of objects in the following format:
     * [
     *     {
     *         selector: my-id-selector,
     *         usages: 3,
     *         foundIn: [
     *             views/content/customer.php
     *             views/content/dashboard.php
     *             views/content/shop.php
     *         ]
     *     }
     * ]
     */
    findUsages(grepProgram, path, selectors) {
        const foundSelectors = [];
        selectors.forEach(selector => {
            // TODO, move this call into each grepProgram
            const call = grepProgram.call(selector, path);
            const listOfFiles = this.getFilesFromOutput(call.output[1]);
            foundSelectors.push({
                selector,
                usages: listOfFiles.length,
                foundIn: listOfFiles.sort(),
            });
        });
        return foundSelectors;
    }
    selectorIsIdOrClass(selector) {
        return (selector.startsWith(this.id) || selector.startsWith(this.class));
    }
    removePseudoSelectors(selectors) {
        const selectorMatch = /(:hover|:valid|:invalid)/g;
        return selectors.filter(selector => !selector.match(selectorMatch));
    }
    removeNoiseFromSelectors(selectors) {
        const cleanSelectors = selectors.map(selector => {
            return selector.replace(/(#|\.|,|\s*\{)/g, "");
        });
        return cleanSelectors;
    }
    getFilesFromOutput(output) {
        const matches = [];
        output.split("\n").forEach(fileMatch => {
            matches.push(fileMatch.split(":")[0]);
        });
        return matches.filter(match => match !== "");
    }
}
exports.Selectors = Selectors;
//# sourceMappingURL=selectors.js.map