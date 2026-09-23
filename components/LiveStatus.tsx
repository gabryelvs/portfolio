export function LiveStatus({ label }: { label: string }) {
  return (
    <span className="status mono">
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
