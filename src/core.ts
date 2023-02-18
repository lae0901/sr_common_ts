// sr_core_ts/src/core.ts

import { rxp, regex_exec } from './regex_core' ;
import { regexPattern_toFragments } from './regex-frag' ;
import { iTestResultItem, testResults_append } from './test-result'

export {rxp, regex_exec, regexPattern_toFragments } ;
export { iTestResultItem, testResults_append };

// --------------------------------- any_toString ---------------------------------
// value to string. Objects have values of their properties printed. 
export function any_toString(val: any, skipProps?: string[])
{
  let text = '';
  if ( typeof val == 'undefined')
    text = 'undefined' ;
  else if ( val == null )
    text = 'null ;'
  else if (typeof (val) == 'string')
    text = val;
  else if (typeof (val) == 'number')
    text = val.toString();
  else if (Array.isArray(val))
  {
    text = '[';
    for (let ix = 0; ix < val.length; ++ix)
    {
      const item = val[ix];
      if (ix > 0)
        text += ', ';
      text += any_toString(item);
    }
    text += ']';
  }
  else if (typeof (val) == 'object')
  {
    text = '{';
    const keys = Object.keys(val);
    let keyProcessed = false;
    for (let ix = 0; ix < keys.length; ++ix)
    {
      const key = keys[ix];
      let skip = false;
      if (skipProps && skipProps.indexOf(key) != -1)
        skip = true;

      if (!skip)
      {
        if (keyProcessed)
        {
          text += ', ';
        }
        text += `${key}:${any_toString(val[key])}`;
        keyProcessed = true;
      }
    }
    text += '}';
  }
  else
  {
    text = val.toString();
  }
  return text;
}

// --------------------------------- arr_compareEqual -------------------------
export function arr_compareEqual<T>( arr1: T[], arr2: T[]) : boolean 
{
  let res = true ;
  let ix = 0 ;
  while(true)
  {
    if ((ix >= arr1.length) && (ix >= arr2.length))
    {
      res = true ;  // array items match.
      break ;
    }
    else if ( ix >= arr2.length )
    {
      res = false ;  // a > b. more items in arr1.
      break ;
    }
    else if ( ix >= arr1.length )
    {
      res = false ;
      break ;
    }
    else
    {
      const vlu1 = arr1[ix] ;
      const vlu2 = arr2[ix] ;

      if (Array.isArray(vlu1) && Array.isArray(vlu2))
      {
        res = arr_compareEqual(vlu1 as string[], vlu2 as string[]);
      }
      else if (typeof vlu1 == 'object' && typeof vlu2 == 'object')
      {
        res = obj_compareEqual(vlu1, vlu2);
      }
      else
      {
        res = (vlu1 === vlu2);
      }
      if ( !res )
        break ;
    }
    ix += 1 ;
  }
  return res ;
}

// -------------------------------- arr_copyItems --------------------------------
// return array containing items copied from input array.
export function arr_copyItems<T>(arr: T[], from: number, count: number): T[]
{
  const toItems: T[] = [];
  let ix = from;
  while ((ix < arr.length) && (count > 0))
  {
    const item = arr[ix];
    toItems.push(item);
    ix += 1;
    count -= 1;
  }
  return toItems;
}

// ------------------------------- arr_findAndSplice ----------------------------
// find index of item in array where func(item) == true. Then use splice to remove
// that found item.
// return true if item was found and removed.
export function arr_findAndSplice<T>(arr: T[],
  predicate: (value: T, index: number, obj: T[]) => unknown) : boolean
{
  const fx = arr.findIndex(predicate);
  if (fx != -1)
    arr.splice(fx, 1);

  return (fx != -1);
}

// ------------------------- arr_front -------------------------------------
// return either null or the first item in the array.
export function arr_front<T>(arr: T[]): T | null
{
  if (arr.length == 0)
    return null;
  else
  {
    return arr[0];
  }
}

// ---------------------------- date_currentISO -------------------------------
export function date_currentISO()
{
  let dt = new Date();
  return date_toISO(dt);
}

