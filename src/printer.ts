const chalk = require("chalk");

import { Selector} from "./selector";
class Printer {

    public verbose: boolean;
    public userDefinedUsageCount: number;

    private readonly verboseMessage: string = "Running mort in verbose mode";

    constructor(verbose: boolean, userDefinedUsageCount: number) {
        this.verbose = verbose;
        this.userDefinedUsageCount = userDefinedUsageCount;

        if (this.verbose) {
            console.log(chalk.yellow(this.verboseMessage));
        }
    }
    /**
     * Prints out the usages for each selector if they are <= userDefinedUsageCount
     * TODO selector below is actually a random object constructed in findUsages. Refactor
     * this to typehint that
     */
    public printUsage(selector: any) {

        if (selector.usages <= this.userDefinedUsageCount) {
            console.log(
            `${selector.usages} usages found. ${chalk.green(selector.selector.rawName)} can probably be removed.`,
            );

            if (this.verbose) {
                if (!selector.foundIn.length) {
                    console.log(`Command used was: ${chalk.yellow(selector.commandUsed)}\n`);
                }
            }
        }
    }
}

export { Printer };
