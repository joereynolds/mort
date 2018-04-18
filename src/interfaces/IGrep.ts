interface IGrep {
    run(cssFilePath: string, searchOnly: string): any[];
    call(selector: string, path: string): any;
}

export { IGrep };
