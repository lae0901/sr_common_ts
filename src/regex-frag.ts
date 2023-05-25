// regex-frag.js

import { str_isQuoted, str_substrLenient } from './core.js';
import { rxp, regex_isQuantifier, regex_splitLastChar } from './regex_core.js';
import { arr_range, str_indexOfUnescapedChar, str_unescape } from './more-core.js' ;

interface regexFrag_interface
{
  name: string,
  title?: string,
  text: string,
  quantifier?: boolean,
  quantifierText?: string,
  style?: string,
  textMask?: string,
  nameMask?: string,
  tail?: string,
  varvlu?: string,
  bx?: number,
  lx?: number,
  compositeName?: string,
  compositeStyle?: string,
  compositeNameMask?: string,
  isBeginCapture?: boolean,
  isComponent?: boolean,
  isComposite?: boolean,
  isEndCapture?: boolean,
  isUserFragment?: boolean,
  isHidden?: boolean,
  special?: string,
  editPopup?: boolean,
  focused?: boolean,
  removed?: boolean,
  lazy?: boolean,
  captureDepth?: number,
  componentArray?: regexFrag_interface[],
  frag_num?: number,
  left?: number,
  top?: number,
  bottom?: number,
  rownum?: number,
  insertMarker?: { rltv: string }
};

// quantifier: true.  a quantifier can follow this command.
// style: info warning success ...  How to style fragment when display visually.
// compositeSyle: style used when this fragment is start of composite fragment.
// name: fragment name. Name is displayed when display fragments in visual form.
// compositeName: name used when this and fragments that follow are combined into
//                composite fragment.
// isBeginCapture:  this instruction is a begin capture instruction.
// isEndCapture:  this instruction is an end capture instruction.
// isComposite:   this fragment is itself composed of fragments.
// isComponent:   this fragment is a component fragment of a composite fragment.
// componentArray: array of fragments that make up composite fragment.
//                     Capture fragment is a composite fragment.
let regexPattern_charCommandList : regexFrag_interface[] = [
  { text: '^', name: 'start of string' },
  { text: '$', name: 'end of string' },
  { text: '.', name: 'any character', quantifier: true },

  {
    text: '(', name: 'begin capture', compositeName: 'capture',
    style: 'info', isBeginCapture: true
  },
  { text: '(?:', name: 'begin non capture', style: 'info', isBeginCapture: true },
  { text: '(?=', name: 'begin positive lookahead', style: 'info', isBeginCapture: true },
  { text: '(?!', name: 'begin negative lookahead', style: 'info', isBeginCapture: true },

  {
    text: '(?<', name: 'beginNamedCapture', compositeNameMask: 'NamedCapture {{}}',
    textMask: '(?<{{}}>', nameMask: 'beginNamedCapture {{}}',
    tail: '>', varvlu: '', style: 'info', isBeginCapture: true
  },

  {
    text: '[', name: 'any character',
    textMask: '[{{}}]', nameMask: 'any character {{}}',
    tail: ']', varvlu: '', style: 'info'
  },

  {
    text: '[^', name: 'any character not',
    textMask: '[^{{}}]', nameMask: 'any character not {{}}',
    tail: ']', varvlu: '', style: 'info'
  },

  { text: ')', name: 'end capture', quantifier: true, style: 'info', isEndCapture: true },
  { text: '|', name: 'or' },
  { text: '\\s', name: 'whitespace', quantifier: true },
  { text: '\\S', name: 'not whitespace', quantifier: true },
  { text: '\\b', name: 'begin/end word', quantifier: true },
  { text: '\\B', name: 'not begin/end word', quantifier: true },
  { text: '\\w', name: 'word char', quantifier: true },
  { text: '\\d', name: 'digit char', quantifier: true },
  { text: '\\D', name: 'not digit char', quantifier: true },

  { text: '\\w*', name: 'zeroMoreWord', quantifier: true },
  { text: rxp.variableName, name: 'variableName', isComposite: true, quantifier: true },
  { text: rxp.oneMoreNumeric, name: 'oneMoreNumeric', quantifier: true },
  { text: rxp.oneMoreDigits, name: 'oneMoreDigits', quantifier: true },
  { text: rxp.oneMoreAlpha, name: 'oneMoreAlpha', quantifier: true },
  { text: rxp.oneMoreWord, name: 'oneMoreWord', quantifier: true },

  { text: '\\+', name: '+ char', quantifier: true },
  { text: '\\*', name: '* char', quantifier: true },
  { text: '\\?', name: '? char', quantifier: true },
  { text: '\\/', name: '/ char', quantifier: true },
  { text: '\\.', name: '. char', quantifier: true },
  { text: rxp.comment, name: 'comment', style: 'warning', isComposite: true },
  { text: rxp.singleQuoteQuoted, name: 'single quote quoted', style: 'warning', isComposite: true },
  { text: rxp.doubleQuoteQuoted, name: 'double quote quoted', style: 'warning', isComposite: true },
];

