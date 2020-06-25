
export interface iTesterResults
{
  completion_arr: string[],
  errmsg_arr: string[]
};


type PassFail = 'pass' | 'fail' ;

export interface iTesterResultItem
{
  passFail : PassFail,
  text: string,
  method?: string  // name of function being tested.
}

// ----------------------------- testerResults_append -----------------------------
export function testerResults_append(results_arr: iTesterResultItem[],
                    passText: string, failText: string, method:string = '' )
{
  let item : iTesterResultItem ;
  if ( failText )
  {
    item = {passFail:'fail', text:failText} ;
  }
  else
  {
    item = { passFail: 'pass', text: passText };
  }
  results_arr.push(item) ;
}

// --------------------------- testerResults_consoleLog ---------------------------
export function testerResults_consoleLog( results_arr: iTesterResultItem[])
{
  for( const item of results_arr )
  {
    const method = (item.method) ? item.method + ' ': '' ;
    console.log(`${item.passFail} ${method}${item.text}`);
  }
}

// ------------------------------- testerResults_new -------------------------------
export function testerResults_new(): iTesterResultItem[]
{
  const results_arr: iTesterResultItem[] = [];
  return results_arr ;
}
