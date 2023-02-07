
// ------------------------------ arr_range ----------------------------------
// return range of items where selectFunction returns true in some items.
export function arr_range(arr: any [], selectFunction : ( item:any) => boolean )
{
  let from_index = -1;
  let to_index = -1;
  let count = 0;
  let from_item = null;
  let to_item = null;
  for (let ix = 0; ix < arr.length; ++ix)
  {
    const item = arr[ix];
    if (selectFunction(item))
    {
      // first item that is true.
      if (from_index == -1)
      {
        from_index = ix;
        from_item = item;
      }

      // extend range of items to last that is true.
      to_index = ix;
      to_item = item;
      count = to_index - from_index + 1;
    }

  }

  return { from_index, to_index, count, from_item, to_item };
}

// ----------------------- str_indexOfUnescapedChar ------------------------
// find char in string that is not escaped ( preceded with escape char ) 
export function str_indexOfUnescapedChar(
                      text : string, findChar : string, bx : number) : number
{
  let ix = bx || 0;  // start of search.
  let foundIx = -1;  // find result. init to not found.
  while (ix < text.length)
  {
    const ch1 = text[ix];

    // current char escapes the next char. advance past next char. 
    if (ch1 == '\\')  
    {
      ix += 2;
    }

    // character being searched for. return its index.
    else if (ch1 == findChar)
    {
      foundIx = ix;
      break;
    }

    // advance index. continue search.
    else
    {
      ix += 1;
    }
  }
  return foundIx;
}

// ----------------------- str_unescape ------------------------
// remove all the backslash characters from the string. With the exception of when
// the backslash is followed by another backslash. In that case, remove only the
// first of the pair.
export function str_unescape(text : string) : string
{
  let ix = 0;
  let result = '';
  while (ix < text.length)
  {
    const ch1 = text[ix];
    const nx1 = (ix + 1 >= text.length) ? '' : text[ix + 1];
    if ((ch1 == '\\') && (nx1 == '\\'))
    {
      result += ch1;
      ix += 2;
    }
    else if (ch1 == '\\')
    {
      ix += 2;
      result += nx1;
    }
    else
    {
      ix += 1;
      result += ch1;
    }
  }
  return result;
}

