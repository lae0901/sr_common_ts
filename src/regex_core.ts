// src/regex_core.ts
// date: 2019-09-14
// desc: regex functions and constants. Used to enhance functionality of javascript
//       built in regex features.

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

interface regex_exec_rtnval_interface
{
  matchBx: number,
  matchLx: number,
  matchText: string,
  execRv?: RegExpExecArray | null,
  [key: string]: any;
}

interface map_capture_item_interface
{
  ix: number,
  name: string,
  trim?: boolean,
  fxName?: string
}

// -------------------------- regex_exec -----------------------------------
// match to a pattern, starting at bx in text string.
// re_pattern:  either a RegExp object or regular expression pattern.
// map_capture:  map captured matches. [{ix, name, trim:true, fxName }]
//               map from array of captured matches to properties in return value.
//               ix: index in capture array of value to map
//               name: property name to map to in the return object.
//               trim: when true, trim whitespace from capture value when mapping
//                     to map to property name in return object.
//               fxName: property name in return object in which to store the
//                       found position in the search text of the trimmed capture 
//                       value.
// const rv = regex_exec(stmt, bx, rxx_dataDefn, [{ ix: 1, name: 'const' },
// { ix: 2, name: 'datatype' }, { ix: 3, name: 'pointer' }]);
export function regex_exec(text: string, bx: number, re_pattern: RegExp | string,
  map_capture?: map_capture_item_interface[])
  : regex_exec_rtnval_interface
{
  let matchBx = -1;
  let matchLx = 0;
  let matchOx = -1;
  let matchText = '';
  let capture_ix = bx;

  // setup the regular expression to execute.
  let re = re_pattern;
  if (typeof (re) == 'string')
  {
    re = new RegExp(re_pattern, 'g');
  }

  // start position in text
  re.lastIndex = bx;

  const reg_rv = re.exec(text);

  if (reg_rv != null)
  {
    matchBx = reg_rv.index;
    matchOx = matchBx - bx;
    matchText = reg_rv[0];
    matchLx = matchText.length;
  }

  let rv: regex_exec_rtnval_interface = { matchBx, matchLx, matchOx, matchText, execRv: reg_rv };

  // map from capture array to properties in return value.
  if (map_capture && reg_rv)
  {
    for (let mx = 0; mx < map_capture.length; ++mx)
    {
      const item = map_capture[mx];
      if (item.ix < reg_rv.length)
      {
        let capture_text = reg_rv[item.ix];
        rv[item.name] = capture_text;

        // trim blanks from the capture variable.
        if (item.trim)
        {
          if (!capture_text)
            capture_text = '';
          else
            capture_text = capture_text.trim();
          rv[item.name] = capture_text;
        }

        // the found position of the capture value. Scan the input text for the
        // capture text. Store the found pos in the specified propert of the return
        // object.
        if (item.fxName)
        {
          const fx = text.indexOf(capture_text, capture_ix);
          rv[item.fxName] = fx;

          // next time look for capture text, start looking after the location of
          // this just found capture text.
          capture_ix = fx + capture_text.length;
        }
      }
    }
  }

  return rv;
}
