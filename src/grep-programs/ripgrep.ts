const child_process = require("child_process");
const fs = require("fs");
import { IGrep } from "../interfaces/IGrep";

class RipGrep implements IGrep {

    public readonly executable: string = "rg";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = "--iglob=!*.{css,scss}";

    public run(cssFilePath: string, searchOnly: string = "."): string[]  {
        const selectors = this.getSelectors(cssFilePath);
        const cleanSelectors = this.cleanCssSelectors(selectors);
        return this.findUsagesOfSelectors(searchOnly, cleanSelectors);
    }

    /**
     * Gets all ids and classes from cssFilePath
     *
     * @TODO move out of ripgrep
     */
    public getSelectors(cssFilePath: string): string[] {
        const fileContents: string = fs.readFileSync(cssFilePath, "utf8");

        const selectors = fileContents.split("\n").filter(selector => {
            return (selector.startsWith("#") || selector.startsWith("."));
        });

        return selectors;
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
                foundIn: listOfFiles,
            });
        });

        return foundSelectors;
    }

    /**
     * @TODO move out of ripgrep
     */
    public cleanCssSelectors(selectors: string[]): string[] {
        selectors = this.removeNoiseFromSelectors(selectors);
        selectors = this.removePseudoSelectors(selectors);
        return selectors.filter(selector => selector !== "");
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

    /**
     * @TODO move out of ripgrep
     */
    private removeNoiseFromSelectors(selectors: string[]): string[] {
        const cleanSelectors = selectors.map(selector => {
            return selector.replace(/(#|\.|\s*\{)/g, "");
        });

        return cleanSelectors;
    }

    /**
     * @TODO move out of ripgrep
     */
    private removePseudoSelectors(selectors: string[]): string[] {
        const selectorMatch = /(:hover|:valid|:invalid)/g;
        return selectors.filter(selector => !selector.match(selectorMatch));
    }
}

export { RipGrep };
