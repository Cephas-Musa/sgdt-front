const fs = require('fs');
const path = require('path');

const dir = 'src/dashboards';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const apiImports = `import { useApi } from "@/lib/api";
import { apiGetDossiers, apiGetAlertes } from "@/lib/api";`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // If it uses DOSSIERS from mock
  if (content.includes('import {') && content.includes('DOSSIERS') && content.includes('@/lib/mock')) {
    
    // 1. Add apiGetDossiers to imports if not there
    if (!content.includes('apiGetDossiers')) {
      if (content.includes('import { useApi')) {
        content = content.replace(/import \{ useApi(.*?) \} from "@\/lib\/api";/, 'import { useApi$1, apiGetDossiers } from "@/lib/api";');
      } else {
        content = content.replace(/import \{ DOSSIERS/, `import { useApi, apiGetDossiers } from "@/lib/api";\nimport { DOSSIERS`);
      }
    }

    // 2. Inject useApi(apiGetDossiers) into the component body
    // Find the main component function
    const componentRegex = /export default function (\w+)\(\) \{([\s\S]*?)return \(/;
    const match = content.match(componentRegex);
    if (match) {
      const funcBody = match[2];
      if (!funcBody.includes('apiGetDossiers')) {
        const injected = `\n  const { data: rawDossiers } = useApi(apiGetDossiers);\n  const activeDossiers = rawDossiers as any[] || [];\n` + funcBody;
        content = content.replace(funcBody, injected);
      }
    }

    // 3. Replace DOSSIERS.length with activeDossiers.length
    content = content.replace(/DOSSIERS\.length/g, 'activeDossiers.length');
    
    // Replace DOSSIERS.filter(...) with activeDossiers.filter(...)
    content = content.replace(/DOSSIERS\.filter/g, 'activeDossiers.filter');

    // Replace DOSSIERS.slice(...) with activeDossiers.slice(...)
    content = content.replace(/DOSSIERS\.slice/g, 'activeDossiers.slice');

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
