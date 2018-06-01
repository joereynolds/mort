const chalk = require("chalk");

import { Selector} from "./selector";
class Printer {

    public verbose: number;
    public userDefinedUsageCount: number;
    public file: string;

    private readonly verboseMessage: string = "Running mort in verbose mode";

    constructor(verbose: number, userDefinedUsageCount: number, file: string) {
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
    public printUsage(selector: any) {

        const rawName = chalk.green(selector.selector.rawName);
        const lineNumber = selector.selector.lineNumber;
        let usagesMessage = `${selector.usages} usages found. ${rawName}:${lineNumber} can probably be removed.`;

        if (this.verbose >= 1) {
            const lineCount = chalk.yellow(`(${selector.selector.lineCount} lines)`);
            usagesMessage = `${selector.usages} usages found. ${rawName}:${lineNumber} ${lineCount} can probably be removed.`;
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

    public printDone() {
        console.log(`${chalk.bgGreen("Done!")}`);
    }

    public warnAboutFileNotFound(file: string) {
        this.warn(`Failed to open ${file}. Does it exist?`);
    }

    public warnAboutNoRipgrep() {
        this.warn("rg (ripgrep) not found, falling back to 'git grep'");
    }

    public warnAboutNoRipgrepAndNoGitgrep() {
        this.warn("rg (ripgrep) not found, git grep not found, falling back to 'grep'");
    }

    public warn(message: string) {
        console.log(chalk.red(message));
    }
}

export { Printer };
