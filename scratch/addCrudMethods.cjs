const fs = require('fs');
let c = fs.readFileSync('backend/app/Http/Controllers/ConfigurationController.php', 'utf8');

const crudCountries = `
    public function storeCountry(Request $request) {
        $v = $request->validate([
            'id' => 'required|string|unique:pays,id',
            'code' => 'required|string',
            'designation' => 'required|string',
        ]);
        return response()->json(\\App\\Models\\Pays::create($v), 201);
    }
    public function updateCountry(Request $request, $id) {
        $p = \\App\\Models\\Pays::findOrFail($id);
        $v = $request->validate([
            'code' => 'sometimes|string',
            'designation' => 'sometimes|string',
        ]);
        $p->update($v);
        return response()->json($p);
    }
    public function destroyCountry($id) {
        \\App\\Models\\Pays::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
`;

const crudCurrencies = `
    public function storeCurrency(Request $request) {
        $v = $request->validate([
            'id' => 'required|string|unique:devises,id',
            'code_pays' => 'required|string',
            'code_devise' => 'required|string',
            'denomination' => 'required|string',
        ]);
        return response()->json(\\App\\Models\\Devise::create($v), 201);
    }
    public function updateCurrency(Request $request, $id) {
        $d = \\App\\Models\\Devise::findOrFail($id);
        $v = $request->validate([
            'code_pays' => 'sometimes|string',
            'code_devise' => 'sometimes|string',
            'denomination' => 'sometimes|string',
        ]);
        $d->update($v);
        return response()->json($d);
    }
    public function destroyCurrency($id) {
        \\App\\Models\\Devise::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
`;

const crudLocodes = `
    public function storeLocode(Request $request) {
        $v = $request->validate([
            'id' => 'required|string|unique:locodes,id',
            'code' => 'required|string',
            'designation' => 'required|string',
            'code_pays' => 'required|string',
            'denomination' => 'required|string',
        ]);
        return response()->json(\\App\\Models\\Locode::create($v), 201);
    }
    public function updateLocode(Request $request, $id) {
        $l = \\App\\Models\\Locode::findOrFail($id);
        $v = $request->validate([
            'code' => 'sometimes|string',
            'designation' => 'sometimes|string',
            'code_pays' => 'sometimes|string',
            'denomination' => 'sometimes|string',
        ]);
        $l->update($v);
        return response()->json($l);
    }
    public function destroyLocode($id) {
        \\App\\Models\\Locode::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
`;

c = c.replace('    public function getCurrencies()', crudCountries + '\n    public function getCurrencies()');
c = c.replace('    public function getCustomsOffices()', crudCurrencies + '\n    public function getCustomsOffices()');
c = c.replace('    public function getWarehouses()', crudLocodes + '\n    public function getWarehouses()');

fs.writeFileSync('backend/app/Http/Controllers/ConfigurationController.php', c);
