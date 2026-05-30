const fs = require('fs');

// Fix app.entrepots.tsx
let entrepots = fs.readFileSync('src/routes/app.entrepots.tsx', 'utf8');
entrepots = entrepots.replace('import { DOSSIERS } from "@/lib/mock";\n', '');
fs.writeFileSync('src/routes/app.entrepots.tsx', entrepots);

// Fix app.localisation.tsx
let loc = fs.readFileSync('src/routes/app.localisation.tsx', 'utf8');
loc = loc.replace('import { DOSSIERS } from "@/lib/mock";', 'import { apiGetDossiers } from "@/lib/api";\nimport { useState, useEffect } from "react";');

const hookStr = `
  const [DOSSIERS, setDossiers] = useState<any[]>([]);
  useEffect(() => {
    apiGetDossiers().then(res => setDossiers(res as any[])).catch(() => {});
  }, []);
`;

loc = loc.replace('export const Route = createFileRoute("/app/localisation")({\n  component: () => {', 'export const Route = createFileRoute("/app/localisation")({\n  component: () => {' + hookStr);
fs.writeFileSync('src/routes/app.localisation.tsx', loc);
