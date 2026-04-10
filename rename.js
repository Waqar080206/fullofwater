const fs = require('fs');
const path = require('path');

const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'artifacts', 'cache', 'typechain-types'];
const extensions = ['.ts', '.js', '.tsx', '.json', '.md', '.sol', '.css', '.html'];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                processDir(fullPath);
            }
        } else if (extensions.includes(path.extname(file))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content
                .replace(/LapLogicCore/g, 'LapLogicCore')
                .replace(/lapLogicCore/g, 'lapLogicCore')
                .replace(/LAPLOGIC_CORE/g, 'LAPLOGIC_CORE')
                .replace(/LapLogic/g, 'LapLogic')
                .replace(/laplogic/g, 'laplogic')
                .replace(/LapLogic/g, 'LapLogic')
                .replace(/laplogic/g, 'laplogic')
                .replace(/laplogic/g, 'laplogic')
                .replace(/LAPLOGIC/g, 'LAPLOGIC');
                
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDir(__dirname);
console.log('Done!');
