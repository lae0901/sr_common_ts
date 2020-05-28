// src/regex_core.ts
// date: 2019-09-14
// desc: regex functions and constants. Used to enhance functionality of javascript
//       built in regex features.

// ------------------------------------- rxp --------------------------------------
// rxp - const object that contains regex match patterns.
export const rxp = {
  any: '\\.',       // match any char
  zeroMoreWhitespace: `\\s*`,
  singleQuoteQuoted: `'(?:\\\\.|[^'\\\\])*'`,
  doubleQuoteQuoted: `"(?:\\\\.|[^"\\\\])*"`,
  forwardSlashEnclosed: `/(?:\\\\.|[^/\\\\])*/`,
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
  comment: '\\/\\*.+?\\*\\/|\\/\\/.*(?=[\\n\\r])',
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
  escape: (char: string) => { return '\\' + char },

  beginNamedCapture: function (name:string)
  {
    return `(?<${name}>`;
  },

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
  ix: number,      // index into regex return array of the capture item
  name: string,    // property name of the capture item.
  trim?: boolean,  // trim whitespace from text of capture item
  fxName?: string  // property name in which to store location of item
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

  // got a match. store the location of the match and the text that was matched.
  // matchOx is the offset from where the scan started ( bx ) to where the match
  // was found ( reg_rv.index ). When matchOx is zero that means there is nothing
  // between the start location and the match start position.
  if (reg_rv != null)
  {
    matchBx = reg_rv.index;
    matchOx = matchBx - bx;
    matchText = reg_rv[0];
    matchLx = matchText.length;
  }

  // store match info in the return value object.
  let rv: regex_exec_rtnval_interface = { matchBx, matchLx, matchOx, matchText, execRv: reg_rv };

  // capture match instruction have been specified.
  // The RegExp.exec method returned an array containing the text of what was 
  // matched. The map_capture array contains instructions to copy that matched text
  // into the rv object. Where each capture instruction item specifies the index
  // into the RegExp return array of the match text, and the property name in the
  // rv object where that match text is to be stored.
  if (map_capture && reg_rv)
  {
    for (let mx = 0; mx < map_capture.length; ++mx)
    {
      const item = map_capture[mx];
      if (item.ix < reg_rv.length)
      {
        // isolate matched text from regexp return array
        let capture_text = reg_rv[item.ix] || '' ;

        // trim blanks from the matched text..
        if (item.trim)
          capture_text = capture_text.trim();

        // store captured text in specified property name of rv object.
        rv[item.name] = capture_text;

        // the found position of the capture value. Scan the input text for the
        // capture text. Store the found pos in the specified property of the 
        // return object.
        if (item.fxName)
        {
          const fx = text.indexOf(capture_text, capture_ix);
          rv[item.fxName] = fx;

          // next time look for capture text, start looking after the location of
          // this just found capture text.
          if ( fx >= 0 )
            capture_ix = fx + capture_text.length;
        }
      }
    }
  }

  return rv;
}

// ---------------------------- regex_isQuantifier ----------------------
export function regex_isQuantifier(ch1 : string ) : boolean
{
  if ((ch1 == '+') || (ch1 == '*') || (ch1 == '?'))
    return true;
  else
    return false;
}

// ------------------------------ regex_splitLastChar ---------------------------
// split the last character of the end regex input text.
// Each character in the string is either a single char. Or is a 2 char escaped
// character.
export function regex_splitLastChar(text : string) : {part1:string, part2:string}
{
  let part1 = '';
  let part2 = '';

  let ix = 0;
  while (ix < text.length)
  {
    let ch1 = text.substr(ix, 1);
    if ((ch1 == '\\') && ((ix + 1) < text.length))
    {
      ch1 = text.substr(ix, 2);
    }

    // character is part of part1 or part2.
    const next_ix = ix + ch1.length;
    if (next_ix < text.length)
      part1 += ch1;
    else
      part2 += ch1;

    // advance ix to next character
    ix += ch1.length;
  }

  return { part1, part2 };
}
