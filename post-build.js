'use strict';

//#region Required Scripts
const { readdir } = require("fs").promises;
const { readFileSync, writeFileSync, mkdirSync, mkdir } = require("fs");
const escapeRegExp = require("./../MGKFrameworkJS/misc/escape-regexp.js");
//#endregion

//#region Methods
async function* getFiles(root, dir) {
    const dirents = await readdir(dir, { encoding: "utf-8", withFileTypes: true });
    for (const dirent of dirents) {
        const res = dir + "\\" + dirent.name;
        if (dirent.isDirectory() === true) {
            const obj = await getFiles(root, res);
            yield* {
                fullFile: obj.fullFile,
                path: obj.path,
                fileName: obj.fileName
            };
        } else {
            const regex = new RegExp(escapeRegExp(root), "g");
            yield {
                fullFile: res,
                path: dir.replace(regex, ""),
                fileName: dirent.name
            };
        }
    }
};
//#endregion

//#region Default Action upon require
(async () => {
    for await (const f of getFiles(__dirname + '\\content', __dirname + '\\content')) {
        try {
            const fileData = readFileSync(f.fullFile, { encoding: "utf-8" });
            mkdirSync(__dirname + "\\app\\MGKEdit\\content" + f.path, { recursive: true });
            writeFileSync(__dirname + '\\app\\MGKEdit\\content' + f.path + "\\" + f.fileName, fileData, { encoding: "utf-8" });
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }

    process.exit();
})();
//#endregion