// --------------------------------- date_fromISO ------------------------------------
// build Date object from yy, mm, dd parts of ISO date.
// iso_time: time of day in hh:mm:ss form.
export function date_fromISO(iso:string, iso_time?:string)
{
  let dt;
  const yr = Number(iso.substring(0, 0 + 4));
  const mm = Number(iso.substring(5, 5 + 2)) - 1;
  const dd = Number(iso.substring(8, 8 + 2));

  if (iso_time)
  {
    const hr = Number(iso_time.substring(0, 0 + 2));
    const min = Number(iso_time.substring(3, 3 + 2));
    const sec = Number(iso_time.substring(6, 6 + 2));
    dt = new Date(yr, mm, dd, hr, min, sec);
  }
  else
  {
    dt = new Date(yr, mm, dd);
  }

  return dt;
}

// --------------------------------- date_toEpoch ---------------------------------
// convert Date to unix epoch, which is number of seconds since 1970. 
// use getTime function to get milliseconds since 1970. Then divide by 1000 to get
// number of seconds.
export function date_toEpoch( dt: Date ) : number
{
  const msecs = dt.getTime( ) ;
  return msecs / 1000 ;
}

// --------------------- date_toISO -----------------------------
// convert date to ISO format. yyyy-mm=dd
export function date_toISO( d: Date)
{
  function pad(n:number) { return n < 10 ? '0' + n : n.toString( ) }

  return d.getFullYear() + '-'
    + pad(d.getMonth() + 1) + '-'
    + pad(d.getDate());
}

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

// --------------------------------- obj_apply ---------------------------------
// apply properties from the from object to the to object.
// use obj_apply in place of the spread operator when you do not want to create 
// a new resulting object. 
// obj_apply( obj1, {name:'xxx', numOrders:3})
// is different from:
// const res = obj_apply( obj1, {name:'xxx', numOrders:3})
export function obj_apply(toObj: { [key: string]: any }, fromObj: { [key: string]: any }) :
    {[key:string]: any}
{
  for (const prop in fromObj)
  {
    toObj[prop] = fromObj[prop];
  }
  return toObj ;
}

// ------------------------------- obj_propertyMatch -------------------------------
/** compare that the properties of obj1 exist in obj2 and that the values of 
 * those properties are equal.
 */
export function obj_propertyMatch(
        obj1: {[key: string]: any} | null, 
        obj2: {[key: string]: any} | null ) : boolean
{
  let isEqual = true ;

  // obj1 is null.  Consider this is a match.  Same as obj1 being empty.
  if ( obj1 == null )
    return true ;

  const keys1 = Object.keys(obj1) ;
  const keys2 = obj2 ? Object.keys(obj2) : [] ;

  // match each property in obj1.
  for( const key of keys1 )
  {
    // property in obj1 not found in obj2.
    if ( keys2.indexOf(key) == -1 )
    {
      isEqual = false ;
      break ;
    }

    // isolate property value
    const vlu1 = obj1[key];
    const vlu2 = obj2 ? obj2[key] : '' ; // obj2 will actually never be null.

    if ( Array.isArray(vlu1) && Array.isArray(vlu2) )
    {
      isEqual = arr_compareEqual(vlu1, vlu2) ;
    }
    else if ( typeof vlu1 == 'object' && typeof vlu2 == 'object')
    {
      isEqual = obj_compareEqual(vlu1, vlu2) ;
    }
    else
    {
      isEqual = (vlu1 === vlu2) ;
    }

    // property is not equal. break out.
    if ( !isEqual )
      break ;
  }

  return isEqual ;
}

// ------------------------------ obj_compareEqual ------------------------------
/**
 * property by property, deep compare of two objects. Both objects must have
 * same number of properties, property names and values must match for compare 
 * equal to return true.
 * @param obj1 
 * @param obj2 
 * @returns 
 */
export function obj_compareEqual(
        obj1: {[key: string]: any} | null, 
        obj2: {[key: string]: any} | null ) : boolean
{
  let isEqual = true ;

  // first, compare based on the args being null.
  if ( obj1 == null )
  {
    return ( obj2 == null) ? true : false ;
  }
  else if ( obj2 == null )
  {
    return false ;
  }

  const keys1 = Object.keys(obj1) ;
  const keys2 = Object.keys(obj2) ;

  // the two objects do not have the same number of properties. not equal.
  if ( keys1.length != keys2.length )
    isEqual = false ;

  // compare each property in obj1 to corresponding property in obj2.
  if ( isEqual )
  {
    for( const key of keys1 )
    {
      const vlu1 = obj1[key] ;
      const vlu2 = obj2[key] ;

      if ( vlu2 == undefined )  // property in obj1, but not in obj2.
        isEqual = false ;
      else if ( Array.isArray(vlu1) && Array.isArray(vlu2) )
      {
        isEqual = arr_compareEqual(vlu1, vlu2) ;
      }
      else if ( typeof vlu1 == 'object' && typeof vlu2 == 'object')
      {
        isEqual = obj_compareEqual(vlu1, vlu2) ;
      }
      else
      {
        isEqual = (vlu1 === vlu2) ;
      }

      // property is not equal. break out.
      if ( !isEqual )
        break ;
    }
  }

  return isEqual ;
}

