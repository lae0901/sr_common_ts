
// --------------------------------- arr_compareEqual -------------------------
function arr_compareEqual<T>( arr1: T[], arr2: T[]) : boolean 
{
  let res = true ;
  const vlu1 = arr1[0] ;
  const vlu2 = arr2[0] ;
  if (typeof vlu1 == 'object' && vlu1 != null 
    && typeof vlu2 == 'object' && vlu2 != null )
  {
    res = obj_compareEqual(vlu1, vlu2);
  }
  return res ;
}

// ------------------------------ obj_compareEqual ------------------------------
// property by property, deep compare of two objects. 
// return is equal or not.
function obj_compareEqual(
  obj1: { [key: string]: any }, obj2: {[key: string]: any} ) : boolean
{
let isEqual = true ;

return isEqual ;
}
