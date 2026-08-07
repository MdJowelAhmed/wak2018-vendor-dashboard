import { Package } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
};

export function AuthHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-6 text-center">
      <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl bg-[#895129] shadow-md">
        <Package className="size-5 text-white" aria-hidden />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      ) : null}
    </div>
  );
}
