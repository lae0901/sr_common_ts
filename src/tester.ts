import {  file_open, file_close, file_writeText,
         file_isDir, dir_ensureExists, dir_mkdir, dir_readdir, 
          file_ensureExists, file_unlink,
          file_readAllText, file_writeNew, 
          path_joinUnix, path_toUnixPath, 
          date_toEpoch, date_fromISO,
          array_copyItems, array_compareEqual, 
          file_stat, file_utimes, 
          path_splitRootPath, path_toBaseNameArray, path_fromBaseNameArray, date_toISO, 
          dir_rmdir, iDirDeepOptions, object_compareEqual, object_apply, 
          array_findAndSplice, any_toString, file_rename, path_rename, file_copy, file_exists, 
          string_splitWords, file_resolve, string_random, stringArr_toDistinctAndSorted, 
          stringWords_wordAtPosition, 
          iStringWord,
          stringArr_toDistinct,
          object_properties,
          string_splitWhitespaceWords,
          scan_unquotedPattern,
          string_substrLenient} from './core';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { string_assignSubstr, string_enquote, string_padLeft, string_padRight, 
        path_findFile, path_parts, rxp, dir_readDirDeep } from './core';
import {testResults_append, testResults_consoleLog, testResults_new } from 'sr_test_framework';
import { system_downloadsFolder } from './system-downloads';

const folderPath = '/c:/github/tester';
const fileName = 'app.vue';

{
  const path1 = `file:///c:/web/pwa/dark-sky/demo/steve.txt`;  
  const parts = path_parts(path1) ;
}

{
  const path1 = `/web/pwa/dark-sky/demo/steve.txt`;
  const parts = path_parts(path1);
}

regex_orDemo( ) ;

// run main function that is declared as async. 
async_main( ) ;

async function runTest( testDir:string )
{
  let wasDeleted = false;
  const { created, errmsg } = await dir_ensureExists(testDir);
}

async function base_async(folderPath: string, fileName: string)
{
  const { dirPath, remPath } = await path_findFile(folderPath, fileName);
  console.log(`dirPath:${dirPath}  remPath:${remPath}`);
}

// ------------------------------- async_main ---------------------------------
async function async_main( )
{
  const results = testResults_new( ) ;

  // string_test
  {
    const res = string_test() ;
    results.push( ...res ) ;
  }

  // stringWords_test
  {
    const res = stringWords_test();
    results.push(...res);
  }

  // array_test
  {
    const res = array_test();
    results.push(...res);
  }

  // date_test
  {
    const res = date_test();
    results.push(...res);
  }

  // dir_test
  {
    const res = await dir_test();
    results.push(...res);
  }

  // file_test
  {
    const res = await file_test();
    results.push(...res);
  }

  // path_test
  {
    const res = path_test();
    results.push(...res);
  }

  // scan_test
  {
    const res = scan_test();
    results.push(...res);
  }

  // primitive file test. create a file, write some text to it, close, then read
  // entire contents and match against what was written.
  {
    const { results:res } = await primitive_file_test() ;
    results.push(...res) ;
  }

  // system_test
  {
    const res = system_test();
    results.push(...res);
  }

  // object_test
  {
    const res = object_test();
    results.push(...res);
  }

  // any_test
  {
    const res = any_test( ) ;
    results.push(...res);
  }

  await testResults_consoleLog( results ) ;
}

// ----------------------------------- any_test -----------------------------------
function any_test( )
{
  const results = testResults_new();
  let method = '';
  const category = 'any_ methods';

  // test the array_copyItems function.
  {
    method = 'any_toString';
    const val = {name:'bob', salary:252.33 } ;
    const expected = '{name:bob, salary:252.33}';
    const actual = any_toString(val) ;
    const desc = 'object to string';
    testResults_append(results, { category, expected, actual, desc, method });
  }

  return results ;
}

