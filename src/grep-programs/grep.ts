const child_process = require("child_process");
import { IGrep } from "../interfaces/IGrep";
import { Printer } from "../printer";
import { Selector } from "../selector";
import { Selectors } from "../selectors";

class Grep implements IGrep {

    public readonly executable: string = "grep";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = "--exclude=*.css";

    public run(cssFilePath: string, searchOnly: string = ".", printer: Printer | null = null): Selector[]  {
        const selectors = new Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return selectors.findUsages(this, searchOnly, cleanSelectors, printer);
    }

    public call(selector: string, path: string) {
        const call = child_process.spawnSync(
            this.executable,
            [
                "-r",
                this.ignoreCase,
                this.filesToIgnore,
                "--exclude=*.scss", // Again, couldn't get this working in the same string
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

export { Grep };
