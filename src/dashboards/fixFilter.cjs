const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\HP\\Documents\\sgdt\\src\\dashboards';

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix d.reference?.toLowerCase().includes
      // Fix d.dra?.toLowerCase().includes
      // Fix m.reference?.toLowerCase().includes
      
      let newContent = content.replace(/d\.reference\?\.toLowerCase\(\)\.includes/g, '(d.reference || "").toLowerCase().includes');
      newContent = newContent.replace(/d\.reference\.toLowerCase\(\)\.includes/g, '(d.reference || "").toLowerCase().includes');
      
      newContent = newContent.replace(/d\.dra\?\.toLowerCase\(\)\.includes/g, '(d.dra || "").toLowerCase().includes');
      newContent = newContent.replace(/d\.dra\.toLowerCase\(\)\.includes/g, '(d.dra || "").toLowerCase().includes');
      
      newContent = newContent.replace(/d\.importateur\?\.toLowerCase\(\)\.includes/g, '(d.importateur || "").toLowerCase().includes');
      newContent = newContent.replace(/d\.importateur\.toLowerCase\(\)\.includes/g, '(d.importateur || "").toLowerCase().includes');

      newContent = newContent.replace(/m\.reference\?\.toLowerCase\(\)\.includes/g, '(m.reference || "").toLowerCase().includes');
      newContent = newContent.replace(/m\.reference\.toLowerCase\(\)\.includes/g, '(m.reference || "").toLowerCase().includes');

      newContent = newContent.replace(/m\.vehicule\?\.toLowerCase\(\)\.includes/g, '(m.vehicule || "").toLowerCase().includes');
      newContent = newContent.replace(/m\.vehicule\.toLowerCase\(\)\.includes/g, '(m.vehicule || "").toLowerCase().includes');

      newContent = newContent.replace(/d\.type\?\.toLowerCase\(\) ===/g, '(d.type || "").toLowerCase() ===');
      newContent = newContent.replace(/d\.type\.toLowerCase\(\) ===/g, '(d.type || "").toLowerCase() ===');

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir(dir);
console.log('Done.');
