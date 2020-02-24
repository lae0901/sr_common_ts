# common typescript modules
* rxp - regular expression constants
* core.ts - contains series of string_ and scan_ functions.

## usage
```
import { dir_mkdir, string_tail, string_contains } from 'sr_core_ts';

```

## directory methods
* {isDir, errmsg} = file_isDir(path)

## publish instructions
* increment version number in package.json
* npm run build
* git push to repo
* npm publish
* npm update in projects which use this package
