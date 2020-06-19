import { file_isDir, dir_ensureExists, dir_mkdir, dir_readdir, 
          file_readText, file_writeNew } from './core';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
// import { path_findFile, path_parts, rxp, regexPattern_toFragments } from './core';
import { string_padLeft, string_padRight, 
        path_findFile, path_parts, rxp, dir_readDirDeep } from './core';

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
  // string_test
  {
    const { errmsg_arr, completion_arr } = await string_test() ;
    for( const line of completion_arr )
    {
      console.log(line) ;
    }

    for (const line of errmsg_arr)
    {
      console.error(line);
    }
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

  return ;

  await dir_readDirDeep_test( ) ;
  return ;

  regex_listFragments();

  const path1 = `c:/web/pwa/dark-sky/demo/src/steve.txt`;
  const parts = path_parts(path1);
  const { dirPath, remPath } = await path_findFile(path1, 'package.json');
  console.log(`dirPath:${dirPath} remPath:${remPath}`);
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

// ---------------------------------- string_test ----------------------------------
async function string_test( )
{
  const errmsg_arr : string[] = [] ;
  const completion_arr : string[] = [] ;
  let method = '' ;

  // test the string_padLeft function.
  {
    method = 'string_padLeft' ;
    const text = '123' ;
    const paddedText = string_padLeft(text, 7, '0') ;
    if ( paddedText != '0000123')
      errmsg_arr.push(`${method} test failed. ${paddedText}`);
    else 
      completion_arr.push(`${method}. passed.`)
  }

  // test the string_padRight function.
  {
    method = 'string_padRight';
    const text = '123';
    const paddedText = string_padRight(text, 7, '0');
    if (paddedText != '1230000')
      errmsg_arr.push(`${method} test failed. ${paddedText}`);
    else
      completion_arr.push(`${method}. passed.`)
  }  

  return {errmsg_arr, completion_arr};
}

// ---------------------------------- file_test ----------------------------------
async function file_test()
{
  const errmsg_arr: string[] = [];
  const completion_arr: string[] = [];
  let method = '';
  const testDir = path.join( os.tmpdir( ), 'sr_core_ts') ;

  // create directory /tmp/sr_core_ts 
  {
    const { created, errmsg } = await dir_ensureExists(testDir);
    const files = await dir_readdir(testDir) ;
    completion_arr.push(`create dir ${testDir}. passed.`);
  }

  // file_writeNew
  const testTextFile = path.join(testDir, 'textFile.txt');
  const textContents = 'tester.txt\nline 2\napp store' ;
  {
    method = 'file_writeNew';
    await file_writeNew(testTextFile, textContents) ;
    completion_arr.push(`${method}. passed.`);
  }

  // file_readText
  {
    method = 'file_readText';
    const {text} = await file_readText(testTextFile);
    if ( text == textContents )
    {
      completion_arr.push(`${method}. passed. ${text}`);
    }
    else
    {
      errmsg_arr.push(`${method} test failed. ${text}`);
    }
  }

  return { errmsg_arr, completion_arr };
}

