#!/usr/bin/env node

import { RipGrep } from "./grep-programs/ripgrep";
import { Printer } from "./printer";

const program = require("commander");

const ripgrep = new RipGrep();
const printer = new Printer();
const version = "0.1.0";

program
    .version(version)
    .option("-u, --usage-count", "Show warnings for any css selector <= usage-count.")
    .option("-v, --verbose", "Detailed information about the matches will be displayed.", 0)
    .parse(process.argv);

if (!program.args[0]) {
    console.log("Please supply a css file");
} else {
    const usages = ripgrep.run(
        program.args[0],
        program.args[1],
    );

    printer.printUsages(
        usages,
        0,
        program.verbose,
    );
}