// -------------------- regexPattern_charCommandList_applyUserFragments ----------
function regexPattern_charCommandList_applyUserFragments( regexArray : regexFrag_interface[] )
{
  // build array of user fragments
  const userFragments = regexArray.filter((item) =>
  {
    return item.isComposite ;
  }).map((item) : regexFrag_interface => 
  {
    return { text:item.text, name:item.title || '', quantifier:true, isUserFragment:true} ;
  });

  // range of existing userFragment items in charCommandList.
  const {from_index, count } = arr_range(regexPattern_charCommandList, (item) =>
  {
    return item.isUserFragment == true ;
  });

  // either replace existing userFragments in charCommandList. or append to end 
  // of array.
  if ( from_index == -1 )
    regexPattern_charCommandList.push(...userFragments);
  else
    regexPattern_charCommandList.splice(from_index, count, ...userFragments);

  return regexPattern_charCommandList ;
}

// -------------------------- compositeFrag_build ----------------------------
// this fragment is itself composed of fragments. Build the text, display name 
// and display style of the composite fragment from its components.
function compositeFrag_build( fragArray : regexFrag_interface[] )
{
  let composite_name = '';
  let composite_style = '';
  let composite_text = '';
  fragArray.forEach((item) =>
  {
    if ( item.special != 'caret')
    {
      composite_text += item.text;
      if ( !composite_name )
      {
        if (item.compositeNameMask )
          composite_name = item.compositeNameMask.replace('{{}}', item.varvlu || '' ) ;
        else
          composite_name = item.compositeName || item.name;
        composite_style = item.compositeStyle || item.style || '';
      }
      else if ( !item.isEndCapture )
        composite_name += ' ' + item.name ;
    }
  });
  return {name:composite_name, style:composite_style, text: composite_text} ;
}

// ------------------------------- frag_apply_text ----------------------------
// apply the varvlu to the textMask and nameMask of this regex pattern fragment.
function frag_apply_text(frag : regexFrag_interface  , text : string)
{
  if ( !frag.varvlu )
  {
    frag.text = text ;
    frag.lx = frag.text.length;
  }
  else
  {
    frag_apply_varvlu(frag, text) ;
  }
}

// ------------------------------- frag_apply_varvlu ----------------------------
// apply the varvlu to the textMask and nameMask of this regex pattern fragment.
function frag_apply_varvlu(frag : regexFrag_interface, varvlu : string)
{
  frag.varvlu = varvlu;
  const unescaped_varvlu = str_unescape(varvlu);
  if ( frag.textMask )
    frag.text = frag.textMask.replace('{{}}', frag.varvlu);
  if (frag.nameMask)
    frag.name = frag.nameMask.replace('{{}}', unescaped_varvlu);
  else
    frag.name = frag.text;
  frag.lx = frag.text.length;
}

// --------------------------- frag_assignDefaultProperties -----------------------
function frag_assignDefaultProperties( frag : regexFrag_interface )
{
  frag.editPopup = frag.editPopup || false ;
  frag.isUserFragment = frag.isUserFragment || false ;
  frag.focused = frag.focused || false ;
  frag.removed = frag.removed || false ;
}

// ---------------------------------- frag_mark_remove ----------------------------
// remove the fragment from regex string. Mark it as special so that its content is
// skipped when building regex from fragments.
function frag_mark_remove(frag : regexFrag_interface )
{
  frag.special = 'remove' ;
}

