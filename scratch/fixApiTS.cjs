const fs = require('fs');

let content = fs.readFileSync('src/lib/api.ts', 'utf8');

const splitIdx = content.indexOf('// ==========================================');
if (splitIdx > -1) {
  content = content.substring(0, splitIdx);
}

const methods = `
export async function apiCreateCountry(data: any): Promise<any> {
  return request<any>("/config/countries", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateCountry(id: string, data: any): Promise<any> {
  return request<any>(\`/config/countries/\${id}\`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteCountry(id: string): Promise<any> {
  return request<any>(\`/config/countries/\${id}\`, { method: "DELETE" });
}

export async function apiCreateCurrency(data: any): Promise<any> {
  return request<any>("/config/currencies", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateCurrency(id: string, data: any): Promise<any> {
  return request<any>(\`/config/currencies/\${id}\`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteCurrency(id: string): Promise<any> {
  return request<any>(\`/config/currencies/\${id}\`, { method: "DELETE" });
}

export async function apiCreateLocode(data: any): Promise<any> {
  return request<any>("/config/locodes", { method: "POST", body: JSON.stringify(data) });
}
export async function apiUpdateLocode(id: string, data: any): Promise<any> {
  return request<any>(\`/config/locodes/\${id}\`, { method: "PUT", body: JSON.stringify(data) });
}
export async function apiDeleteLocode(id: string): Promise<any> {
  return request<any>(\`/config/locodes/\${id}\`, { method: "DELETE" });
}
`;

content += methods;

fs.writeFileSync('src/lib/api.ts', content);
