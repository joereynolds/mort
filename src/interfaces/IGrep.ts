import { Printer } from "../printer";

interface IGrep {
    run(cssFilePath: string, searchOnly: string, printer: Printer | null): any[];
    call(selector: string, path: string): any;
}

export { IGrep };
