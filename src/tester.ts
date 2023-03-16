import {  
          date_toEpoch, date_fromISO,
          arr_copyItems, arr_compareEqual, 
          date_toISO, 
          obj_compareEqual, obj_apply, obj_propertyMatch,
          arr_findAndSplice, any_toString, 
          str_splitWords, 
          str_random, strArr_toDistinctAndSorted, 
          strWords_wordAtPosition, 
          iStringWord,
          strArr_toDistinct,
          obj_properties,
          str_splitWhitespaceWords,
          scan_unquotedPattern,
          str_substrLenient,
          uint8Arr_toString,
          uint8Arr_toHexString,
          uint8Arr_fromArrayObject,
          uint8Arr_join,
          str_replaceAt,
        } from './core';
import { str_assignSubstr, str_enquote, str_padLeft, str_padRight, 
        rxp, 
      } from './core';
import {testResults_consoleLog, 
        testResults_new } from 'sr_test_framework';
import {testResults_append} from './test-result';
          

const folderPath = '/c:/github/tester';
const fileName = 'app.vue';

{
  const path1 = `file:///c:/web/pwa/dark-sky/demo/steve.txt`;  
  // const parts = path_parts(path1) ;
}

{
  const path1 = `/web/pwa/dark-sky/demo/steve.txt`;
  // const parts = path_parts(path1);
}

regex_orDemo( ) ;

// run main function that is declared as async. 
async_main( ) ;

async function runTest( testDir:string )
{
  let wasDeleted = false;
  // const { created, errmsg } = await dir_ensureExists(testDir);
}

// async function base_async(folderPath: string, fileName: string)
// {
//   const { dirPath, remPath } = await path_findFile(folderPath, fileName);
//   console.log(`dirPath:${dirPath}  remPath:${remPath}`);
// }

// ------------------------------- async_main ---------------------------------
async function async_main( )
{
  const results = testResults_new( ) ;

  // str_test
  {
    const res = str_test() ;
    results.push( ...res ) ;
  }

  // strWords_test
  {
    const res = strWords_test();
    results.push(...res);
  }

  // arr_test
  {
    const res = arr_test();
    results.push(...res);
  }

  // date_test
  {
    const res = date_test();
    results.push(...res);
  }

  // // dir_test
  // {
  //   const res = await dir_test();
  //   results.push(...res);
  // }

  // // file_test
  // {
  //   const res = await file_test();
  //   results.push(...res);
  // }

  // // path_test
  // {
  //   const res = path_test();
  //   results.push(...res);
  // }

  // scan_test
  {
    const res = scan_test();
    results.push(...res);
  }

  // // primitive file test. create a file, write some text to it, close, then read
  // // entire contents and match against what was written.
  // {
  //   const { results:res } = await primitive_file_test() ;
  //   results.push(...res) ;
  // }

  // // system_test
  // {
  //   const res = system_test();
  //   results.push(...res);
  // }

  // obj_test
  {
    const res = obj_test();
    results.push(...res);
  }

  // any_test
  {
    const res = any_test( ) ;
    results.push(...res);
  }

  // uint8Arr
  {
    const res = uint8Arr_test();
    results.push(...res);
  }

  await testResults_consoleLog( results ) ;
}

// ----------------------------------- any_test -----------------------------------
function any_test( )
{
  const results = testResults_new();
  let method = '';
  const category = 'any_ methods';

  // test the arr_copyItems function.
  {
    method = 'any_toString';
    const val = {name:'bob', salary:252.33 } ;
    const expected = '{name:bob, salary:252.33}';
    const actual = any_toString(val) ;
    const desc = 'object to string';
    testResults_append(results, { category, expected, actual, desc, method });
  }

  return results ;
}

