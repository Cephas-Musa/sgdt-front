const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\HP\\Documents\\sgdt\\src\\routes';

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
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

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir(dir);
console.log('Routes done.');
