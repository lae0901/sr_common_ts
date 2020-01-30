import { rxp, regex_exec } from './regex_core';
export { rxp, regex_exec };
export declare function lines_findFirst(lines: string[], findText: string, options?: {
    start?: number;
}): {
    linn: number;
    coln: number;
};
export declare function object_indexerItems(obj: {
    [key: string]: any;
}): any[];
export declare function object_toQueryString(obj: {}): string;
export declare function path_removeQueryString(str: string): string;
export declare function path_toFileUri(path: string): string;
export declare function scan_charNeAll(text: string, bx: number, pattern: string): number;
export declare function scan_revCharEqAny(text: string, bx: number, anyChar: string): number;
export declare function scan_revCharNeAll(text: string, bx: number, pattern: string): number;
export declare function scan_revSepWord(text: string, pos: number, wsChars: string): {
    text: string;
    bx: number;
} | null;
export declare function string_contains(str: string, pattern: string): boolean;
export declare function string_dequote(text: string): string;
export declare function string_rtrim(str: string): string;
export declare function string_startsWith(text: string, startText: string): boolean;
export declare function string_tail(str: string, num: number): string;
export declare function string_wordBx(text: string, word: string, ix: number): number;
