"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
class Printer {
    constructor() {
        this.verboseMessage = "Running mort in verbose mode";
    }
    /**
     * Prints out the usages for each selector if they are <= userDefinedUsageCount
     */
    printUsages(selectors, userDefinedUsageCount, verboseOutput) {
        if (verboseOutput) {
            console.log(chalk.yellow(this.verboseMessage));
        }
        selectors.forEach(selector => {
            if (selector.usages <= userDefinedUsageCount) {
                console.log(`${selector.usages} usages found. ${chalk.green(selector.selector)} can probably be removed.`);
            }
            if (verboseOutput) {
                if (selector.foundIn.length) {
                    console.log(`  Found matches in: ${chalk.yellow(selector.foundIn.join(" & "))}.`);
                }
            }
        });
    }
}
exports.Printer = Printer;
//# sourceMappingURL=printer.js.map