// --------------------------- obj_indexerItems ------------------------
// return an array containing the indexer properties of the object.
export function obj_indexerItems(obj: {[key: string]: any}): any[]
{
  const indexer: {}[] = [];
  let str = '';
  if (obj)
  {
    for (const key of Object.keys(obj))
    {
      if (!isNaN(Number(key)))
      {
        const vlu = obj[key];
        indexer.push(vlu);
      }
    }
  }

  return indexer;
}

// --------------------------------- obj_properties ----------------------------
/**
 * extract and return specified list of properties of object. If the input object 
 * does not contain the property, the property is still added to the return object,
 * but the value is undefined.
 * @param obj 
 * @param propNameArr 
 */
export function obj_properties( obj: {[key:string]:any } | undefined, propNameArr:string[] )
{
  const to_obj : {[key:string]:any} = {} ;
  for( const propName of propNameArr )
  {
    to_obj[propName] = obj ? obj[propName] : undefined ;
  }
  return to_obj ;
}

// ------------------------- obj_toQueryString ---------------------------------
export function obj_toQueryString( obj:{} )
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

// --------------------------- scan_charEqAny ------------------------------
// scan in string until char equal any of pattern chars.
export function scan_charEqAny(text: string, bx: number, pattern: string): 
              { found_index:number, found_char:string }
{
  let ix = bx;
  let found_char = '';
  let found_index = -1 ;
  while (ix < text.length)
  {
    const ch1 = text.substring(ix, ix + 1);
    const fx = pattern.indexOf(ch1);
    if (fx >= 0)
    {
      found_index = ix ;
      found_char = ch1 ;
      break ;
    }
    ix += 1;
  }
  return { found_index, found_char } ;
}

