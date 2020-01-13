// src/core.ts

// ------------------------------- lines_findFirst ----------------------------
// return linn and coln of first occurance of findText in string array of lines.
export function lines_findFirst(lines: string[], findText: string, options?: { start?: number })
  : { linn: number, coln: number }
{
  let linn = -1, coln = -1;

  // start find linn.
  let startLinn = 0;
  if (options)
  {
    startLinn = options.start || 0;
  }

  for (let ix = startLinn; ix < lines.length; ++ix)
  {
    const line = lines[ix];
    const fx = line.indexOf(findText);
    if (fx >= 0)
    {
      linn = ix;
      coln = fx;
      break;
    }
  }

  return { linn, coln };
}

// ------------------------- object_toQueryString ---------------------------------
export function object_toQueryString( obj:{} )
{
  // redefine the input obj argument. Redefine as object where all the property 
  // names are strings. And the property values are of type any.
  interface StringAnyMap { [key: string]: any; }
  const mapObj = obj as StringAnyMap ;

  const qs = Object.keys(mapObj)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(mapObj[key]))
    .join('&');
  
  return qs;
}

// ----------------------------------- path_removeQueryString ---------------------
// find and remove the query string portion of the path 
export function path_removeQueryString(str: string): string
{
  const fx = str.indexOf('?');
  if (fx >= 0)
  {
    return str.substr(0, fx);
  }
  else
    return str;
}

// ------------------------------ path_toFileUri ----------------------------------
// convert file path to string ready to be parsed by 
export function path_toFileUri(path: string): string 
{
  // replace '\' with '/'
  let toPath = '';
  for (let ix = 0; ix < path.length; ++ix)
  {
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

// ------------------------------------- rxp --------------------------------------
// rxp - const object that contains regex match patterns.
export const rxp = {
  any: '\\.',       // match any char
  zeroMoreWhitespace: `\\s*`,
  singleQuoteQuoted: `\\s*'(?:\\\\.|[^'\\\\])*'`,
  doubleQuoteQuoted: `\\s*"(?:\\\\.|[^"\\\\])*"`,
  jsonNameVluSep: `\\s*:`,
  beginString: `^\\s*`,
  jsonStart: `\\s*{`,
  jsonEnd: `\\s*}`,
  jsonStartArray: `\\s*\\[`,
  jsonStartObject: `\\s*\\{`,
  comma: `\\s*,`,
  or: '|',
  beginCapture: '(',
  closeParen: '\\)',
  endCapture: ')',
  endCaptureZeroOne: ')?',
  endCaptureZeroMore: ')*',
  endCaptureOneMore: ')+',
  oneMoreNumeric: '[\\d.]+',
  oneMoreDigits: '\\d+',
  oneMoreAlpha: '[A-Za-z]+',
  oneMoreName: '[A-Za-z_]+',
  oneMoreWord: '\\w+',
  oneMoreWhitespace: '\\s+',
  openParen: '\\(',
  stringStart: '^',
  stringEnd: '$',
  variableName: `[a-zA-Z_]\\w*`,
  zeroOneAny: '\\.?',
  zeroMoreWord: '\\w*',

  oneMoreAnyBut: (anyChars: string) =>
  {
    return '[^' + anyChars + ']+';
  },

  jsonVluStart: function ()
  {
    return this.zeroMoreWhitespace + this.beginCapture + this.singleQuoteQuoted +
      this.or + this.variableName + this.or + this.jsonStartArray +
      this.or + this.jsonStartObject + this.endCapture
  },
  jsonPropName: function ()
  {
    return this.zeroMoreWhitespace + this.beginCapture + this.singleQuoteQuoted +
      this.or + this.variableName + this.endCapture
  },
  jsonNameVluPair: function ()
  {
    return this.zeroMoreWhitespace + this.beginCapture + this.singleQuoteQuoted +
      this.or + this.variableName + this.endCapture +
      this.jsonNameVluSep +
      this.beginCapture + this.singleQuoteQuoted +
      this.or + this.variableName + this.endCapture
  },
  escape: (char: string) => { return '\\' + char }
}

// -------------------------------- string_contains -------------------------------
export function string_contains(str: string, pattern: string): boolean
{
  if (str.indexOf(pattern) >= 0)
    return true;
  else
    return false;
}

// ----------------------- string_dequote ------------------------
export function string_dequote(text: string): string
{
  let dequoteText = '';
  const quoteChar = text[0];
  let ix = 1;
  const lastIx = text.length - 2;
  while (ix <= lastIx)
  {
    if ((text[ix] == '\\') && (text[ix + 1] == quoteChar))
    {
      ix += 2;
      dequoteText += quoteChar;
    }
    else
    {
      dequoteText += text[ix];
      ix += 1;
    }
  }
  return dequoteText;
}

// ------------------------- string_rtrim --------------------
export function string_rtrim(str:string): string
{
  if (!str)
    return '';
  else
    return str.replace(/\s+$/, "");
}

// ----------------------string_tail ---------------------------------
// return num number of characters from end of string.
export function string_tail(str: string, num: number): string
{
  if (str.length <= num)
    return str;
  else
  {
    var bx = str.length - num;
    return str.substr(bx);
  }
}

// ------------------------ string_wordBx ---------------------------
// return bx of word in text that has a char located at position ix.
export function string_wordBx(text: string, word: string, ix: number)
  : number
{
  let bx = -1;
  const wordLx = word.length;
  while (ix >= 0)
  {
    const remLx = text.length - ix;
    if (remLx >= wordLx)
    {
      if (text.substr(ix, wordLx) == word)
      {
        bx = ix;
        break;
      }
    }
    ix -= 1;
  }

  return bx;
}
