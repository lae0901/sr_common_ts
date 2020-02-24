// src/core.ts

import * as fs from 'fs';
import * as path from 'path';
import { rxp, regex_exec } from './regex_core' ;

export {rxp, regex_exec} ;

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

  // look for the file in each directory in the path.  Starting from the left.
  while( remPath.length > 0 )
  {
    const { front, rem } = path_splitFront(remPath);
    checkPath = path.join(checkPath, front ) ;
    remPath = rem;
    const filePath = path.join(checkPath, fileName) ;
    const exists = await file_exists(filePath);
    if ( exists )
    {
      foundDirPath = checkPath ;
      foundRemPath = remPath ;
      break ;
    }
  }

  return {dirPath:foundDirPath, remPath:foundRemPath} ;
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


// -------------------------------- string_startsWith -------------------------
// test that the starting text of text matches startText.
export function string_startsWith(text: string, startText: string): boolean
{
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

// ---------------------------- string_substrLenient --------------------
// return substring of the input string. only, clip the results if start or end
// pos are out of bounds of the string.
function string_substrLenient(str: string, fx: number, lx: number = -1): string
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

