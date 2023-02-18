
import { arr_compareEqual, obj_propertyMatch } from './core';

// -------------------------------- iTestResultItem --------------------------------
export interface iTestResultItem
{
  passText?: string,
  failText?: string,

  category?: string;  // category of the test. tests are grouped by category and summarized by category.
  method?: string ; // name of function being tested.
  aspect?: string ; // aspect of the method being tested.

  desc?: string ;   // description of the test.
  expected?: any ;  // expected result of test
  actual?: any ;  // actual result of test
  didFail?: boolean;     // test failed. true or false.

  startTime?: Date;   // when test was run. 
  endTime?: Date;     // time test ended. duration = endTime - startTime

  errmsg?: string;    // errmsg of error that cause test to fail.
}

// ------------------------ testResults_append ---------------------
export function testResults_append(resultsArr: iTestResultItem[], result:iTestResultItem)
{
  result.startTime = result.startTime ? result.startTime : new Date( ) ;
  result.endTime = result.endTime ? result.endTime : new Date( ) ;

  // an errmsg of an error.  test did fail.
  if ( typeof result.didFail == 'undefined' && result.errmsg )
    result.didFail = true ;
  result.didFail = typeof result.didFail == 'undefined' ? false : result.didFail;

  // set didFail flag based on test result.
  if ( !result.didFail && result.expected != undefined && result.actual != undefined )
  {
    // expected and actual are arrays. compare arrays for equality.
    if ( Array.isArray(result.expected) && Array.isArray(result.actual))
    {
      result.didFail = !(arr_compareEqual(result.expected, result.actual));
    }

    // expected and actual are objects. compare each property.
    else if ( typeof result.expected == 'object' && typeof result.actual == 'object')
    {
      result.didFail = !(obj_propertyMatch(result.expected, result.actual));
    }

    else
    {
      result.didFail = !(result.expected == result.actual ) ;
    }
  }

  resultsArr.push(result);
}
