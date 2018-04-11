const child_process = require("child_process");
import { IGrep } from "../interfaces/IGrep";
import { Selectors } from "../selectors";

class GitGrep implements IGrep {

    public readonly executable: string = "git";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = "'.' ':!*.css' ':!.*scss";

    public run(cssFilePath: string, searchOnly: string = "."): string[]  {
        const selectors = new Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return selectors.findUsages(this, searchOnly, cleanSelectors);
    }

    public call(selector: string, path: string) {

        const call = child_process.spawnSync(
            this.executable,
            [
                "grep", //subcommand
                this.ignoreCase,
                selector,
                this.filesToIgnore,
                path,
            ],
            {
                stdio: "pipe",
                encoding: "utf-8",
            },
        );

        return call;
    }
}

export { GitGrep };
