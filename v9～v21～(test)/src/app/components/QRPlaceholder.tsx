export function QRPlaceholder({ size = 220 }: { size?: number }) {
  const cells = 21;
  const seed = (i: number, j: number) => {
    // deterministic pseudo pattern
    const v = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
    return v - Math.floor(v) > 0.5;
  };
  const cellSize = size / cells;
  const isFinder = (i: number, j: number) => {
    const inBox = (oi: number, oj: number) => i >= oi && i < oi + 7 && j >= oj && j < oj + 7;
    return inBox(0, 0) || inBox(0, cells - 7) || inBox(cells - 7, 0);
  };
  const finderCell = (i: number, j: number) => {
    const local = (oi: number, oj: number) => {
      const li = i - oi, lj = j - oj;
      if (li === 0 || li === 6 || lj === 0 || lj === 6) return true;
      if (li >= 2 && li <= 4 && lj >= 2 && lj <= 4) return true;
      return false;
    };
    if (i < 7 && j < 7) return local(0, 0);
    if (i < 7 && j >= cells - 7) return local(0, cells - 7);
    if (i >= cells - 7 && j < 7) return local(cells - 7, 0);
    return false;
  };
  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm" style={{ width: size + 24, height: size + 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: cells }).map((_, i) =>
          Array.from({ length: cells }).map((_, j) => {
            const filled = isFinder(i, j) ? finderCell(i, j) : seed(i, j);
            return filled ? (
              <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#0b2545" />
            ) : null;
          })
        )}
      </svg>
    </div>
  );
}
