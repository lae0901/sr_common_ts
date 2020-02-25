import { file_isDir, dir_ensureExists, dir_mkdir } from './core';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { path_findFile } from './core';

const folderPath = '/c:/github/tester';
const fileName = 'app.vue';
base_async(folderPath, fileName);

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


