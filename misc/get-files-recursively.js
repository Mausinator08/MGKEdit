"use strict";

//#region Required Scripts
const { readdir } = require("fs").promises;
const escapeRegExp = require("./escape-regexp.js");
//#endregion

//#region Methods
async function getFiles(root, dir) {
    return new Promise(async (resolve, reject) => {
        try {
            var files = [];
            const dirents = await readdir(dir, { encoding: "utf-8", withFileTypes: true });
            for (const dirent of dirents) {
                const res = dir + "\\" + dirent.name;
                if (dirent.isDirectory() === true) {
                    const obj = await getFiles(root, res);
                    for (var o of obj) {
                        files.push({
                            fullFile: o.fullFile,
                            path: o.path,
                            fileName: o.fileName
                        });
                    }
                } else {
                    const regex = new RegExp(escapeRegExp(root), "g");
                    files.push({
                        fullFile: res,
                        path: dir.replace(regex, ""),
                        fileName: dirent.name
                    });
                }
            }

            resolve(files);
        } catch (error) {
            reject(error);
        }
    });
};
//#endregion

//#region Exports
module.exports = {
    recurse: async function (root, dir) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await getFiles(root, dir));
            } catch (error) {
                reject(error);
            }
        });
    }
};
//#endregion