// ---------------------------------- arr_test ----------------------------------
function arr_test()
{
  const results = testResults_new();
  let method = '';
  const category = 'array' ;

  // test the arr_copyItems function.
  {
    method = 'arr_copyItems';
    const arr = ['123', 'array', 53, 'test', 'babel'];
    const expected = [53, 'test', 'babel'];
    const actual = arr_copyItems(arr, 2, 4);
    const desc = 'copy array items';
    testResults_append( results, {category, expected, actual, desc, method});
  }

  // test the arr_copyItems function.
  {
    method = 'arr_findAndSplice';
    const arr = ['123', 'array', 53, 'test', 'babel'];
    const expected = [ '123', 53, 'test', 'babel'];
    const spliced = arr_findAndSplice(arr, (item) =>
    {
      return item == 'array' ;
    });
    
    const desc = 'find and remove item from array';
    testResults_append(results, { category, expected, actual:arr, desc, method });
  }

  // test the arr_compareEqual function. arrays are equal.
  {
    method = 'arr_compareEqual';
    const aspect = 'arrays are equal';
    const arr1 = ['123', 'array', 53, {age:25, name:'abc'}, ['22', 89, 'jack'], 'test', 'babel'];
    const arr2 = ['123', 'array', 53, {age:25, name:'abc'}, ['22', 89, 'jack'], 'test', 'babel'];
    const expected = true;
    const actual = arr_compareEqual( arr1, arr2 ) ;
    const desc = 'compare arrays for equality';
    testResults_append(results, { category, expected, actual, desc, method, aspect });
  }

  // test the arr_compareEqual function. arrays not equal.
  {
    method = 'arr_compareEqual';
    const aspect = 'arrays not equal';
    const arr1 = ['123', 'array', 53, { age: 25, name: 'abc' }, ['22', 89, 'jack'], 'test', 'babel'];
    const arr2 = ['123', 'array', 53, { age: 27, name: 'abc' }, ['22', 89, 'jack'], 'test', 'babel'];
    const expected = false;
    const actual = arr_compareEqual(arr1, arr2);
    const desc = 'compare arrays for equality';
    testResults_append(results, { category, expected, actual, desc, method, aspect });
  }

  return results;
}

