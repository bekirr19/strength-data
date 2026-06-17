/* AreaChart — lightweight SVG progress chart for the Strength Data UI kit.
   Smooth area + line, period-max reference line, x labels. Light theme. */
function AreaChart({ data = [], labels = [], color = 'var(--blue-500)', height = 200 }) {
  const W = 320, H = height, padL = 8, padR = 14, padT = 16, padB = 24;
  const n = data.length;
  if (n === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  // y-domain padded a little below min for a livelier curve
  const lo = Math.max(0, min - span * 0.4);
  const hi = max + span * 0.15;
  const x = (i) => padL + (i / (n - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

  const pts = data.map((v, i) => [x(i), y(v)]);
  // smooth path (catmull-rom → bezier)
  const line = smooth(pts);
  const area = `${line} L ${pts[n - 1][0].toFixed(1)} ${(H - padB).toFixed(1)} L ${pts[0][0].toFixed(1)} ${(H - padB).toFixed(1)} Z`;
  const maxY = y(max);
  const uid = 'g' + Math.random().toString(36).slice(2, 8);

  // gridlines
  const grid = [0.5, 1].map((f) => padT + f * (H - padT - padB));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((gy, i) => (
        <line key={i} x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="var(--gray-200)" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      {/* period max reference */}
      <line x1={padL} y1={maxY} x2={W - padR} y2={maxY} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d={area} fill={`url(#${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === n - 1 ? 4 : 0} fill="#fff" stroke={color} strokeWidth="2.5" />
      ))}
      {labels.map((lb, i) => (
        (i % Math.ceil(n / 5) === 0 || i === n - 1) ? (
          <text key={i} x={x(i)} y={H - 6} fontSize="9" fontWeight="600" fill="var(--gray-400)" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{lb}</text>
        ) : null
      ))}
    </svg>
  );
}

function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

window.AreaChart = AreaChart;
