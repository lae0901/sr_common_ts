import {  file_open, file_close, file_writeText,
         file_isDir, dir_ensureExists, dir_mkdir, dir_readdir, 
          file_ensureExists, file_unlink,
          file_readAllText, file_writeNew, path_toUnixPath } from './core';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { string_enquote, string_padLeft, string_padRight, 
        path_findFile, path_parts, rxp, dir_readDirDeep } from './core';
import {testResults_append, testResults_consoleLog, testResults_new } from 'sr_test_framework';

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

  // path_test
  {
    const res = path_test();
    results.push(...res);
  }

  // file_test
  {
    const { errmsg_arr, completion_arr } = await file_test();
    for (const line of completion_arr)
    {
      console.log(line);
    }

    for (const line of errmsg_arr)
    {
      console.error(line);
    }
  }

  // primitive file test. create a file, write some text to it, close, then read
  // entire contents and match against what was written.
  {
    const { results:res } = await primitive_file_test() ;
    results.push(...res) ;
  }

  testResults_consoleLog( results ) ;
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

  return results ;
}

// ---------------------------------- file_test ----------------------------------
async function file_test()
{
  const errmsg_arr: string[] = [];
  const completion_arr: string[] = [];
  let method = '';
  const tempTestDir = path.join( os.tmpdir( ), 'sr_core_ts') ;

  // create directory /tmp/sr_core_ts 
  {
    const { created, errmsg } = await dir_ensureExists(tempTestDir);
    const {files} = await dir_readdir(tempTestDir) ;
    completion_arr.push(`create dir ${tempTestDir}. passed.`);
  }

  // file_writeNew
  const testTextFile = path.join(tempTestDir, 'textFile.txt');
  const textContents = 'tester.txt\nline 2\napp store' ;
  {
    method = 'file_writeNew';
    await file_writeNew(testTextFile, textContents) ;
    completion_arr.push(`${method}. passed.`);
  }

  // file_readAllText
  {
    method = 'file_readAllText';
    const {text} = await file_readAllText(testTextFile);
    if ( text == textContents )
    {
      completion_arr.push(`${method}. passed. ${text}`);
    }
    else
    {
      errmsg_arr.push(`${method} test failed. ${text}`);
    }
  }

  // make sure file abc.txt exists in testTempDir
  {
    method = 'file_ensureExists';
    const abcFile = path.join(tempTestDir, 'abc.txt');
    const { fileCreated } = await file_ensureExists( abcFile);
    completion_arr.push(`${method}. passed. ${abcFile}`);
  }

  // run unlink to delete the just created file in testTempDir
  {
    method = 'file_unlink';
    const abcFile = path.join(tempTestDir, 'abc.txt');
    const {errmsg} = await file_unlink(abcFile);
    if (errmsg.length == 0)
    {
      completion_arr.push(`${method}. passed. ${abcFile}`);
    }
    else
    {
      errmsg_arr.push(`${method} test failed. ${abcFile} ${errmsg}`);
    }
  }

  return { errmsg_arr, completion_arr };
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

