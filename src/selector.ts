class Selector {

    public rawName: string;
    public cleanName: string;

    private readonly id: string = "#";
    private readonly class: string = ".";

    constructor(rawName: string) {
        this.rawName = rawName;
        this.cleanName = this.clean(rawName);
    }

    public clean(name: string): string {
        return name.replace(/(#|\.|,|\s*\{|\[(\S*)\])/g, "");
    }

    public hasPseudoSelector(): boolean {
        const pseudoSelectorMatch = /(:+.*)/g;
        return Boolean(this.rawName.match(pseudoSelectorMatch));
    }

    public isIdOrClass(): boolean {
        return (this.rawName.startsWith(this.id) || this.rawName.startsWith(this.class));
    }
}

export { Selector };
