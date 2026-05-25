export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 font-display font-bold text-2xl tracking-widest ${className}`}>
      <span className="text-foreground">VO</span>
      <span className="text-primary text-glow-cyan">X</span>
      <span className="text-foreground">A</span>
    </div>
  );
}
