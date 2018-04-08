const fs = require("fs");

class Selectors {

    public fromFile(file: string): string[] {
        const fileContents: string = fs.readFileSync(file, "utf8");

        const selectors = fileContents.split("\n").filter(selector => {
            return (selector.startsWith("#") || selector.startsWith("."));
        });

        return selectors;
    }

    public clean(selectors: string[]): string[] {
        selectors = this.removeNoiseFromSelectors(selectors);
        selectors = this.removePseudoSelectors(selectors);
        return selectors.filter(selector => selector !== "");
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
}

export { Selectors };
