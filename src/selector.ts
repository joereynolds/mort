
class Selector {

    public rawName: string;
    public cleanName: string;
    public prefix: string;

    constructor(rawName: string, cleanName: string, prefix: string) {
        this.rawName = rawName;
        this.cleanName = cleanName;
        this.prefix = prefix;
    }

    public getRawName(): string {
        return this.rawName;
    }

    /**
     * Returns the name of the selector without the # or .
     */
    public getCleanName(): string {
        return "not implemented";
    }

    private isId(): boolean {
        return true;
    }

    private isClass(): boolean {
        return true;
    }

}

export { Selector };
