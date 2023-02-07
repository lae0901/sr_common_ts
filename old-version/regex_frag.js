
// -------------------------- compositeFrag_build ----------------------------
// this fragment is itself composed of fragments. Build the text, display name 
// and display style of the composite fragment from its components.
function compositeFrag_build(fragArray)
{
  let composite_name = '';
  let composite_style = '';
  let composite_text = '';
  fragArray.forEach((item) =>
  {
    if (item.special != 'caret')
    {
      composite_text += item.text;
      if (!composite_name)
      {
        if (item.compositeNameMask)
          composite_name = item.compositeNameMask.replace('{{}}', item.varvlu);
        else
          composite_name = item.compositeName || item.name;
        composite_style = item.compositeStyle || item.style;
      }
      else if (!item.isEndCapture)
        composite_name += ' ' + item.name;
    }
  });
  return { name: composite_name, style: composite_style, text: composite_text };
}

// ------------------------------- frag_apply_text ----------------------------
// apply the varvlu to the textMask and nameMask of this regex pattern fragment.
function frag_apply_text(frag, text)
{
  if (!frag.varvlu)
  {
    frag.text = text;
    frag.lx = frag.text.length;
  }
}

// ------------------------------- frag_apply_varvlu ----------------------------
// apply the varvlu to the textMask and nameMask of this regex pattern fragment.
function frag_apply_varvlu(frag, varvlu)
{
  frag.varvlu = varvlu;
  const unescaped_varvlu = string_unescape(varvlu);
  frag.text = frag.textMask.replace('{{}}', frag.varvlu);
  if (frag.nameMask)
    frag.name = frag.nameMask.replace('{{}}', unescaped_varvlu);
  else
    frag.name = frag.text;
  frag.lx = frag.text.length;
}

