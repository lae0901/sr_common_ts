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

## string methods
* string_dequote( str )
* string_head( str, lx)
* string_isQuoted( str )
* string_matchGeneric( str: string, pattern: string ) : boolean
* string_replaceAll( str, find, replace)
* string_startsWith( str, text | string[])
* string_substrLenient( str, bx, lx )

## regular expression methods
* regexPattern_toFragments( pattern: string) : regexFrag_interface[]

## publish instructions
* increment version number in package.json
* npm run build
* git add, commit, push to repo
* npm publish
* npm update in projects which use this package

## testing 
* press F5 to run task "launch hello.ts"
* this task runs npm build. then calls src/tester.ts
* see the outfiles property to see that lib/tester.js is actually run
