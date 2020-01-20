export declare function lines_findFirst(lines: string[], findText: string, options?: {
    start?: number;
}): {
    linn: number;
    coln: number;
};
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
export declare const rxp: {
    any: string;
    zeroMoreWhitespace: string;
    singleQuoteQuoted: string;
    doubleQuoteQuoted: string;
    jsonNameVluSep: string;
    beginString: string;
    jsonStart: string;
    jsonEnd: string;
    jsonStartArray: string;
    jsonStartObject: string;
    comma: string;
    or: string;
    beginCapture: string;
    closeParen: string;
    endCapture: string;
    endCaptureZeroOne: string;
    endCaptureZeroMore: string;
    endCaptureOneMore: string;
    oneMoreNumeric: string;
    oneMoreDigits: string;
    oneMoreAlpha: string;
    oneMoreName: string;
    oneMoreWord: string;
    oneMoreWhitespace: string;
    openParen: string;
    stringStart: string;
    stringEnd: string;
    variableName: string;
    zeroOneAny: string;
    zeroMoreWord: string;
    oneMoreAnyBut: (anyChars: string) => string;
    jsonVluStart: () => string;
    jsonPropName: () => string;
    jsonNameVluPair: () => string;
    escape: (char: string) => string;
};
interface regex_exec_rtnval_interface {
    matchBx: number;
    matchLx: number;
    matchText: string;
    execRv?: RegExpExecArray | null;
    [key: string]: any;
}
interface map_capture_item_interface {
    ix: number;
    name: string;
    trim?: boolean;
    fxName?: string;
}
export declare function regex_exec(text: string, bx: number, re_pattern: RegExp, map_capture: map_capture_item_interface[]): regex_exec_rtnval_interface;
export {};
