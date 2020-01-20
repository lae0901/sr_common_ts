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
export declare function regex_exec(text: string, bx: number, re_pattern: RegExp, map_capture?: map_capture_item_interface[]): regex_exec_rtnval_interface;
export {};
