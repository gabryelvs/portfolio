import type { Sequence } from "@/lib/sequences";

const WIDE_W = 1000;
const TOP = 60;
const ROW = 34;
const NARROW_ROW = 52;

/**
 * Splits a sequence step label at its first two-space separator.
 * The part before the separator is the short main label; the rest,
 * trimmed, is an optional detail line. Labels without the separator
 * have no detail.
 */
export function splitLabel(label: string): { main: string; detail: string | null } {
  const i = label.indexOf("  ");
  if (i === -1) return { main: label, detail: null };
  const main = label.slice(0, i);
  const detail = label.slice(i + 2).trim();
  return { main, detail: detail.length > 0 ? detail : null };
}

export function SequenceDiagram({ seq }: { seq: Sequence }) {
  const n = seq.lanes.length;
  const laneX = (id: string) => {
    const i = seq.lanes.findIndex((l) => l.id === id);
    return 90 + (i * (WIDE_W - 180)) / Math.max(n - 1, 1);
  };
  const wideH = TOP + seq.steps.length * ROW;
  const narrowH = 40 + seq.steps.length * NARROW_ROW;

  return (
    <figure className="hero-dgm">
      <svg className="dgm dgm-wide" viewBox={`0 0 ${WIDE_W} ${wideH}`} role="img" aria-labelledby={`${seq.id}-wt`} aria-describedby={`${seq.id}-wd`}>
        <title id={`${seq.id}-wt`}>{seq.title}</title>
        <desc id={`${seq.id}-wd`}>{seq.desc}</desc>
        <g fontSize="12">
          {seq.lanes.map((l) => (
            <text key={l.id} x={laneX(l.id)} y={20} textAnchor="middle" className="t-muted">
              {l.label}
            </text>
          ))}
        </g>
        {seq.lanes.map((l) => (
          <path key={l.id} className="link" d={`M${laneX(l.id)} 32 V${wideH - 8}`} strokeDasharray="2 4" />
        ))}
        <g fontSize="12">
          {seq.steps.map((s, i) => {
            const y = TOP + i * ROW;
            if (s.kind === "note") {
              const x = laneX(s.at);
              const w = s.label.length * 7.4 + 20;
              return (
                <g key={i}>
                  <rect className="node-strong" x={x - w / 2} y={y - 14} width={w} height={26} rx={4} />
                  <text x={x} y={y + 3} textAnchor="middle">
                    {s.label}
                  </text>
                </g>
              );
            }
            const x1 = laneX(s.from);
            const x2 = laneX(s.to);
            const end = x2 > x1 ? x2 - 6 : x2 + 6;
            return (
              <g key={i}>
                <path className={s.hot ? "msg hot" : "msg link"} d={`M${x1} ${y} H${end}`} />
                <circle className={s.hot ? "hot-dot" : "dot"} cx={x2 > x1 ? x2 - 4 : x2 + 4} cy={y} r={3} />
                <text x={Math.min(x1, x2) + 10} y={y - 8} className={s.hot ? undefined : "t-muted"}>
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <svg className="dgm dgm-narrow" viewBox={`0 0 340 ${narrowH}`} role="img" aria-labelledby={`${seq.id}-nt`} aria-describedby={`${seq.id}-nd`}>
        <title id={`${seq.id}-nt`}>{seq.title}</title>
        <desc id={`${seq.id}-nd`}>{seq.desc}</desc>
        <path className="link" d={`M20 18 V${narrowH - 12}`} />
        <g fontSize="12.5">
          {seq.steps.map((s, i) => {
            const y = 30 + i * NARROW_ROW;
            const hot = s.kind === "msg" && s.hot;
            const { main, detail } = splitLabel(s.label);
            return (
              <g key={i}>
                <circle className={hot ? "hot-dot" : "dot"} cx={20} cy={y} r={hot ? 3.5 : 3} />
                <text x={36} y={y + 4} className={hot ? undefined : "t-muted"}>
                  {main}
                </text>
                {detail !== null && (
                  <text x={36} y={y + 22} className="t-muted" fontSize="11">
                    {detail}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption className="mono">{seq.caption}</figcaption>
    </figure>
  );
}
