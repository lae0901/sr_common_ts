# common typescript modules
* rxp - regular expression constants
* core.ts - contains series of string_ and scan_ functions.

## usage
```
import { dir_mkdir, string_tail, string_contains } from 'sr_core_ts';

```

## array methods
* array_front<T>( arr: T[] ) : T | null

## directory methods
* {isDir, errmsg} = file_isDir(path)

## path methods
* path_findFile( dirPath: string, fileName: string ) : Promise<{dirPath,remPath}> 
* path_splitFront( path: string, sep: string = '/' ) : {front: string, rem:string }

## publish instructions
* increment version number in package.json
* npm run build
* git push to repo
* npm publish
* npm update in projects which use this package
