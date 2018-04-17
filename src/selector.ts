
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

    public getRawName(): string {
        return this.rawName;
    }

    public isIdOrClass(selector: string): boolean {
        return (selector.startsWith(this.id) || selector.startsWith(this.class));
    }
}

export { Selector };
