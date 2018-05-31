"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
class Printer {
    constructor(verbose, userDefinedUsageCount, file) {
        this.verboseMessage = "Running mort in verbose mode";
        this.verbose = verbose;
        this.userDefinedUsageCount = userDefinedUsageCount;
        this.file = file;
        if (this.verbose) {
            console.log(chalk.yellow(this.verboseMessage + ` [Verbosity: ${this.verbose}]`));
            console.log(chalk.yellow(`Scanning ${this.file} ...`));
        }
    }
    /**
     * Prints out the usages for each selector if they are <= userDefinedUsageCount
     * TODO selector below is actually a random object constructed in findUsages. Refactor
     * this to typehint that
     */
    printUsage(selector) {
        const rawName = chalk.green(selector.selector.rawName);
        let usagesMessage = `${selector.usages} usages found. ${rawName} can probably be removed.`;
        if (this.verbose >= 1) {
            const lineCount = chalk.yellow(`(${selector.selector.lineCount} lines)`);
            usagesMessage = `${selector.usages} usages found. ${rawName} ${lineCount} can probably be removed.`;
        }
        if (this.verbose === 3) {
            console.log(`Searching for ${chalk.green(selector.selector.rawName)}`);
        }
        if (selector.usages <= this.userDefinedUsageCount) {
            console.log(usagesMessage);
            if (this.verbose >= 2) {
                if (selector.foundIn.length <= this.userDefinedUsageCount) {
                    console.log(`Command used was: ${chalk.yellow(selector.commandUsed)}\n`);
                }
            }
        }
    }
    printDone() {
        console.log(`${chalk.bgGreen("Done!")}`);
    }
    warnAboutFileNotFound(file) {
        this.warn(`Failed to open ${file}. Does it exist?`);
    }
    warnAboutNoRipgrep() {
        this.warn("rg (ripgrep) not found, falling back to 'git grep'");
    }
    warnAboutNoRipgrepAndNoGitgrep() {
        this.warn("rg (ripgrep) not found, git grep not found, falling back to 'grep'");
    }
    warn(message) {
        console.log(chalk.red(message));
    }
}
exports.Printer = Printer;
//# sourceMappingURL=printer.js.map