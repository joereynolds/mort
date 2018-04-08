const child_process = require("child_process");
import { IGrep } from "../interfaces/IGrep";
import { Selectors } from "../selectors";

class RipGrep implements IGrep {

    public readonly executable: string = "rg";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = "--iglob=!*.{css,scss}";

    public run(cssFilePath: string, searchOnly: string = "."): string[]  {
        const selectors = new Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return this.findUsagesOfSelectors(searchOnly, cleanSelectors);
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
    public findUsagesOfSelectors(path: string, selectors: string[]) {
        const foundSelectors: any[] = [];
        selectors.forEach(selector => {
            const call = child_process.spawnSync(
                this.executable,
                [
                    this.ignoreCase,
                    this.filesToIgnore,
                    selector,
                    path,
                    // "--debug"
                ],
                {
                    stdio: "pipe",
                    encoding: "utf-8",
                },
            );

            const listOfFiles: string[] = this.getFilesFromOutput(call.output[1]);

            foundSelectors.push({
                selector,
                usages: listOfFiles.length,
                foundIn: listOfFiles.sort(),
            });
        });

        return foundSelectors;
    }

    /**
     * @TODO move out of ripgrep
     */
    private getFilesFromOutput(output: string): string[] {
        const matches: string[] = [];
        output.split("\n").forEach(fileMatch => {
            matches.push(fileMatch.split(":")[0]);
        });

        return matches.filter(match => match !== "");
    }
}

export { RipGrep };
