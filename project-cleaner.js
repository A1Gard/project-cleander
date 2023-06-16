const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);


let max_level = 10;
process.argv.forEach(function (val, index, array) {
    if ((val === '-l' || val == 'level' ) && process.argv[index+1] !== undefined ){
        max_level =  process.argv[index+1];
    }
});

async function getFiles(dir, level = 1) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() && max_level > level ? getFiles(res,level+1) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}


;(async () => {
    let files = await getFiles('.');
    console.log(files.length);
})();