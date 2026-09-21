export type ConnectorReadiness = { ready: boolean };

export async function getConnectorReadiness(): Promise<ConnectorReadiness> {
  const res = await fetch("/api/connectors/readiness", { method: "POST" });
  if (!res.ok) return { ready: false };
  return (await res.json()) as ConnectorReadiness;
}