// ----------------------------- regexPattern_toFragments -------------------------
// parse the input regex pattern into individual regex instructions.
// return these regex instructions as an array of regex pattern visual fragments. 
// regex fragment item: {text, name, lx }
function regexPattern_toFragments(pattern)
{

  // ----------------------------- frag_advanceLazy --------------------
  // process the ? that can follow a quantifier. This makes the quantifier lazy.
  // Lazy, meaning, other "or" matches take precedence. 
  const frag_advanceLazy = function (frag, pattern)
  {
    let lazy = false;
    const ch1 = pattern.substr(frag.bx + frag.lx, 1);
    if (ch1 == '?')
      lazy = true;

    if (lazy)
    {
      frag.name = `${frag.name} lazy`;
      frag.lx += 1;
      frag.text = pattern.substr(frag.bx, frag.lx);
      frag.lazy = lazy;
    }
  };

  // ----------------------------- frag_advanceQuantifier --------------------
  const frag_advanceQuantifier = function (frag, pattern)
  {
    // look for quantifier after the escape command.
    let quantifier = '';
    const ch1 = pattern.substr(frag.bx + frag.lx, 1);
    if (ch1 == '?')
      quantifier = 'zeroOrOne';
    else if (ch1 == '*')
      quantifier = 'zeroOrMore';
    else if (ch1 == '+')
      quantifier = 'oneOrMore';

    // apply quantifier to regex fragment.
    if (quantifier)
    {
      frag.name = `${frag.name} ${quantifier}`;
      frag.lx += 1;
      frag.text = pattern.substr(frag.bx, frag.lx);
      frag.quantifier = quantifier;
    }
  };

  // quantifier: true.  a quantifier can follow this command.
  // style: info warning success ...  How to style fragment when display visually.
  // compositeSyle: style used when this fragment is start of composite fragment.
  // name: fragment name. Name is displayed when display fragments in visual form.
  // compositeName: name used when this and fragments that follow are combined into
  //                composite fragment.
  // isBeginCapture:  this instruction is a begin capture instruction.
  // isEndCapture:  this instruction is an end capture instruction.
  // isComposite:   this fragment is itself composed of fragments.
  // compositeFragArray: array of fragments that make up composite fragment.
  //                     Capture fragment is a composite fragment.
  const charCommandList = [
    { text: '^', name: 'start of string' },
    { text: '$', name: 'end of string' },
    { text: '.', name: 'any character', quantifier: true },

    {
      text: '(', name: 'begin capture', compositeName: 'capture',
      style: 'info', isBeginCapture: true
    },
    { text: '(?:', name: 'begin non capture', style: 'info', isBeginCapture: true },
    { text: '(?=', name: 'begin positive lookahead capture', style: 'info', isBeginCapture: true },

    {
      text: '(?<', name: 'beginNamedCapture', compositeNameMask: 'NamedCapture {{}}',
      textMask: '(?<{{}}>', nameMask: 'beginNamedCapture {{}}',
      tail: '>', varvlu: '', style: 'info', isBeginCapture: true
    },

    {
      text: '[', name: 'any character',
      textMask: '[{{}}]', nameMask: 'any character {{}}',
      tail: ']', varvlu: '', style: 'info'
    },

    {
      text: '[^', name: 'any character not',
      textMask: '[^{{}}]', nameMask: 'any character not {{}}',
      tail: ']', varvlu: '', style: 'info'
    },

    { text: ')', name: 'end capture', quantifier: true, style: 'info', isEndCapture: true },
    { text: '|', name: 'or' },
    { text: '\\s', name: 'whitespace', quantifier: true },
    { text: '\\S', name: 'not whitespace', quantifier: true },
    { text: '\\b', name: 'begin/end word', quantifier: true },
    { text: '\\B', name: 'not begin/end word', quantifier: true },
    { text: '\\w', name: 'word char', quantifier: true },
    { text: '\\d', name: 'digit char', quantifier: true },
    { text: '\\D', name: 'not digit char', quantifier: true },
    { text: '\\.', name: 'any char not newline', quantifier: true },

    { text: '\\w*', name: 'zeroMoreWord' },
    { text: rxp.variableName, name: 'varName' },
    { text: rxp.oneMoreNumeric, name: 'oneMoreNumeric' },
    { text: rxp.oneMoreDigits, name: 'oneMoreDigits' },
    { text: rxp.oneMoreAlpha, name: 'oneMoreAlpha' },
    { text: rxp.oneMoreWord, name: 'oneMoreWord' },

    { text: '\\+', name: '+ char', quantifier: true },
    { text: '\\*', name: '* char', quantifier: true },
    { text: '\\?', name: '? char', quantifier: true },
    { text: '\\/', name: '/ char', quantifier: true },
    { text: rxp.comment, name: 'comment', style: 'warning' },
    { text: rxp.singleQuoteQuoted, name: 'single quote quoted', style: 'warning', highlevel: true },
    { text: rxp.doubleQuoteQuoted, name: 'double quote quoted', style: 'warning', highlevel: true },
  ];

  // const quantifierCommandList = [
  //   { text: '+', name: 'one or more' },
  //   { text: '*', name: 'zero or more' },
  //   { text: '?', name: 'zero or one' },
  // ];

  let px = 0;
  const fragArray = [];
  let captureDepth = 0;

  // --------------------------------- charCommandList_find ----------------------
  // search list of regex instructions. Examine each item, looking for the best
  // match.  Where best match is a match of the longest regex instruction.
  const charCommandList_find = function (pattern, bx)
  {
    let found_item;
    for (let ix = 0; ix < charCommandList.length; ++ix)
    {
      const item = charCommandList[ix];

      const textLx = item.text.length;
      if ((!found_item) || (found_item.text.length < textLx))
      {
        const patternText = str_substrLenient(pattern, bx, textLx);
        if (patternText == item.text)
        {
          if ((item.highlevel) && (pattern == item.text))
          {
          }
          else
          {
            found_item = item;
          }
        }
      }
    }

    return found_item;
  };

  // --------------------------------- main ----------------------------------

  // regex pattern is enclosed in forward slash. It is a regex literal. Remove the
  // enclosing slash and replace any escaped fwd slash with unescaped fwd slash.
  if (string_isQuoted(pattern, '/'))
  {
    const bx = 1;
    const lx = pattern.length - 2;
    pattern = str_substrLenient(pattern, bx, lx);
    pattern = pattern.replace(/\\\//g, '/');
  }

  while (px < pattern.length)
  {
    let ch1 = pattern.substr(px, 1);
    const ch2 = pattern.substr(px, 2);
    const ch3 = pattern.substr(px, 3);
    let frag = null;

    // look for character command.  ^$.()|
    if (frag == null)
    {
      const found_item = charCommandList_find(pattern, px);
      if (found_item)
      {
        const { text } = found_item;
        frag = { ...found_item, bx: px, lx: text.length };

        // this fragment continues with some variable text and ends with fixed
        // tail text.
        if (frag.tail)
        {
          const bx = px + text.length;
          let fx;
          if (frag.tail.length > 1)
            fx = pattern.indexOf(frag.tail, bx);  // find the tail
          else
            fx = string_indexOfUnescapedChar(pattern, frag.tail, bx);

          if (fx >= 0)
          {
            const varvluLx = fx - bx;  // the variable value runs up to the tail.
            const varvlu = pattern.substr(bx, varvluLx);

            // apply the variable value to this fragment. The fragment contains
            // a textMask and nameMask. Build the text and name properties from
            // these two masks.
            frag_apply_varvlu(frag, varvlu);
          }
        }

        frag_advanceQuantifier(frag, pattern);
        frag_advanceLazy(frag, pattern);
      }
    }

    // process as plain text.
    if (frag == null) 
    {
      // the special regex characters:  \ ^ . $ | ? * + ( ) [ {
      // match for characters other than special regex characters.
      const match = pattern.substr(px).match(/([^\\\^\.\$\|\?\*\+\(\)\[\{]|\\\\)+/);
      if (match)
      {
        let matchText = match[0];

        // // replace double \\ with single \.
        // matchText = matchText.replace(/\\\\/g, '\\' ) ;

        frag = {
          text: '', name: '',
          textMask: '{{}}', nameMask: 'text: {{}}',
          varvlu: '',
          bx: px, lx: matchText.length, style: 'secondary'
        };

        // look ahead to the next character in the pattern. A quantifier applies to
        // the last character in the pattern. So if this is multiple plain text 
        // characters, split off the last character as the one the quantifier 
        // applies to.
        {
          const lx = matchText.length;
          const nx1 = str_substrLenient(pattern, px + lx, 1);
          if (regex_isQuantifier(nx1))
          {
            // split the regex text on its last character. Where a character is
            // either an actual character. Or it is an escaped character.
            const { part1, part2 } = regex_splitLastChar(matchText);
            if (part1.length > 0)
            {
              matchText = part1;
            }
          }
        }

        // apply the variable value to this fragment. The fragment contains
        // a textMask and nameMask. Build the text and name properties from
        // these two masks.
        frag_apply_varvlu(frag, matchText);

        frag_advanceQuantifier(frag, pattern);
        frag_advanceLazy(frag, pattern);
      }
    }

    // unknown character.
    if (frag == null)
    {
      frag = { text: ch1, name: `unknown ${ch1}`, bx: px, lx: 1 };
      frag_advanceQuantifier(frag, pattern);
    }

    // update and store captureDepth.
    if (frag.isBeginCapture)
      captureDepth += 1;
    frag.captureDepth = captureDepth;
    if (frag.isEndCapture)
      captureDepth -= 1;

    // store fragment in fragment list.
    fragArray.push(frag);
    px += frag.lx;

    // endCapture fragment. Check and process that the fragments from begin
    // capture to endCapture can be combined into single capture fragment.
    if (frag.isEndCapture)
    {
      const end_ix = fragArray.length - 1;
      const { begin_ix, begin_frag } =
        fragments_findCaptureBegin(fragArray, end_ix);
      if (begin_frag)
        fragments_combineCaptureFragments(fragArray, begin_ix, end_ix);
    }
  }

  return fragArray;
}

// ----------------------------- fragments_applyLocation --------------------------
// apply left, top, bottom location to each regex fragment.
// regex visual frag item: {text, name, style, frag_num, left, top, bottom, rownum}
function fragments_applyLocation(fragment_array, container_div)
{
  const child_elems = [...container_div.children];
  for (let ix = 0; ix < child_elems.length; ++ix)
  {
    const child = child_elems[ix];

    // this is a visual fragment DOM element.
    if (child.id.substr(0, 8) == 'patfrag_')
    {
      const child_rect = child.getBoundingClientRect();

      const frag_num = Number(child.id.substr(8));
      const found_frag = fragment_array.find((item) =>
      {
        return item.frag_num == frag_num;
      });

      found_frag.left = Math.round(child_rect.left);
      found_frag.top = Math.round(child_rect.top);
      found_frag.bottom = Math.round(child_rect.bottom);
    }
  }
}

// ------------------------------------ fragments_assignRowNum --------------------
// regex visual fragment item: {text, name, style, frag_num, top, bottom, rownum}
function fragments_assignRowNum(fragment_array)
{
  // create rownum array from array of regex visual fragments. Each fragment
  // contains a top and bottom property. Each row consists of fragments with the
  // same top value.
  const rownum_array = fragments_toRowNumArray(fragment_array);

  // using rownum_array, update each fragment_array item with the corr rownum from
  // the rownum_array.  Use the top pos of each fragment item as key to the rownum
  // array.
  fragment_array.forEach((fragItem) =>
  {
    const foundItem = rownum_array.find((rowItem) =>
    {
      return (rowItem.top == fragItem.top);
    });
    fragItem.rownum = foundItem.rownum;
  });
}

// ------------------------------- fragments_findRownum ---------------------------
// search regex fragments array. Looking for item where vertPos is within the range
// of top and bottom location of the fragment. When found, return the rownum of
// that fragment.
function fragments_findRownum(fragment_array, vertPos)
{
  const found = fragment_array.find((item) =>
  {
    return ((vertPos >= item.top) && (vertPos <= item.bottom));
  });
  if (found == null)
    return -1;
  else
    return found.rownum;
}

// -------------------------- fragments_toRowNumArray -----------------------------
// return an array of distinct row numbers. Where each row corresponds to a 
// distinct top position in the input array of regex fragments.
function fragments_toRowNumArray(fragment_array)
{
  // build an array of distinct top locations. Each row of visual fragments 
  // will have the same top location. From that distinct list, assign a
  // row number.
  const { rownum_array } = fragment_array.reduce((rio, item) =>
  {
    const top = item.top;
    const found_row = rio.rownum_array.find((it) =>
    {
      return it.top == top;
    });
    if (found_row == null)
      rio.rownum_array.push({ rownum: 0, top });
    return rio;
  }, { rownum_array: [] });

  // sort rownum array by top pos.
  rownum_array.sort((a, b) =>
  {
    if (a.top < b.top)
      return -1;
    else if (a.top == b.top)
      return 0;
    else
      return 1;
  });

  // assign a row number to each visual fragment. 
  let rownum = 0;
  rownum_array.forEach((item) =>
  {
    item.rownum = rownum;
    rownum += 1;
  });

  return rownum_array;
}

// --------------------------- fragments_combineCaptureFragments ------------------
function fragments_combineCaptureFragments(fragArray, begin_ix, end_ix)
{
  // only a single fragment between the begin and end fragment. combine into a 
  // single "caputure" fragment.
  if ((end_ix - begin_ix) == 2)
  {
    // remove the component fragments.
    const fragCx = end_ix - begin_ix + 1;
    const componentFragArray = fragArray.splice(begin_ix, fragCx);

    // build the name, text, style of the composite fragment.
    const { name: composite_name, text: composite_text, style: composite_style }
      = compositeFrag_build(componentFragArray);

    // create the composite fragment.                    
    const composite_frag = {
      name: composite_name, text: composite_text,
      style: composite_style,
      isComposite: true,
      compositeFragArray: componentFragArray
    };

    // add the composite_frag to end of fragArray.
    fragArray.push(composite_frag);
  }
}

// --------------------------- fragments_findCaptureBegin ------------------
// starting from isEndCapture fragment, look backwards in fragments array until the
// isBeginCapture fragment is found.
function fragments_findCaptureBegin(fragArray, end_ix)
{
  let begin_ix;
  let begin_frag;
  const end_frag = fragArray[end_ix];

  // find the begin fragment.
  for (let ix = end_ix; ix >= 0; --ix)
  {
    const frag = fragArray[ix];
    if (frag.isBeginCapture && (frag.captureDepth == end_frag.captureDepth))
    {
      begin_ix = ix;
      begin_frag = frag;
      break;
    }
  }

  return { begin_ix, begin_frag };
}

// ------------------------------ fragments_toRegexPattern ------------------------
function fragments_toRegexPattern(fragment_array)
{
  let pattern = '';
  fragment_array.forEach((item) =>
  {
    if (!item.special)
    {
      pattern += item.text;
    }
  });
  return pattern;
}

// site/js/regex_core.js
// date: 2019-09-14
// desc: regex functions and constants. Used to enhance functionality of javascript
//       built in regex features.

// rxp - const object that contains regex match patterns.
const rxp = {
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
  oneMoreWord: '\\w+',
  oneMoreWhitespace: '\\s+',
  openParen: '\\(',
  stringStart: '^',
  stringEnd: '$',
  variableName: `[a-zA-Z_]\\w*`,
  zeroOneAny: '\\.?',
  zeroMoreWord: '\\w*',
  zeroMoreWhitespace: '\\s*',

  jsonVluStart: function ()
  {
    return this.zeroMoreWhitespace + this.beginCapture + this.singleQuotedString +
      this.or + this.varName + this.or + this.jsonStartArray +
      this.or + this.jsonStartObject + this.endCapture
  },
  jsonPropName: function ()
  {
    return this.zeroMoreWhitespace + this.beginCapture + this.singleQuotedString +
      this.or + this.varName + this.endCapture
  },
  jsonNameVluPair: function ()
  {
    return this.zeroMoreWhitespace + this.beginCapture + this.singleQuotedString +
      this.or + this.varName + this.endCapture +
      this.jsonNameVluSep +
      this.beginCapture + this.singleQuotedString +
      this.or + this.varName + this.endCapture
  },
  beginNamedCapture: function (name)
  {
    return `(?<${name}>`;
  },
  escape: function (char) { return '\\' + char }
}

// ---------------------------- regex_isQuantifier ----------------------
function regex_isQuantifier(ch1)
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
function regex_splitLastChar(text)
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

// -------------------------- string_head ----------------------
// return the front of the string
function string_head(text, lx)
{
  if (!text)
    return '';
  if (lx > text.length)
    lx = text.length;
  if (lx <= 0)
    return '';
  else
    return text.substr(0, lx);
}

// ----------------------- string_indexOfUnescapedChar ------------------------
// find char in string that is not escaped ( preceded with escape char ) 
function string_indexOfUnescapedChar(text, findChar, bx)
{
  let ix = bx || 0;  // start of search.
  let foundIx = -1;  // find result. init to not found.
  while (ix < text.length)
  {
    const ch1 = text[ix];

    // current char escapes the next char. advance past next char. 
    if (ch1 == '\\')  
    {
      ix += 2;
    }

    // character being searched for. return its index.
    else if (ch1 == findChar)
    {
      foundIx = ix;
      break;
    }

    // advance index. continue search.
    else
    {
      ix += 1;
    }
  }
  return foundIx;
}

// ------------------------------- string_isQuoted --------------------------------
function string_isQuoted(text, quoteChar)
{
  let isQuoted = false;
  if (text.length >= 2)
  {
    const headChar = string_head(text, 1);

    // continue with test.  checking if is specified quote char.
    if (!quoteChar || (headChar == quoteChar))
    {
      if ((headChar == '"') || (headChar == "'") || (headChar == '`') ||
        (headChar == '/'))
      {
        const tailCh1 = string_tail(text, 1);
        const tailCh2 = string_tail(text, 2);
        if ((headChar == tailCh1) && (tailCh2.substr(0, 1) != '\\'))
          isQuoted = true;
      }
    }
  }
  return isQuoted;
}

// ----------------------string_tail ---------------------------------
function string_tail(text, lx)
{
  if (text.length <= lx)
    return text;
  else
  {
    var bx = text.length - lx;
    return text.substr(bx);
  }
}

// ------------------------- string_trim --------------------
function string_trim(str)
{
  if (typeof str == 'number')
    str = str.toString();
  if (!str)
    return str;
  else
  {
    let s1 = str.replace(/(\s+$)|(^\s+)/g, "");
    return s1;
  }
}

// ---------------------------- str_substrLenient --------------------
// return substring of the input string. only, clip the results if start or end
// pos are out of bounds of the string.
function str_substrLenient(str, fx, lx = -1)
{
  if ((typeof str) != 'string')
    return '';

  // move from from negative to zero. Reduce length by the adjusted amount.
  if (fx < 0)
  {
    var adj = 0 - fx;
    fx += adj;
    if (lx != -1)
    {
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

// ----------------------- string_unescape ------------------------
// remove all the backslash characters from the string. With the exception of when
// the backslash is followed by another backslash. In that case, remove only the
// first of the pair.
function string_unescape(text)
{
  let ix = 0;
  let result = '';
  while (ix < text.length)
  {
    const ch1 = text[ix];
    const nx1 = (ix + 1 >= text.length) ? '' : text[ix + 1];
    if ((ch1 == '\\') && (nx1 == '\\'))
    {
      result += ch1;
      ix += 2;
    }
    else if (ch1 == '\\')
    {
      ix += 2;
      result += nx1;
    }
    else
    {
      ix += 1;
      result += ch1;
    }
  }
  return result;
}


export { fragments_toRegexPattern, regexPattern_toFragments } ;
