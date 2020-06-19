// src/core.ts

import * as fs from 'fs';
import * as path from 'path';
import { rxp, regex_exec } from './regex_core' ;
import { regexPattern_toFragments } from './regex-frag' ;

export {rxp, regex_exec, regexPattern_toFragments } ;

// ------------------------- array_front -------------------------------------
// return either null or the first item in the array.
export function array_front<T>(arr: T[]): T | null
{
  if (arr.length == 0)
    return null;
  else
  {
    return arr[0];
  }
}

// ------------------------------- dir_containsFile -------------------------------
// check if the directory contains a file name ( file name being a file or dir)
export async function dir_containsFile( dirPath: string, fileNameArr: string[] ) : Promise<boolean>
{
  const promise = new Promise<boolean>((resolve, reject) =>
  {
    let contains = false ;
    fs.readdir(dirPath, (err, items) =>
    {
      const found = items.find((item) =>
      {
        const containsItem = stringArray_contains(fileNameArr, item);
        return containsItem ;
      });
      if ( found )
        contains = true ;
      resolve( contains ) ;
    });
  });
  return promise;
}

// ------------------------------ dir_findFirstText -----------------------------
export async function dir_findFirstText(dirPath: string, findText: string)
  : Promise<{ foundFilePath: string, foundLinn: number }>
{
  const promise = new Promise<{ foundFilePath: string, foundLinn: number }>((resolve, reject) =>
  {
    fs.readdir(dirPath, async (err, items) =>
    {
      let foundFilePath = '';
      let foundLinn = 0;
      for (const item of items)
      {
        const itemPath = path.join(dirPath, item);
        const {isDir}  = await file_isDir(itemPath);
        if (isDir)
        {
          const rv = await dir_findFirstText(itemPath, findText);

          // a file was found in the sub folder.
          if (rv.foundFilePath)
          {
            foundFilePath = rv.foundFilePath;
            foundLinn = rv.foundLinn;
            break;
          }
        }
        else
        {
          const rv = await file_findFirstText(itemPath, findText);
          if (rv.foundLinn >= 0)
          {
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

// ------------------------------- dir_ensureExists -----------------------------
export function dir_ensureExists( dirPath: string) : Promise<{ created:boolean, errmsg:string}>
{
  const promise = new Promise<{created:boolean, errmsg:string}>(async (resolve, reject) =>
  {
    let created = false ;
    let errmsg = '' ;

    const { isDir } = await file_isDir(dirPath) ;
    if ( isDir )
    {
    }
    else
    {
      const {errmsg:errmsg2, exists} = await dir_mkdir(dirPath) ;
      errmsg = errmsg2 ;
      if ( !errmsg && !exists )
        created = true ;
    }

    resolve({ created, errmsg });
  });
  return promise;
}

// ----------------------------------- dir_mkdir ------------------------------
// create directory. return { exists, errmsg }
export function dir_mkdir(dirPath: string): Promise<{exists:boolean,errmsg:string}>
{
  const promise = new Promise<{exists:boolean, errmsg:string}>(async (resolve, reject) =>
  {
    let errmsg = '', exists = false ;
    fs.mkdir(dirPath, (err) =>
    {
      if (err)
      {
        if ( err.code == 'EEXIST')
          exists = true ;
        else
          errmsg = err.message ;
      }
      resolve({exists, errmsg});
    });
  });
  return promise;
}

interface iDirDeepOptions
{
  ignoreDir?: string[],
  containsFile?: string[]
}

// -------------------------------- dir_readDirDeep --------------------------------
// return deep list of directories contained within dirPath.
// each directory returned is the full path of the directory.
// use the ignoreDir parameter to ignore directories by their file name.
export function dir_readDirDeep( dirPath: string, options: iDirDeepOptions ) : Promise<string[]>
{
  options = options || {} ;
  const promise = new Promise<string[]>(async (resolve, reject) =>
  {
    const files = await dir_readdir(dirPath) ;
    let foundDirs : string[] = [] ;
    for( const file of files)
    {
      const filePath = path.join(dirPath, file) ;
      const { isDir } = await file_isDir(filePath) ;
      if (( isDir ) && !stringArray_contains( options.ignoreDir, file))
      {
        // check if the directory contains a specified file.
        let skip = false ;
        if ( options.containsFile )
        {
          const does_contain_file = await dir_containsFile(filePath, options.containsFile ) ;
          if ( does_contain_file == false )
            skip = true ;
        }

        // add to list of found directories.
        if ( !skip )
        {
          foundDirs.push(filePath) ;
        }

        const subFoundDirs = await dir_readDirDeep( filePath, options ) ;
        foundDirs.push(...subFoundDirs) ;
      }
    }
    resolve(foundDirs) ;
  }) ;
  return promise;
}

// --------------------------- dir_readdir ----------------------
// return results of fs.readdir as a promise.
export function dir_readdir(dirPath: string): Promise<string[]>
{
  const promise = new Promise<string[]>(async (resolve, reject) =>
  {
    fs.readdir(dirPath, (err, files) =>
    {
      if (files)
      {
        resolve(files);
      }
      else
      {
        reject(err);
      }
    });
  });
  return promise;
}

// ---------------------------- file_create -----------------------------
export async function file_create(path: string) : Promise<string>
{
  const promise = new Promise<string>((resolve, reject) =>
  {
    let errmsg = '' ;
    fs.open(path, 'w', function (err, fd)
    {
      if (err)
      {
        errmsg = err.message ;
        resolve(errmsg) ;
      }

      fs.close(fd, () =>
      {
        resolve(errmsg);
      });
    });
  });
  return promise;
}

// -------------------------- file_exists ------------------------------
export async function file_exists(path: string): Promise<boolean>
{
  const promise = new Promise<boolean>((resolve, reject) =>
  {
    fs.stat(path, (err, stat) =>
    {
      if (err == null)
      {
        resolve(true);
      }
      else
      {
        resolve(false);
      }
    });
  });
  return promise;
}

// ------------------------------- file_findFirstText ----------------------------
// find first instance of text in file.
export function file_findFirstText(filePath: string, findText: string)
  : Promise<{ foundLinn: number, foundPos: number }>
{
  const promise = new Promise<{ foundLinn: number, foundPos: number }>((resolve, reject) =>
  {
    fs.readFile(filePath, 'utf8', (err, data) =>
    {
      const lower_data = data.toLowerCase();
      const lower_findText = findText.toLowerCase();
      if (err)
        reject('file_findText ' + filePath + ' ' + err)
      else
      {
        let foundLinn = -1;
        let foundPos = -1;
        const fx = lower_data.indexOf(lower_findText);
        if (fx >= 0)
        {
          const lines = lower_data.split('\n');
          for (let linn = 0; linn < lines.length; ++linn)
          {
            const line = lines[linn];
            const pos = line.indexOf(lower_findText);
            if (pos >= 0)
            {
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

// ------------------------ file_isDir ----------------------------
// return promise of fileSystem stat info of a file.
export async function file_isDir(path: string)
  : Promise<{ isDir: boolean, errmsg: string }>
{
  const promise = new Promise<{ isDir: boolean, errmsg: string }>((resolve, reject) =>
  {
    let isDir = false;
    let errmsg = '';
    fs.stat(path, (err, stats) =>
    {
      if (err)
      {
        errmsg = err.message;
      }
      else
      {
        isDir = stats.isDirectory();
      }

      resolve({ isDir, errmsg });
    });
  });

  return promise;
}

// --------------------------- file_readFile ----------------------
// return results of fs.readFile as array of text lines.
export function file_readFile(filePath: string): Promise<{ data: Buffer, errmsg: string }>
{
  const promise = new Promise<{ data: Buffer, errmsg: string }>(async (resolve, reject) =>
  {
    let errmsg = '';
    fs.readFile(filePath, (err, data) =>
    {
      if (err)
      {
        errmsg = err.message;
      }
      resolve({ data, errmsg });
    });
  });
  return promise;
}

// --------------------------- file_readLines ----------------------
// return results of fs.readFile as array of text lines.
export function file_readLines(filePath: string): Promise<{ lines: string[], errmsg: string }>
{
  const promise = new Promise<{ lines: string[], errmsg: string }>(async (resolve, reject) =>
  {
    let lines: string[] = [];
    let errmsg = '';
    fs.readFile(filePath, (err, data) =>
    {
      if (data)
      {
        const text = data.toString('utf8');
        lines = text.split('\n');
      }
      else if (err)
      {
        errmsg = err.message;
      }
      resolve({ lines, errmsg });
    });
  });
  return promise;
}

// ------------------------ file_stat ----------------------------
// return promise of fileSystem stat info of a file.
export function file_stat(path: string): Promise<fs.Stats>
{
  const promise = new Promise<fs.Stats>((resolve, reject) =>
  {
    fs.stat(path, (err, stats) =>
    {
      resolve(stats);
    })
  });

  return promise;
}

// ------------------------------ file_ensureExists ------------------------
export async function file_ensureExists(path: string)
{
  const exists = await file_exists(path);
  if (exists == false)
  {
    await file_create(path);
  }
}

// ----------------------------------- file_writeFile ------------------------------
// write text to a new file.
export function file_writeFile(filePath: string, text: string = ''): Promise<string>
{
  const promise = new Promise<string>(async (resolve, reject) =>
  {
    let errmsg = '';
    fs.writeFile(filePath, text, (err) =>
    {
      if (err)
        errmsg = err.message;
      resolve(errmsg);
    });
  });
  return promise;
}

// ---------------------------- file_writeNew -----------------------------
// replace contents of existing file. Or write text to new file.
export async function file_writeNew(path: string, text: string) : Promise<string>
{
  const promise = new Promise<string>((resolve, reject) =>
  {
    let errmsg = '' ;
    fs.open(path, 'w', function (err, fd)
    {
      if (err)
      {
        errmsg = err.message ;
        resolve(errmsg) ;
      }

      const buf = Buffer.alloc(text.length, text);
      // const buf = new Buffer(text) ;
      fs.write(fd, buf, 0, buf.length, null, (err) =>
      {
        if (err) reject('error writing file: ' + err);
        fs.close(fd, () =>
        {
          resolve( errmsg );
        });
      });

    });
  });
  return promise;
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

// --------------------------- object_indexerItems ------------------------
// return an array containing the indexer properties of the object.
export function object_indexerItems(obj: {[key: string]: any}): any[]
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

// ---------------------------- path_findFile ----------------------------------
// look for the file in each directory in the path.  Starting from the left.
// returns the folder path where the file is found. Also returns the remaining
// part of the path that was not searched.
export async function path_findFile( dirPath: string, fileName: string ) 
          : Promise<{dirPath:string,remPath:string}> 
{
  let checkPath = '', foundDirPath = '', foundRemPath = '' ;
  let remPath = dirPath ;

  // parse the path into separated parts. 
  const parts = path_parts(dirPath) ;

  // look for the file in each directory in the path.  Starting from the left.
  for( const part of parts )
  {
    const filePath = path.join( part.path, fileName);
    const exists = await file_exists(filePath);
    if (exists)
    {
      foundDirPath = part.path;
      foundRemPath = part.remPath;
      break;
    }
  }

  return {dirPath:foundDirPath, remPath:foundRemPath} ;
}

interface interface_pathPart {
  root:string,  // root of the path.  drive letter  or slash.
  base:string,  // filename.ext
  ext:string,
  dir:string,
  path:string,   // input to parse 
  remPath:string // remain path. all parts that follow the path of this part.
};

// ------------------------- path_parts -----------------------------------
export function path_parts(str:string) : interface_pathPart[]
{
  let arr : interface_pathPart[] = [] ;
  let cur = str ;
  let remPath = '' ;

  while(cur)
  {
    const rv = path.parse(cur) ;
    const { root, base, dir, ext } = path.parse(cur) ;
    arr.push({root,base,dir,ext,path:cur, remPath });
    if ( !base )
      break ;
    cur = dir ;
    remPath = path.join(base,remPath) ;
  }

  return arr.reverse( ) ;
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

// ---------------------------------- path_splitFront ----------------------------------
// split a path from the front.  Returning the front item and the remaining items.
export function path_splitFront(path: string, sep: string = '/'): { front: string, rem: string }
{
  let front = '', rem = '';
  const ix = path.indexOf(sep);
  if (ix >= 0)
  {
    front = path.substr(0, ix);
    if ( !front )
      front = '/' ;
    rem = string_substrLenient(path, ix + 1);
  }
  else
  {
    front = path;
    rem = '';
  }

  return { front, rem };
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

// --------------------------- scan_charNeAll ------------------------------
// scan in string until char not equal any of pattern chars.
export function scan_charNeAll(text: string, bx: number, pattern: string): number
{
  let ix = bx;
  while (ix < text.length)
  {
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

// ----------------------------- scan_revCharEqAny --------------------------------
// scan backwards until character is equal any of chars in anyChar string.
export function scan_revCharEqAny(text: string, bx: number, anyChar: string): number
{
  let ix = bx;
  while (ix >= 0)
  {
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

// ----------------------------- scan_revCharNeAll --------------------------------
// scan backwards until character is not equal all of chars in pattern string.
export function scan_revCharNeAll(text: string, bx: number, pattern: string): number
{
  let ix = bx;
  while (ix >= 0)
  {
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
    wordText = text.substr(bx, lx);
  }

  return (wordText) ? { text: wordText, bx } : null;
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
// note: the quote char can be any character. The rule is the first char is the
//       quote char. Then the closing quote is that same first char. And the
//       backslash is used to escape the quote char within the string.
// Use string_isQuoted
export function string_dequote(text: string): string
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

// -------------------------- string_head ----------------------
// return the front of the string
export function string_head(str: string, lx: number)
{
  if (!str)
    return '';
  if (lx > str.length)
    lx = str.length;
  if (lx <= 0)
    return '';
  else
    return str.substr(0, lx);
}

// ------------------------------- string_isQuoted --------------------------------
export function string_isQuoted(text : string, quoteChar? : string) : boolean
{
  let isQuoted = false;
  if (text.length >= 2)
  {
    const headChar = string_head(text, 1);

    if ( !quoteChar || quoteChar == headChar )
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

// --------------------------------- string_matchGeneric --------------------------
export function string_matchGeneric(str: string, pattern: string): boolean
{
  // remove final '*' from pattern.
  const starChar = string_tail(pattern, 1);
  if (starChar != '*')
    return false;

  const pattern_lx = pattern.length - 1;
  pattern = string_substrLenient(pattern, 0, pattern_lx);
  if (pattern_lx == 0)
    return true;
  else if (str.substr(0, pattern_lx) == pattern)
    return true;
  else
    return false;
}

// -------------------- string_replaceAll -----------------------
// replace all occurance of findText with replaceText
export function string_replaceAll( str:string, findText:string, replaceText:string )
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
      res += str.substr(ix, lx);

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

// ------------------------- string_rtrim --------------------
export function string_rtrim(str:string): string
{
  if (!str)
    return '';
  else
    return str.replace(/\s+$/, "");
}

// -------------------------------- string_startsWith -------------------------
// test that the starting text of text matches startText.
export function string_startsWith(text: string, startText: string | string[] ): boolean
{
  if (!startText)
    return false;
  else if ( Array.isArray(startText))
  {
    for( const startTextItem of startText )
    {
      const rc = string_startsWith(text, startTextItem) ;
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
    else if (text.substr(0, startLx) == startText)
      return true;
    else
      return false;
  }
}

// ---------------------------- string_substrLenient --------------------
// return substring of the input string. only, clip the results if start or end
// pos are out of bounds of the string.
export function string_substrLenient(str: string, fx: number, lx: number = -1): string
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

// ----------------------------- stringArray_contains -----------------------------
// check if the array of strings contains the specified string.
export function stringArray_contains(arr: string[] | undefined, text: string): boolean
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
