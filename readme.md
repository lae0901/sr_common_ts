# common typescript modules
* rxp - regular expression constants
* core.ts - contains series of str_ and scan_ functions.

## usage
```
import { dir_mkdir, str_tail, str_contains } from 'sr_core_ts';

```

## array methods
* arr_compareEqual<T>( arr1, arr2 )
* toarr = arr_copyItems( arr, start, length )
* arr_findAndSplice( arr, predicate )
* arr_front<T>( arr: T[] ) : T | null
* boolean = strArr_contains( arr, text )

## object methods
* any_toString( val )
* obj_apply( obj1, obj2 )
* const isEqual = obj_compareEqual( obj1, obj2 )

## directory methods
* {isDir, errmsg} = file_isDir(path)
* boolean = dir_containsItem( dirPath, itemNameArr )
* string[] = dir_readDirDeep(dirPath, {ignoreDir, containsItem, includeRoot, containsHaltDeep, containsMaxDepth })
* {errmsg} = await dir_rmdir( dirPath, {recursive})
* fileName = await dir_firstFile( dirPath, regexpPattern )

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

## scan methods

`scan_unquotedPattern` - scan for pattern outside of quoted text. 

Primary use is when scanning for control character in text of a statement. But skip when that control character is within quotes in the statement. 

```
{index, text} = scan_unquotedPattern( text, bx, pattern )
```

```
const scanText = `repeating match hit will "<div>" check for < div> the next or`;
const { index, text } = scan_unquotedPattern( scanText, 0, '<\\s*div\\s*>');
```

## string methods
* {found_char, found_index } = scan_charEqAny(text,start,pattern)
* str_assignSubstr( str, start, length, vlu ) : string
* str_dequote( str )
* text = str_enquote( str, quoteChar )
* str_head( str, lx)
* str_isQuoted( str )
* str_matchGeneric( str: string, pattern: string ) : boolean
* randomText = str_random( length ) 
* text = str_padLeft(text, length, pad) ;
* text = str_padRight(text, length, pad) ;
* str_replaceAll( str, find, replace)
* str_startsWith( str, text | string[])
* str_substrLenient( str, bx, lx )
* distinctArr = strArr_toDistinct( arr )
* distinctArr = strArr_toDistinctAndSorted( arr )

## string words methods

`words = str_splitWords( str )`

Split string into array of words. Each word stores the text of the word, the delimeter, start position, whether there is whitespace before or after the word.  Each word object implements the `iStringWord` interface.

`words = str_splitWhitespaceWords( str )`

Split string into array of words, where the words are split on whitespace only.

`word = strWords_wordAtPosition( words, pos )`

Using the input array of `iStringWord` words returned by `str_splitWords`, return the word that is found at the specified position.

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
