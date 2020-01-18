"use strict";
// src/core.ts
Object.defineProperty(exports, "__esModule", { value: true });
const regex_core_1 = require("./regex_core");
exports.rxp = regex_core_1.rxp;
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
