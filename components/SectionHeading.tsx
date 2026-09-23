export function SectionHeading({
  index,
  title,
  id,
  sub,
}: {
  index: string;
  title: string;
  id: string;
  sub?: string;
}) {
  return (
    <>
      <div className={sub ? "sec-head" : "sec-head solo"}>
        <span className="num mono">{index}</span>
        <h2 id={id}>{title}</h2>
      </div>
      {sub ? <p className="sec-sub">{sub}</p> : null}
    </>
  );
}