// ---------------------------------- array_test ----------------------------------
function array_test()
{
  const results = testResults_new();
  let method = '';
  const category = 'array' ;

  // test the array_copyItems function.
  {
    method = 'array_copyItems';
    const arr = ['123', 'array', 53, 'test', 'babel'];
    const expected = [53, 'test', 'babel'];
    const testResult = array_copyItems(arr, 2, 4);
    const desc = 'copy array items';
    testResults_append( results, {category, expected, testResult, desc, method});
  }

  // test the array_copyItems function.
  {
    method = 'array_findAndSplice';
    const arr = ['123', 'array', 53, 'test', 'babel'];
    const expected = [ '123', 53, 'test', 'babel'];
    const spliced = array_findAndSplice(arr, (item) =>
    {
      return item == 'array' ;
    });
    
    const desc = 'find and remove item from array';
    testResults_append(results, { category, expected, testResult:arr, desc, method });
  }

  // test the array_compareEqual function. arrays are equal.
  {
    method = 'array_compareEqual';
    const aspect = 'arrays are equal';
    const arr1 = ['123', 'array', 53, {age:25, name:'abc'}, ['22', 89, 'jack'], 'test', 'babel'];
    const arr2 = ['123', 'array', 53, {age:25, name:'abc'}, ['22', 89, 'jack'], 'test', 'babel'];
    const expected = true;
    const testResult = array_compareEqual( arr1, arr2 ) ;
    const desc = 'compare arrays for equality';
    testResults_append(results, { category, expected, testResult, desc, method, aspect });
  }

  // test the array_compareEqual function. arrays not equal.
  {
    method = 'array_compareEqual';
    const aspect = 'arrays not equal';
    const arr1 = ['123', 'array', 53, { age: 25, name: 'abc' }, ['22', 89, 'jack'], 'test', 'babel'];
    const arr2 = ['123', 'array', 53, { age: 27, name: 'abc' }, ['22', 89, 'jack'], 'test', 'babel'];
    const expected = false;
    const testResult = array_compareEqual(arr1, arr2);
    const desc = 'compare arrays for equality';
    testResults_append(results, { category, expected, testResult, desc, method, aspect });
  }

  return results;
}

