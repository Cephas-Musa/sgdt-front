const fs = require('fs');
const file = 'c:/Users/HP/Documents/sgdt/src/routes/app.dossiers.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<tbody className="divide-y">\s*\{d\.articles\?\.map[^]*?<\/tbody>/g;

const replacement = `<tbody className="divide-y">
                                {(() => {
                                  const allArticles = [
                                    ...(d.articles || []),
                                    ...(d.representation_entry?.articles || d.representationEntry?.articles || [])
                                  ];
                                  if (allArticles.length === 0) {
                                    return <tr><td colSpan={4} className="py-8 text-center text-muted-foreground italic">Aucun article listé</td></tr>;
                                  }
                                  return allArticles.map((art, idx) => (
                                    <tr key={art.id || idx}>
                                      <td className="py-2 font-bold">{art.designation}</td>
                                      <td className="py-2 text-right font-mono">{art.poids}</td>
                                      <td className="py-2 text-right">{art.quantite}</td>
                                      <td className="py-2 text-right font-black text-success">{art.fob?.toLocaleString()}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Success');
} else {
  console.log('Not found');
}
