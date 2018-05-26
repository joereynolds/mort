#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gitgrep_1 = require("./grep-programs/gitgrep");
const grep_1 = require("./grep-programs/grep");
const ripgrep_1 = require("./grep-programs/ripgrep");
const printer_1 = require("./printer");
const program_1 = require("./program");
const program = require("commander");
const commandExists = require("command-exists").sync;
const executable = new program_1.Program();
const version = "1.3.0";
function increaseVerbosity(v, total) {
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
const printer = new printer_1.Printer(program.verbose, program.usageCount, program.file);
let grepProgram = new ripgrep_1.RipGrep();
if (!commandExists("rg")) {
    printer.warnAboutNoRipgrep();
    grepProgram = new gitgrep_1.GitGrep();
}
if (!commandExists("rg") && !commandExists("git")) {
    printer.warnAboutNoRipgrepAndNoGitgrep();
    grepProgram = new grep_1.Grep();
}
if (program.program === "gitgrep") {
    grepProgram = new gitgrep_1.GitGrep();
}
if (program.program === "grep") {
    grepProgram = new grep_1.Grep();
}
if (!program.file) {
    program.file = 0; // If there's no file, pass stdin through instead
}
grepProgram.run(program.file, ".", printer);
//# sourceMappingURL=main.js.map