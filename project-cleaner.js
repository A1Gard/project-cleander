const {promisify} = require('util');
const {resolve} = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const path = require('path');
const readline = require("readline");

const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// argumans
let maxLevel = 10;
let debug = false;
let removes = [];
let skip = ['.git'];
let searchPath = '.';
let count = 0;

// pars argumans
process.argv.forEach(function (val, index, array) {
    if ((val === '-l' || val === 'level') && process.argv[index + 1] !== undefined) {
        maxLevel = process.argv[index + 1];
    }
    if (val === '-d' || val === 'debug') {
        debug = true;
    }
    if (val === '-r' || val === 'remove' && process.argv[index + 1] !== undefined) {
        removes = process.argv[index + 1].split(',');
    }
    if (val === '-p' || val === 'path' && process.argv[index + 1] !== undefined) {
        searchPath = process.argv[index + 1];
    }
});


async function getFiles(dir, level = 1) {
    // let count = 0;
    const subdirs = await readdir(dir);
    if (level === 1){
        console.log('start cleaning...');
    }
    try {

        const names = dir.split('/');
        const fname = names[names.length - 1];
        if (removes.indexOf(fname) !== -1) {
                if (fname === 'vendor'){
                    if (await fs.existsSync(dir + '/autoload.php')){
                        console.log('rm',dir);
                        fs.rmSync(dir, { recursive: true, force: true });
                        count++;
                    }
                }else{
                    console.log('rm',dir);
                    fs.rmSync(dir, { recursive: true, force: true });
                    count++;
                }

            return [];
        } else if (skip.indexOf(fname) !== -1) {
            return [];
        } else {

        }
    } catch (e) {
        if (debug)
            console.log(e.message);
    }
    const files = await Promise.all(subdirs.map(async (subdir) => {
        try {
            const names = dir.split('/');
            const fname = names[names.length - 1];
            const res = resolve(dir, subdir);
            if (removes.indexOf(fname) !== -1) {
                return res;
            } else if (skip.indexOf(fname) !== -1) {
                return res;
            } else {
                return (await stat(res)).isDirectory() && maxLevel > level ? getFiles(res, level + 1) : res;
            }
        } catch (e) {
            if (debug)
                console.log(e.message);
        }

    }));
    return files.reduce((a, f) => a.concat(f), []);
}


;(async () => {
    console.log('Clean detail:');
    console.log('removes:', removes.join(','));
    console.log('path:', searchPath);
    console.log('max level:', maxLevel );
    console.log('................................');
    interface.question("Are you sure to contintue? (y/n) ",async function(ans) {
        if (ans == "y" || ans == "yes") {
            await getFiles(searchPath);
            console.log('removed dirs: ', count);
        } else {
            console.log("oh..., cancel");
        }
        // pause the interface so the program can exit
        interface.pause();
    });




})();
// fs.rmSync(dir, { recursive: true, force: true });