"use strict";
// src/core.ts
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const regex_core_1 = require("./regex_core");
exports.rxp = regex_core_1.rxp;
exports.regex_exec = regex_core_1.regex_exec;
// ------------------------------ dir_findFirstText -----------------------------
async function dir_findFirstText(dirPath, findText) {
    const promise = new Promise((resolve, reject) => {
        fs.readdir(dirPath, async (err, items) => {
            let foundFilePath = '';
            let foundLinn = 0;
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const { isDir } = await file_isDir(itemPath);
                if (isDir) {
                    const rv = await dir_findFirstText(itemPath, findText);
                    // a file was found in the sub folder.
                    if (rv.foundFilePath) {
                        foundFilePath = rv.foundFilePath;
                        foundLinn = rv.foundLinn;
                        break;
                    }
                }
                else {
                    const rv = await file_findFirstText(itemPath, findText);
                    if (rv.foundLinn >= 0) {
                        foundFilePath = itemPath;
                        foundLinn = rv.foundLinn;
                        break;
                    }
                }
            }
            resolve({ foundFilePath, foundLinn });
        });
    });
    return promise;
}
exports.dir_findFirstText = dir_findFirstText;
// ------------------------------- dir_ensureExists -----------------------------
function dir_ensureExists(dirPath) {
    const promise = new Promise(async (resolve, reject) => {
        let created = false;
        let errmsg = '';
        const { isDir } = await file_isDir(dirPath);
        if (isDir) {
        }
        else {
            const { errmsg: errmsg2, exists } = await dir_mkdir(dirPath);
            errmsg = errmsg2;
            if (!errmsg && !exists)
                created = true;
        }
        resolve({ created, errmsg });
    });
    return promise;
}
exports.dir_ensureExists = dir_ensureExists;
// ----------------------------------- dir_mkdir ------------------------------
// create directory. return { exists, errmsg }
function dir_mkdir(dirPath) {
    const promise = new Promise(async (resolve, reject) => {
        let errmsg = '', exists = false;
        fs.mkdir(dirPath, (err) => {
            if (err) {
                if (err.code == 'EEXIST')
                    exists = true;
                else
                    errmsg = err.message;
            }
            resolve({ exists, errmsg });
        });
    });
    return promise;
}
exports.dir_mkdir = dir_mkdir;
// --------------------------- dir_readdir ----------------------
// return results of fs.readdir as a promise.
function dir_readdir(dirPath) {
    const promise = new Promise(async (resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (files) {
                resolve(files);
            }
            else {
                reject(err);
            }
        });
    });
    return promise;
}
exports.dir_readdir = dir_readdir;
// ---------------------------- file_create -----------------------------
async function file_create(path) {
    const promise = new Promise((resolve, reject) => {
        let errmsg = '';
        fs.open(path, 'w', function (err, fd) {
            if (err) {
                errmsg = err.message;
                resolve(errmsg);
            }
            fs.close(fd, () => {
                resolve(errmsg);
            });
        });
    });
    return promise;
}
exports.file_create = file_create;
// -------------------------- file_exists ------------------------------
async function file_exists(path) {
    const promise = new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err == null) {
                return true;
            }
            else {
                return false;
            }
        });
    });
    return promise;
}
exports.file_exists = file_exists;
// ------------------------------- file_findFirstText ----------------------------
// find first instance of text in file.
function file_findFirstText(filePath, findText) {
    const promise = new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            const lower_data = data.toLowerCase();
            const lower_findText = findText.toLowerCase();
            if (err)
                reject('file_findText ' + filePath + ' ' + err);
            else {
                let foundLinn = -1;
                let foundPos = -1;
                const fx = lower_data.indexOf(lower_findText);
                if (fx >= 0) {
                    const lines = lower_data.split('\n');
                    for (let linn = 0; linn < lines.length; ++linn) {
                        const line = lines[linn];
                        const pos = line.indexOf(lower_findText);
                        if (pos >= 0) {
                            foundLinn = linn;
                            foundPos = pos;
                            break;
                        }
                    }
                }
                resolve({ foundLinn, foundPos });
            }
        });
    });
    return promise;
}
exports.file_findFirstText = file_findFirstText;
// ------------------------ file_isDir ----------------------------
// return promise of fileSystem stat info of a file.
async function file_isDir(path) {
    const promise = new Promise((resolve, reject) => {
        let isDir = false;
        let errmsg = '';
        fs.stat(path, (err, stats) => {
            if (err) {
                errmsg = err.message;
            }
            else {
                isDir = stats.isDirectory();
            }
            resolve({ isDir, errmsg });
        });
    });
    return promise;
}
exports.file_isDir = file_isDir;
// --------------------------- file_readLines ----------------------
// return results of fs.readFile as array of text lines.
function file_readLines(filePath) {
    const promise = new Promise(async (resolve, reject) => {
        let lines = [];
        let errmsg = '';
        fs.readFile(filePath, (err, data) => {
            if (data) {
                const text = data.toString('utf8');
                lines = text.split('\n');
            }
            else if (err) {
                errmsg = err.message;
            }
            resolve({ lines, errmsg });
        });
    });
    return promise;
}
exports.file_readLines = file_readLines;
// ------------------------ file_stat ----------------------------
// return promise of fileSystem stat info of a file.
function file_stat(path) {
    const promise = new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            resolve(stats);
        });
    });
    return promise;
}
exports.file_stat = file_stat;
// ------------------------------ file_ensureExists ------------------------
async function file_ensureExists(path) {
    const exists = await file_exists(path);
    if (exists == false) {
        await file_create(path);
    }
}
exports.file_ensureExists = file_ensureExists;
// ----------------------------------- file_writeFile ------------------------------
// write text to a new file.
function file_writeFile(filePath, text = '') {
    const promise = new Promise(async (resolve, reject) => {
        let errmsg = '';
        fs.writeFile(filePath, text, (err) => {
            if (err)
                errmsg = err.message;
            resolve(errmsg);
        });
    });
    return promise;
}
exports.file_writeFile = file_writeFile;
// ---------------------------- file_writeNew -----------------------------
// replace contents of existing file. Or write text to new file.
async function file_writeNew(path, text) {
    const promise = new Promise((resolve, reject) => {
        let errmsg = '';
        fs.open(path, 'w', function (err, fd) {
            if (err) {
                errmsg = err.message;
                resolve(errmsg);
            }
            const buf = Buffer.alloc(text.length, text);
            // const buf = new Buffer(text) ;
            fs.write(fd, buf, 0, buf.length, null, (err) => {
                if (err)
                    reject('error writing file: ' + err);
                fs.close(fd, () => {
                    resolve(errmsg);
                });
            });
        });
    });
    return promise;
}
exports.file_writeNew = file_writeNew;
// ------------------------------- lines_findFirst ----------------------------
// return linn and coln of first occurance of findText in string array of lines.
function lines_findFirst(lines, findText, options) {
    let linn = -1, coln = -1;
    // start find linn.
    let startLinn = 0;
    if (options) {
        startLinn = options.start || 0;
    }
    for (let ix = startLinn; ix < lines.length; ++ix) {
        const line = lines[ix];
        const fx = line.indexOf(findText);
        if (fx >= 0) {
            linn = ix;
            coln = fx;
            break;
        }
    }
    return { linn, coln };
}
exports.lines_findFirst = lines_findFirst;
// --------------------------- object_indexerItems ------------------------
// return an array containing the indexer properties of the object.
function object_indexerItems(obj) {
    const indexer = [];
    let str = '';
    if (obj) {
        for (const key of Object.keys(obj)) {
            if (!isNaN(Number(key))) {
                const vlu = obj[key];
                indexer.push(vlu);
            }
        }
    }
    return indexer;
}
exports.object_indexerItems = object_indexerItems;
// ------------------------- object_toQueryString ---------------------------------
function object_toQueryString(obj) {
    const mapObj = obj;
    const qs = Object.keys(mapObj)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(mapObj[key]))
        .join('&');
    return qs;
}
exports.object_toQueryString = object_toQueryString;
// ----------------------------------- path_removeQueryString ---------------------
// find and remove the query string portion of the path 
function path_removeQueryString(str) {
    const fx = str.indexOf('?');
    if (fx >= 0) {
        return str.substr(0, fx);
    }
    else
        return str;
}
exports.path_removeQueryString = path_removeQueryString;
// ------------------------------ path_toFileUri ----------------------------------
// convert file path to string ready to be parsed by 
function path_toFileUri(path) {
    // replace '\' with '/'
    let toPath = '';
    for (let ix = 0; ix < path.length; ++ix) {
        const ch1 = path.substr(ix, 1);
        if (ch1 == '\\')
            toPath += '/';
        else
            toPath += ch1;
    }
    // append file:/// to front of path.
    const return_path = 'file:///' + toPath;
    return return_path;
}
exports.path_toFileUri = path_toFileUri;
// --------------------------- scan_charNeAll ------------------------------
// scan in string until char not equal any of pattern chars.
function scan_charNeAll(text, bx, pattern) {
    let ix = bx;
    while (ix < text.length) {
        const ch1 = text.substr(ix, 1);
        const fx = pattern.indexOf(ch1);
        if (fx == -1)
            break;
        ix += 1;
    }
    if (ix < text.length)
        return ix;
    else
        return -1;
}
exports.scan_charNeAll = scan_charNeAll;
// ----------------------------- scan_revCharEqAny --------------------------------
// scan backwards until character is equal any of chars in anyChar string.
function scan_revCharEqAny(text, bx, anyChar) {
    let ix = bx;
    while (ix >= 0) {
        const ch1 = text.substr(ix, 1);
        const fx = anyChar.indexOf(ch1);
        if (fx >= 0)
            break;
        ix -= 1;
    }
    if (ix >= 0)
        return ix;
    else
        return -1;
}
exports.scan_revCharEqAny = scan_revCharEqAny;
// ----------------------------- scan_revCharNeAll --------------------------------
// scan backwards until character is not equal all of chars in pattern string.
function scan_revCharNeAll(text, bx, pattern) {
    let ix = bx;
    while (ix >= 0) {
        const ch1 = text.substr(ix, 1);
        const fx = pattern.indexOf(ch1);
        if (fx == -1)
            break;
        ix -= 1;
    }
    if (ix >= 0)
        return ix;
    else
        return -1;
}
exports.scan_revCharNeAll = scan_revCharNeAll;
// --------------------------------- scan_revSepWord -----------------------
// scan reverse to next separator delimited word. First step backwards past 
// separator until last char of word. Then step back until separator found. That 
// is char immed befor start of word.
// This is simple word finder. Use scan_revWord and scan_word to find a word and
// its delim chars.
function scan_revSepWord(text, pos, wsChars) {
    let wordText = '';
    let bx = -1;
    const ex = scan_revCharNeAll(text, pos, wsChars);
    if (ex >= 0) {
        const fx = scan_revCharEqAny(text, ex, wsChars);
        if (fx == -1)
            bx = 0;
        else
            bx = fx + 1;
        // isolate the word.
        const lx = ex - bx + 1;
        wordText = text.substr(bx, lx);
    }
    return (wordText) ? { text: wordText, bx } : null;
}
exports.scan_revSepWord = scan_revSepWord;
// -------------------------------- string_contains -------------------------------
function string_contains(str, pattern) {
    if (str.indexOf(pattern) >= 0)
        return true;
    else
        return false;
}
exports.string_contains = string_contains;
// ----------------------- string_dequote ------------------------
function string_dequote(text) {
    let dequoteText = '';
    const quoteChar = text[0];
    let ix = 1;
    const lastIx = text.length - 2;
    while (ix <= lastIx) {
        if ((text[ix] == '\\') && (text[ix + 1] == quoteChar)) {
            ix += 2;
            dequoteText += quoteChar;
        }
        else {
            dequoteText += text[ix];
            ix += 1;
        }
    }
    return dequoteText;
}
exports.string_dequote = string_dequote;
// ------------------------- string_rtrim --------------------
function string_rtrim(str) {
    if (!str)
        return '';
    else
        return str.replace(/\s+$/, "");
}
exports.string_rtrim = string_rtrim;
// -------------------------------- string_startsWith -------------------------
// test that the starting text of text matches startText.
function string_startsWith(text, startText) {
    if (!startText)
        return false;
    const startLx = startText.length;
    if (startLx > text.length)
        return false;
    else if (text.substr(0, startLx) == startText)
        return true;
    else
        return false;
}
exports.string_startsWith = string_startsWith;
// ---------------------------- string_substrLenient --------------------
// return substring of the input string. only, clip the results if start or end
// pos are out of bounds of the string.
function string_substrLenient(str, fx, lx = -1) {
    if ((typeof str) != 'string')
        return '';
    // move from from negative to zero. Reduce length by the adjusted amount.
    if (fx < 0) {
        var adj = 0 - fx;
        fx += adj;
        if (lx != -1) {
            lx -= adj;
            if (lx < 0)
                lx = 0;
        }
    }
    if (fx >= str.length)
        return '';
    if (lx == -1)
        return str.substr(fx);
    // remaining length.
    var remLx = str.length - fx;
    // trim length if remaining lgth exceeded.
    if (lx > remLx)
        lx = remLx;
    return str.substr(fx, lx);
}
// ----------------------string_tail ---------------------------------
// return num number of characters from end of string.
function string_tail(str, num) {
    if (str.length <= num)
        return str;
    else {
        var bx = str.length - num;
        return str.substr(bx);
    }
}
exports.string_tail = string_tail;
// ------------------------ string_wordBx ---------------------------
// return bx of word in text that has a char located at position ix.
function string_wordBx(text, word, ix) {
    let bx = -1;
    const wordLx = word.length;
    while (ix >= 0) {
        const remLx = text.length - ix;
        if (remLx >= wordLx) {
            if (text.substr(ix, wordLx) == word) {
                bx = ix;
                break;
            }
        }
        ix -= 1;
    }
    return bx;
}
exports.string_wordBx = string_wordBx;
//# sourceMappingURL=core.js.map