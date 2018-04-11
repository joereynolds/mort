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
        const selectors = this.getFrom(fileContents.split(/(\r\n|\n)/g));

        return selectors;
    }

    /**
     * Returns the selectors from a given source.
     * It only gets ids and classes and child selectors
     * are returned as a separate item.
     */
    public getFrom(selectors: string[]): string[] {
        const filtered: string[] = selectors.filter(selector => {
            return (selector.startsWith(this.id) || selector.startsWith(this.class));
        });

        const allSelectors: string[] = [];
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

    private selectorIsIdOrClass(selector: string): boolean {
        return (selector.startsWith(this.id) || selector.startsWith(this.class));
    }

    private removePseudoSelectors(selectors: string[]): string[] {
        const selectorMatch = /(:hover|:valid|:invalid|:active|:focus|::before|::after|:first-child|:not)/g;
        return selectors.filter(selector => !selector.match(selectorMatch));
    }

    private removeNoiseFromSelectors(selectors: string[]): string[] {
        const cleanSelectors = selectors.map(selector => {
            return selector.replace(/(#|\.|,|\s*\{|\[(\S*)\])/g, "");
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
