const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
    const list = fs.readdirSync(dir);
    for (let file of list) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath, files);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            files.push(filePath);
        }
    }
    return files;
}

const allFiles = walk('c:/Users/HP/Documents/sgdt/src');
let changed = false;

for (let file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find all occurrences of import { ... apiGetDossiers ... } from "@/lib/api"
    const apiImportRegex = /import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/api["'];?/g;
    let match;
    let importBlocks = [];
    
    while ((match = apiImportRegex.exec(content)) !== null) {
        importBlocks.push({
            fullMatch: match[0],
            content: match[1],
            index: match.index
        });
    }

    if (importBlocks.length > 0) {
        let allNamedImports = [];
        let newContent = content;
        let modifiedFile = false;
        
        // Count how many times apiGetDossiers is imported
        let count = 0;
        for (let block of importBlocks) {
            const imports = block.content.split(',').map(i => i.trim()).filter(Boolean);
            if (imports.includes('apiGetDossiers')) {
                count++;
            }
        }
        
        if (count > 1) {
            // we have duplicates
            console.log(`Fixing duplicate apiGetDossiers in ${file}`);
            let firstSeen = false;
            
            // replace all import blocks
            newContent = newContent.replace(apiImportRegex, (match, innerContent) => {
                let imports = innerContent.split(',').map(i => i.trim()).filter(Boolean);
                
                if (imports.includes('apiGetDossiers')) {
                    if (!firstSeen) {
                        firstSeen = true; // keep it here
                    } else {
                        // remove it from subsequent imports
                        imports = imports.filter(i => i !== 'apiGetDossiers');
                    }
                }
                
                if (imports.length === 0) return '';
                return `import { ${imports.join(', ')} } from "@/lib/api";`;
            });
            
            fs.writeFileSync(file, newContent);
            changed = true;
        }
    }
}

if (!changed) {
    console.log("No duplicate imports found.");
}
