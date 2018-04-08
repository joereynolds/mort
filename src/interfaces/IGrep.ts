interface IGrep {
    readonly executable: string;
    readonly ignoreCase: string;
    readonly filesToIgnore: string;

    run(cssFilePath: string): any[];
    call(selector: string, path: string): any;
}

export { IGrep };
