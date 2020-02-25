import { path_findFile } from '../src/core';

const folderPath = '/c:/github/tester' ;
const fileName = 'app.vue' ;
base_async(folderPath, fileName ) ;


async function base_async( folderPath:string, fileName:string )
{
  const { dirPath, remPath } = await path_findFile(folderPath, fileName ) ;
  console.log(`dirPath:${dirPath}  remPath:${remPath}`);
}
