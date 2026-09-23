import type { Slug } from "@/lib/work";

export type SeqLane = { id: string; label: string };
export type SeqStep =
  | { kind: "msg"; from: string; to: string; label: string; hot?: boolean }
  | { kind: "note"; at: string; label: string };
export type Sequence = {
  id: string;
  title: string;
  desc: string;
  caption: string;
  lanes: SeqLane[];
  steps: SeqStep[];
};

export const sequences: Record<Slug, Sequence> = {
  payledger: {
    id: "seq-pl",
    title: "Sequence of a PayLedger transfer",
    desc: "The client sends POST /transfers with an Idempotency-Key. Inside one database transaction the API claims the key, checks the caller owns the source wallet, locks both wallet rows in ascending id order, checks the balance, inserts one transaction and two ledger entries that sum to zero, updates both balances and saves the response on the key, then commits once and answers 201.",
    caption: "Every transfer is one database transaction, key included. Bright lines are where correctness is decided.",
    lanes: [
      { id: "client", label: "client" },
      { id: "api", label: "api · transfer service" },
      { id: "db", label: "postgresql" },
    ],
    steps: [
      { kind: "msg", from: "client", to: "api", label: "POST /transfers  Idempotency-Key", hot: true },
      { kind: "msg", from: "api", to: "db", label: "claim key  INSERT … ON CONFLICT DO NOTHING", hot: true },
      { kind: "msg", from: "api", to: "db", label: "source wallet owned by caller?  (404 if not)" },
      { kind: "msg", from: "api", to: "db", label: "SELECT … FOR UPDATE  both wallets, ascending id", hot: true },
      { kind: "note", at: "api", label: "balance ≥ amount" },
      { kind: "msg", from: "api", to: "db", label: "INSERT transaction + entries  −100 / +100  Σ = 0" },
      { kind: "msg", from: "api", to: "db", label: "UPDATE balances ·  save response on the key" },
      { kind: "msg", from: "api", to: "db", label: "COMMIT  (key and transfer together)", hot: true },
      { kind: "msg", from: "api", to: "client", label: "201 Created" },
    ],
  },
  "webhook-inspector": {
    id: "seq-wi",
    title: "Sequence of a Webhook Inspector capture",
    desc: "A sender posts to /in/{bin}. Vercel's edge forwards it with the client's IP in x-real-ip. The capture route streams the body, keeps the first megabyte, drops the headers the platform added, stores the request and prunes the bin to 500, then answers 200 even if the insert failed. The browser polls for new requests every two seconds.",
    caption: "Capture first, fail quietly: the sender always gets its 200.",
    lanes: [
      { id: "sender", label: "sender" },
      { id: "proxy", label: "vercel edge" },
      { id: "app", label: "capture route" },
      { id: "db", label: "postgresql" },
      { id: "ui", label: "browser" },
    ],
    steps: [
      { kind: "msg", from: "sender", to: "proxy", label: "POST /in/{bin}", hot: true },
      { kind: "msg", from: "proxy", to: "app", label: "forward  client IP in x-real-ip" },
      { kind: "note", at: "app", label: "stream body, keep 1 MB" },
      { kind: "msg", from: "app", to: "db", label: "INSERT request  prune bin to 500" },
      { kind: "msg", from: "app", to: "sender", label: "200 OK, even if the insert failed", hot: true },
      { kind: "msg", from: "ui", to: "app", label: "GET requests every 2 s" },
    ],
  },
  "taskboard-api": {
    id: "seq-tb",
    title: "Sequence of a Taskboard card move",
    desc: "The client sends PATCH to move a card with a Bearer token. The JWT filter verifies it. The card service checks membership and answers 404 to non-members, locks the source and target columns in UUID order, re-reads the card, shifts positions to keep them dense, and commits.",
    caption: "Two moves lock columns in the same order, so they queue instead of deadlocking.",
    lanes: [
      { id: "client", label: "client" },
      { id: "auth", label: "jwt filter" },
      { id: "svc", label: "card service" },
      { id: "db", label: "postgresql" },
    ],
    steps: [
      { kind: "msg", from: "client", to: "auth", label: "PATCH /cards/{id}/move  Bearer", hot: true },
      { kind: "msg", from: "auth", to: "svc", label: "verified user" },
      { kind: "msg", from: "svc", to: "db", label: "membership lookup  (404 if not a member)" },
      { kind: "msg", from: "svc", to: "db", label: "SELECT … FOR UPDATE  both columns, UUID order", hot: true },
      { kind: "msg", from: "svc", to: "db", label: "re-read card  (409 if it left the locked columns)" },
      { kind: "msg", from: "svc", to: "db", label: "park at −1 · close gap ·  open gap · place" },
      { kind: "msg", from: "svc", to: "db", label: "COMMIT", hot: true },
      { kind: "msg", from: "svc", to: "client", label: "200 OK" },
    ],
  },
};
