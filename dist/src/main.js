#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ripgrep_1 = require("./grep-programs/ripgrep");
const printer_1 = require("./printer");
const program = require("commander");
const ripgrep = new ripgrep_1.RipGrep();
const printer = new printer_1.Printer();
const version = "0.1.0";
program
    .version(version)
    .option("-u, --usage-count", "Show warnings for any css selector <= usage-count.")
    .option("-v, --verbose", "Detailed information about the matches will be displayed.", 0)
    .parse(process.argv);
if (!program.args[0]) {
    console.log("Please supply a css file");
}
else {
    const usages = ripgrep.run(program.args[0], program.args[1]);
    printer.printUsages(usages, 0, program.verbose);
}
//# sourceMappingURL=main.js.map