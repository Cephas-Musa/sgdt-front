const fs = require('fs');

const file = 'c:/Users/HP/Documents/sgdt/src/routes/app.dossiers.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<tbody className="divide-y">
                              {d.articles?.map(art => (
                                <tr key={art.id}>
                                  <td className="py-2 font-bold">{art.designation}</td>
                                  <td className="py-2 text-right font-mono">{art.poids}</td>
                                  <td className="py-2 text-right">{art.quantite}</td>
                                  <td className="py-2 text-right font-black text-success">{art.fob?.toLocaleString()}</td>
                                </tr>
                              )) || (
                                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground italic">Aucun article listǸ</td></tr>
                              )}
                            </tbody>`;

const targetStr2 = `<tbody className="divide-y">
                              {d.articles?.map(art => (
                                <tr key={art.id}>
                                  <td className="py-2 font-bold">{art.designation}</td>
                                  <td className="py-2 text-right font-mono">{art.poids}</td>
                                  <td className="py-2 text-right">{art.quantite}</td>
                                  <td className="py-2 text-right font-black text-success">{art.fob?.toLocaleString()}</td>
                                </tr>
                              )) || (
                                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground italic">Aucun article listé</td></tr>
                              )}
                            </tbody>`;

const replacement = `<tbody className="divide-y">
                              {(() => {
                                const allArticles = [
                                  ...(d.articles || []),
                                  ...(d.representation_entry?.articles || d.representationEntry?.articles || [])
                                ];
                                if (allArticles.length === 0) {
                                  return <tr><td colSpan={4} className="py-8 text-center text-muted-foreground italic">Aucun article listé</td></tr>;
                                }
                                return allArticles.map((art: any, aidx: number) => (
                                  <tr key={art.id || aidx}>
                                    <td className="py-2 font-bold">{art.designation}</td>
                                    <td className="py-2 text-right font-mono">{art.poids}</td>
                                    <td className="py-2 text-right">{art.quantite}</td>
                                    <td className="py-2 text-right font-black text-success">{art.fob?.toLocaleString()}</td>
                                  </tr>
                                ));
                              })()}
                            </tbody>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync(file, content);
    console.log("Replaced using targetStr (with encoding Ǹ)");
} else if (content.includes(targetStr2)) {
    content = content.replace(targetStr2, replacement);
    fs.writeFileSync(file, content);
    console.log("Replaced using targetStr2 (with encoding é)");
} else {
    // maybe try replacing the entire tbody contents using a regex
    content = content.replace(/<tbody className="divide-y">[\s\S]*?<\/tbody>/g, replacement);
    fs.writeFileSync(file, content);
    console.log("Replaced using regex");
}
