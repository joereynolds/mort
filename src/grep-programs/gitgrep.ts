const child_process = require("child_process");
const fs = require("fs");
import { IGrep } from "../interfaces/IGrep";

class GitGrep implements IGrep {

    public readonly executable: string = "git grep";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = ":!.css :!.scss";

    public run(cssFilePath: string, searchOnly: string = "."): string[]  {
        return;

    }
}

export { GitGrep };