// --------------------------- scan_charNeAll ------------------------------
// scan in string until char not equal all of pattern chars.
export function scan_charNeAll(text: string, bx: number, pattern: string): number
{
  let ix = bx;
  while (ix < text.length)
  {
    const ch1 = text.substring(ix, ix + 1);
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

// ----------------------------- scan_revCharEqAny --------------------------------
// scan backwards until character is equal any of chars in anyChar string.
export function scan_revCharEqAny(text: string, bx: number, anyChar: string): number
{
  let ix = bx;
  while (ix >= 0)
  {
    const ch1 = text.substring(ix, ix + 1);
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

// ----------------------------- scan_revCharNeAll --------------------------------
// scan backwards until character is not equal all of chars in pattern string.
export function scan_revCharNeAll(text: string, bx: number, pattern: string): number
{
  let ix = bx;
  while (ix >= 0)
  {
    const ch1 = text.substring(ix, ix + 1);
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

// --------------------------------- scan_revSepWord -----------------------
// scan reverse to next separator delimited word. First step backwards past 
// separator until last char of word. Then step back until separator found. That 
// is char immed befor start of word.
// This is simple word finder. Use scan_revWord and scan_word to find a word and
// its delim chars.
export function scan_revSepWord(text: string, pos: number, wsChars: string):
  { text: string, bx: number } | null
{
  let wordText = '';
  let bx = -1;
  const ex = scan_revCharNeAll(text, pos, wsChars);
  if (ex >= 0)
  {
    const fx = scan_revCharEqAny(text, ex, wsChars);
    if (fx == -1)
      bx = 0;
    else
      bx = fx + 1;

    // isolate the word.
    const lx = ex - bx + 1;
    wordText = text.substring(bx, bx + lx);
  }

  return (wordText) ? { text: wordText, bx } : null;
}

// ----------------------------- scan_unquotedPattern -----------------------------
/**
 * scan text, looking for regex pattern that is outside of quoted text.
 * @param text - text to scan
 * @param bx - position in text to start the scan.
 * @param pattern - regex pattern to scan for.
 * @returns index and text of the found pattern.
 */
export function scan_unquotedPattern(text: string, bx: number, pattern: string)
{
  let findBx = -1 ;
  let foundText: string | undefined;

  // regex expression.  looking for quoted string or the scan for text.
  // repeat the match until the pattern is found.
  const fullPattern = '(' + pattern + ')' + '|(' + rxp.doubleQuoteQuoted +
    ')|(' + rxp.singleQuoteQuoted + ')';
  const regex = new RegExp( fullPattern, 'g');

  while (true)
  {
    regex.lastIndex = bx;
    const match = regex.exec(text);

    if (!match)
    {
      findBx = -1 ;
      break;
    }
    else if ( typeof match[1] != 'undefined')
    {
      foundText = match[1];
      findBx = match.index;
      break;
    }
    else
    {
      const doubleQuotedText = match[2] || '';
      const singleQuotedText = match[3] || '';
      bx = match.index + singleQuotedText.length + doubleQuotedText.length;
    }
  }

  return { index:findBx, text:foundText };
}

// ------------------------------ str_assignSubstr ------------------------------
// assign text to substring location within target string.  Returns new string that 
// contains the assigned value.
export function str_assignSubstr(str: string, 
          start: number, length: number, vlu: string): string
{
  let before_text = '';
  let after_text = '';

  // length runs to end of string.
  if (length == -1)
  {
    length = str.length - start;
  }

  // length of text before text to be assigned.
  const before_length = start;
  
  // length and start of text that follows what is assigned.
  const after_start = start + length;
  const after_length = str.length - after_start;

  // the text of the string before and after the assigned to location.
  if (before_length > 0)
    before_text = str.substring(0, 0 + before_length);
  if (after_length > 0)
    after_text = str.substring(after_start, after_start + after_length);

  const result = before_text + vlu + after_text;
  return result;
}

// -------------------------------- str_contains -------------------------------
export function str_contains(str: string, pattern: string): boolean
{
  if (str.indexOf(pattern) >= 0)
    return true;
  else
    return false;
}

// ----------------------- str_dequote ------------------------
// note: the quote char can be any character. The rule is the first char is the
//       quote char. Then the closing quote is that same first char. And the
//       backslash is used to escape the quote char within the string.
// Use str_isQuoted
export function str_dequote(text: string): string
{
  let dequoteText = '';
  const quoteChar = text[0];
  let ix = 1;
  const lastIx = text.length - 2;
  while (ix <= lastIx)
  {
    const ch1 = text[ix] ;
    const nx1 = ( ix == lastIx ) ? '' : text[ix+1] ;
    if (( ch1 == '\\') && ( nx1 == quoteChar))
    {
      ix += 2;
      dequoteText += quoteChar;
    }
    else if (( ch1 == '\\') && ( nx1 == '\\'))
    {
      ix += 2;
      dequoteText += ch1;
    }
    else
    {
      dequoteText += ch1;
      ix += 1;
    }
  }
  return dequoteText;
}

// -------------------------------- str_enquote --------------------------------
// enclose the input string in quotes. 
export function str_enquote( text:string, quoteChar:string ) :string
{
  quoteChar = quoteChar || '"';

  // double up the backslash characters.
  text = text.replace(/\\/g, '\\\\');   
  
  // backslash escape all quote chars
  if ( quoteChar == '"')
    text = text.replace(/"/g, '\\"');
  else if ( quoteChar == "'")
    text = text.replace(/'/g, "\\'");
  else if (quoteChar == "`")
    text = text.replace(/`/g, "\\`");

  // return the quoted string.
  return quoteChar + text + quoteChar ;
}

// -------------------------- str_head ----------------------
// return the front of the string
export function str_head(str: string, lx: number)
{
  if (!str)
    return '';
  if (lx > str.length)
    lx = str.length;
  if (lx <= 0)
    return '';
  else
    return str.substring(0, 0 + lx);
}

// ------------------------------- str_isQuoted --------------------------------
export function str_isQuoted(text : string, quoteChar? : string) : boolean
{
  let isQuoted = false;
  if (text.length >= 2)
  {
    const headChar = str_head(text, 1);

    if ( !quoteChar || quoteChar == headChar )
    {
      if ((headChar == '"') || (headChar == "'") || (headChar == '`') ||
            (headChar == '/'))
      {
        const tailCh1 = str_tail(text, 1);
        const tailCh2 = str_tail(text, 2);
        if ((headChar == tailCh1) && (tailCh2.substring(0, 0 + 1) != '\\'))
          isQuoted = true;
      }
    }
  }
  return isQuoted;
}

// --------------------------------- str_matchGeneric --------------------------
export function str_matchGeneric(str: string, pattern: string): boolean
{
  // remove final '*' from pattern.
  const starChar = str_tail(pattern, 1);
  if (starChar != '*')
    return false;

  const pattern_lx = pattern.length - 1;
  pattern = str_substrLenient(pattern, 0, pattern_lx);
  if (pattern_lx == 0)
    return true;
  else if (str.substring(0, 0 + pattern_lx) == pattern)
    return true;
  else
    return false;
}

// ----------------------- str_padLeft -----------------------
// pad on the left until specified length.
export function str_padLeft(inText:string, length:number, padChar:string)
{
  padChar = padChar || ' ';
  let text = inText;
  while (text.length < length)
  {
    text = padChar + text ;
  }
  return text;
}

// ------------------------- str_padRight ----------------------------
// pad on the right with pad character.
export function str_padRight(inText:string, padLx:number, padChar:string)
{
  padChar = padChar || ' ';
  let text = inText;
  while (text.length < padLx)
  {
    text += padChar;
  }
  return text;
}

// --------------------------------- str_random ---------------------------------
/**
 * generate a random string of characters. 
 * @param length number of random characters.
 */
export function str_random( length:number )
{
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++)
  {
    const randomRangeSize = i == 0 ? 52 : charactersLength ;
    const randomIndex = Math.floor(Math.random() * randomRangeSize ) ;
    result += characters.charAt( randomIndex );
  }
  return result;
}

// -------------------- str_replaceAll -----------------------
// replace all occurance of findText with replaceText
export function str_replaceAll( str:string, findText:string, replaceText:string )
{
  let res = '';
  let ix = 0;
  while (ix < str.length)
  {
    const fx = str.indexOf(findText, ix);

    // length from start to found position
    let lx = 0;
    if (fx == -1)
      lx = str.length - ix;
    else
      lx = fx - ix;

    // copy not match text to result.
    if (lx > 0)
      res += str.substring(ix, ix + lx);

    // match found. add replacement text to result.
    if (fx != -1)
      res += replaceText;

    // advance in str.
    if (fx == -1)
      ix = str.length;
    else
      ix = fx + findText.length;
  }
  return res;
}

// ------------------------- str_rtrim --------------------
export function str_rtrim(str:string): string
{
  if (!str)
    return '';
  else
    return str.replace(/\s+$/, "");
}

// ---------------------------------- iStringWord ----------------------------------
export interface iStringWord
{
  bx:number;

  /** whitespace before the text. */
  wsBefore?:boolean;

  text:string;
  /**
   * whitespace after the text
   */
  wsAfter?:boolean;
  
  delim?:string;
}

// ------------------------------- str_splitWords -------------------------------
/**
 * split string into array of words. Each word consisting of position in the string,
 * value of the word, and the text of delim that follows the word.
 * @param str String to split into words.
 * @returns array of words. Each word being an object that implements the iStringWord interface.
 */
export function str_splitWords(str: string)
{
  const words: iStringWord[] = [] ;
  const regex = /(\s*)(\w+)?(\s*)(\W?)/g;
  let lastIndex = 0 ;
  let pv_lastIndex = -1 ;
  const xx = str.length ;
  while( lastIndex < str.length)
  {
    // make sure not looping.
    if ( pv_lastIndex >= lastIndex )
      break ;

    // start regex match after the last match.
    regex.lastIndex = lastIndex ;
    pv_lastIndex = lastIndex;

    const match = regex.exec(str) ;
    if ( !match )
      break;

    // store match in array of words.
    {
      const wsb = match[1] ? match[1] : '' ;
      const wsBefore = !!wsb;
      const bx = match.index + wsb.length ;
      const text = match[2] ? match[2] : '' ;
      const wsa = match[3] ? match[3] : '';
      const wsAfter = !!wsa ;
      const delim = match[4] ? match[4] : '' ;
      words.push({bx, wsBefore, text, wsAfter, delim});

      lastIndex = bx + text.length + wsa.length + delim.length;
    }
  }

  return words ;
}

// ------------------------ str_splitWhitespaceWords --------------------
/**
 * split words on whitespace only. no delimeters. 
 * @param str 
 */
export function str_splitWhitespaceWords(str: string)
{
  const words: iStringWord[] = [];
  const regex = /(\s*)(\S+)/g;
  let lastIndex = 0;
  let pv_lastIndex = -1;
  while (true)
  {
    // make sure not looping.
    if (pv_lastIndex >= lastIndex)
      break;

    // start regex match after the last match.
    regex.lastIndex = lastIndex;
    pv_lastIndex = lastIndex;

    const match = regex.exec(str);
    if (!match)
      break;

    // store match in array of words.
    {
      const ws = match[1] ? match[1] : '';
      const wsBefore = !!ws;
      const bx = match.index + ws.length;
      const text = match[2] ;
      words.push({ bx, wsBefore, text });

      lastIndex = bx + text.length;
    }
  }

  return words;
}

// -------------------------------- str_startsWith -------------------------
// test that the starting text of text matches startText.
export function str_startsWith(text: string, startText: string | string[] ): boolean
{
  if (!startText)
    return false;
  else if ( Array.isArray(startText))
  {
    for( const startTextItem of startText )
    {
      const rc = str_startsWith(text, startTextItem) ;
      if ( rc )
        return true ;
    }
    return false ;
  }
  else
  {
    const startLx = startText.length;
    if (startLx > text.length)
      return false;
    else if (text.substring(0, 0 + startLx) == startText)
      return true;
    else
      return false;
  }
}

// ---------------------------- str_substrLenient --------------------
// return substring of the input string. only, clip the results if start or end
// pos are out of bounds of the string.
export function str_substrLenient(
            str: string|undefined, fx: number, lx: number = -1): string
{
  if ((typeof str != 'string') || ( str == null))
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
    return str.substring(fx);

  // remaining length.
  var remLx = str.length - fx;

  // trim length if remaining lgth exceeded.
  if (lx > remLx)
    lx = remLx;

  return str.substring(fx, fx + lx);
}

// ----------------------str_tail ---------------------------------
// return num number of characters from end of string.
export function str_tail(str: string, num: number): string
{
  if (str.length <= num)
    return str;
  else
  {
    var bx = str.length - num;
    return str.substring(bx);
  }
}

// ------------------------ str_wordBx ---------------------------
// return bx of word in text that has a char located at position ix.
export function str_wordBx(text: string, word: string, ix: number)
  : number
{
  let bx = -1;
  const wordLx = word.length;
  while (ix >= 0)
  {
    const remLx = text.length - ix;
    if (remLx >= wordLx)
    {
      if (text.substring(ix, ix + wordLx) == word)
      {
        bx = ix;
        break;
      }
    }
    ix -= 1;
  }

  return bx;
}

// ----------------------------- strArr_contains -----------------------------
// check if the array of strings contains the specified string.
export function strArr_contains(arr: string[] | undefined, text: string): boolean
{
  let contains = false;
  if (!arr)
    contains = false;
  else
  {
    const foundItem = arr.find((item) =>
    {
      return (item == text);
    });
    if (foundItem)
      contains = true;
  }
  return contains;
}

// ------------------------- strArr_toDistinct -------------------------
/**
 * use Map object to convert input array of strings into distinct list of
 * string items.
 * @param arr input array of string
 */
export function strArr_toDistinct(arr: string[])
{
  const map = new Map<string,string>( ) ;
  for( const item of arr )
  {
    if ( !map.has(item))
      map.set(item, '' ) ;
  }
  const distinctArr = Array.from(map.keys());
  return distinctArr ;
}

// ------------------------- strArr_toDistinctAndSorted -------------------------
/**
 * use Map object to convert input array of strings into distinct and sorted list of
 * string items.
 * @param arr input array of string
 */
export function strArr_toDistinctAndSorted(arr: string[])
{
  const mappedArr = arr.reduce((rio, item) =>
  {
    if (!rio.has(item))
      rio.set(item, '');
    return rio;
  }, new Map<string, string>());
  const distinctArr = Array.from(mappedArr.keys());
  return distinctArr.sort((a, b) =>
  {
    if (a < b)
      return -1;
    else if (a == b)
      return 0;
    else
      return 1;
  });
}

// -------------------------- strWords_wordAtPosition --------------------------
/**
 * search array of words returned by `str_splitWords` function for the word 
 * located at the specified position. 
 * @param wordsArr array of words. This array returned by str_splitWords 
 * function.
 * @param pos Position in the string. Search for the word located at this specified 
 * position.
 * @returns object containing found word, prev word, next word and index of the 
 * word in the array of words.
 */
export function strWords_wordAtPosition(wordsArr: iStringWord[], pos: number)
{
  let found: iStringWord | undefined;
  let prev: iStringWord | undefined;
  let next: iStringWord | undefined;
  let arrayIndex = -1;

  for (let ix = 0; ix < wordsArr.length; ++ix)
  {
    const word = wordsArr[ix];
    const word_ex = word.bx + word.text.length;
    if ((word.bx <= pos) && (pos < word_ex))
    {
      found = word;
      if (ix > 0)
        prev = wordsArr[ix - 1];
      if ((ix + 1) < wordsArr.length)
        next = wordsArr[ix + 1];
      arrayIndex = ix;
      break;
    }
  }
  return { found, prev, next, arrayIndex };
}

// ------------------------------- uint8Arr_nextNum -------------------------------
/**
 * return value of next uint8 item in array. If past end of array, return -1.
 * @param buf 
 * @param ix 
 * @returns 
 */
export function uint8Arr_nextNum(buf:Uint8Array, ix:number)
{
  const nx = ix + 1 ;
  if ( nx < buf.length )
    return buf[nx] ;
  else 
    return -1 ;
}

// -------------------------------- uint8Arr_remLx --------------------------------
/**
 * return remaining length of array from index to the end.
 * @param buf 
 * @param ix 
 * @returns 
 */
export function uint8Arr_remLx(buf:Uint8Array, ix:number)
{
  return buf.length - ix ;
}

// ------------------------------ uint8Arr_toString ------------------------------
/**
 * return the Uint8Array items as string of numeric values with space between each
 * value.
 * @param buf 
 * @returns 
 */
export function uint8Arr_toString(buf:Uint8Array)
{
  let str = '' ;
  for( var ix = 0 ; ix < buf.length ; ++ix )
  {
    const num = buf[ix];
    if ( str )
      str += ` ${num}`;
    else 
      str += `${num}`;
  }
  return str ;
}

// ------------------------------ uint8Arr_toHexString ------------------------------
/**
 * return the Uint8Array items as string of numeric values as hex with space 
 * between each value.
 * @param buf 
 * @param options upper:set hex string values to upper case.  FF FA ...
 * @returns 
 */
export function uint8Arr_toHexString(buf:Uint8Array, options?:{upper?:boolean})
{
  let str = '' ;
  options = options || {};
  const upper = options.upper ? options.upper : false;

  for( var ix = 0 ; ix < buf.length ; ++ix )
  {
    const num = buf[ix];
    const hex = upper ? num.toString(16).toUpperCase() : num.toString(16);
    if ( str )
      str += ` ${hex}`;
    else 
      str += `${hex}`;
  }
  return str ;
}

// ---------------------------- uint8Arr_scanUntilTerm ----------------------------
/**
 * scan ahead in buf until one of the terminate code values stored in termArr.
 * @param buf 
 * @param bx 
 * @param termArr 
 * @returns scanBuf - bytes scanned up to term byte. 
 *          scanLx - total scan num bytes. scan bytes + termByte
 *          termNum - the scan terminating byte. -1 if EOF.
 */
export function uint8Arr_scanUntilTerm(buf:Uint8Array, bx:number, termArr:number[]|Uint8Array)
{
  let ix = bx ;
  let lx = 0 ;
  let termNum = -1 ;
  while( ix < buf.length )
  {
    const num = buf[ix] ;
    if ( termArr.indexOf(num) >= 0 )
    {
      termNum = num ;
      break ;
    }
    ix += 1 ;
    lx += 1 ;
  }

  // extract the sequence of buffer bytes that run from bx until the found until
  // code number.
  const scanBuf = lx ? buf.slice( bx, bx + lx) : null;
  const scanLx = termNum == -1 ? lx : lx + 1;
  return { scanBuf, scanLx, termNum };
}
