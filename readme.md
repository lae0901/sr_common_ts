# common typescript modules
* rxp - regular expression constants
* core.ts - contains series of string_ and scan_ functions.

## usage
```
import { dir_mkdir, string_tail, string_contains } from 'sr_core_ts';

```

## array methods
* array_compareEqual<T>( arr1, arr2 )
* toarr = array_copyItems( arr, start, length )
* array_findAndSplice( arr, predicate )
* array_front<T>( arr: T[] ) : T | null
* boolean = stringArray_contains( arr, text )

## object methods
* any_toString( val )
* object_apply( obj1, obj2 )
* const isEqual = object_compareEqual( obj1, obj2 )

## directory methods
* {isDir, errmsg} = file_isDir(path)
* boolean = dir_containsFile( dirPath, fileNameArr )
* string[] = dir_readDirDeep(dirPath, {ignoreDir, containsFile, includeRoot, containsHaltDeep, containsMaxDepth })
* {errmsg} = await dir_rmdir( dirPath, {recursive})

## file methods
* { errmsg } = await file_close( fd ) ;
* errmsg = await file_copy( source, dest ) ;
* { fileCreated } = await file_ensureExists(filePath) ;
* { fd, errmsg } = await file_open( filePath, flags ) ;
* {text,errmsg} = await file_readAllText(filePath) ;
* {data,errmsg} = await file_readFile(filePath) ;
* {toPath,errmsg} = await file_rename( oldPath, {ext,path,dirPath, baseNameNoExt, baseName});
* filePath = await file_resolve( dirPath, fileName ) ;
* {errmsg} = await file_unlink( filePath ) ;
* { errmsg } = await file_writeText( fd, text ) ;
* errmsg = await file_utimes( filePath, atime, utime ) ;

## path methods
* path_findFile( dirPath: string, fileName: string ) : Promise<{dirPath,remPath}> 
* toPath = path_fromBaseNameArray( arr: string[] )
* path_joinUnix( path1: string, path2: string ) : string
* toPath = path_rename( oldPath, {ext,path,dirPath, baseNameNoExt, baseName})
* path_splitFront( path: string, sep: string = '/' ) : {front: string, rem:string }
* remPath = path_splitRootPath( inPath: string, rootPath: string )
* arr = path_toBaseNameArray( path: string )
* path_toUnixPath( path: string ) : string

## string methods
* {found_char, found_index } = scan_charEqAny(text,start,pattern)
* string_assignSubstr( str, start, length, vlu ) : string
* string_dequote( str )
* text = string_enquote( str, quoteChar )
* string_head( str, lx)
* string_isQuoted( str )
* string_matchGeneric( str: string, pattern: string ) : boolean
* text = string_padLeft(text, length, pad) ;
* text = string_padRight(text, length, pad) ;
* string_replaceAll( str, find, replace)
* words = string_splitWords( str ) ;
* string_startsWith( str, text | string[])
* string_substrLenient( str, bx, lx )

## date methods
* epoch = date_toEpoch( Date )
* dt = date_fromISO('2020-05-15', '14:22:15')
* text = date_toISO( dt )

## regular expression methods
* regexPattern_toFragments( pattern: string) : regexFrag_interface[]

## print methods
* openTextLinesInBrowser( textStream, filePath, isMarkdown )

## system methods
* system_downloadsFolder( ) : string

## publish instructions
* increment version number in package.json
* make sure new functions are exported from core.ts
* update README.md to document new function or feature
* npm run build
* npm run test
* git add, commit, push to repo
* npm publish
* npm update in projects which use this package

## testing 
* npm run test
* or press F5, run task "run tester"
