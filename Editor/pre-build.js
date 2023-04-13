'use strict';

const tsconfig = require("./tsconfig.json");
const fs = require("fs");

if (!tsconfig) {
    console.error("Could not find tsconfig.json in \"" + __dirname + "\\\"! Terminating...");
    process.exit(1);
}

if (!tsconfig.compilerOptions) {
    console.error("Could not find compilerOptions in tsconfig.json in \"" + __dirname + "\\\"! Terminating...");
    process.exit(2);
}

if (tsconfig.compilerOptions.sourceRoot === undefined) {
    console.error("Could not find compilerOptions.sourceRoot in tsconfig.json in \"" + __dirname + "\\\"! Terminating...");
    process.exit(3);
}

try {
    tsconfig.compilerOptions.sourceRoot = __dirname + "\\..\\";

    fs.writeFileSync(__dirname + "\\tsconfig.json", JSON.stringify(tsconfig, null, 2), { encoding: "utf-8" });
    process.exit();
} catch (error) {
    console.error(error);
    process.exit(4);
}
