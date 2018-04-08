interface IGrep {
    readonly executable: string;
    readonly ignoreCase: string;
    readonly filesToIgnore: string;

    run(cssFilePath: string): any[];
}

export { IGrep };
