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
* { errmsg } = await file_close( fd ) ;
* { fileCreated } = await file_ensureExists(filePath) ;
* { fd, errmsg } = await file_open( filePath, flags ) ;
* {text,errmsg} = await file_readAllText(filePath) ;
* {data,errmsg} = await file_readFile(filePath) ;
* {errmsg} = await file_unlink( filePath ) ;
* { errmsg } = await file_writeText( fd, text ) ;

## path methods
* path_findFile( dirPath: string, fileName: string ) : Promise<{dirPath,remPath}> 
* path_joinUnix( path1: string, path2: string ) : string
* path_splitFront( path: string, sep: string = '/' ) : {front: string, rem:string }
* path_toUnixPath( path: string ) : string

## string methods
* string_dequote( str )
* text = string_enquote( str, quoteChar )
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

## system methods
* system_downloadsFolder( ) : string

## publish instructions
* increment version number in package.json
* make sure new functions are exported from core.ts
* npm run build
* npm run test
* git add, commit, push to repo
* npm publish
* npm update in projects which use this package

## testing 
* npm run test
* or press F5, run task "run tester"
