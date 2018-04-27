interface IGrep {
    run(cssFilePath: string, searchOnly: string, printer: any): any[];
    call(selector: string, path: string): any;
}

export { IGrep };
