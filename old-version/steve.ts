
const columns_array : {widthPct:string, width:number} [] = [] ;

// summarize various width related values of columns_array.
const { numColumns, numStar, sumPctWidth, sumFixedWidth } =
  columns_array.reduce((rio, item) =>
  {
    const widthPct = item.widthPct || '';

    // sum column width where width is assigned.
    if (item.width)
      rio.sumFixedWidth += item.width;

    // number of widthPct:'*'.
    else if (widthPct == '*')
      rio.numStar += 1;

    // sum where widthPct:'number'.
    else if (widthPct.length > 0)
      rio.sumPctWidth += Number(widthPct);

    // number of columns. Used to calc total column gap space.
    rio.numColumns += 1;

    return rio;
  }, { numColumns: 0, numStar: 0, sumPctWidth: 0, sumFixedWidth: 0 });
