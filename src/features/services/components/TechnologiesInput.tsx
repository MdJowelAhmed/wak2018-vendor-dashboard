import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";

export type TechnologiesValue = {
  frontend: string;
  backend: string;
  database: string;
};

export function TechnologiesInput({
  value,
  onChange,
  className,
}: {
  value: TechnologiesValue;
  onChange: (next: TechnologiesValue) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-3", className)}>
      <div className="grid gap-2">
        <Label htmlFor="tech-frontend">Frontend</Label>
        <Input
          id="tech-frontend"
          value={value.frontend}
          onChange={(e) => onChange({ ...value, frontend: e.target.value })}
          placeholder="e.g. React"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tech-backend">Backend</Label>
        <Input
          id="tech-backend"
          value={value.backend}
          onChange={(e) => onChange({ ...value, backend: e.target.value })}
          placeholder="e.g. Node.js"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tech-database">Database</Label>
        <Input
          id="tech-database"
          value={value.database}
          onChange={(e) => onChange({ ...value, database: e.target.value })}
          placeholder="e.g. PostgreSQL"
        />
      </div>
    </div>
  );
}
