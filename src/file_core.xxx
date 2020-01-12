// .src/common/file-system.ts 

import * as fs from 'fs';
import * as path from 'path';

// ------------------------------ dir_findFirstText -----------------------------
export async function dir_findFirstText(dirPath: string, findText: string)
  : Promise<{ foundFilePath: string, foundLinn: number }>
{
  const promise = new Promise<{ foundFilePath: string, foundLinn: number }>((resolve, reject) =>
  {
    fs.readdir(dirPath, async (err, items) =>
    {
      let foundFilePath = '';
      let foundLinn = 0;
      for (const item of items)
      {
        const itemPath = path.join(dirPath, item);
        const isDir = await file_isDirectory(itemPath);
        if (isDir)
        {
          const rv = await dir_findFirstText(itemPath, findText);

          // a file was found in the sub folder.
          if (rv.foundFilePath)
          {
            foundFilePath = rv.foundFilePath;
            foundLinn = rv.foundLinn;
            break;
          }
        }
        else
        {
          const rv = await file_findFirstText(itemPath, findText);
          if (rv.foundLinn >= 0)
          {
            foundFilePath = itemPath;
            foundLinn = rv.foundLinn;
            break;
          }
        }
      }
      resolve({ foundFilePath, foundLinn });
    });
  });
  return promise;
}

// ---------------------------- file_create -----------------------------
export async function file_create(path: string) 
{
  const promise = new Promise((resolve, reject) =>
  {
    fs.open(path, 'w', function (err, fd)
    {
      if (err)
      {
        reject('error opening file: ' + err);
      }

      fs.close(fd, () =>
      {
        resolve();
      });
    });
  });
  return promise;
}

// -------------------------- file_exists ------------------------------
export async function file_exists(path: string): Promise<boolean>
{
  const promise = new Promise<boolean>((resolve, reject) =>
  {
    fs.stat(path, (err, stat) =>
    {
      if (err == null)
      {
        return true;
      }
      else
      {
        return false;
      }
    });
  });
  return promise;
}

// ------------------------------- file_findFirstText ----------------------------
// find first instance of text in file.
export function file_findFirstText(filePath: string, findText: string)
  : Promise<{ foundLinn: number, foundPos: number }>
{
  const promise = new Promise<{ foundLinn: number, foundPos: number }>((resolve, reject) =>
  {
    fs.readFile(filePath, 'utf8', (err, data) =>
    {
      const lower_data = data.toLowerCase();
      const lower_findText = findText.toLowerCase();
      if (err)
        reject('file_findText ' + filePath + ' ' + err)
      else
      {
        let foundLinn = -1;
        let foundPos = -1;
        const fx = lower_data.indexOf(lower_findText);
        if (fx >= 0)
        {
          const lines = lower_data.split('\n');
          for (let linn = 0; linn < lines.length; ++linn)
          {
            const line = lines[linn];
            const pos = line.indexOf(lower_findText);
            if (pos >= 0)
            {
              foundLinn = linn;
              foundPos = pos;
              break;
            }
          }
        }
        resolve({ foundLinn, foundPos });
      }
    });
  });
  return promise;
}

// ------------------------ file_isDirectory ----------------------------
// return promise of fileSystem stat info of a file.
export function file_isDirectory(path): Promise<boolean>
{
  const promise = new Promise<boolean>((resolve, reject) =>
  {
    fs.stat(path, (err, stats) =>
    {
      if (err)
        reject(`file_isDirectory ${path} ${err}`);
      else
        resolve(stats.isDirectory());
    });
  });

  return promise;
}

// --------------------------- file_readLines ----------------------
// return results of fs.readFile as array of text lines.
export function file_readLines(filePath: string): Promise<{ lines: string[], errmsg: string }>
{
  const promise = new Promise<{ lines: string[], errmsg: string }>(async (resolve, reject) =>
  {
    let lines: string[] = [];
    let errmsg = '';
    fs.readFile(filePath, (err, data) =>
    {
      if (data)
      {
        const text = data.toString('utf8');
        lines = text.split('\n');
      }
      else
      {
        errmsg = err.message;
      }
      resolve({ lines, errmsg });
    });
  });
  return promise;
}

// ------------------------ file_stat ----------------------------
// return promise of fileSystem stat info of a file.
export function file_stat(path): Promise<fs.Stats>
{
  const promise = new Promise<fs.Stats>((resolve, reject) =>
  {
    fs.stat(path, (err, stats) =>
    {
      resolve(stats);
    })
  });

  return promise;
}

// ------------------------------ file_ensureExists ------------------------
export async function file_ensureExists(path: string)
{
  const exists = await file_exists(path);
  if (exists == false)
  {
    await file_create(path);
  }
}

// ---------------------------- file_writeNew -----------------------------
// replace contents of existing file. Or write text to new file.
export async function file_writeNew(path: string, text: string) 
{
  const promise = new Promise((resolve, reject) =>
  {
    fs.open(path, 'w', function (err, fd)
    {
      if (err)
      {
        reject('error opening file: ' + err);
      }

      const buf = Buffer.alloc(text.length, text);
      // const buf = new Buffer(text) ;
      fs.write(fd, buf, 0, buf.length, null, (err) =>
      {
        if (err) reject('error writing file: ' + err);
        fs.close(fd, () =>
        {
          resolve();
        });
      });
    });
  });
  return promise;
}