// --------------------------- frag_newTextFrag -----------------------------------
// addnProps - additional properties to add to the new frag object.
function frag_newTextFrag( text : string, addnProps : {} )
{
  addnProps = addnProps || {} ;
  const frag : regexFrag_interface = {
    text: '', name: '',
    textMask: '{{}}', nameMask: 'text: {{}}',
    varvlu: '',
    lx: text.length, style: 'secondary', editPopup:false,
    ...addnProps
  };
  frag_apply_varvlu(frag, text);

  return frag ;
}

// ----------------------------- regexPattern_toFragments -------------------------
// parse the input regex pattern into individual regex instructions.
// return these regex instructions as an array of regex pattern visual fragments. 
// regex fragment item: {text, name, lx }
// options: { noFullMatch: true }
export function regexPattern_toFragments( 
              pattern : string , options : { noFullMatch?: boolean} ) : regexFrag_interface[]
{

  // ----------------------------- frag_advanceLazy --------------------
  // process the ? that can follow a quantifier. This makes the quantifier lazy.
  // Lazy, meaning, other "or" matches take precedence. 
  const frag_advanceLazy = function (frag : regexFrag_interface, pattern : string)
  {
    let lazy = false;
    frag.bx = frag.bx || 0 ;
    frag.lx = frag.lx || 0 ;
    const ch1 = pattern.substr(frag.bx + frag.lx, 1);
    if (ch1 == '?')
      lazy = true;

    if (lazy)
    {
      frag.name = `${frag.name} lazy`;
      frag.lx += 1;
      frag.text = pattern.substr(frag.bx, frag.lx);
      frag.lazy = lazy;
    }
  };

  // ----------------------------- frag_advanceQuantifier --------------------
  const frag_advanceQuantifier = function (frag : regexFrag_interface, pattern:string)
  {
    // look for quantifier after the escape command.
    let quantifier = '';
    if ( typeof frag.bx != 'undefined' && frag.lx )
    {
      const ch1 = pattern.substr(frag.bx + frag.lx, 1);
      if (ch1 == '?')
        quantifier = 'zeroOrOne';
      else if (ch1 == '*')
        quantifier = 'zeroOrMore';
      else if (ch1 == '+')
        quantifier = 'oneOrMore';

      // apply quantifier to regex fragment.
      if (quantifier)
      {
        frag.name = `${frag.name} ${quantifier}`;
        frag.lx += 1;
        frag.text = pattern.substr(frag.bx, frag.lx);
        frag.quantifierText = quantifier;
      }
    } 
  };

  let px = 0;
  const fragArray = [];
  let captureDepth = 0 ;
  options = options || { } ;
  const noFullMatch = options.noFullMatch || false ;

  // --------------------------------- charCommandList_find ----------------------
  // search list of regex instructions. Examine each item, looking for the best
  // match.  Where best match is a match of the longest regex instruction.
  const charCommandList_find = function (pattern : string, bx : number , noFullMatch : boolean) : regexFrag_interface | null
  {
    let found_item : regexFrag_interface | null = null ;
    for (let ix = 0; ix < regexPattern_charCommandList.length; ++ix)
    {
      const item = regexPattern_charCommandList[ix];

      if ((!found_item) || (found_item.text.length < item.text.length))
      {
        const patternText = str_substrLenient(pattern, bx, item.text.length );
        if (patternText == item.text)
        {
          let canMatch = true ;
          if (( noFullMatch == true) && ( bx == 0 ) && ( pattern.length == item.text.length ))
          {
            canMatch = false ;
          }
          if ( canMatch )
            found_item = item;
        }
      }
    }

    return found_item;
  };

  // --------------------------------- main ----------------------------------

  // regex pattern is enclosed in forward slash. It is a regex literal. Remove the
  // enclosing slash and replace any escaped fwd slash with unescaped fwd slash.
  if ( str_isQuoted(pattern, '/'))
  {
    const bx = 1 ;
    const lx = pattern.length - 2 ;
    pattern = str_substrLenient(pattern, bx, lx) ;
    pattern = pattern.replace(/\\\//g, '/');
  }

  while (px < pattern.length)
  {
    let frag = null;

    // look for character command.  ^$.()|
    if (frag == null)
    {
      const found_item = charCommandList_find(pattern, px, noFullMatch);
      if (found_item)
      {
        const { text } = found_item;
        frag = { ...found_item, bx: px, lx: text.length };
        frag_assignDefaultProperties(frag) ;

        // this fragment continues with some variable text and ends with fixed
        // tail text.
        if (frag.tail)
        {
          const bx = px + text.length;
          let fx ;
          if ( frag.tail.length > 1)
            fx = pattern.indexOf(frag.tail, bx);  // find the tail
          else 
            fx = str_indexOfUnescapedChar( pattern, frag.tail, bx ) ;

          if (fx >= 0)
          {
            const varvluLx = fx - bx;  // the variable value runs up to the tail.
            const varvlu = pattern.substr(bx, varvluLx);

            // apply the variable value to this fragment. The fragment contains
            // a textMask and nameMask. Build the text and name properties from
            // these two masks.
            frag_apply_varvlu(frag, varvlu);
          }
        }

        frag_advanceQuantifier(frag, pattern);
        frag_advanceLazy(frag, pattern);
      }
    }

    // process as plain text.
    if (frag == null) 
    {
      // the special regex characters:  \ ^ . $ | ? * + ( ) [ {
      // match for characters other than special regex characters.
      const match = pattern.substr(px).match(/([^\\\^\.\$\|\?\*\+\(\)\[\{]|\\\\)+/);
      if (match)
      {
        let matchText = match[0];
        frag = frag_newTextFrag(matchText, {bx:px}) ;

        // look ahead to the next character in the pattern. A quantifier applies to
        // the last character in the pattern. So if this is multiple plain text 
        // characters, split off the last character as the one the quantifier 
        // applies to.
        {
          const lx = matchText.length ;
          const nx1 = str_substrLenient(pattern, px + lx, 1) ;
          if ( regex_isQuantifier(nx1))
          {
            // split the regex text on its last character. Where a character is
            // either an actual character. Or it is an escaped character.
            const { part1, part2 } = regex_splitLastChar(matchText);
            if ( part1.length > 0 )
            {
              matchText = part1;
            }
          }
        }

        // apply the variable value to this fragment. The fragment contains
        // a textMask and nameMask. Build the text and name properties from
        // these two masks.
        frag_apply_varvlu(frag, matchText);

        frag_advanceQuantifier(frag, pattern);
        frag_advanceLazy(frag, pattern);
      }
    }

    // unknown character.
    if (frag == null)
    {
      const ch1 = pattern.substr(px, 1);
      frag = { text: ch1, name: `unknown ${ch1}`, bx: px, lx: 1 };
      frag_advanceQuantifier(frag, pattern);
    }

    // update and store captureDepth.
    if ( frag.isBeginCapture )
      captureDepth += 1 ;
    frag.captureDepth = captureDepth ;
    if ( frag.isEndCapture )
      captureDepth -= 1 ;

    // store fragment in fragment list.
    fragArray.push(frag);
    px += frag.lx || 0;

    // fragment is a composite fragment. It is itself composed of regex fragments.
    // Parse the composite fragment and create componentArray.
    if (( frag.isComposite == true ) && ( !frag.componentArray ))
    {
      const componentArray = regexPattern_toFragments( frag.text, { noFullMatch:true }) ;
      frag.componentArray = componentArray ;
    }

    // endCapture fragment. Check and process that the fragments from begin
    // capture to endCapture can be combined into single capture fragment.
    if ( frag.isEndCapture )
    {
      const end_ix = fragArray.length - 1 ;
      const { begin_ix, begin_frag } = 
                    fragments_findCaptureBegin(fragArray, end_ix ) ;
      if ( begin_frag )
        fragments_combineCaptureFragments(fragArray, begin_ix, end_ix ) ;
    }
  }

  return fragArray;
}

// ----------------------------- fragments_applyLocation --------------------------
// apply left, top, bottom location to each regex fragment.
// regex visual frag item: {text, name, style, frag_num, left, top, bottom, rownum}
function fragments_applyLocation(fragment_array : regexFrag_interface[] , container_div:any)
{
  const child_elems = [...container_div.children];
  for (let ix = 0; ix < child_elems.length; ++ix)
  {
    const child = child_elems[ix];

    // this is a visual fragment DOM element.
    if (child.id.substr(0, 8) == 'patfrag_')
    {
      const child_rect = child.getBoundingClientRect();

      const frag_num = Number(child.id.substr(8));
      const found_frag = fragment_array.find((item) =>
      {
        return item.frag_num == frag_num;
      });

      if ( found_frag )
      {
        found_frag.left = Math.round(child_rect.left);
        found_frag.top = Math.round(child_rect.top);
        found_frag.bottom = Math.round(child_rect.bottom);
      }
    }
  }
}

// ------------------------------------ fragments_assignRowNum --------------------
// regex visual fragment item: {text, name, style, frag_num, top, bottom, rownum}
function fragments_assignRowNum(fragment_array : regexFrag_interface[] )
{
  // create rownum array from array of regex visual fragments. Each fragment
  // contains a top and bottom property. Each row consists of fragments with the
  // same top value.
  const rownum_array = fragments_toRowNumArray(fragment_array);

  // using rownum_array, update each fragment_array item with the corr rownum from
  // the rownum_array.  Use the top pos of each fragment item as key to the rownum
  // array.
  fragment_array.forEach((fragItem) =>
  {
    const foundItem = rownum_array.find((rowItem) =>
    {
      return (rowItem.top == fragItem.top);
    });
    if ( foundItem )
    {
      fragItem.rownum = foundItem.rownum;
    }
  });
}

// ---------------------------- fragments_clearPopup -------------------------------
function fragments_clearPopup(fragArray : regexFrag_interface[], options? : {deep?:boolean})
{
  options = options || {};
  const deep = options.deep || false;

  // clear editPopup in all fragments.
  fragArray.forEach((item) =>
  {
    item.editPopup = false;
    if (item.componentArray && deep)
      fragments_clearPopup(item.componentArray, { deep });
  });

  // now that popups are cleared, set to show blinking caret.
  fragments_showCaret(fragArray, false);
}

// ------------------------------- fragments_findRownum ---------------------------
// search regex fragments array. Looking for item where vertPos is within the range
// of top and bottom location of the fragment. When found, return the rownum of
// that fragment.
function fragments_findRownum(fragment_array : regexFrag_interface[] , vertPos : number)
{
  const found = fragment_array.find((item) =>
  {
    const item_top = item.top || 0 ;
    const item_bottom = item.bottom || 0 ;

    return (vertPos >= item_top) && (vertPos <= item_bottom );
  });
  if (found == null)
    return -1;
  else
    return found.rownum;
}

interface rowNumItem_interface
{
  rownum: number,
  top:number
}

// -------------------------- fragments_toRowNumArray -----------------------------
// return an array of distinct row numbers. Where each row corresponds to a 
// distinct top position in the input array of regex fragments.
function fragments_toRowNumArray(fragment_array : regexFrag_interface[])
{

  const arr: {rownum:number, top:number}[] = [] ;
  let reduce_initial = { rownum_array: arr } ;

  // build an array of distinct top locations. Each row of visual fragments 
  // will have the same top location. From that distinct list, assign a
  // row number.
  const { rownum_array } = fragment_array.reduce((rio, item) =>
  {
    const top = item.top || 0 ;
    const found_row = rio.rownum_array.find((it) =>
    {
      return it.top == top;
    });
    if (found_row == null)
      rio.rownum_array.push({ rownum: 0, top });
    return rio;
  }, reduce_initial );

  // sort rownum array by top pos.
  rownum_array.sort((a, b) =>
  {
    if (a.top < b.top)
      return -1;
    else if (a.top == b.top)
      return 0;
    else
      return 1;
  });

  // assign a row number to each visual fragment. 
  let rownum = 0;
  rownum_array.forEach((item) =>
  {
    item.rownum = rownum;
    rownum += 1;
  });

  return rownum_array;
}

// --------------------------- fragments_combineCaptureFragments ------------------
function fragments_combineCaptureFragments( fragArray : regexFrag_interface[] , begin_ix : number, end_ix : number )
{
  // only a single fragment between the begin and end fragment. combine into a 
  // single "caputure" fragment.
  if ((end_ix - begin_ix) == 2 )
  {
    // remove the component fragments.
    const fragCx = end_ix - begin_ix + 1;
    const componentArray = fragArray.splice(begin_ix, fragCx );

    // build the name, text, style of the composite fragment.
    const { name: composite_name, text:composite_text, style:composite_style } 
                    = compositeFrag_build( componentArray ) ;

    // mark the component fragments as isComponent:true
    componentArray.forEach((item) =>
    {
      item.isComponent = true ;
    });

    // create the composite fragment.                    
    const composite_frag = { name:composite_name, text:composite_text, 
                              style:composite_style, 
                              isComposite:true, componentArray };

    // add the composite_frag to end of fragArray.
    fragArray.push( composite_frag ) ;
  }
}

// --------------------------- fragments_findCaptureBegin ------------------
// starting from isEndCapture fragment, look backwards in fragments array until the
// isBeginCapture fragment is found.
function fragments_findCaptureBegin(fragArray : regexFrag_interface[] , end_ix : number )
{
  let begin_ix = 0 ;
  let begin_frag;
  const end_frag = fragArray[end_ix];

  // find the begin fragment.
  for (let ix = end_ix; ix >= 0; --ix)
  {
    const frag = fragArray[ix];
    if (frag.isBeginCapture && (frag.captureDepth == end_frag.captureDepth))
    {
      begin_ix = ix;
      begin_frag = frag;
      break;
    }
  }

  return { begin_ix, begin_frag } ;
}

// --------------------------- fragments_findCaret ------------------
// find caret frag item in array of fragments.
// this is a deep find. When fragment contains components, search that
// component array.
// deep: true false. if true, find caret in componentArray of composite fragments.
function fragments_findCaret(fragArray : regexFrag_interface[] , deep : boolean) :
          { found_index:number, found_array: regexFrag_interface[] | null, found_item: regexFrag_interface | null }
{
  deep = deep || true ;
  let ix = -1 ;
  let found_index = -1 ;
  let found_array = null ;
  let found_item = null ;
  for( const item of fragArray )
  {
    ix += 1 ;
    if (item.special == 'caret')
    {
      found_index = ix ;
      found_array = fragArray ;
      found_item = item ;
      break ;
    }
    else if ( deep && item.componentArray )
    {
      const rv = fragments_findCaret(item.componentArray, true) ;
      if ( rv.found_index >= 0)
      {
        found_index = rv.found_index ;
        found_array = rv.found_array ;
        found_item = rv.found_item ;
        break ;
      }
    }
  }
  return { found_index, found_array, found_item } ;
}

// --------------------------- fragments_hideCaret ---------------------
// hide caret frag item in array of fragments.
// deep: true false. if true, hide caret in componentArray of composite fragments.
function fragments_hideCaret(fragArray : regexFrag_interface[], deep : boolean )
{
  deep = deep || false;
  for (const item of fragArray)
  {
    if (item.special == 'caret')
    {
      item.isHidden = true ;
    }
    else if (deep && item.componentArray)
    {
      fragments_hideCaret(item.componentArray, true);
    }
  }
}

// ------------------------- fragments_assignInsertMarker -------------------------
// marker: { rltv:'after', 'before', 'begin', 'end'}
function fragments_assignInsertMarker(fragArray : regexFrag_interface[], index : number, marker : { rltv:string })
{
  // first, unmark all items.
  fragArray.forEach((item) =>
  {
    item.insertMarker = undefined;
  });

  let marker_index = index == -1 ? fragArray.length - 1 : index ;
  let marker_item = fragArray[marker_index] ;

  // marker item is a caret. move marker to actual fragment item.
  if ( marker_item.special )
  {
    if ( marker_index > 0 )
    {
      marker_index -= 1 ;
      if ( marker.rltv == 'before')
        marker.rltv = 'after' ;
    }
    else
    {
      marker_index += 1 ;
      if ( marker.rltv == 'after')
        marker.rltv = 'before' ;
    }
  }

  // set the insertMarker property of the frag. 
  marker_item = fragArray[marker_index];
  marker_item.insertMarker = marker ;
}

// ------------------------- fragments_findInsertMarker -------------------------
// marker: { rltv:'after', 'before', 'begin', 'end'}
function fragments_findInsertMarker(fragArray : regexFrag_interface[] )
{
  let marker;
  let marker_index = fragArray.findIndex((item) =>
  {
    return item.insertMarker
  });
  if (marker_index >= 0)
  {
    marker = fragArray[marker_index].insertMarker ;
  }
  return { marker, marker_index } ;
}

// ----------------------- fragments_insertCaret ----------------------------------
function fragments_insertCaret( frag_array : regexFrag_interface[] , index : number)
{
  // mark the item in frag_array as the "insert_before" item.
  if ( frag_array.length > 0)
  {
    if (index != -1)
      fragments_assignInsertMarker(frag_array, index, { rltv: 'before' });
    else
    {
      index = frag_array.length - 1;
      fragments_assignInsertMarker(frag_array, index, { rltv: 'after' });
    }
  }

  const caret = fragments_insertCaret_atMarker(frag_array);

  // mark the caret as hidden if there is a popup active 
  const found_index = frag_array.findIndex((item) =>
  {
    return item.editPopup;
  });

  if (found_index != -1)
    caret.isHidden = true;
  else
    caret.isHidden = false;
}

// ---------------------- fragments_insertCaret_atMarker -------------------------
function fragments_insertCaret_atMarker( fragArray : regexFrag_interface[] )
{
  let caret : regexFrag_interface ;

  // extract the caret fragment.  If not found, create the caret.
  const { found_index, found_item } = fragments_findCaret( fragArray, false ) ;
  if ( found_item )
  {
    const items = fragArray.splice( found_index, 1 ) ;
    caret = items[0] ;
  }
  else
  {
    caret = {special:'caret', name:'', text:''} ;
  }

  const { marker_index, marker } = fragments_findInsertMarker( fragArray ) ;

  // setup insert before index.
  let insert_index = 0 ;
  if ( marker_index == -1 || !marker )
    insert_index = -1 ;
  else if ( marker.rltv == 'before')
    insert_index = marker_index ;
  else if ( marker.rltv == 'after')
    insert_index = marker_index + 1 ;
  else if ( marker.rltv == 'end')
    insert_index = -1 ;
  else if ( marker.rltv == 'begin')
    insert_index = 0 ;

  // insert caret or add to end of array.
  if ( insert_index == -1 )
    fragArray.push(caret) ;
  else 
    fragArray.splice(insert_index, 0, caret ) ;

  return caret ;
}

// ------------------------------ fragments_removeCaret ---------------------------
// remove all the item.special = 'caret' fragments in frag array.
function fragments_removeCaret( fragArray : regexFrag_interface[] )
{
  while(true)
  {
    let caret_index = -1;
    let ix = -1;
    fragArray.forEach((item) =>
    {
      ix += 1 ;
      if ( item.special == 'caret')
        caret_index = ix ;
    });

    if ( caret_index != -1 )
    {
      fragArray.splice( caret_index, 1);
    }
    else
      break ;
  }
}

// --------------------------- fragments_showCaret ---------------------
// hide caret frag item in array of fragments.
// deep: true false. if true, hide caret in componentArray of composite fragments.
function fragments_showCaret(fragArray : regexFrag_interface[], deep : boolean)
{
  deep = deep || false;
  for (const item of fragArray)
  {
    if (item.special == 'caret')
    {
      item.isHidden = false;
    }
    else if (deep && item.componentArray)
    {
      fragments_showCaret(item.componentArray, true);
    }
  }
}

// ------------------------------ fragments_toRegexPattern ------------------------
function fragments_toRegexPattern(fragment_array : regexFrag_interface[])
{
  let pattern = '';
  fragment_array.forEach((item) =>
  {
    if ( !item.special )
    {
      pattern += item.text;
    }
  });
  return pattern;
}
