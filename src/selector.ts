class Selector {

    public rawName: string;
    public cleanName: string;
    public lineCount: number;
    public lineNumber: number;

    private readonly id: string = "#";
    private readonly class: string = ".";

    constructor(rawName: string) {
        this.rawName = rawName;
        this.cleanName = this.clean(rawName);
        this.lineCount = 0;
        this.lineNumber = 0;
    }

    public clean(name: string): string {
        const re = new RegExp(
          "("
            + "#"                // Remove #'s
            + "|\\."             // Remove .'s
            + "|,"               // Remove ,'s
            + "|\\s*\\{"         // Remove all spaces and {'s
            + "|\\[(\\S*)\\]" +  // remove [ and ] and everything inside []
          ")",
          "g",
        );

        return name.replace(re, "");
    }

    public hasPseudoSelector(): boolean {
        const pseudoSelectorMatch = /(:+.*)/g;
        return Boolean(this.rawName.match(pseudoSelectorMatch));
    }

    public isIdOrClass(): boolean {
        return (this.isValidId(this.rawName) || this.rawName.startsWith(this.class));
    }

    public isValidId(id: string): boolean {
        const idRegex = new RegExp("^#[a-z|A-Z]+");
        return idRegex.test(id);
    }

    /**
     * Set the highest count found for a selector
     */
    public setLineCount(lineCount: number) {
        if (lineCount > this.lineCount) {
            this.lineCount = lineCount;
        }
    }

    public setLineNumber(lineNumber: number) {
        this.lineNumber = lineNumber;
    }
}

export { Selector };
