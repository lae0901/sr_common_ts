"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../src/core");
const folderPath = '/c:/github/tester';
const fileName = 'app.vue';
base_async(folderPath, fileName);
async function base_async(folderPath, fileName) {
    const { dirPath, remPath } = await core_1.path_findFile(folderPath, fileName);
    console.log(`dirPath:${dirPath}  remPath:${remPath}`);
}
//# sourceMappingURL=path-test.js.map