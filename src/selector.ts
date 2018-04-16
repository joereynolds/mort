
class Selector {

    public rawName: string;

    private readonly id: string = "#";
    private readonly class: string = ".";

    constructor(rawName: string) {
        this.rawName = rawName;
    }

    public getRawName(): string {
        return this.rawName;
    }

    public isIdOrClass(selector: string): boolean {
        return (selector.startsWith(this.id) || selector.startsWith(this.class));
    }
}

export { Selector };
