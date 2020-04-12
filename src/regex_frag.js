
// ------------------------------- frag_apply_varvlu ----------------------------
// apply the varvlu to the textMask and nameMask of this regex pattern fragment.
function frag_apply_varvlu(frag, varvlu)
{
  frag.varvlu = varvlu;
  frag.text = frag.textMask.replace('{{}}', frag.varvlu);
  frag.name = frag.nameMask.replace('{{}}', frag.varvlu);
  frag.lx = frag.text.length;
}

// ----------------------------- regexPattern_toFragments -------------------------
// parse the input regex pattern into individual regex instructions.
// return these regex instructions as an array of regex pattern visual fragments. 
// regex fragment item: {text, name, lx }
function regexPattern_toFragments(pattern)
{
  // ----------------------------- frag_advanceLazy --------------------
  const frag_advanceLazy = function (frag, pattern)
  {
    let lazy = false;
    ch1 = pattern.substr(frag.bx + frag.lx, 1);
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
  const frag_advanceQuantifier = function (frag, pattern)
  {
    // look for quantifier after the escape command.
    let quantifier = '';
    ch1 = pattern.substr(frag.bx + frag.lx, 1);
    if (ch1 == '?')
      quantifier = 'zeroOrOne';
    else if (ch1 == '*')
      quantifier = 'zeroOrMore';
    else if (ch1 == '+')
      quantifier = 'oneOrMore';

    // apply quantifier to regex fragment.
    if (quantifier)
    {
      frag.name = `${quantifier} ${frag.name}`;
      frag.lx += 1;
      frag.text = pattern.substr(frag.bx, frag.lx);
      frag.quantifier = quantifier;
    }
  };

  // quantifier:true.  a quantifier can follow this command.
  const charCommandList = [
    { text: '^', name: 'start of string' },
    { text: '$', name: 'end of string' },
    { text: '.', name: 'any character', quantifier: true },
    { text: '(', name: 'begin capture', style: 'info' },
    { text: '(?:', name: 'begin non capture', style: 'info' },
    { text: '(?=', name: 'begin positive lookahead', style: 'info' },

    {
      text: '(?<', name: 'beginNamedCapture',
      textMask: '(?<{{}}>', nameMask: 'beginNamedCapture {{}}',
      tail: '>', varvlu: '', style: 'info'
    },

    { text: ')', name: 'end capture', quantifier: true, style: 'info' },
    { text: '|', name: 'or' },
    { text: '\\s', name: 'whitespace', quantifier: true },
    { text: '\\S', name: 'not whitespace', quantifier: true },
    { text: '\\b', name: 'begin/end word', quantifier: true },
    { text: '\\B', name: 'not begin/end word', quantifier: true },
    { text: '\\w', name: 'word char', quantifier: true },
    { text: '\\d', name: 'digit char', quantifier: true },
    { text: '\\D', name: 'not digit char', quantifier: true },
    { text: '\\.', name: 'any char not newline', quantifier: true },

    { text: '\\w*', name: 'zeroMoreWord' },
    { text: rxp.varName, name: 'varName' },
    { text: rxp.oneMoreNumeric, name: 'oneMoreNumeric' },
    { text: rxp.oneMoreDigits, name: 'oneMoreDigits' },
    { text: rxp.oneMoreAlpha, name: 'oneMoreAlpha' },
    { text: rxp.oneMoreWord, name: 'oneMoreWord' },

    { text: '\\+', name: '+ char', quantifier: true },
    { text: '\\*', name: '* char', quantifier: true },
    { text: '\\?', name: '? char', quantifier: true },
    { text: '\\/', name: '/ char', quantifier: true },
    { text: rxp.comment, name: 'comment', style: 'warning' },
    { text: rxp.singleQuoteQuoted, name: 'single quote quoted', style: 'warning' },
    { text: rxp.doubleQuoteQuoted, name: 'double quote quoted', style: 'warning' },
  ];

  const quantifierCommandList = [
    { text: '+', name: 'one or more' },
    { text: '*', name: 'zero or more' },
    { text: '?', name: 'zero or one' },
  ];

  let px = 0;
  const fragArray = [];

  // --------------------------------- charCommandList_find ----------------------
  // search list of regex instructions. Examine each item, looking for the best
  // match.  Where best match is a match of the longest regex instruction.
  const charCommandList_find = function (pattern, bx)
  {
    let found_item;
    for (let ix = 0; ix < charCommandList.length; ++ix)
    {
      const item = charCommandList[ix];

      const textLx = item.text.length;
      if ((!found_item) || (found_item.text.length < textLx))
      {
        const patternText = string_substrLenient(pattern, bx, textLx);
        if (patternText == item.text)
        {
          found_item = item;
        }
      }
    }

    return found_item;
  };

  // --------------------------------- main ----------------------------------

  while (px < pattern.length)
  {
    let ch1 = pattern.substr(px, 1);
    const ch2 = pattern.substr(px, 2);
    const ch3 = pattern.substr(px, 3);
    let frag = null;

    // look for character command.  ^$.()|
    if (frag == null)
    {
      const found_item = charCommandList_find(pattern, px);
      if (found_item)
      {
        const { text } = found_item;
        frag = { ...found_item, bx: px, lx: text.length };

        // this fragment continues with some variable text and ends with fixed
        // tail text.
        if (frag.tail)
        {
          const bx = px + text.length;
          const fx = pattern.indexOf(frag.tail, bx);  // find the tail
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

        if (frag.quantifier)
        {
          frag_advanceQuantifier(frag, pattern);
        }

        // if the fragment has a quantifier.  process in lazy.
        if (frag.quantifier)
          frag_advanceLazy(frag, pattern);
      }
    }

    // bracket expression.
    if ((frag == null) && (ch1 == '['))
    {
      let lx = 1;
      if (ch2 == '[^')
        lx = 2;
      // match to the closing square bracket.
      const rv = regex_exec(pattern, px + lx, /(?:\\\]|[^\]])*\]/g);
      if (rv != null)
      {
        lx += rv.matchLx;
      }

      frag = { text: pattern.substr(px, lx), name: 'match characters', bx: px, lx };
      frag_advanceQuantifier(frag, pattern);
      if (frag.quantifier)
        frag_advanceLazy(frag, pattern);
    }

    // process as plain text.
    if (frag == null) 
    {
      const match = pattern.substr(px).match(/[A-Za-z0-9 ]+/);
      if (match)
      {
        const matchText = match[0];
        frag = {
          text: matchText, name: 'text: ' + matchText,
          textMask: '{{}}', nameMask: 'text: {{}}',
          varvlu: matchText,
          bx: px, lx: matchText.length, style: 'secondary'
        };
      }
    }

    // unknown character.
    if (frag == null)
    {
      frag = { text: ch1, name: `unknown ${ch1}`, bx: px, lx: 1 };
      frag_advanceQuantifier(frag, pattern);
    }

    // store fragment in fragment list.
    fragArray.push(frag);
    px += frag.lx;
  }

  return fragArray;
}
