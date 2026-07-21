import "./CustomSpinner.css";

export function CustomSpinner() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-8">
      <span
        className="loader"
        style={
          {
            "--color-1": "var(--primary)",
            "--size": "1px",
          } as React.CSSProperties
        }
      ></span>
    </div>
  );
}
