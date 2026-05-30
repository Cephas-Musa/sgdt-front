const fs = require('fs');
let content = fs.readFileSync('backend/app/Http/Controllers/DossierController.php', 'utf8');

// Update store method
const storeRegex = /(if \(\$request->has\('extra_data'\)\) \{\s*\$dossierData\['extra_data'\] = \$request->input\('extra_data'\);\s*\})/;
const newStoreLogic = `$1 else {
            $dossierData['extra_data'] = [];
        }

        if ($request->has('titres_details')) {
            $dossierData['extra_data']['titres_details'] = $request->input('titres_details');
        }
        if ($request->has('declarations_details')) {
            $dossierData['extra_data']['declarations_details'] = $request->input('declarations_details');
        }`;

content = content.replace(storeRegex, newStoreLogic);

// Update update method
const updateRegex = /(if \(\$request->has\('extra_data'\)\) \{\s*\$dossier->extra_data = array_merge\(\(array\) \$dossier->extra_data, \$request->input\('extra_data'\)\);\s*\})/;
const newUpdateLogic = `$1

        $extraData = (array) $dossier->extra_data;
        if ($request->has('titres_details')) {
            $extraData['titres_details'] = $request->input('titres_details');
        }
        if ($request->has('declarations_details')) {
            $extraData['declarations_details'] = $request->input('declarations_details');
        }
        $dossier->extra_data = $extraData;`;

content = content.replace(updateRegex, newUpdateLogic);

fs.writeFileSync('backend/app/Http/Controllers/DossierController.php', content);
