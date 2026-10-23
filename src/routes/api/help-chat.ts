import { createFileRoute } from "@tanstack/react-router";
import { handleHelpChat } from "@/lib/ai/help.server";

export const Route = createFileRoute("/api/help-chat")({ server: { handlers: { POST: ({ request }) => handleHelpChat(request) } } });
