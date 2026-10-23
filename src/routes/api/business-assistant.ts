import { createFileRoute } from "@tanstack/react-router";
import { handleBusinessAssistant } from "@/lib/ai/business-assistant.server";
export const Route = createFileRoute("/api/business-assistant")({ server: { handlers: { POST: ({ request }) => handleBusinessAssistant(request) } } });