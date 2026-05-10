import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/app/parking")({
  component: () => <StubPage title="Parking" description="Gestion des véhicules stationnés." />,
});