function regex_orDemo( )
{
  let errmsg = '' ;
  
  {
    const regex = /(\s*)((<\/)|({{)|(}})|(<[\w]))/g;
    const text = '    <sp}}an>{{customer}}</span>';
    regex.lastIndex = 1;
    const match = regex.exec(text) ;
    if ( match )
    {
      const closeBraces = match[1] ;
      const openBraces = match[2] ;
      if ( closeBraces )
        console.log(`close braces found at position ${match.index}`);
      if (openBraces)
        console.log(`open braces found at position ${match.index}`);
    }
  }

  {
    const text = `  <td @click="travItem_setEdit(item, rowIndex, 'TRIPNAME');"><span>{{item.TRIPNAME}}</span></td>`
    let bx = 60;

    const dummy = str_substrLenient(text, bx, 20);
    console.log(text);
    const regex = /(\s*)((<\/)|({{)|(<)([.]))/g;
    regex.lastIndex = bx;
    const match = regex.exec(text);

    if (match)
    {
      console.log(`found pattern ${str_substrLenient(text, match.index, 20)} position:${match.index}`);
      console.log(`start scan ${bx}  text:${dummy}`);
    }
  }

}

// --------------------------------- regex_listFragments ------------------------
// split a regex pattern into fragments.  Then list those fragments to console.
function regex_listFragments()
{
  const pattern = rxp.comment ;
  // const frags = regexPattern_toFragments(pattern) ;
  // for( const frag of frags )
  // {
  //   console.log( `frag name:${frag.name}  text:${frag.text}`);
  // }
}

// ---------------------------------- obj_test ----------------------------------
function obj_test()
{
  const results = testResults_new();
  let method = '';
  const category = 'object';

  // test the obj_compareEqual function.
  {
    method = 'obj_compareEqual';
    const obj1 = { names: ['123', 'array'], age: 53, textLines:['test', 'babel']};
    const obj2 = { names: ['123', 'array'], age: 53, textLines:['test', 'babel']};
    const expected = true;
    const actual = obj_compareEqual( obj1, obj2);
    const desc = 'compare object equality';
    const aspect = 'objects match' ;
    testResults_append(results, { category, expected, actual, desc, method, aspect });
  }

  // test the obj_compareEqual function.
  {
    method = 'obj_compareEqual';
    const obj1 = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'] };
    const obj2 = { names: ['123', 'array'], textLines: ['test', 'babel'] };
    const expected = false;
    const actual = obj_compareEqual(obj1, obj2);
    const desc = 'compare object equality';
    const aspect = 'objects do not match';
    testResults_append(results, { category, expected, actual, desc, method, aspect });
  }

  // obj_apply.
  {
    method = 'obj_apply';
    const obj1 = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'] };
    const obj2 = { addr1: 'one bank street', city:'rockaway' };
    obj_apply( obj1, obj2 ) ;
    const expected_obj = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'],
                       addr1: 'one bank street', city: 'rockaway' };
    const expected = true ;
    const actual = obj_compareEqual(obj1, expected_obj);
    const desc = 'apply properties to object';
    testResults_append(results, { category, expected, actual, desc, method });
  }
  
  // obj_propertyMatch.
  {
    method = 'obj_propertyMatch';
    const obj1 = { age: 53, textLines: ['test', 'babel'] };
    const obj2 = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'] };
    const actual = obj_propertyMatch( obj1, obj2 ) ;
    const expected = true ;
    testResults_append(results, { actual, expected, category, method });
  }
  
  // obj_propertyMatch.
  {
    method = 'obj_propertyMatch';
    const aspect = 'property missing from obj2';
    const obj1 = { age: 53, weight:153, textLines: ['test', 'babel'] };
    const obj2 = { names: ['123', 'array'], age: 53, textLines: ['test', 'babel'] };
    const actual = obj_propertyMatch( obj1, obj2 ) ;
    const expected = false ;
    testResults_append(results, { actual, expected, category, method, aspect });
  }

  return results;
}

// ----------------------------------- scan_test -----------------------------------
function scan_test( )
{
  const results = testResults_new();

  // scan_unquotedPattern
  {
    const scanText = `repeating match hit will "<div>" check for < div> the next or`;
    const method = 'scan_unquotedPattern';
    const expected = {index:43, text:'< div>'};
    const actual = scan_unquotedPattern( scanText, 0, '<\\s*div\\s*>');
    testResults_append(results, { method, expected, actual });
  }

  return results;
}

// ---------------------------------- strWords_test ----------------------------------
function strWords_test()
{
  const results = testResults_new();

  // str_splitWords
  {
    const method = 'str_splitWords';
    const text = ` : call str_split( arg1, 25 )`;
    const actual = str_splitWords(text).map((item) =>
    {
      const { text, delim } = item;
      return { text, delim };
    });
    const expected = [{text:'', delim:':'},  { text: 'call', delim: '' }, 
    { text: 'str_split', delim: '(' },
    { text: 'arg1', delim: ',' }, { text: '25', delim: ')' }];
    testResults_append(results, { method, actual, expected });
  }

  // strWords_wordAtPosition
  {
    const method = 'strWords_wordAtPosition' ;
    const text = ` call str_split( arg1, 25 )`;
    const words = str_splitWords(text) ;
    const {found} = strWords_wordAtPosition( words, 7 ) ;
    const actual = obj_properties( found, ['bx', 'text', 'delim'] );
    const expected = { bx:6, text:'str_split', delim:'(' } ;
    testResults_append(results, { method, actual, expected });
  }

  // str_splitWhitespaceWords
  {
    const method = 'str_splitWhitespaceWords';
    const text = ` : call :steve_split( arg1, 25 )`;
    const rv = str_splitWhitespaceWords(text);
    const actual = { numItems:rv.length, thirdWord: rv[2].text  };
    const expected = {numItems:6, thirdWord:':steve_split('};
    testResults_append(results, { method, actual, expected });
  }

  return results;
}


// ---------------------------------- str_test ----------------------------------
function str_test( )
{
  const category = 'str';
  const results = testResults_new( ) ;
  let method = '' ;

  // test the str_padLeft function.
  {
    method = 'str_padLeft' ;
    const text = '123' ;
    const expected = '0000123' ;
    const actual = str_padLeft(text, 7, '0') ;
    testResults_append(results, {method, expected, actual});
  }

  // test the str_padRight function.
  {
    method = 'str_padRight';
    const text = '123';
    const expected = '1230000';
    const actual = str_padRight(text, 7, '0');
    testResults_append(results, {method, expected, actual});
  }

  // generate string of random characters. 
  {
    method = 'str_random';
    const expected = 8;
    const text = str_random( 8 ) ;
    const actual = text.length ;
    testResults_append(results, { method, expected, actual });
  }

  // enquote string. simple.
  {
    method = 'str_enquote';
    const text = 'srcFiles' ;
    const expected = '"srcFiles"';
    const actual = str_enquote(text, '"');
    testResults_append(results, {expected, actual, method});
  }

  // enquote string. string contains backslash characters, quote characters.
  {
    method = 'str_enquote';
    const text = 'src"Fi\\les';
    const expected = '"src\\\"Fi\\\\les"';
    const actual = str_enquote(text, '"');
    testResults_append(results, {expected, actual, method});
  }

  // str_assignSubstr
  {
    method = 'str_assignSubstr';
    const text = 'src"Fi\\les';
    const expected = 'srcToshles';
    const actual = str_assignSubstr(text, 3, 4, 'Tosh');
    testResults_append(results, {expected, actual, method});
  }

  // strArr_toDistinctAndSorted
  {
    method = 'strArr_toDistinctAndSorted' ;
    const inputArr = ['Joe', 'Sue', 'Bob', 'Joe'];
    const actual = strArr_toDistinctAndSorted( inputArr ) ;
    const expected = ['Bob', 'Joe', 'Sue'];
    testResults_append( results, {method, actual, expected});
  }

  // strArr_toDistinct
  {
    method = 'strArr_toDistinct';
    const inputArr = ['Joe', 'acwww', 'Sue', 'Bob', 'acwww', 'Joe'];
    const actual = strArr_toDistinct(inputArr);
    const expected = ['Joe', 'acwww', 'Sue', 'Bob'];
    testResults_append(results, { method, actual, expected });
  }

  // str_replaceAt
  {
    method = 'str_replaceAt';
    const inText = 'autocoder_telnet';
    const actual = str_replaceAt(inText, 5, 3, 'README');
    const expected = 'autocREADMEr_telnet';
    testResults_append(results, { method, actual, expected, category });
  }

  // str_replaceAt. aspect: replace to end of string
  {
    method = 'str_replaceAt';
    const aspect = 'replace to end';
    const inText = 'autocoder_telnet';
    const actual = str_replaceAt(inText, 14, -1, 'README');
    const expected = 'autocoder_telnREADME';
    testResults_append(results, { method, actual, expected, category, aspect });
  }


  return results ;
}

// ---------------------------------- date_test ----------------------------------
function date_test()
{
  const results = testResults_new();
  let method = '';

  // test the date_toEpoch function.
  {
    method = 'date_toEpoch';
    const desc = `convert date to epoch`;
    const dt = new Date(1595273994 * 1000) ;
    const expected = 1595273994;
    const actual = date_toEpoch(dt);
    testResults_append(results, {method, expected, actual, desc }) ;
  }

  {
    method = 'date_fromISO';
    const iso_date = '2019-02-15';
    const iso_time = '15:25:18';
    const desc = `ISO date and time ${iso_date} ${iso_time} to Date object`;
    const dt = date_fromISO(iso_date, iso_time) ;
    const mtime = date_toEpoch(dt) ;
    const expected = 1550262318 ;
    const actual = mtime ;
    testResults_append(results, { method, expected, actual, desc });
  }

  {
    method = 'date_toISO';
    const desc = `convert date to ISO form`;
    const dt = new Date(2020,4,22) ;
    const expected = '2020-05-22';
    const actual = date_toISO( dt ) ;
    testResults_append(results, { method, expected, actual, desc });
  }

  return results;
}

// ---------------------------------- uint8Arr_test ----------------------------------
function uint8Arr_test()
{
  const results = testResults_new();
  const category = 'uint8Arr';

  // uint8Arr_toString
  {
    const method = 'uint8Arr_toString';
    const buf = new Uint8Array([255,250,39,1,3,73]);
    const expected = '255 250 39 1 3 73';
    const actual = uint8Arr_toString(buf);
    testResults_append(results, { method, category, expected, actual });
  }

  // uint8Arr_toHexString
  {
    const method = 'uint8Arr_toHexString';
    const buf = new Uint8Array([255,250,39,1,3,73]);
    const expected = 'FF FA 27 1 3 49';
    const actual = uint8Arr_toHexString(buf, {upper:true});
    testResults_append(results, { method, category, expected, actual });
  }

  // uint8Arr_fromArrayObject
  {
    const str = `
    const method = 'uint8Arr_toString';
    const buf = new Uint8Array([255,250,39,1,3,73]);
    `;
    const buf = Uint8Array.from(str, c => c.charCodeAt(0));
    const buf_str = JSON.stringify(buf);
    const buf_obj = JSON.parse( buf_str );
    const buf2 = uint8Arr_fromArrayObject(buf_obj);
    const str2 = Buffer.from(buf2).toString('utf8');

    const method = 'uint8Arr_fromArrayObject';
    const expected = str;
    const actual = str2;
    testResults_append(results, { method, category, expected, actual });
  }

  // uint8Arr_join
  {
    const textArr = ['123', '', '567'];
    const actual = uint8Arr_join( textArr, (item) => 
    {
      if ( item )
      {
        const arr = (item as string).split('').map( (item) => Number(item));
        const buf = new Uint8Array([...arr]);
        return buf;
      }
      else 
        return undefined;
    });
    const expected = new Uint8Array([1,2,3,5,6,7]);
    const method = 'uint8Arr_join';
    testResults_append(results, { method, expected, actual });
  }

  return results;
}
