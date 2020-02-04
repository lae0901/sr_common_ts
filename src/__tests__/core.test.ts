import { file_isDir, dir_ensureExists, dir_mkdir } from '../core';
import os from 'os' ;
import * as fs from 'fs';
import * as path from 'path';

let tempDir = '' ;
let testDir = '' ;

// Applies to all tests in this file
beforeAll(() =>
{
});

// Applies to all tests in this file
beforeEach(() =>
{
  // temporary directory. make sure does not exist.
  tempDir = os.tmpdir();
  testDir = path.join(tempDir, 'core_ts');
  try
  {
    fs.rmdirSync(testDir, { recursive: true });
  }
  catch (e)
  {
  }
});

it('dir_mkdir', async () =>
{
  // create test dir.
  {
    const { exists, errmsg } = await dir_mkdir(testDir) ;
    expect( exists ).toBe(false) ;
  }
});

it('file_isDir', async () =>
{
  // create test dir.
  {
    const { exists, errmsg } = await dir_mkdir(testDir);
  }

  // check that the test dir exists.
  {
    const { isDir, errmsg } = await file_isDir(testDir);
    expect(isDir).toBe(true);
  }
});

// use dir_ensureExists to create the dir.
it('dir_ensureExists', async () =>
{
   const { created, errmsg } = await dir_ensureExists(testDir);
   expect(created).toBe(true);
});

