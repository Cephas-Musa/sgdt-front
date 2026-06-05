import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetEntryPoints, apiCreateEntryPoint, apiGetExitPoints, apiCreateExitPoint } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/app/configuration")({
  component: ConfigPage,
});

function ConfigPage() {
  const { data: rawEntryPoints, reload: reloadEntry } = useApi(() => apiGetEntryPoints({}), []);
  const { data: rawExitPoints, reload: reloadExit } = useApi(() => apiGetExitPoints({}), []);
  const entryPoints = (rawEntryPoints || []) as any[];
  const exitPoints = (rawExitPoints || []) as any[];

  const [entryCode, setEntryCode] = useState("");
  const [entryDesignation, setEntryDesignation] = useState("");
  const [exitCode, setExitCode] = useState("");
  const [exitDesignation, setExitDesignation] = useState("");
  const [newType, setNewType] = useState<"sortie" | "entree_pays">("sortie");

  const handleCreateEntry = async () => {
    if (!entryCode || !entryDesignation) { toast.error("Code et dénomination requis"); return; }
    try {
      await apiCreateEntryPoint({ code: entryCode, designation: entryDesignation, type: "entree_pays" });
      toast.success("Point d'entrée ajouté");
      setEntryCode(""); setEntryDesignation("");
      reloadEntry();
    } catch (e: any) { toast.error(e?.message || "Erreur"); }
  };

  const handleCreateExit = async () => {
    if (!exitCode || !exitDesignation) { toast.error("Code et dénomination requis"); return; }
    try {
      await apiCreateExitPoint({ code: exitCode, designation: exitDesignation });
      toast.success("Point de sortie ajouté");
      setExitCode(""); setExitDesignation("");
      reloadExit();
    } catch (e: any) { toast.error(e?.message || "Erreur"); }
  };

  const points = newType === "sortie" ? exitPoints : entryPoints;

  return (
    <div>
      <PageHeader
        title="Configuration"
        description="Bureaux de sortie et bureaux d'entrée pays"
        actions={
          <FormDialog
            trigger={
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter un bureau
              </Button>
            }
            title="Nouveau bureau"
          >
            <Tabs defaultValue="sortie" onValueChange={(v) => setNewType(v as "sortie" | "entree_pays")}>
              <TabsList>
                <TabsTrigger value="sortie">Bureau sortie</TabsTrigger>
                <TabsTrigger value="entree">Bureau entrée pays</TabsTrigger>
              </TabsList>
              <TabsContent value="sortie" className="space-y-3 pt-3">
                <FormGrid>
                  <Field label="Code (ex: UGMPO / UGCYKA)">
                    <Input value={exitCode} onChange={(e) => setExitCode(e.target.value)} />
                  </Field>
                  <Field label="Dénomination (ex: MPONDWE / CHANIKA)">
                    <Input value={exitDesignation} onChange={(e) => setExitDesignation(e.target.value)} />
                  </Field>
                </FormGrid>
                <Button onClick={handleCreateExit} className="w-full mt-2">Enregistrer</Button>
              </TabsContent>
              <TabsContent value="entree" className="space-y-3 pt-3">
                <FormGrid>
                  <Field label="Code (ex: 617B / 603B)">
                    <Input value={entryCode} onChange={(e) => setEntryCode(e.target.value)} />
                  </Field>
                  <Field label="Dénomination (ex: KASINDI / GOMA VILLE)">
                    <Input value={entryDesignation} onChange={(e) => setEntryDesignation(e.target.value)} />
                  </Field>
                </FormGrid>
                <Button onClick={handleCreateEntry} className="w-full mt-2">Enregistrer</Button>
              </TabsContent>
            </Tabs>
          </FormDialog>
        }
      />
      <div className="mt-4">
        <Tabs value={newType} onValueChange={(v) => setNewType(v as "sortie" | "entree_pays")}>
          <TabsList>
            <TabsTrigger value="sortie">Bureaux de sortie ({exitPoints.length})</TabsTrigger>
            <TabsTrigger value="entree">Bureaux d'entrée pays ({entryPoints.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="sortie" className="pt-4">
            <DataTable
              data={exitPoints.map((p: any) => ({ ...p, id: p.id || p.code }))}
              columns={[
                { key: "code", header: "Code" },
                { key: "designation", header: "Dénomination" },
              ]}
            />
          </TabsContent>
          <TabsContent value="entree" className="pt-4">
            <DataTable
              data={entryPoints.map((p: any) => ({ ...p, id: p.id || p.code }))}
              columns={[
                { key: "code", header: "Code" },
                { key: "designation", header: "Dénomination" },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
