// sr_core_ts/src/core.ts

import * as fs from 'fs';
import * as path from 'path';
import { rxp, regex_exec } from './regex_core' ;
import { regexPattern_toFragments } from './regex-frag' ;
import { system_downloadsFolder } from './system-downloads';
import { openTextLinesInBrowser } from './open-in-browser';

export {rxp, regex_exec, regexPattern_toFragments } ;
export { system_downloadsFolder};
export { openTextLinesInBrowser } ;

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

// --------------------------------- array_compareEqual -------------------------
export function array_compareEqual<T>( arr1: T[], arr2: T[]) : boolean 
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
        res = array_compareEqual(vlu1, vlu2);
      }
      else if (typeof vlu1 == 'object' && typeof vlu2 == 'object')
      {
        res = object_compareEqual(vlu1, vlu2);
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

// -------------------------------- array_copyItems --------------------------------
// return array containing items copied from input array.
export function array_copyItems<T>(arr: T[], from: number, count: number): T[]
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

// ------------------------------- array_findAndSplice ----------------------------
// find index of item in array where func(item) == true. Then use splice to remove
// that found item.
// return true if item was found and removed.
export function array_findAndSplice<T>(arr: T[],
  predicate: (value: T, index: number, obj: T[]) => unknown) : boolean
{
  const fx = arr.findIndex(predicate);
  if (fx != -1)
    arr.splice(fx, 1);

  return (fx != -1);
}

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
  const yr = Number(iso.substr(0, 4));
  const mm = Number(iso.substr(5, 2)) - 1;
  const dd = Number(iso.substr(8, 2));

  if (iso_time)
  {
    const hr = Number(iso_time.substr(0, 2));
    const min = Number(iso_time.substr(3, 2));
    const sec = Number(iso_time.substr(6, 2));
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

// ----------------------------------- dir_rmdir ------------------------------
// remove directory. use recursive option to also remove contents.
export function dir_rmdir(dirPath: string, options?:{recursive?:boolean}): Promise<{ errmsg: string }>
{
  options = options || {} ;
  const recursive = options.recursive || false;
  const promise = new Promise<{ errmsg: string }>(async (resolve, reject) =>
  {
    let errmsg = '';

    fs.rmdir(dirPath, {recursive}, (err) =>
    {
      if (err)
      {
        errmsg = err.message;
      }
      resolve({ errmsg });
    });
  });
  return promise;
}

// -------------------------------- iDirDeepOptions -------------------------------
export interface iDirDeepOptions
{
  ignoreDir?: string[];
  containsFile?: string[];
  includeRoot?: boolean;

  // containsHaltDeep: true false. When folder found that contains file, do not 
  // continue looking in sub folders of that folder for more folders that also 
  // contain the file.
  containsHaltDeep?: boolean;

  // how deep to folder tree to search for initial folder that contains file.
  containsMaxDepth?: number;
}

// -------------------------------- dir_readDirDeep --------------------------------
// return deep list of directories contained within dirPath.
// each directory returned is the full path of the directory.
// use the ignoreDir parameter to ignore directories by their file name.
// includeRoot: include this root directory in the returned list of directories.
//              ( only if root directory passes include tests, like contains file. )
export function dir_readDirDeep( dirPath: string, options: iDirDeepOptions ) : Promise<string[]>
{
  options = options || {} ;
  const containsHaltDeep = options.containsHaltDeep || false ;
  let containsMaxDepth = options.containsMaxDepth ;
  let doContinue = true ;

  const promise = new Promise<string[]>(async (resolve, reject) =>
  {
    const {files, errmsg} = await dir_readdir(dirPath) ;
    let foundDirs : string[] = [] ;

    // include this root dir in list of result directories.
    if ( options.includeRoot )
    {
      // check if the directory contains a specified file.
      let skip = false;
      if (options.containsFile)
      {
        const does_contain_file = await dir_containsFile( dirPath, options.containsFile);
        if (does_contain_file == false)
          skip = true;
        else 
        {
          containsMaxDepth = undefined ;
          if ( containsHaltDeep )
            doContinue = false ;
        }
      }
      if (!skip)
        foundDirs.push(dirPath) ;
    }

    if ( doContinue )
    {
      for( const file of files)
      {
        const filePath = path.join(dirPath, file) ;
        const { isDir } = await file_isDir(filePath) ;
        if (( isDir ) && !stringArray_contains( options.ignoreDir, file))
        {
          let continue_deep = true ;
          let sub_containsMaxDepth = containsMaxDepth;

          // check if the directory contains a specified file.
          let does_contain_file = false ;
          let doPush = true ;
          if ( options.containsFile )
          {
            does_contain_file = await dir_containsFile(filePath, options.containsFile ) ;
            if ( does_contain_file == false )
              doPush = false ;
            if ( does_contain_file && containsHaltDeep )
              continue_deep = false ;
          }

          // add to list of found directories.
          if ( doPush )
          {
            foundDirs.push(filePath) ;
          }

          // do not continue deep if this folder does not match contain rule and
          // conainsMaxDepth has been reached.
          if ( continue_deep && sub_containsMaxDepth != undefined )
          {
            if ( does_contain_file )  // once folder contains file, containsMaxDepth no longer applies.
              sub_containsMaxDepth = undefined;
            else if ( sub_containsMaxDepth <= 1 )
              continue_deep = false ;
          }

          // search for deep directories in this sub directory.
          if ( continue_deep )
          {
            if ( sub_containsMaxDepth )
              sub_containsMaxDepth -= 1 ;
            const subOptions = { ...options, includeRoot: false, 
                                  containsMaxDepth: sub_containsMaxDepth };
            const subFoundDirs = await dir_readDirDeep(filePath, subOptions);
            foundDirs.push(...subFoundDirs);
          }
        }
      }
    }
    resolve(foundDirs) ;
  }) ;
  return promise;
}

// --------------------------- dir_readdir ----------------------
// return results of fs.readdir as a promise.
export function dir_readdir(dirPath: string): Promise<{files:string[],errmsg:string}>
{
  const promise = new Promise<{files:string[],errmsg:string}>(async (resolve, reject) =>
  {
    fs.readdir(dirPath, (err, files) =>
    {
      if (files)
      {
        resolve({files,errmsg:''});
      }
      else
      {
        const errmsg = err ? err.message : '' ;
        resolve({ files:[], errmsg });
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

// ------------------------------ file_ensureExists ------------------------
export async function file_ensureExists(path: string)
{
  let fileCreated = false;
  const exists = await file_exists(path);
  if (exists == false)
  {
    await file_create(path);
    fileCreated = true;
  }
  return { fileCreated };
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

// --------------------------- file_readAllText ----------------------
// return results of fs.readFile as string.
export async function file_readAllText(filePath: string)
{
  const { data, errmsg } = await file_readFile(filePath);
  const text = (data) ? data.toString('utf8') : '';
  return { text, errmsg };
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

// -------------------------- file_rename ------------------------------
// rename the file. return errmsg thru a resolved Promise.
// to arg is an object. Use to specify the full path to rename/move to,
// the directory to move to, the extension to rename the file to.
export async function file_rename( oldPath: string, to: rename_path_to ) 
            : Promise<{toPath:string,errmsg:string}>
{
  // using the to arg, setup name of rename file.
  let toPath = path_rename( oldPath, to ) ;

  const promise = new Promise<{toPath:string,errmsg:string}>((resolve, reject) =>
  {
    fs.rename( oldPath, toPath, (err) =>
    {
      let errmsg = '' ;
      if ( err != null )
        errmsg = err.message ;
      resolve( {toPath, errmsg });
    });
  });
  return promise;
}

// ------------------------ file_stat ----------------------------
// return promise of fileSystem stat info of a file.
export function file_stat(path: string): Promise<{stats:fs.Stats,errmsg:string}>
{
  const promise = new Promise<{stats:fs.Stats,errmsg:string}>((resolve, reject) =>
  {
    fs.stat(path, (err, stats) =>
    {
      let errmsg = '' ;
      if ( err )
        errmsg = err.message ;
      resolve({stats, errmsg});
    })
  });

  return promise;
}

// --------------------------- file_readText ----------------------
// return results of fs.readFile as string.
// get rid of this function. Use file_readAllText instead.
export async function file_readText(filePath: string)
{
  const {data, errmsg } = await file_readFile(filePath) ;
  const text = (data) ? data.toString('utf8') : '' ;
  return { text, errmsg } ;
}

// -------------------------------- file_close --------------------------------
export function file_close( fd:number): Promise<{errmsg:string}>
{
  const promise = new Promise<{ errmsg: string }>((resolve, reject) =>
  {
    let errmsg = '';
    fs.close( fd, ( ) =>
    {
      resolve({ errmsg });
    });
  });
  return promise;
}

// -------------------------------- file_open --------------------------------
export function file_open( path: string, flags: string | number): Promise<{ fd:number, errmsg: string }>
{
  const promise = new Promise<{ fd:number, errmsg: string }>((resolve, reject) =>
  {
    let errmsg = '';
    fs.open(path, flags, (err, fd) =>
    {
      if (err)
      {
        errmsg = err.message;
      }
      resolve({fd, errmsg});
    });
  });
  return promise;
}

// ---------------------------- file_unlink -----------------------------
// unlink, delete, remove file from file system.
export async function file_unlink(path: string): Promise<{ errmsg: string }>
{
  const promise = new Promise<{ errmsg: string }>((resolve, reject) =>
  {
    let errmsg = '';
    fs.unlink(path, (err) =>
    {
      if (err)
      {
        errmsg = err.message;
        resolve({ errmsg });
      }
      else
      {
        resolve({ errmsg });
      }
    });
  });
  return promise;
}

// ---------------------------------- file_utimes ---------------------------------
// set atime and mtime ( access and modified ) times of a file.
// Times are specified as unix epoch time. The number of seconds since a UTC 
// starting time in 1970.
export async function file_utimes(filePath: string, atime: number, mtime: number):
              Promise<string>
{
  const promise = new Promise<string>((resolve, reject) =>
  {
    fs.utimes(filePath, atime, mtime, (err) =>
    {
      if (err)
        resolve(err.message);
      else
        resolve('');
    });
  });
  return promise;
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
// replace contents of existing file. Or write data to new file.
export async function file_writeNew(path: string, data: string | Buffer ) : Promise<string>
{
  const promise = new Promise<string>((resolve, reject) =>
  {
    let errmsg = '' ;

    if ( Buffer.isBuffer(data))
    {
      fs.writeFile( path, data, 'binary', (err) =>
      {
        if (err)
          resolve(err.message);
        else
          resolve('');
      });
    }
    else
    {
      fs.open(path, 'w', function (err, fd)
      {
        if (err)
        {
          errmsg = err.message ;
          resolve(errmsg) ;
        }

        const buf = Buffer.alloc(data.length, data);
        fs.write(fd, buf, 0, buf.length, null, (err) =>
        {
          if (err) reject('error writing file: ' + err);
          fs.close(fd, () =>
          {
            resolve( errmsg );
          });
        });
      });
    }
  });
  return promise;
}

// -------------------------------- file_writeText --------------------------------
export function file_writeText(fd: number, text: string): Promise<{ errmsg: string }>
{
  const promise = new Promise<{ errmsg: string }>((resolve, reject) =>
  {
    const buf = Buffer.alloc(text.length, text);
    fs.write(fd, buf, 0, buf.length, null, (err) =>
    {
      let errmsg = '';
      if (err)
        errmsg = `error writing file: ${err.message}`;
      resolve({ errmsg });
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

// --------------------------------- object_apply ---------------------------------
// apply properties from the from object to the to object.
// use object_apply in place of the spread operator when you do not want to create 
// a new resulting object. 
// object_apply( obj1, {name:'xxx', numOrders:3})
// is different from:
// const res = object_apply( obj1, {name:'xxx', numOrders:3})
export function object_apply(toObj: { [key: string]: any }, fromObj: { [key: string]: any }) :
    {[key:string]: any}
{
  for (const prop in fromObj)
  {
    toObj[prop] = fromObj[prop];
  }
  return toObj ;
}

// ------------------------------ object_compareEqual ------------------------------
// property by property, deep compare of two objects. 
// return is equal or not.
export function object_compareEqual(
        obj1: { [key: string]: any }, obj2: {[key: string]: any}) : boolean
{
  let isEqual = true ;
  const keys1 = Object.keys(obj1) ;
  const keys2 = Object.keys(obj2) ;

  // compare each property in obj1 to corresponding property in obj2.
  for( const key of keys1 )
  {
    const vlu1 = obj1[key] ;
    const vlu2 = obj2[key] ;

    if ( Array.isArray(vlu1) && Array.isArray(vlu2) )
    {
      isEqual = array_compareEqual(vlu1, vlu2) ;
    }
    else if ( typeof vlu1 == 'object' && typeof vlu2 == 'object')
    {
      isEqual = object_compareEqual(vlu1, vlu2) ;
    }
    else
    {
      isEqual = (vlu1 === vlu2) ;
    }

    // property is not equal. break out.
    if ( !isEqual )
      break ;
  }

  // all properties in obj1 match those in obj2.
  // Check for any properties in obj2 that are not in obj1.
  if ( isEqual )
  {
    if ( keys1.length != keys2.length )
      isEqual = false ;
    else if ( array_compareEqual(keys1, keys2) == false )
      isEqual = false ;
  }

  return isEqual ;
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

// ---------------------------- path_fromBaseNameArray ----------------------------
export function path_fromBaseNameArray(items: string[]): string 
{
  let itemPath = '';
  for (const item of items)
  {
    itemPath = path.join(itemPath, item);
  }
  return itemPath;
}

interface interface_pathPart {
  root:string,  // root of the path.  drive letter  or slash.
  base:string,  // filename.ext
  ext:string,
  dir:string,
  path:string,   // input to parse 
  remPath:string // remain path. all parts that follow the path of this part.
};

// --------------------------------- path_joinUnix ---------------------------------
// combine the two paths with "/" between them. 
// code mod: remove code which used path_toUnixPath on the resulting joined path.
//           reason being that a windows backslash is a valid file name character
//           in unix. So cannot blindly convert all backslash to unix path sep
//           character.
export function path_joinUnix( path1:string, path2:string) : string
{
  // look for the first path separator in path1. 
  // const { found_char } = scan_charEqAny(path1, 0, '/\\');

  // windows separator character. convert to unix.
  // if ( found_char == '\\')
  // {
  //   path1 = path_toUnixPath(path1) ;
  // }
  
  if ( !path1 )
    return path2 ;
  else if ( !path2 )
    return path1 ;
  else
    return `${path1}/${path2}`;

  // let res = path.join(path1, path2) ;
  // res = path_toUnixPath(res) ;
  // return res ;
}

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

// -------------------------------- rename_path_to --------------------------------
interface rename_path_to {
  path?: string;
  dirPath?: string;
  ext?: string;
  baseName?: string;
  baseNameNoExt?: string;
}

// -------------------------- path_rename ------------------------------
// rename the input path. Apply the dirPath, ext, baseName, baseNameNoExt
// properties of the to arg.
export function path_rename(oldPath: string, to: rename_path_to ) : string 
{
  // using the to arg, setup name of rename file.
  let toPath = oldPath;

  // rename entire path
  if ( to.path )
  {
    toPath = to.path ;
  }

  // change dirPath of the input path.
  if ( to.dirPath )
  {
    toPath = path.join( to.dirPath, path.basename(toPath)) ;
  }

  // change name of extension.
  if ( to.ext )
  {
    const ext = path.extname(toPath) ;
    const baseName_noExt = path.basename(toPath, ext ) ;
    toPath = path.join( path.dirname(toPath), baseName_noExt + to.ext );
  }

  // change basename of the input path.
  if ( to.baseName )
  {
    toPath = path.join( path.dirname(toPath), to.baseName ) ;
  }

  // change basename of input path, but keep the extension.
  if ( to.baseNameNoExt )
  {
    const ext = path.extname(toPath);
    toPath = path.join( path.dirname(toPath), to.baseNameNoExt + ext ) ;
  }

  return toPath ;
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

// ------------------------------ path_splitRootPath ------------------------------
/**
 * split the input path on the segments of the path which match the input rootPath.
 * @param in_path 
 * @param rootPath 
 * @returns : {match_path, rem_path } match_path is input path that matches the 
 * root path. rem_path is remaining parts of input path.
 */
export function path_splitRootPath(in_path: string, rootPath: string)
{
  const items = path_toBaseNameArray(in_path);
  const root_items = path_toBaseNameArray(rootPath);

  // number of segments which match root path segments
  let segCx = 0 ;
  for( let ix = 0 ; ix < root_items.length ; ++ix )
  {
    if ( ix >= items.length )
      break ;
    if ( items[ix] != root_items[ix])
      break ;
    segCx += 1 ;
  }

  // the remaining items of path after the root path.
  const match_items = items.slice(0, segCx ) ;
  const rem_items = items.slice( segCx ) ;

  const matchPath = path_fromBaseNameArray(match_items);
  const remPath = path_fromBaseNameArray(rem_items);

  return {matchPath, remPath};
}

// ----------------------------- path_toBaseNameArray -----------------------------
/**
 * split path into array of segments. ( Each segment the return value of 
 * path.basename function. ) The return array items contain the path segments
 * ordered from left to right.
 * @param in_path The path to be parsed in array
 */
export function path_toBaseNameArray(in_path: string): string[]
{
  let pathItems: string[] = [];
  let curPath = in_path;
  while (true)
  {
    const baseName = path.basename(curPath);
    if (!baseName)
    {
      pathItems.unshift(curPath);
      break;
    }
    pathItems.unshift(baseName);
    curPath = path.dirname(curPath);
  }

  return pathItems;
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

// -------------------------------- path_toUnixPath --------------------------------
export function path_toUnixPath( path: string ) : string
{
  const unixPath = path.replace(/\\/g, '\/') ;
  return unixPath ;
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
    const ch1 = text.substr(ix, 1);
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

// ------------------------------ string_assignSubstr ------------------------------
// assign text to substr location within target string.  Returns new string that 
// contains the assigned value.
export function string_assignSubstr(str: string, 
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
    before_text = str.substr(0, before_length);
  if (after_length > 0)
    after_text = str.substr(after_start, after_length);

  const result = before_text + vlu + after_text;
  return result;
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

// -------------------------------- string_enquote --------------------------------
// enclose the input string in quotes. 
export function string_enquote( text:string, quoteChar:string ) :string
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

// ----------------------- string_padLeft -----------------------
// pad on the left until specified length.
export function string_padLeft(inText:string, length:number, padChar:string)
{
  padChar = padChar || ' ';
  let text = inText;
  while (text.length < length)
  {
    text = padChar + text ;
  }
  return text;
}

// ------------------------- string_padRight ----------------------------
// pad on the right with pad character.
export function string_padRight(inText:string, padLx:number, padChar:string)
{
  padChar = padChar || ' ';
  let text = inText;
  while (text.length < padLx)
  {
    text += padChar;
  }
  return text;
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
