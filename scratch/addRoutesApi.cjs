const fs = require('fs');

let apiPhp = fs.readFileSync('backend/routes/api.php', 'utf8');
const crudRoutes = `
    Route::post('/countries', [ConfigurationController::class, 'storeCountry']);
    Route::put('/countries/{id}', [ConfigurationController::class, 'updateCountry']);
    Route::delete('/countries/{id}', [ConfigurationController::class, 'destroyCountry']);
    
    Route::post('/currencies', [ConfigurationController::class, 'storeCurrency']);
    Route::put('/currencies/{id}', [ConfigurationController::class, 'updateCurrency']);
    Route::delete('/currencies/{id}', [ConfigurationController::class, 'destroyCurrency']);
    
    Route::post('/locodes', [ConfigurationController::class, 'storeLocode']);
    Route::put('/locodes/{id}', [ConfigurationController::class, 'updateLocode']);
    Route::delete('/locodes/{id}', [ConfigurationController::class, 'destroyLocode']);
`;

if (!apiPhp.includes("storeCountry")) {
  apiPhp = apiPhp.replace("Route::post('/customs-offices',", crudRoutes + "\n        Route::post('/customs-offices',");
  fs.writeFileSync('backend/routes/api.php', apiPhp);
}

let apiTs = fs.readFileSync('src/lib/api.ts', 'utf8');

const apiTsMethods = `
// ==========================================
// CRUD Configuration (Pays, Devises, Locodes)
// ==========================================

export async function apiGetCountries(): Promise<any[]> {
  return request<any[]>("/countries");
}
export async function apiCreateCountry(data: any): Promise<any> {
  return request<any>("/countries", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateCountry(id: string, data: any): Promise<any> {
  return request<any>(\`/countries/\${id}\`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteCountry(id: string): Promise<any> {
  return request<any>(\`/countries/\${id}\`, { method: "DELETE" });
}

export async function apiGetCurrencies(): Promise<any[]> {
  return request<any[]>("/currencies");
}
export async function apiCreateCurrency(data: any): Promise<any> {
  return request<any>("/currencies", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateCurrency(id: string, data: any): Promise<any> {
  return request<any>(\`/currencies/\${id}\`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteCurrency(id: string): Promise<any> {
  return request<any>(\`/currencies/\${id}\`, { method: "DELETE" });
}

export async function apiGetLocodes(): Promise<any[]> {
  return request<any[]>("/locodes");
}
export async function apiCreateLocode(data: any): Promise<any> {
  return request<any>("/locodes", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateLocode(id: string, data: any): Promise<any> {
  return request<any>(\`/locodes/\${id}\`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteLocode(id: string): Promise<any> {
  return request<any>(\`/locodes/\${id}\`, { method: "DELETE" });
}
`;

if (!apiTs.includes("apiCreateCountry")) {
  apiTs = apiTs + "\n" + apiTsMethods;
  fs.writeFileSync('src/lib/api.ts', apiTs);
}
