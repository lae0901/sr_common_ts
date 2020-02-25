"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const os = require("os");
const fs = require("fs");
const path = require("path");
const core_2 = require("./core");
const folderPath = '/c:/github/tester';
const fileName = 'app.vue';
base_async(folderPath, fileName);
if (false) {
    // temporary directory. make sure does not exist.
    const tempDir = os.tmpdir();
    const testDir = path.join(tempDir, 'core_ts');
    try {
        fs.rmdirSync(testDir, { recursive: true });
    }
    catch (e) {
    }
    runTest(testDir);
}
async function runTest(testDir) {
    let wasDeleted = false;
    const { created, errmsg } = await core_1.dir_ensureExists(testDir);
}
async function base_async(folderPath, fileName) {
    const { dirPath, remPath } = await core_2.path_findFile(folderPath, fileName);
    console.log(`dirPath:${dirPath}  remPath:${remPath}`);
}
//# sourceMappingURL=tester.js.map