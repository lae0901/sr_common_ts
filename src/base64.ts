
// -------------------------------- iBase64Builder --------------------------------
export interface iBase64Builder
{
  data: string;
  extra: Buffer | null;
}

// ------------------------------- base64Builder_new -------------------------------
export function base64Builder_new(): iBase64Builder
{
  return { data: '', extra: null };
}

// ----------------------------- base64Builder_append -----------------------------
export function base64Builder_append(builder: iBase64Builder, chunk: Buffer | string) 
{
  // make sure chunk is Buffer.
  if (typeof chunk == 'string')
  {
    chunk = Buffer.from(chunk);
  }

  // add extra to front of chunk.
  if (builder.extra)
  {
    chunk = Buffer.concat([builder.extra, chunk]);
    builder.extra = null;
  }

  // remaining bytes cannot be encoded now. Store as extra for next append call.
  const remLx = chunk.length % 3;
  if (remLx)
  {
    const evenLx = chunk.length - remLx;
    builder.extra = chunk.slice(evenLx);
    chunk = chunk.slice(0, evenLx);
  }

  // base64 encode the chunk. append to 
  builder.data += chunk.toString('base64');
}

// ----------------------------- base64Builder_final -----------------------------
export function base64Builder_final(builder: iBase64Builder): string
{
  if (builder.extra)
  {
    builder.data += builder.extra.toString('base64');
    builder.extra = null;
  }
  return builder.data;
}
