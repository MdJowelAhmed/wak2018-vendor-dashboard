import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";

export type DummyConversation = {
  id: string;
  name: string;
  context: "vendor" | "service";
  lastMessage: string;
};

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: DummyConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="space-y-1">
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "hover:bg-muted/80 w-full rounded-md p-2 text-left text-sm transition",
              activeId === c.id && "bg-muted",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="line-clamp-1 font-medium">{c.name}</span>
              <Badge variant="outline" className="capitalize">
                {c.context}
              </Badge>
            </div>
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {c.lastMessage}
            </p>
          </button>
        </li>
      ))}
      {!conversations.length ? (
        <p className="text-muted-foreground text-sm">No conversations.</p>
      ) : null}
    </ul>
  );
}
