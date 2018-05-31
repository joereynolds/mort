const fs = require("fs");
const splitRetain = require("split-retain");

import { IGrep } from "./interfaces/IGrep";
import { Printer } from "./printer";
import { Selector} from "./selector";

class Selectors {

    public fromFile(file: string): Selector[] {
        const fileContents: string = fs.readFileSync(file, "utf8");
        const selectors = this.getFrom(fileContents.split(/(\r\n|\n)/g));
        return selectors;
    }

    /**
     * Returns the selectors from a given source.
     * It only gets ids and classes and child selectors
     * are returned as a separate item.
     */
    public getFrom(selectors: string[]): Selector[] {
        const allSelectors: Selector[] = [];

        // Use this to keep track of what we've added to avoid duplicates
        // going in
        const alreadyAddedSelectors: string[] = [];
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
        selectors.forEach((selector, index) => {
            const selectorr = new Selector(selector.trim());
            if (selectorr.isIdOrClass()) {
                const elements: string[] = splitRetain(selector, /(\.|#|>|\s+)/g, { leadingSeparator: true });
                elements.forEach(element => {
                    const splitSelector = new Selector(element.trim());
                    if (splitSelector.isIdOrClass()
                        && !splitSelector.hasPseudoSelector()
                        && !alreadyAddedSelectors.includes(element)

                    ) {
                        // @ts-ignore
                        splitSelector.setLineCount(this.getLineCountForSelector(selectors, index));
                        alreadyAddedSelectors.push(element);
                        allSelectors.push(splitSelector);
                    }
                });
            }
        });

        return allSelectors.sort((a, b) => {
            return b.rawName < a.rawName ? 1
                : b.rawName > a.rawName ? -1
                : 0;
        });
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
    public findUsages(grepProgram: IGrep, path: string, selectors: Selector[], printer: Printer | null = null) {
        const foundSelectors: any[] = [];

        selectors.forEach(selector => {
            const call = grepProgram.call(selector.cleanName, path);
            const listOfFiles: string[] = this.getFilesFromOutput(call.output[1]);

            let commandUsed = " ";

            if (call && call.args) {
                commandUsed = call.args.join(" ");
            }

            foundSelectors.push({
                selector,
                usages: listOfFiles.length,
                foundIn: listOfFiles.sort(),
                commandUsed,
            });

            if (printer !== null) {
                printer.printUsage({
                    selector,
                    usages: listOfFiles.length,
                    foundIn: listOfFiles.sort(),
                    commandUsed,
                });
            }
        });

        if (printer !== null) {
            printer.printDone();
        }

        return foundSelectors;
    }

    private getFilesFromOutput(output: string): string[] {
        const matches: string[] = [];
        output.split("\n").forEach(fileMatch => {
            matches.push(fileMatch.split(":")[0]);
        });

        return matches.filter(match => match !== "");
    }

    private getLineCountForSelector(selectors: string[], index: number) {
        // Get and set the line count: go from the index of the current selector
        // in the array until we see a }
        for (let i = index; i < selectors.length; i++) {
            if (selectors[i].includes("}")) {
                // We have two divide by 2 because for some reason
                // The file is twice the line count of the original
                // file, TODO - Fix this.
                const lineCount = Math.floor((i - index) / 2) + 1;
                return lineCount;
            }
        }

    }
}

export { Selectors };
