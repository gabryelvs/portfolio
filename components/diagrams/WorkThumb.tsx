import type { Slug } from "@/lib/work";

function PayLedgerThumb() {
  return (
    <svg className="dgm" viewBox="0 0 400 176" role="img" aria-labelledby="th-pl-t" aria-describedby="th-pl-d">
      <title id="th-pl-t">PayLedger transfer path</title>
      <desc id="th-pl-d">A transfer request locks both wallets in id order, writes two balancing ledger entries and commits once.</desc>
      <path className="link" d="M20 38 H380" />
      <path className="hot" d="M62 38 V88 H200 V138 H340" />
      <path className="hot-draw" pathLength={1} d="M62 38 V88 H200 V138 H340" />
      <g fontSize="11">
        <rect className="node" x="8" y="24" width="108" height="28" rx="4" />
        <text x="62" y="42" textAnchor="middle">POST /transfers</text>
        <rect className="node" x="268" y="24" width="120" height="28" rx="4" />
        <text x="328" y="42" textAnchor="middle" className="t-muted">idempotency_keys</text>
        <rect className="node-strong" x="140" y="74" width="120" height="28" rx="4" />
        <text x="200" y="92" textAnchor="middle">lock wallets ↑id</text>
        <rect className="node" x="12" y="124" width="140" height="28" rx="4" />
        <text x="82" y="142" textAnchor="middle" className="t-muted">entries −100 / +100</text>
        <rect className="node-strong" x="292" y="124" width="96" height="28" rx="4" />
        <text x="340" y="142" textAnchor="middle">COMMIT</text>
      </g>
      <circle className="hot-dot" cx="62" cy="88" r="2.5" />
      <circle className="hot-dot" cx="200" cy="138" r="2.5" />
      <circle className="dot" cx="152" cy="138" r="2" />
    </svg>
  );
}

function WebhookInspectorThumb() {
  return (
    <svg className="dgm" viewBox="0 0 400 176" role="img" aria-labelledby="th-wi-t" aria-describedby="th-wi-d">
      <title id="th-wi-t">Webhook Inspector capture path</title>
      <desc id="th-wi-d">A webhook sender reaches the Fly proxy, then the capture route, which stores at most one megabyte per request in Postgres and always answers 200. The browser polls every two seconds.</desc>
      <path className="link" d="M200 102 V138" />
      <path className="hot" d="M60 38 H200 V88 H340" />
      <path className="hot-draw" pathLength={1} d="M60 38 H200 V88 H340" />
      <g fontSize="11">
        <rect className="node" x="12" y="24" width="96" height="28" rx="4" />
        <text x="60" y="42" textAnchor="middle">sender</text>
        <rect className="node" x="152" y="24" width="96" height="28" rx="4" />
        <text x="200" y="42" textAnchor="middle" className="t-muted">Fly proxy</text>
        <rect className="node-strong" x="132" y="74" width="136" height="28" rx="4" />
        <text x="200" y="92" textAnchor="middle">/in/{"{bin}"} ≤1 MB</text>
        <rect className="node-strong" x="292" y="74" width="96" height="28" rx="4" />
        <text x="340" y="92" textAnchor="middle">200 OK</text>
        <rect className="node" x="140" y="124" width="120" height="28" rx="4" />
        <text x="200" y="142" textAnchor="middle" className="t-muted">Postgres</text>
        <rect className="node" x="292" y="124" width="96" height="28" rx="4" />
        <text x="340" y="142" textAnchor="middle" className="t-muted">UI · poll 2s</text>
      </g>
      <path className="link" d="M260 138 H292" strokeDasharray="3 3" />
      <circle className="dot" cx="200" cy="124" r="2" />
    </svg>
  );
}

function TaskboardThumb() {
  return (
    <svg className="dgm" viewBox="0 0 400 176" role="img" aria-labelledby="th-tb-t" aria-describedby="th-tb-d">
      <title id="th-tb-t">Taskboard card move path</title>
      <desc id="th-tb-d">A move request passes the JWT filter, locks the source and target columns in UUID order, shifts positions, and commits. Non-members get 404.</desc>
      <path className="hot" d="M60 38 H200 V62 H80 V138 H340" />
      <path className="hot-draw" pathLength={1} d="M60 38 H200 V62 H80 V138 H340" />
      <path className="link" d="M148 88 H176" strokeDasharray="3 3" />
      <g fontSize="11">
        <rect className="node" x="12" y="24" width="96" height="28" rx="4" />
        <text x="60" y="42" textAnchor="middle">PATCH move</text>
        <rect className="node" x="152" y="24" width="96" height="28" rx="4" />
        <text x="200" y="42" textAnchor="middle" className="t-muted">JWT filter</text>
        <rect className="node-strong" x="12" y="74" width="136" height="28" rx="4" />
        <text x="80" y="92" textAnchor="middle">lock cols ↑uuid</text>
        <rect className="node" x="176" y="74" width="136" height="28" rx="4" />
        <text x="244" y="92" textAnchor="middle" className="t-muted">404 if not member</text>
        <rect className="node" x="12" y="124" width="136" height="28" rx="4" />
        <text x="80" y="142" textAnchor="middle" className="t-muted">shift positions</text>
        <rect className="node-strong" x="292" y="124" width="96" height="28" rx="4" />
        <text x="340" y="142" textAnchor="middle">COMMIT</text>
      </g>
      <circle className="hot-dot" cx="148" cy="138" r="2.5" />
    </svg>
  );
}

export function WorkThumb({ slug }: { slug: Slug }) {
  switch (slug) {
    case "payledger":
      return <PayLedgerThumb />;
    case "webhook-inspector":
      return <WebhookInspectorThumb />;
    case "taskboard-api":
      return <TaskboardThumb />;
  }
}
