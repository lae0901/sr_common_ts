
// ----------------------------- regexPattern_toFragments -------------------------
// parse the input regex pattern into individual regex instructions.
// return these regex instructions as an array of regex pattern visual fragments. 
// regex fragment item: {text, name, lx }
export function regexPattern_toFragments(pattern:string) : regexFrag_interface[] ;

interface regexFrag_interface {
  name: string,
  text: string,
  quantifier?: boolean,
  style?: string,
  textMask?: string,
  nameMask?: string,
  tail?: string,
  varvlu?: string,
  bx?: number,
  lx?: number

}