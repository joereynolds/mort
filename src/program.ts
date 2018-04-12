const { execSync } = require("child_process");

class Program {

    public isExecutable(program: string): boolean {
        return true;
    }

    private getLastExitCode(): number {
        return 127;

    }
}

export { Program };
