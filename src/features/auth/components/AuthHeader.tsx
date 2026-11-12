

type Props = {
  title: string;
  subtitle?: string;
};

export function AuthHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-6 text-center">
      <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-[#895129] shadow-md">
    <img src="/logo.png" alt="Logo" className="h-full w-full object-cover rounded-full" /> 
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
