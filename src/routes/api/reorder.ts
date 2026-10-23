import { createFileRoute } from "@tanstack/react-router";
import { handleReorder } from "@/lib/ai/reorder.server";

export const Route = createFileRoute("/api/reorder")({ server: { handlers: { POST: ({ request }) => handleReorder(request) } } });