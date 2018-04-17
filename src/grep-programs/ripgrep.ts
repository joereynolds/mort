const child_process = require("child_process");
import { IGrep } from "../interfaces/IGrep";
import { Selector } from "../selector";
import { Selectors } from "../selectors";

class RipGrep implements IGrep {

    public readonly executable: string = "rg";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = "--iglob=!*.{css,scss}";

    public run(cssFilePath: string, searchOnly: string = "."): Selector[]  {
        const selectors = new Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return selectors.findUsages(this, searchOnly, cleanSelectors);
    }

    public call(selector: string, path: string) {
        const call = child_process.spawnSync(
            this.executable,
            [
                this.ignoreCase,
                this.filesToIgnore,
                selector,
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

export { RipGrep };
