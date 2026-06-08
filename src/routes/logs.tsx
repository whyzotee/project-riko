import { createFileRoute } from "@tanstack/react-router";
import { Logs } from "../components/logs/Logs";

export const Route = createFileRoute("/logs")({
  component: LogsPage
});

function LogsPage() {
  return <Logs />;
}
