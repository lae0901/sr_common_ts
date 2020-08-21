import {  file_open, file_close, file_writeText,
         file_isDir, dir_ensureExists, dir_mkdir, dir_readdir, 
          file_ensureExists, file_unlink,
          file_readAllText, file_writeNew, 
          path_joinUnix, path_toUnixPath, date_toEpoch, array_copyItems, array_compare, file_stat, file_utimes, path_splitRootPath, path_toBaseNameArray, path_fromBaseNameArray } from './core';
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

// run main function that is declared as async. 
async_main( ) ;

if ( false )
{
  const cwdOSRoot = path.parse(process.cwd()).root;
  const fileOSRoot = path.parse(__dirname).root;
  console.log(`os root:${cwdOSRoot}  fileRoot:${fileOSRoot}`);

  base_async(folderPath, fileName);
}

if ( false )
{
  // temporary directory. make sure does not exist.
  const tempDir = os.tmpdir();
  const testDir = path.join(tempDir, 'core_ts');
  try
  {
    fs.rmdirSync(testDir, { recursive: true });
  }
  catch (e)
  {
  }

  runTest( testDir ) ;
}

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

  testResults_consoleLog( results ) ;
}

// ---------------------------------- array_test ----------------------------------
function array_test()
{
  const results = testResults_new();
  let method = '';

  // test the array_copyItems function.
  {
    method = 'array_copyItems';
    let passText = '';
    let errmsg = '';
    const arr = ['123', 'array', 53, 'test', 'babel'];
    const expected = [53, 'test', 'babel'];
    const toArr = array_copyItems(arr, 2, 4);
    const cr = array_compare(expected, toArr) ;
    if (cr != 0)
      errmsg = `copy array error. ${toArr}. expected ${expected}`;
    else
      passText = `correct result. ${toArr}.`;
    testResults_append(results, passText, errmsg, method);
  }

  return results;
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

// ----------------------------- dir_readDirDeep_test -----------------------------
async function dir_readDirDeep_test()
{
  const dirPath = `c:\\github\\defn`;
  const options = { ignoreDir: ['node_modules', 'git', '.git'], containsFile:['common','file-explorer'] };
  const dirPathNames = await dir_readDirDeep(dirPath, options );
  for( const dirPath of dirPathNames )
  {
    console.log(`${dirPath}`);
  }
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
    let passText = '';
    let errmsg = '';
    const dirPath = '\\home\\srichter';
    const fileName = 'test.pdf';
    const expected = '/home/srichter/test.pdf';
    const unixPath = path_joinUnix( path_toUnixPath(dirPath), fileName );
    if (unixPath != expected)
      errmsg = `incorrect result. ${unixPath}. expected ${expected}`;
    else
      passText = `correct result. ${unixPath}.`;
    testResults_append(results, passText, errmsg, method);
  }

  // path_splitRootPath.
  {
    method = 'path_splitRootPath';
    let passText = '';
    let errmsg = '';
    const fullPath = '/web/home/srichter/gcc/abc.pdf';
    const rootPath = '/web/home';
    const expected = 'srichter/gcc/abc.pdf';
    let remPath = path_splitRootPath( fullPath, rootPath );
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

// ---------------------------------- string_test ----------------------------------
function string_test( )
{
  const results = testResults_new( ) ;
  let method = '' ;

  // test the string_padLeft function.
  {
    method = 'string_padLeft' ;
    let passText = '' ;
    let errmsg = '' ;
    const text = '123' ;
    const expected = '0000123' ;
    const paddedText = string_padLeft(text, 7, '0') ;
    if ( paddedText != expected)
      errmsg = `incorrect result. ${paddedText}. expected ${expected}`;
    else 
      passText = `correct result. ${paddedText}.`;
    testResults_append(results, passText, errmsg, method);
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
    let passText = '';
    let errmsg = '';
    const dt = new Date(1595273994 * 1000) ;
    const expected = 1595273994;
    const epoch = date_toEpoch(dt);
    if (epoch != expected)
      errmsg = `incorrect result. ${epoch}. expected ${expected}`;
    else
      passText = `correct result. epoch ${epoch}.`;
    testResults_append(results, passText, errmsg, method);
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
  const testTextFile = path.join(tempTestDir, 'textFile.txt');
  const textContents = 'tester.txt\nline 2\napp store' ;
  {
    method = 'file_writeNew';
    await file_writeNew(testTextFile, textContents) ;
    let passText = `write text ${textContents}`;
    testResults_append(results, passText, '', method);
  }

  // file_readAllText
  {
    method = 'file_readAllText';
    const {text} = await file_readAllText(testTextFile);
    let failText = '' ;
    let passText = '' ;
    if ( text == textContents )
    {
      passText = `text read ${text}`;
    }
    else
    {
      failText = `read text failed. ${text}`;
    }
    testResults_append(results, passText, failText, method);
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

