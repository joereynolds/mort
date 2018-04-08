const chalk = require("chalk");

class Printer {

    private readonly verboseMessage: string = "Verbose output is being displayed"

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
                    `${selector.usages} usages found, ${chalk.green(selector.selector)} can probably be removed.`,
                );
            }

            if (verboseOutput) {
                if (selector.foundIn.length) {
                    console.log(`  Found matches in: ${chalk.yellow(selector.foundIn.join(" & "))}.`);
                }
            }
        });
    }
}

export { Printer };