function regex_orDemo( )
{
  let errmsg = '' ;
  
  {
    const regex = /(\s*)((<\/)|({{)|(}})|(<[\w]))/g;
    const text = '    <sp}}an>{{customer}}</span>';
    regex.lastIndex = 1;
    const match = regex.exec(text) ;
    if ( match )
    {
      const closeBraces = match[1] ;
      const openBraces = match[2] ;
      if ( closeBraces )
        console.log(`close braces found at position ${match.index}`);
      if (openBraces)
        console.log(`open braces found at position ${match.index}`);
    }
  }

  {
    const text = `  <td @click="travItem_setEdit(item, rowIndex, 'TRIPNAME');"><span>{{item.TRIPNAME}}</span></td>`
    let bx = 60;

    const dummy = string_substrLenient(text, bx, 20);
    console.log(text);
    const regex = /(\s*)((<\/)|({{)|(<)([.]))/g;
    regex.lastIndex = bx;
    const match = regex.exec(text);

    if (match)
    {
      console.log(`found pattern ${string_substrLenient(text, match.index, 20)} position:${match.index}`);
      console.log(`start scan ${bx}  text:${dummy}`);
    }
  }

}

// --------------------------------- regex_listFragments ------------------------
// split a regex pattern into fragments.  Then list those fragments to console.
function regex_listFragments()
{
  const pattern = rxp.comment ;
  // const frags = regexPattern_toFragments(pattern) ;
  // for( const frag of frags )
  // {
  //   console.log( `frag name:${frag.name}  text:${frag.text}`);
  // }
}

// ---------------------------------- object_test ----------------------------------
function object_test()
{
  const results = testResults_new();
  let method = '';
  const category = 'object';

  // test the object_compareEqual function.
  {
    method = 'object_compareEqual';
    const obj1 = { names: ['123', 'array'], age: 53, textLines:['test', 'babel']};
    const obj2 = { names: ['123', 'array'], age: 53, textLines:['test', 'babel']};
    const expected = true;
    const testResult = object_compareEqual( obj1, obj2);
    const desc = 'compare object equality';
    const aspect = 'objects match' ;
    testResults_append(results, { category, expected, testResult, desc, method, aspect });
  }

  // test the object_compareEqual function.
  {
    method = 'object_compareEqual';
    const obj1 = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'] };
    const obj2 = { names: ['123', 'array'], textLines: ['test', 'babel'] };
    const expected = false;
    const testResult = object_compareEqual(obj1, obj2);
    const desc = 'compare object equality';
    const aspect = 'objects do not match';
    testResults_append(results, { category, expected, testResult, desc, method, aspect });
  }

  // object_apply.
  {
    method = 'object_apply';
    const obj1 = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'] };
    const obj2 = { addr1: 'one bank street', city:'rockaway' };
    object_apply( obj1, obj2 ) ;
    const expected_obj = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'],
                       addr1: 'one bank street', city: 'rockaway' };
    const expected = true ;
    const testResult = object_compareEqual(obj1, expected_obj);
    const desc = 'apply properties to object';
    testResults_append(results, { category, expected, testResult, desc, method });
  }

  return results;
}

// ----------------------------------- scan_test -----------------------------------
function scan_test( )
{
  const results = testResults_new();

  // scan_unquotedPattern
  {
    const scanText = `repeating match hit will "<div>" check for < div> the next or`;
    const method = 'scan_unquotedPattern';
    const expected = {index:43, text:'< div>'};
    const actual = scan_unquotedPattern( scanText, 0, '<\\s*div\\s*>');
    testResults_append(results, { method, expected, actual });
  }

  return results;
}

// ---------------------------------- path_test ----------------------------------
function path_test()
{
  const results = testResults_new();
  let method = '';

  // path_toUnixPath.
  {
    method = 'path_toUnixPath';
    let passText = '';
    let errmsg = '';
    const text = '\\home\\srichter\\test.pdf';
    const expected = '/home/srichter/test.pdf';
    const unixPath = path_toUnixPath( text ) ;
    if (unixPath != expected)
      errmsg = `incorrect result. ${unixPath}. expected ${expected}`;
    else
      passText = `correct result. ${unixPath}.`;
    testResults_append(results, passText, errmsg, method);
  }

  // path_joinUnix.
  {
    method = 'path_joinUnix';
    const dirPath = '\\home\\srichter';
    const fileName = 'test.pdf';
    const expected = '/home/srichter/test.pdf';
    const actual = path_joinUnix( path_toUnixPath(dirPath), fileName );
    testResults_append(results, {method, expected, actual});
  }

  // path_joinUnix.
  {
    method = 'path_joinUnix';
    const aspect = 'three path arguments' ;
    const dirPath = '\\home\\srichter';
    const subFolder = 'autocoder' ;
    const fileName = 'test.pdf';
    const expected = '/home/srichter/autocoder/test.pdf';
    const actual = path_joinUnix(path_toUnixPath(dirPath), subFolder, fileName);
    testResults_append(results, { method, expected, actual, aspect });
  }

  // path_rename
  {
    const method = 'path_rename' ;
    const input_path = '/home/srichter/test.pdf';
    const actual = path_rename( input_path, { dirPath:'/home/pricelist', ext:'.txt'});
    const expected = '\\home\\pricelist\\test.txt' ;
    testResults_append( results, {method, expected, actual });
  }

  // path_splitRootPath.
  {
    method = 'path_splitRootPath';
    let passText = '';
    let errmsg = '';
    const fullPath = '/web/home/srichter/gcc/abc.pdf';
    const rootPath = '/web/home';
    const expected = 'srichter/gcc/abc.pdf';
    let { matchPath, remPath } = path_splitRootPath( fullPath, rootPath );
    remPath = path_toUnixPath(remPath) ;
    if (remPath != expected)
      errmsg = `incorrect result. remPath: ${remPath}. expected ${expected}`;
    else
      passText = `correct result. ${remPath}.`;
    testResults_append(results, passText, errmsg, method);
  }

  // path_toBaseNameArray.
  {
    method = 'path_toBaseNameArray';
    let passText = '';
    let errmsg = '';
    const fullPath = '/web/home/srichter/gcc/abc.pdf';
    const arr = path_toBaseNameArray(fullPath);
    if (( arr.length == 6) && (arr[1] == 'web') && (arr[5] == 'abc.pdf'))
      passText = `correct result. ${arr}.`;
    else
      errmsg = `incorrect result. number items ${arr.length}. expected 5.`;
    testResults_append(results, passText, errmsg, method);
  }

  // path_fromBaseNameArray.
  {
    method = 'path_fromBaseNameArray';
    let passText = '';
    let errmsg = '';
    const fullPath = '/web/home/srichter/gcc/abc.pdf';
    const arr = path_toBaseNameArray(fullPath);
    const toFullPath = path_toUnixPath(path_fromBaseNameArray(arr)) ;
    if ( fullPath == toFullPath )
      passText = `correct result. ${toFullPath}.`;
    else
      errmsg = `incorrect result. result ${toFullPath}. expected ${fullPath}`;
    testResults_append(results, passText, errmsg, method);
  }

  return results;
}


// ---------------------------------- stringWords_test ----------------------------------
function stringWords_test()
{
  const results = testResults_new();

  // string_splitWords
  {
    const method = 'string_splitWords';
    const text = ` : call string_split( arg1, 25 )`;
    const actual = string_splitWords(text).map((item) =>
    {
      const { text, delim } = item;
      return { text, delim };
    });
    const expected = [{text:'', delim:':'},  { text: 'call', delim: '' }, 
    { text: 'string_split', delim: '(' },
    { text: 'arg1', delim: ',' }, { text: '25', delim: ')' }];
    testResults_append(results, { method, actual, expected });
  }

  // stringWords_wordAtPosition
  {
    const method = 'stringWords_wordAtPosition' ;
    const text = ` call string_split( arg1, 25 )`;
    const words = string_splitWords(text) ;
    const {found} = stringWords_wordAtPosition( words, 7 ) ;
    const actual = object_properties( found, ['bx', 'text', 'delim'] );
    const expected = { bx:6, text:'string_split', delim:'(' } ;
    testResults_append(results, { method, actual, expected });
  }

  // string_splitWhitespaceWords
  {
    const method = 'string_splitWhitespaceWords';
    const text = ` : call :steve_split( arg1, 25 )`;
    const rv = string_splitWhitespaceWords(text);
    const actual = { numItems:rv.length, thirdWord: rv[2].text  };
    const expected = {numItems:6, thirdWord:':steve_split('};
    testResults_append(results, { method, actual, expected });
  }

  return results;
}


// ---------------------------------- string_test ----------------------------------
function string_test( )
{
  const results = testResults_new( ) ;
  let method = '' ;

  // test the string_padLeft function.
  {
    method = 'string_padLeft' ;
    const text = '123' ;
    const expected = '0000123' ;
    const actual = string_padLeft(text, 7, '0') ;
    testResults_append(results, {method, expected, actual});
  }

  // test the string_padRight function.
  {
    method = 'string_padRight';
    let passText = '';
    let errmsg = '';
    const text = '123';
    const expected = '1230000';
    const paddedText = string_padRight(text, 7, '0');
    if (paddedText != expected)
      errmsg = `incorrect result. ${paddedText}. expected ${expected}`;
    else
      passText = `correct result. ${paddedText}.`;
    testResults_append(results, passText, errmsg, method);
  }

  // generate string of random characters. 
  {
    method = 'string_random';
    const expected = 8;
    const text = string_random( 8 ) ;
    const actual = text.length ;
    testResults_append(results, { method, expected, actual });
  }

  // enquote string. simple.
  {
    method = 'string_enquote';
    let passText = '';
    let errmsg = '';
    const text = 'srcFiles' ;
    const expected = '"srcFiles"';
    const rv = string_enquote(text, '"');
    if ( rv == expected)
      passText = `correct result. ${rv}` ;
    else
      errmsg = `incorrect result. ${rv}. expected ${expected}`;
    testResults_append(results, passText, errmsg, method);
  }

  // enquote string. string contains backslash characters, quote characters.
  {
    method = 'string_enquote';
    let passText = '';
    let errmsg = '';
    const text = 'src"Fi\\les';
    const expected = '"src\\\"Fi\\\\les"';
    const rv = string_enquote(text, '"');
    if (rv == expected)
      passText = `correct result. ${rv}`;
    else
      errmsg = `incorrect result. ${rv}. expected ${expected}`;
    testResults_append(results, passText, errmsg, method);
  }

  // string_assignSubstr
  {
    method = 'string_assignSubstr';
    let passText = '';
    let errmsg = '';
    const text = 'src"Fi\\les';
    const expected = 'srcToshles';
    const rv = string_assignSubstr(text, 3, 4, 'Tosh');
    if (rv == expected)
      passText = `correct result. ${rv}`;
    else
      errmsg = `incorrect result. got ${rv}. expected ${expected}`;
    testResults_append(results, passText, errmsg, method);
  }

  // stringArr_toDistinctAndSorted
  {
    method = 'stringArr_toDistinctAndSorted' ;
    const inputArr = ['Joe', 'Sue', 'Bob', 'Joe'];
    const actual = stringArr_toDistinctAndSorted( inputArr ) ;
    const expected = ['Bob', 'Joe', 'Sue'];
    testResults_append( results, {method, actual, expected});
  }

  // stringArr_toDistinct
  {
    method = 'stringArr_toDistinct';
    const inputArr = ['Joe', 'acwww', 'Sue', 'Bob', 'acwww', 'Joe'];
    const actual = stringArr_toDistinct(inputArr);
    const expected = ['Joe', 'acwww', 'Sue', 'Bob'];
    testResults_append(results, { method, actual, expected });
  }

  return results ;
}

// ---------------------------------- date_test ----------------------------------
function date_test()
{
  const results = testResults_new();
  let method = '';

  // test the date_toEpoch function.
  {
    method = 'date_toEpoch';
    const desc = `convert date to epoch`;
    const dt = new Date(1595273994 * 1000) ;
    const expected = 1595273994;
    const testResult = date_toEpoch(dt);
    testResults_append(results, {method, expected, testResult, desc }) ;
  }

  {
    method = 'date_fromISO';
    const iso_date = '2019-02-15';
    const iso_time = '15:25:18';
    const desc = `ISO date and time ${iso_date} ${iso_time} to Date object`;
    const dt = date_fromISO(iso_date, iso_time) ;
    const mtime = date_toEpoch(dt) ;
    const expected = 1550262318 ;
    const testResult = mtime ;
    testResults_append(results, { method, expected, testResult, desc });
  }

  {
    method = 'date_toISO';
    const desc = `convert date to ISO form`;
    const dt = new Date(2020,4,22) ;
    const expected = '2020-05-22';
    const testResult = date_toISO( dt ) ;
    testResults_append(results, { method, expected, testResult, desc });
  }

  return results;
}

// ---------------------------------- dir_test ----------------------------------
async function dir_test()
{
  const results = testResults_new();
  const tempTestDir = path.join(os.tmpdir(), 'sr_core_ts');

  // create directory /tmp/sr_core_ts 
  {
    const { created, errmsg } = await dir_ensureExists(tempTestDir);
    const { files, errmsg:errmsg_read } = await dir_readdir(tempTestDir);
    const method = 'dir_ensureExists';
    const expected = 'created';
    const aspect = 'create temp dir';
    const testResult = !errmsg_read ? 'created' : errmsg_read ;
    testResults_append(results, { expected, method, aspect, testResult });
  }

  // count number of directories
  {
    const dirPath = `c:\\github\\defn`;
    const options = { ignoreDir: ['node_modules', 'git', '.git'], containsItem: ['common', 'file-explorer'] };
    const dirPathNames = await dir_readDirDeep(dirPath, options);
    const expected = 2;
    const method = 'dir_readDirDeep' ;
    const aspect = 'containsItem' ;
    const testResult = dirPathNames.length ;
    testResults_append( results, {expected, method, aspect, testResult });
  }

  // count number of directories that contain list of files
  {
    const dirPath = `c:\\github`;
    const options : iDirDeepOptions = 
          { ignoreDir: ['node_modules', 'git', '.git'], containsMaxDepth:2, 
            containsItem: ['tslint.json', 'tester-core.ts', 'index.ts', 'preview.jpg'] };
    const dirPathNames = await dir_readDirDeep(dirPath, options);
    const expected = 6;
    const method = 'dir_readDirDeep';
    const aspect = 'containsMaxDepth';
    const actual = dirPathNames.length;
    const desc = 'count number dirs that contain list of files.' ;
    testResults_append(results, { expected, method, aspect, actual, desc });
  }

  // delete directory tempTestDir 
  {
    const { errmsg } = await dir_rmdir(tempTestDir, {recursive:true});
    const method = 'dir_rmdir';
    const expected = 'removed';
    const desc = 'delete temp dir';
    const testResult = !errmsg ? 'removed' : errmsg;
    testResults_append(results, { expected, method, desc, testResult });
  }

  return results;
}

// ---------------------------------- file_test ----------------------------------
async function file_test()
{
  const results = testResults_new();
  let method = '';
  const tempTestDir = path.join( os.tmpdir( ), 'sr_core_ts') ;

  // create directory /tmp/sr_core_ts 
  {
    const { created, errmsg } = await dir_ensureExists(tempTestDir);
    const {files} = await dir_readdir(tempTestDir) ;
    method = 'dir_readdir';
    let passText = `create dir ${tempTestDir}. passed.`;
    testResults_append(results, passText, '', method);
  }

  // file_writeNew
  let testTextFile = path.join(tempTestDir, 'textFile.txt');
  const textContents = 'tester.txt\nline 2\napp store' ;
  {
    method = 'file_writeNew';
    await file_writeNew(testTextFile, textContents) ;
    let passText = `write text ${textContents}`;
    testResults_append(results, passText, '', method);
  }

  // file_rename to ext .xxx
  {
    const method = 'file_rename' ;
    const expected = 'C:\\Users\\srich\\AppData\\Local\\Temp\\sr_core_ts\\textFile.xxx' ;
    const {errmsg, toPath}  = await file_rename( testTextFile, {ext:'.xxx'} ) ;
    const actual = toPath ;
    const aspect = 'rename to .xxx';
    testResults_append( results, {method, actual, expected, aspect});
    testTextFile = toPath ;
  }

  // file_rename back to ext .txt
  {
    const method = 'file_rename';
    const expected = 'C:\\Users\\srich\\AppData\\Local\\Temp\\sr_core_ts\\textFile.txt';
    const { errmsg, toPath } = await file_rename(testTextFile, { ext: '.txt' });
    const actual = toPath;
    const aspect = 'rename to back to .txt';
    testResults_append(results, { method, actual, expected, aspect });
    testTextFile = toPath;
  }

  // file_copy textFile.txt to steveFile.txt
  {
    let toTextFile = path.join( path.dirname(testTextFile), 'steveFile.txt') ;
    const method = 'file_copy';
    const expected = '';
    const actual = await file_copy(testTextFile, toTextFile ) ;
    const aspect = 'copy textFile.txt to steveFile.txt';
    testResults_append(results, { method, actual, expected, aspect });
  }

  // check that steveFile.txt exists
  {
    let toTextFile = path.join(path.dirname(testTextFile), 'steveFile.txt');
    const method = 'file_exists';
    const aspect = 'check after copy' ;
    const expected = true;
    const actual = await file_exists( toTextFile);
    testResults_append(results, { method, actual, expected, aspect });
  }

  // file_readAllText
  {
    method = 'file_readAllText';
    const {text:actual} = await file_readAllText(testTextFile);
    const expected = 'tester.txt\nline 2\napp store';
    testResults_append(results, {method, actual, expected});
  }

  // make sure file abc.txt exists in testTempDir
  {
    method = 'file_ensureExists';
    let failText = '';
    let passText = '';
    const abcFile = path.join(tempTestDir, 'abc.txt');
    const { fileCreated } = await file_ensureExists( abcFile);
    passText = `file exists. ${abcFile}`;
    testResults_append(results, passText, failText, method);
  }

  // file_stat, file_utimes
  {

  }

  // read stats of the file.
  {
    method = 'file_stat' ;
    let failText = '';
    let passText = '';
    const abcFile = path.join(tempTestDir, 'abc.txt');
    const { stats, errmsg } = await file_stat(abcFile);
    if ( errmsg )
      failText = `file stats error. file ${abcFile} ${errmsg}`;
    else
      passText = `got file stats. ${abcFile}`;
    testResults_append(results, passText, failText, method);
  }

  // file_utimes
  {
    method = 'file_utimes';
    let aspect = '' ;
    let failText = '';
    let passText = '';
    const filePath = path.join(tempTestDir, 'abc.txt');
    const { stats, errmsg } = await file_stat(filePath);
    if ( !errmsg )
    {
      const { mtimeMs, atimeMs } = stats ;
      const mtime = Math.round(mtimeMs / 1000 ) - 5 ;
      const atime = Math.round( atimeMs / 1000) ;
      aspect = 'set utimes' ;
      const errmsg_utimes = await file_utimes( filePath, atime, mtime ) ;
      if (errmsg_utimes)
        failText = `file utimes error. file ${filePath} ${errmsg_utimes}`;
      else
        passText = `set file mtime. ${filePath}`;
      testResults_append(results, passText, failText, {method,aspect});

      // run stat to read back mtime. check that mtime matches the value it was set to.
      const { stats: after_stats, errmsg: stat_errmsg } = await file_stat(filePath);
      failText = '' ;
      passText = '' ;
      if ( stat_errmsg )
        failText = `file_stat error after file_utimes. ${filePath} ${stat_errmsg}`;
      else if ( after_stats.mtimeMs / 1000 != mtime )
        failText = `mtime does not match value it was changed to. ${filePath} mtime ${mtime}`;
      else
        passText = `mtime set correctly. ${filePath} mtime ${mtime}`;
      aspect = 'check utimes';
      testResults_append(results, passText, failText, {method, aspect});
    }

    if (errmsg)
      failText = `file stats error. file ${filePath} ${errmsg}`;
    else
      passText = `got file stats. ${filePath}`;
    testResults_append(results, passText, failText, method);
  }

  // resolve to file abc.txt in tempTestDir
  {
    method = 'file_resolve' ;
    const fileName = 'abc.txt' ;
    const dirPath = path.dirname( tempTestDir ) ;
    const actual = await file_resolve( dirPath, fileName ) ;
    const expected = path.join( tempTestDir, fileName ) ;
    testResults_append( results, { method, actual, expected});
  }

  // run unlink to delete the just created file in testTempDir
  {
    method = 'file_unlink';
    let failText = '';
    let passText = '';
    const abcFile = path.join(tempTestDir, 'abc.txt');
    const {errmsg} = await file_unlink(abcFile);
    if (errmsg.length == 0)
    {
      passText = `file deleted. ${abcFile}`;
    }
    else
    {
      failText = `delete file failed. ${abcFile} ${errmsg}`;
    }
    testResults_append(results, passText, failText, method);
  }

  return results ;
}

// ---------------------------------- primitive_file_test ----------------------------------
// test primitive file functions.  open, write, close.
async function primitive_file_test()
{
  let method = '';
  const tempTestDir = path.join(os.tmpdir(), 'sr_core_ts');
  const testTextFile = path.join(tempTestDir, 'primitive-textFile.txt');
  const results = testResults_new() ;

  // create directory /tmp/sr_core_ts 
  {
    const { created, errmsg } = await dir_ensureExists(tempTestDir);
    const {files} = await dir_readdir(tempTestDir);
    testResults_append( results, `create dir ${tempTestDir}`, errmsg ) ;
  }

  // open file for writing.
  let fd : number ;
  {
    const {fd:num, errmsg} = await file_open( testTextFile, 'w' ) ;
    fd = num;
    testResults_append(results, `open file for writing ${testTextFile}`, errmsg);
  }

  // write some text.
  let accumWriteText = '' ;
  {
    const writeText = `String literal types allow you to specify the exact value a string must have.`;
    method = 'file_writeText';
    const { errmsg } = await file_writeText(fd, writeText ) ;
    accumWriteText = writeText ;
    testResults_append(results, `write text to file ${testTextFile}`, errmsg, method);
  }

  // write some more text.
  {
    const writeText = ` In practice string literal types combine nicely`;
    method = 'file_writeText';
    const { errmsg } = await file_writeText(fd, writeText);
    accumWriteText += writeText;
    testResults_append(results, `write more text to file ${testTextFile}`, errmsg, method);
  }

  // close the file.
  {
    const { errmsg } = await file_close(fd);
    testResults_append(results, `close file ${testTextFile}`, errmsg);
  }

  // file_readAllText
  {
    method = 'file_readAllText';
    let { text: allText, errmsg } = await file_readAllText(testTextFile);
    if ( !errmsg && ( allText != accumWriteText ))
      errmsg = `read all text does not match write text ${accumWriteText}`;
    testResults_append( results, `readAllText match ${allText}`, errmsg, method );
  }

  // run unlink to delete the just created file in testTempDir
  {
    method = 'file_unlink';
    const { errmsg } = await file_unlink(testTextFile);
    testResults_append(results, `remove file ${testTextFile}`, errmsg, method);
  }

  return { results };
}

// ---------------------------------- system_test ----------------------------------
function system_test()
{
  const results = testResults_new();
  let method = '';

  // test the string_padLeft function.
  {
    method = 'system_downloadsFolder';
    let passText = '';
    let errmsg = '';
    const folder = system_downloadsFolder( ) ;
    if ( !folder )
      errmsg = `downloads folder is empty.`;
    else
      passText = `got downloads folder ${folder}.`;
    testResults_append(results, passText, errmsg, method);
  }

  return results;
}

