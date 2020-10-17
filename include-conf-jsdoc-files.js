"use strict";

//#region Required
const { writeFileSync } = require("fs");
const getFiles = require("./../MGKFrameworkJS/misc/get-files-recursively.js");
var conf = require("./conf-jsdoc.json");
//#endregion

//#region Default Action upon require
(async () => {
    try {
        conf.source.include = [];
        var MGKEditFiles = await getFiles.recurse(__dirname + '\\app\\MGKEdit\\src', __dirname + '\\app\\MGKEdit\\src');
        var MGKFrameworkJSFiles = await getFiles.recurse(__dirname + '\\app\\MGKFrameworkJS\\src', __dirname + '\\app\\MGKFrameworkJS\\src');
        var files = [];

        for (const f of MGKEditFiles) {
            files.push(f);
        }

        for (const f of MGKFrameworkJSFiles) {
            files.push(f);
        }

        for (const f of files) {
            try {
                conf.source.include.push(f.fullFile);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        }

        try {
            writeFileSync(__dirname + "/conf-jsdoc.json", JSON.stringify(conf, null, 4), { encoding: "utf-8" });
        } catch (error) {
            console.error(error);
            process.exit(2);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(3);
    }
})();
//#endregion
