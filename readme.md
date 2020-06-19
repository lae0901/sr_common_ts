# common typescript modules
* rxp - regular expression constants
* core.ts - contains series of string_ and scan_ functions.

## usage
```
import { dir_mkdir, string_tail, string_contains } from 'sr_core_ts';

```

## array methods
* array_front<T>( arr: T[] ) : T | null
* boolean = stringArray_contains( arr, text )

## directory methods
* {isDir, errmsg} = file_isDir(path)
* boolean = dir_containsFile( dirPath, fileNameArr )
* string[] = dir_readDirDeep(dirPath, {ignoreDir, containsFile})

## file methods
* {data,errmsg} = await file_readFile(filePath) ;
* {text,errmsg} = await file_readText(filePath) ;

## path methods
* path_findFile( dirPath: string, fileName: string ) : Promise<{dirPath,remPath}> 
* path_splitFront( path: string, sep: string = '/' ) : {front: string, rem:string }

## string methods
* string_dequote( str )
* string_head( str, lx)
* string_isQuoted( str )
* string_matchGeneric( str: string, pattern: string ) : boolean
* text = string_padLeft(text, length, pad) ;
* text = string_padRight(text, length, pad) ;
* string_replaceAll( str, find, replace)
* string_startsWith( str, text | string[])
* string_substrLenient( str, bx, lx )

## regular expression methods
* regexPattern_toFragments( pattern: string) : regexFrag_interface[]

## publish instructions
* increment version number in package.json
* npm run build
* npm run test
* git add, commit, push to repo
* npm publish
* npm update in projects which use this package

## testing 
* npm run test
* or press F5, run task "run tester"
