import { IGrep } from "../interfaces/IGrep";
import { Selectors } from "../selectors";

class RipGrep implements IGrep {

    public readonly executable: string = "rg";
    public readonly ignoreCase: string = "-i";
    public readonly filesToIgnore: string = "--iglob=!*.{css,scss}";

    public run(cssFilePath: string, searchOnly: string = "."): string[]  {
        const selectors = new Selectors();
        const cleanSelectors = selectors.clean(selectors.fromFile(cssFilePath));
        return selectors.findUsages(this, searchOnly, cleanSelectors);
    }
}

export { RipGrep };
