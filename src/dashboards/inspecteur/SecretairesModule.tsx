import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { Panel } from "@/dashboards/_shared";
import { toast } from "sonner";
import { Users, Copy, Eye, EyeOff, UserPlus, Shield } from "lucide-react";
import { SECRETAIRES_INSPECTEUR, type SecretaireInsp } from "@/lib/mock";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function SecretairesModule() {
  const [secretaires] = useState<SecretaireInsp[]>(SECRETAIRES_INSPECTEUR);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const [genPwd, setGenPwd] = useState("");

  return (
    <Panel
      title="Gestion des Secrétaires"
      actions={
        <FormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              Nouveau secrétaire
            </Button>
          }
          title="Créer un Secrétaire Inspecteur"
          submitLabel="Enregistrer"
          onSubmit={() => toast.success("Secrétaire créé avec succès. Copiez les identifiants.")}
        >
          <FormGrid>
            <Field label="Nom" required>
              <Input />
            </Field>
            <Field label="Post-nom" required>
              <Input />
            </Field>
            <Field label="Prénom" required>
              <Input />
            </Field>
            <Field label="Matricule" required>
              <Input placeholder="SEC-XXX" />
            </Field>
            <Field label="Fonction">
              <Input value="Secrétaire Inspecteur" readOnly className="bg-muted/50" />
            </Field>
            <Field label="Identifiant (auto ou manuel)">
              <Input placeholder="p.nom" />
            </Field>
          </FormGrid>
          <div className="mt-3 space-y-2">
            <Field label="Mot de passe">
              <div className="flex gap-2">
                <Input
                  value={genPwd}
                  onChange={(e) => setGenPwd(e.target.value)}
                  placeholder="Générer ou saisir"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGenPwd(generatePassword())}
                >
                  Générer
                </Button>
              </div>
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`ID: ... | MDP: ${genPwd}`);
                toast.info("Identifiants copiés dans le presse-papier");
              }}
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copier identifiants
            </Button>
          </div>
        </FormDialog>
      }
    >
      <div className="mb-3 flex items-center gap-2 rounded-md bg-accent/5 border border-accent/20 p-3 text-sm">
        <Shield className="h-4 w-4 text-accent shrink-0" />
        <span>
          Vous êtes le seul à pouvoir créer et gérer vos secrétaires. Chaque secrétaire vous est
          rattaché.
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
            <tr>
              <th className="px-3 py-2">Nom complet</th>
              <th className="px-3 py-2">Matricule</th>
              <th className="px-3 py-2">Identifiant</th>
              <th className="px-3 py-2">Mot de passe</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Dossiers</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {secretaires?.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-medium">
                  {s.prenom} {s.nom} {s.postNom}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{s.matricule}</td>
                <td className="px-3 py-2 font-mono text-xs">{s.identifiant}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">
                      {showPwd[s.id] ? s.motDePasse : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowPwd((p) => ({ ...p, [s.id]: !p[s.id] }))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showPwd[s.id] ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(s.motDePasse);
                        toast.info("Mot de passe copié");
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${s.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">
                  {s.dossiersTraites}/{s.dossiersAssignes}
                </td>
                <td className="px-3 py-2 text-xs">{s.dateCreation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
