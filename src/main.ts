#!/usr/bin/env node

import { GitGrep } from "./grep-programs/gitgrep";
import { Grep } from "./grep-programs/grep";
import { RipGrep } from "./grep-programs/ripgrep";
import { IGrep } from "./interfaces/IGrep";
import { Printer } from "./printer";

const fs = require("fs");
const program = require("commander");
const commandExists = require("command-exists").sync;
const process = require("process");

const version = "1.5.0";

function increaseVerbosity(v: any, total: any) {
    return total + 1;
}

program
    .version(version)
    .option("-u, --usage-count <number>", "Show warnings for any css selector <= usage-count.", 0)
    .option("-v, --verbose", "Detailed information about the matches will be displayed.", increaseVerbosity, 0)
    .option("-f, --file <path>", "The css file to run mort against.")
    .option("-p, --program <program>", "Force mort to use a grep program of your choice. " +
                              "Supported ones are 'ripgrep', 'gitgrep', and 'grep'.")
    .parse(process.argv);

const printer = new Printer(program.verbose, program.usageCount, program.file);

let grepProgram = new RipGrep();

if (!commandExists("rg")) {
    printer.warnAboutNoRipgrep();
    grepProgram = new GitGrep();
}

if (!commandExists("rg") && !commandExists("git")) {
    printer.warnAboutNoRipgrepAndNoGitgrep();
    grepProgram = new Grep();
}

if (program.program === "gitgrep") {
    grepProgram = new GitGrep();
}

if (program.program === "grep") {
    grepProgram = new Grep();
}

if (!program.file) {
    program.file = 0; // If there's no file, pass stdin through instead
}

if (!fs.existsSync(program.file) && program.file !== 0) {
    printer.warnAboutFileNotFound(program.file);
    process.exit(0);
}

grepProgram.run(
    program.file,
    ".",
    printer,
);
