const chalk = require("chalk");

import { Selector} from "./selector";
class Printer {

    private readonly verboseMessage: string = "Running mort in verbose mode";

    /**
     * Prints out the usages for each selector if they are <= userDefinedUsageCount
     */
    public printUsages(
        selectors: any[],
        userDefinedUsageCount: number,
        verboseOutput: boolean,
    ) {
        if (verboseOutput) {
            console.log(chalk.yellow(this.verboseMessage));
        }

        selectors.forEach(selector => {
            if (selector.usages <= userDefinedUsageCount) {
                console.log(
                `${selector.usages} usages found. ${chalk.green(selector.selector.rawName)} can probably be removed.`,
                );
            }

            if (verboseOutput) {
                if (!selector.foundIn.length) {
                    console.log(`Command used was: ${chalk.yellow(selector.commandUsed)}\n`);
                }
            }
        });
    }
}

export { Printer };
