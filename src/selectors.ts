const fs = require("fs");
import { IGrep } from "./interfaces/IGrep";

class Selectors {

    private readonly id: string = "#";
    private readonly class: string = ".";

    private readonly pseudoSelectors: string[] = [
        ":checked",
        ":disabled",
        ":focus",
        ":hover",
        ":invalid",
        ":read-only",
        ":required",
        ":valid",
    ];

    public fromFile(file: string): string[] {
        const fileContents: string = fs.readFileSync(file, "utf8");

        const selectors = fileContents.split("\n").filter(selector => {
            return (selector.startsWith(this.id) || selector.startsWith(this.class));
        });

        return selectors;
    }

    public clean(selectors: string[]): string[] {
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
    public findUsages(grepProgram: IGrep, path: string, selectors: string[]) {
        const foundSelectors: any[] = [];
        selectors.forEach(selector => {
            // TODO, move this call into each grepProgram
            const call = grepProgram.call(selector, path);
            const listOfFiles: string[] = this.getFilesFromOutput(call.output[1]);

            foundSelectors.push({
                selector,
                usages: listOfFiles.length,
                foundIn: listOfFiles.sort(),
            });
        });

        return foundSelectors;
    }

    private removePseudoSelectors(selectors: string[]): string[] {
        const selectorMatch = /(:hover|:valid|:invalid)/g;
        return selectors.filter(selector => !selector.match(selectorMatch));
    }

    private removeNoiseFromSelectors(selectors: string[]): string[] {
        const cleanSelectors = selectors.map(selector => {
            return selector.replace(/(#|\.|\s*\{)/g, "");
        });

        return cleanSelectors;
    }

    private getFilesFromOutput(output: string): string[] {
        const matches: string[] = [];
        output.split("\n").forEach(fileMatch => {
            matches.push(fileMatch.split(":")[0]);
        });

        return matches.filter(match => match !== "");
    }
}

export { Selectors };
