"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const os = require("os");
const fs = require("fs");
const path = require("path");
// temporary directory. make sure does not exist.
const tempDir = os.tmpdir();
const testDir = path.join(tempDir, 'core_ts');
try {
    fs.rmdirSync(testDir, { recursive: true });
}
catch (e) {
}
runTest(testDir);
async function runTest(testDir) {
    let wasDeleted = false;
    const { created, errmsg } = await core_1.dir_ensureExists(testDir);
}
//# sourceMappingURL=tester.js.map