import { IGrep } from "../interfaces/IGrep";
import { Selectors } from "../selectors";

class GitGrep implements IGrep {

    public readonly executable: string = "git grep";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = "'.' ':!*.css' ':!.*scss";

    public run(cssFilePath: string, searchOnly: string = "."): string[]  {
        const selectors = new Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return selectors.findUsages(this, searchOnly, cleanSelectors);
    }

    public call(selector: string, path: string) {
        return;
    }
}

export { GitGrep };
