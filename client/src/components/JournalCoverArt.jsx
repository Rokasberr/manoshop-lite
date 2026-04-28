const JournalCoverArt = ({ cover, compact = false }) => {
  const sizeClasses = compact ? "aspect-[4/3] p-5" : "aspect-[16/10] p-6 sm:p-8";

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 ${sizeClasses}`}
      style={{ background: cover.background }}
    >
      <div
        className="absolute inset-y-6 right-6 w-[32%] rounded-[24px] border border-white/12"
        style={{ background: cover.panel }}
      />
      <div
        className="absolute -left-10 top-8 h-32 w-32 rounded-full blur-2xl"
        style={{ background: cover.blur }}
      />
      <div
        className="absolute bottom-6 right-[18%] h-24 w-24 rounded-full border border-white/12 blur-[2px]"
        style={{ background: cover.accent }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/58">{cover.issue}</p>
          <p className="mt-3 max-w-[68%] font-display text-3xl font-bold leading-[0.95] text-white sm:text-4xl">
            {cover.heading}
          </p>
        </div>

        <div className="space-y-2">
          {cover.lines.map((line) => (
            <div key={line} className="inline-flex rounded-full bg-white/8 px-3 py-1 text-xs text-white/70 mr-2">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalCoverArt;
