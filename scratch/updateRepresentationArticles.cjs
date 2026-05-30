const fs = require('fs');
const file = 'c:/Users/HP/Documents/sgdt/src/routes/app.representation.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<tbody className="divide-y">\s*\{d\.representationEntry\?\.articles\?\.length > 0 \?\s*\(\s*d\.representationEntry\.articles\.map\(\(art: any, i: number\) => \(\s*<tr key=\{art\.id \|\| i\}>\s*<td className="py-2 font-bold uppercase">\{art\.designation \|\| "-"}<\/td>\s*<td className="py-2 text-right font-mono">\{art\.poids \|\| "-"}<\/td>\s*<td className="py-2 text-right">\{art\.quantite \|\| "-"}<\/td>\s*<td className="py-2 text-right font-black text-success">\{art\.fob \? Number\(art\.fob\)\.toLocaleString\(\) : "-"}<\/td>\s*<\/tr>\s*\)\s*\)\s*\)\s*:\s*\(\s*<tr><td colSpan=\{4\} className="py-8 text-center text-muted-foreground italic">Aucun article enregistré pour ce dossier<\/td><\/tr>\s*\)\s*\}\s*<\/tbody>/g;

const replacement = `<tbody className="divide-y">
                                      {(() => {
                                        const allArticles = [
                                          ...(d.articles || []),
                                          ...(d.representation_entry?.articles || d.representationEntry?.articles || [])
                                        ];
                                        if (allArticles.length === 0) {
                                          return <tr><td colSpan={4} className="py-8 text-center text-muted-foreground italic">Aucun article enregistré pour ce dossier</td></tr>;
                                        }
                                        return allArticles.map((art: any, i: number) => (
                                          <tr key={art.id || i}>
                                            <td className="py-2 font-bold uppercase">{art.designation || "-"}</td>
                                            <td className="py-2 text-right font-mono">{art.poids || "-"}</td>
                                            <td className="py-2 text-right">{art.quantite || "-"}</td>
                                            <td className="py-2 text-right font-black text-success">{art.fob ? Number(art.fob).toLocaleString() : "-"}</td>
                                          </tr>
                                        ));
                                      })()}
                                    </tbody>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Success app.representation.tsx');
} else {
  console.log('Not found in app.representation.tsx');
}
