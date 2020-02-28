import { file_isDir, dir_ensureExists, dir_mkdir } from './core';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { path_findFile, path_parts } from './core';

const folderPath = '/c:/github/tester';
const fileName = 'app.vue';

{
  const path1 = `file:///c:/web/pwa/dark-sky/demo/steve.txt`;  
  const parts = path_parts(path1) ;
  console.table(parts) ;
}

{
  const path1 = `/web/pwa/dark-sky/demo/steve.txt`;
  const parts = path_parts(path1);
  console.table(parts);
}

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
  const path1 = `c:/web/pwa/dark-sky/demo/steve.txt`;
  const parts = path_parts(path1);
  const { dirPath, remPath } = await path_findFile(path1, 'package.json');
  console.log(`dirPath:${dirPath} remPath:${remPath}`);
}