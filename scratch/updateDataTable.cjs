const fs = require('fs');

let content = fs.readFileSync('src/components/DataTable.tsx', 'utf8');
const replacement = `{c.render
                      ? c.render(row, (current - 1) * pageSize + rowIndex)
                      : (() => {
                          const val = (row as Record<string, unknown>)[c.key];
                          return (val === null || val === undefined || val === "") ? "-" : (val as ReactNode);
                        })()}`;

content = content.replace(/\{c\.render[\s\S]*?: \(\(row as Record<string, ReactNode>\)\[c\.key\] as ReactNode\)\}/, replacement);

fs.writeFileSync('src/components/DataTable.tsx', content);
