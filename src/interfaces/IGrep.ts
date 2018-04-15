interface IGrep {
    readonly executable: string;
    readonly ignoreCase: string;
    readonly filesToIgnore: string;

    run(cssFilePath: string, searchOnly: string): any[];
    call(selector: string, path: string): any;
}

export { IGrep };
