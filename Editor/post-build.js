'use strict';

//#region Required Scripts
const { readFileSync, writeFileSync, mkdirSync } = require("fs");
const getFiles = require("./../Framework/misc/get-files-recursively.js");
//#endregion

//#region Default Action upon require
(async () => {
    var files = await getFiles.recurse(__dirname + '\\content', __dirname + '\\content');

    for (const f of files) {
        try {
            const fileData = readFileSync(f.fullFile, { encoding: "utf-8" });
            mkdirSync(__dirname + "\\app\\Editor\\content" + f.path, { recursive: true });
            writeFileSync(__dirname + '\\app\\Editor\\content' + f.path + "\\" + f.fileName, fileData, { encoding: "utf-8" });
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }

    process.exit();
})();
//#endregion
