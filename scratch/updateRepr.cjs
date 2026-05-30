const fs = require('fs');

let content = fs.readFileSync('src/routes/app.representation.tsx', 'utf8');

content = content.replace('import { LOCODES, PAYS, DEVISES, DOSSIERS, NOTIFICATIONS } from "@/lib/mock";', 
`import { 
  apiGetLocodes, apiCreateLocode, apiUpdateLocode, apiDeleteLocode,
  apiGetCountries, apiCreateCountry, apiUpdateCountry, apiDeleteCountry,
  apiGetCurrencies, apiCreateCurrency, apiUpdateCurrency, apiDeleteCurrency,
  apiGetDossiers
} from "@/lib/api";`);

// Instead of rewriting the whole logic, I'll inject hooks for fetching data.
const hooksAndState = `
  const { user } = useAuth();
  const isChefRepr = user?.role === "chef_bureau_repr";

  const [locodes, setLocodes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [dossiers, setDossiers] = useState<any[]>([]);
  
  const reloadData = async () => {
    try {
      const [loc, cty, cur, dos] = await Promise.all([
        apiGetLocodes(), apiGetCountries(), apiGetCurrencies(), apiGetDossiers()
      ]);
      setLocodes(loc); setCountries(cty); setCurrencies(cur); setDossiers(dos as any[]);
    } catch (e) {}
  };
  
  useEffect(() => { reloadData(); }, []);

  // Search & Filter States
`;

content = content.replace(/  const \{ user \} = useAuth\(\);\n  const isChefRepr = user\?.role === "chef_bureau_repr";\n\n  \/\/ Search & Filter States/g, hooksAndState);

// Fix auto-fill logic to use 'countries' state instead of 'PAYS' mock
content = content.replace(/const found = PAYS\.find/g, 'const found = countries.find');
content = content.replace(/const filteredDossiers = DOSSIERS\.filter/g, 'const filteredDossiers = dossiers.filter');

// Update DataTables
content = content.replace(/data=\{LOCODES\}/g, 'data={locodes}');
content = content.replace(/data=\{PAYS\}/g, 'data={countries}');
content = content.replace(/data=\{DEVISES\}/g, 'data={currencies}');

// Add Submit Handlers for Forms
const locodeSubmit = `
                onSubmit={async () => {
                  try {
                    await apiCreateLocode({ id: 'LOC-'+Date.now(), ...newLocode });
                    toast.success("Locode ajouté");
                    setNewLocode({ code: "", designation: "", codePays: "", denomination: "" });
                    reloadData();
                  } catch(e) { toast.error("Erreur") }
                }}
`;
content = content.replace(/onSubmit=\{\(\) => \{\n\s*toast\.success\("Locode ajouté avec succès"\);\n\s*setNewLocode\(\{ code: "", designation: "", codePays: "", denomination: "" \}\);\n\s*\}\}/, locodeSubmit);

const paysSubmit = `
                onSubmit={async () => {
                  try {
                    await apiCreateCountry({ id: 'PAYS-'+Date.now(), code: newLocode.codePays, designation: newLocode.denomination }); // Reusing state from original UI loosely
                    toast.success("Pays ajouté");
                    reloadData();
                  } catch(e) { toast.error("Erreur") }
                }}
`;
content = content.replace(/onSubmit=\{\(\) => toast\.success\("Pays ajouté"\)\}/, paysSubmit);

const deviseSubmit = `
                onSubmit={async () => {
                  try {
                    await apiCreateCurrency({ id: 'DEV-'+Date.now(), code_pays: newDevise.codePays, code_devise: newDevise.codeDevise, denomination: newDevise.denominationDevise });
                    toast.success("Devise ajoutée");
                    setNewDevise({ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" });
                    reloadData();
                  } catch(e) { toast.error("Erreur") }
                }}
`;
content = content.replace(/onSubmit=\{\(\) => \{\n\s*toast\.success\("Devise ajoutée"\);\n\s*setNewDevise\(\{ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" \}\);\n\s*\}\}/, deviseSubmit);

fs.writeFileSync('src/routes/app.representation.tsx', content);
