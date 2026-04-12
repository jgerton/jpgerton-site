type ModuleHeaderProps = {
  moduleNumber: number;
  totalModules: number;
  title: string;
  description?: string;
  sectionCount: number;
  exerciseCount: number;
  readTimeMinutes: number;
};

export function ModuleHeader({
  moduleNumber,
  totalModules,
  title,
  description,
  sectionCount,
  exerciseCount,
  readTimeMinutes,
}: ModuleHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl p-8 mb-8" style={{
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    }}>
      <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full" style={{
        background: "rgba(13,148,136,0.15)",
      }} />
      <div className="absolute -bottom-8 right-10 w-20 h-20 rounded-full" style={{
        background: "rgba(245,158,11,0.1)",
      }} />

      <div className="relative">
        <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#0D9488" }}>
          Module {moduleNumber} of {totalModules}
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-50 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
            {description}
          </p>
        )}
        <div className="flex gap-4 mt-4 text-xs text-slate-500">
          <span><span style={{ color: "#0D9488" }}>●</span> {sectionCount} sections</span>
          <span><span style={{ color: "#6366F1" }}>●</span> {exerciseCount} exercises</span>
          <span><span style={{ color: "#F59E0B" }}>●</span> {readTimeMinutes} min read</span>
        </div>
      </div>
    </div>
  );
}
