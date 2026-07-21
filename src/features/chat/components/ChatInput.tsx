import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <Input
        className="flex-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Type a message…"
      />
      <Button
        type="button"
        className="bg-[#895129] hover:bg-[#7b4723]"
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        Send
      </Button>
    </div>
  );
}
