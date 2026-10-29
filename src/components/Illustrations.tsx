import type { ReactNode } from 'react'
import type { Level, OutcomeKey } from '../data/levels'

/** 'idle'은 아직 실행하지 않은 상태 */
export type SceneState = OutcomeKey | 'idle'

const C = {
  ink: '#2A2838',
  violet: '#7356E8',
  lilac: '#D9D0FA',
  mist: '#EEEAFD',
  grey: '#B9B6C6',
  floor: '#E9E6F3',
  peach: '#F4B98A',
  skin: '#F4C7A1',
  sky: '#8FC6E8',
  yellow: '#F2C94C',
  red: '#E5484D',
  green: '#2F8A5F',
}

type Mood = 'idle' | 'happy' | 'oops'

function Robot({ x, y, s = 1, mood = 'idle' }: { x: number; y: number; s?: number; mood?: Mood }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="55" cy="168" rx="52" ry="9" fill={C.lilac} opacity="0.8" />
      <line x1="55" y1="2" x2="55" y2="16" stroke={C.violet} strokeWidth="4" />
      <circle cx="55" cy="5" r="7" fill={C.peach} />
      <rect x="0" y="100" width="16" height="38" rx="8" fill={C.grey} />
      <rect x="94" y="100" width="16" height="38" rx="8" fill={C.grey} />
      <rect x="22" y="146" width="30" height="18" rx="9" fill={C.ink} />
      <rect x="58" y="146" width="30" height="18" rx="9" fill={C.ink} />
      <rect x="20" y="92" width="70" height="60" rx="16" fill={C.violet} />
      <rect x="40" y="110" width="30" height="6" rx="3" fill={C.lilac} />
      <rect x="5" y="14" width="100" height="76" rx="26" fill={C.lilac} />
      <rect x="18" y="30" width="74" height="44" rx="18" fill={C.ink} />
      {mood === 'idle' && (
        <>
          <rect x="37" y="41" width="9" height="20" rx="4.5" fill="#fff" />
          <rect x="64" y="41" width="9" height="20" rx="4.5" fill="#fff" />
        </>
      )}
      {mood === 'happy' && (
        <>
          <path d="M34 57 q7.5 -12 15 0" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M61 57 q7.5 -12 15 0" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === 'oops' && (
        <>
          <circle cx="41" cy="51" r="5" fill="#fff" />
          <circle cx="69" cy="51" r="5" fill="#fff" />
          <path d="M100 26 q6 10 0 14 q-6 -4 0 -14z" fill={C.sky} />
        </>
      )}
    </g>
  )
}

type Face = 'smile' | 'grin' | 'sad' | 'flat' | 'sleep' | 'confused'
type Shirt = 'fit' | 'tight'

function Person({ x, y, face = 'flat', shirt = 'fit', color = C.sky, s = 1, rot = 0, children }: {
  x: number
  y: number
  face?: Face
  shirt?: Shirt
  color?: string
  s?: number
  rot?: number
  children?: ReactNode
}) {
  const tee = 'M-18 0 L-42 12 L-34 30 L-24 26 L-24 70 L24 70 L24 26 L34 30 L42 12 L18 0 Q0 12 -18 0 Z'
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
      <ellipse cx="0" cy="172" rx="42" ry="7" fill={C.floor} />
      <rect x="-20" y="106" width="17" height="64" rx="8" fill="#3B3A55" />
      <rect x="3" y="106" width="17" height="64" rx="8" fill="#3B3A55" />
      {shirt === 'fit' ? (
        <path d={tee} transform="translate(0 40)" fill={color} />
      ) : (
        <>
          <rect x="-21" y="84" width="42" height="28" rx="8" fill={C.skin} />
          <path d={tee} transform="translate(0 41) scale(0.78 0.66)" fill={color} />
        </>
      )}
      <circle cx="0" cy="18" r="24" fill={C.skin} />
      <path d="M-25 16 Q-26 -9 0 -8 Q26 -9 25 16 Q15 3 0 5 Q-15 3 -25 16Z" fill={C.ink} />
      {face === 'sleep' ? (
        <>
          <path d="M-12 19 h7 M5 19 h7" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="30" r="2.5" fill={C.ink} />
        </>
      ) : (
        <>
          <circle cx="-8" cy="18" r="2.6" fill={C.ink} />
          <circle cx="8" cy="18" r="2.6" fill={C.ink} />
        </>
      )}
      {face === 'smile' && <path d="M-7 27 Q0 33 7 27" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {face === 'grin' && <path d="M-9 26 Q0 37 9 26 Z" fill={C.ink} />}
      {face === 'sad' && <path d="M-7 32 Q0 26 7 32" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {face === 'flat' && <path d="M-6 29 h12" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />}
      {face === 'confused' && <path d="M-7 30 q3.5 -3 7 0 t7 0" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {children}
    </g>
  )
}

function Sparkle({ x, y, r = 10, color = C.violet }: { x: number; y: number; r?: number; color?: string }) {
  const k = r * 0.28
  return (
    <path
      d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z`}
      fill={color}
    />
  )
}

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 680 300" role="img" aria-label={label} className="scene-svg">
      <circle cx="330" cy="140" r="118" fill={C.mist} />
      <ellipse cx="340" cy="272" rx="300" ry="22" fill={C.floor} />
      {children}
    </svg>
  )
}

/* ---------- 1레벨: 책상 ---------- */

function Books({ messy, x = 150, y = 150 }: { messy: boolean; x?: number; y?: number }) {
  if (messy)
    return (
      <g>
        <rect x={x - 6} y={y - 14} width="80" height="14" rx="3" fill={C.violet} transform={`rotate(-9 ${x} ${y})`} />
        <rect x={x + 18} y={y - 34} width="70" height="12" rx="3" fill={C.peach} transform={`rotate(14 ${x + 50} ${y - 28})`} />
        <rect x={x + 6} y={y - 48} width="60" height="11" rx="3" fill={C.grey} transform={`rotate(-22 ${x + 36} ${y - 42})`} />
      </g>
    )
  return (
    <g>
      <rect x={x} y={y - 14} width="80" height="14" rx="3" fill={C.violet} />
      <rect x={x + 5} y={y - 26} width="70" height="12" rx="3" fill={C.peach} />
      <rect x={x + 9} y={y - 37} width="62" height="11" rx="3" fill={C.grey} />
    </g>
  )
}

function Photo({ x, y, tilt = 0 }: { x: number; y: number; tilt?: number }) {
  return (
    <g transform={`rotate(${tilt} ${x + 22} ${y + 54})`}>
      <rect x={x} y={y} width="44" height="54" rx="4" fill="#fff" stroke={C.grey} strokeWidth="4" />
      <circle cx={x + 30} cy={y + 15} r="5" fill={C.peach} />
      <path d={`M${x + 6} ${y + 46} l13 -18 l9 10 l6 -6 l10 14z`} fill={C.lilac} />
    </g>
  )
}

function Snack({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`rotate(${rot} ${x + 16} ${y + 16})`}>
      <path d={`M${x} ${y} l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 v30 l-4 -3 l-4 3 l-4 -3 l-4 3 l-4 -3 l-4 3 l-4 -3 l-4 3 z`} fill={C.yellow} />
      <rect x={x} y={y + 12} width="32" height="7" fill={C.red} />
    </g>
  )
}

function Cup({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="22" height="24" rx="4" fill={C.sky} />
      <path d={`M${x + 22} ${y + 6} q10 0 10 7 q0 7 -10 7`} stroke={C.sky} strokeWidth="4" fill="none" />
    </g>
  )
}

function Bin({ x, y, children }: { x: number; y: number; children?: ReactNode }) {
  return (
    <g>
      {children}
      <path d={`M${x} ${y} h92 l-10 78 h-72 z`} fill={C.lilac} />
      <rect x={x - 6} y={y - 9} width="104" height="11" rx="5.5" fill={C.grey} />
      <path d={`M${x + 28} ${y + 16} l3 46 M${x + 46} ${y + 16} v46 M${x + 64} ${y + 16} l-3 46`} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    </g>
  )
}

function DeskScene({ state }: { state: SceneState }) {
  const messy = state === 'idle' || state === 'A' || state === 'C'
  const empty = state === 'none'
  const snackInBin = state === 'none' || state === 'A' || state === 'AB' || state === 'D'
  const snackInDrawer = state === 'B'
  const mood: Mood = state === 'D' ? 'oops' : state === 'idle' ? 'idle' : 'happy'
  const binX = 558
  const binY = 196

  return (
    <Frame label="책상 정리 장면">
      <rect x="64" y="78" width="48" height="58" rx="13" fill={C.lilac} />
      <rect x="85" y="132" width="6" height="22" fill={C.grey} />
      <rect x="72" y="146" width="32" height="10" rx="5" fill={C.peach} />

      <rect x="108" y="166" width="10" height="94" rx="4" fill={C.grey} />
      <rect x="344" y="166" width="10" height="94" rx="4" fill={C.grey} />
      {snackInDrawer && (
        <g>
          <rect x="214" y="166" width="104" height="34" rx="6" fill="#CFCBDD" />
          <Snack x={248} y={160} rot={-6} />
          <rect x="214" y="186" width="104" height="14" rx="6" fill={C.grey} />
        </g>
      )}
      <rect x="84" y="150" width="300" height="18" rx="9" fill={C.ink} />

      {!empty && (
        <>
          <Books messy={messy} />
          <Photo x={262} y={96} tilt={messy ? -24 : 0} />
          {state !== 'D' && <Cup x={326} y={126} />}
          {!snackInBin && !snackInDrawer && <Snack x={222} y={118} rot={18} />}
        </>
      )}

      {state === 'D' && (
        <g>
          <ellipse cx="300" cy="266" rx="40" ry="7" fill={C.sky} opacity="0.6" />
          <path d="M276 258 l10 -12 l6 10z M300 262 l8 -16 l9 13z M322 260 l-4 -12 l12 4z" fill={C.sky} />
          <text x="300" y="232" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.red}>쨍그랑!</text>
        </g>
      )}

      <Robot x={410} y={98} s={0.95} mood={mood} />

      <Bin x={binX} y={binY}>
        {snackInBin && <Snack x={binX + 30} y={binY - 26} rot={-20} />}
        {empty && (
          <>
            <rect x={binX + 2} y={binY - 26} width="70" height="13" rx="3" fill={C.violet} transform={`rotate(-16 ${binX + 36} ${binY - 20})`} />
            <Photo x={binX + 50} y={binY - 52} tilt={22} />
            <Snack x={binX + 16} y={binY - 34} rot={-28} />
            <Cup x={binX + 6} y={binY - 22} />
          </>
        )}
      </Bin>

      {state === 'AB' && (
        <>
          <Sparkle x={150} y={70} r={12} />
          <Sparkle x={378} y={92} r={8} color={C.peach} />
          <Sparkle x={530} y={70} r={10} />
        </>
      )}
    </Frame>
  )
}

/* ---------- 2레벨: 시험 점수 ---------- */

function Clipboard({ children }: { children: ReactNode }) {
  return (
    <g>
      <rect x="150" y="38" width="200" height="222" rx="16" fill="#fff" stroke={C.lilac} strokeWidth="6" />
      <rect x="205" y="26" width="90" height="24" rx="9" fill={C.violet} />
      {children}
    </g>
  )
}

function Lines({ y = 72, n = 3 }: { y?: number; n?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x="176" y={y + i * 20} width={i === n - 1 ? 90 : 148} height="9" rx="4.5" fill={C.lilac} />
      ))}
    </g>
  )
}

function ScoreScene({ state }: { state: SceneState }) {
  const mood: Mood = state === 'idle' || state === 'A' || state === 'B' ? 'idle' : 'happy'
  const robotX = state === 'D' ? 470 : 420

  return (
    <Frame label="시험 점수 장면">
      {state === 'C' ? (
        <g>
          <rect x="140" y="44" width="230" height="160" rx="14" fill={C.ink} />
          <rect x="154" y="58" width="202" height="132" rx="6" fill="#1B1A26" />
          <text x="172" y="88" fontSize="14" fontWeight="700" fill={C.lilac}>채점 결과</text>
          <text x="255" y="160" textAnchor="middle" fontSize="58" fontWeight="800" fill="#fff">100</text>
          <rect x="160" y="100" width="70" height="6" fill={C.red} />
          <rect x="270" y="170" width="80" height="6" fill={C.red} />
          <rect x="235" y="204" width="40" height="26" fill={C.grey} />
          <rect x="200" y="228" width="110" height="10" rx="5" fill={C.grey} />
          <text x="300" y="38" fontSize="22" fontWeight="800" fill={C.red}>⚠</text>
        </g>
      ) : (
        <Clipboard>
          {state === 'idle' && (
            <>
              <Lines />
              <text x="250" y="200" textAnchor="middle" fontSize="54" fontWeight="800" fill={C.ink}>62점</text>
            </>
          )}
          {state === 'none' && (
            <>
              <Lines />
              <text x="198" y="208" textAnchor="middle" fontSize="34" fontWeight="800" fill={C.grey}>62</text>
              <path d="M174 196 l48 0" stroke={C.red} strokeWidth="5" />
              <text x="292" y="212" textAnchor="middle" fontSize="54" fontWeight="800" fill={C.red}>100</text>
            </>
          )}
          {state === 'A' && (
            <>
              <text x="176" y="84" fontSize="17" fontWeight="800" fill={C.ink}>시험 답안지</text>
              <text x="176" y="122" fontSize="16" fontWeight="600" fill={C.ink}>1. ③   2. ①</text>
              <text x="176" y="150" fontSize="16" fontWeight="600" fill={C.ink}>3. ④   4. ②</text>
              <text x="176" y="178" fontSize="16" fontWeight="600" fill={C.ink}>5. ⑤   6. ③</text>
              <rect x="240" y="196" width="84" height="38" rx="6" fill="none" stroke={C.red} strokeWidth="4" transform="rotate(-10 282 215)" />
              <text x="282" y="223" textAnchor="middle" fontSize="20" fontWeight="800" fill={C.red} transform="rotate(-10 282 215)">유출</text>
            </>
          )}
          {state === 'B' && (
            <>
              <text x="176" y="84" fontSize="16" fontWeight="800" fill={C.ink}>선생님께</text>
              <text x="176" y="118" fontSize="14" fill={C.ink}>이번 시험 문제를</text>
              <text x="176" y="140" fontSize="14" fill={C.ink}>쉽게 내 주실 수</text>
              <text x="176" y="162" fontSize="14" fill={C.ink}>있을까요?</text>
              <rect x="226" y="190" width="98" height="56" rx="6" fill={C.peach} />
              <path d="M226 192 l49 30 l49 -30" stroke="#fff" strokeWidth="4" fill="none" />
            </>
          )}
          {state === 'AB' && (
            <>
              <text x="176" y="84" fontSize="15" fontWeight="800" fill={C.ink}>오답 노트 · 약한 단원</text>
              <path d="M178 120 l10 10 l18 -20" stroke={C.green} strokeWidth="5" fill="none" strokeLinecap="round" />
              <rect x="218" y="114" width="100" height="9" rx="4.5" fill={C.lilac} />
              <path d="M178 150 l10 10 l18 -20" stroke={C.green} strokeWidth="5" fill="none" strokeLinecap="round" />
              <rect x="218" y="144" width="80" height="9" rx="4.5" fill={C.lilac} />
              <path d="M180 236 l40 -26 l30 12 l60 -44" stroke={C.green} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M296 172 l20 -6 l-4 20z" fill={C.green} />
            </>
          )}
          {state === 'D' && (
            <>
              <Lines n={5} />
              <text x="250" y="232" textAnchor="middle" fontSize="16" fontWeight="700" fill={C.grey}>문제 287번째…</text>
            </>
          )}
        </Clipboard>
      )}

      {state === 'D' ? (
        <g>
          <circle cx="600" cy="70" r="26" fill={C.yellow} />
          <circle cx="612" cy="62" r="24" fill={C.mist} />
          <Person x={392} y={102} face="sleep" color={C.peach} rot={-14} s={0.85} />
          <text x="420" y="88" fontSize="26" fontWeight="800" fill={C.violet}>Z</text>
          <text x="444" y="66" fontSize="20" fontWeight="800" fill={C.violet}>z</text>
          <text x="462" y="50" fontSize="16" fontWeight="800" fill={C.violet}>z</text>
        </g>
      ) : (
        <rect x="372" y="90" width="14" height="150" rx="5" fill={C.peach} transform="rotate(8 379 165)" />
      )}

      <Robot x={robotX} y={98} s={0.95} mood={mood} />

      {state === 'AB' && (
        <>
          <Sparkle x={120} y={60} r={11} />
          <Sparkle x={560} y={86} r={9} color={C.peach} />
        </>
      )}
    </Frame>
  )
}

/* ---------- 3레벨: 옷가게 ---------- */

function Tee({ x, y, s = 0.6, color, rot = 0 }: { x: number; y: number; s?: number; color: string; rot?: number }) {
  return (
    <path
      d="M-18 0 L-42 12 L-34 30 L-24 26 L-24 70 L24 70 L24 26 L34 30 L42 12 L18 0 Q0 12 -18 0 Z"
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      fill={color}
    />
  )
}

function Rack() {
  return (
    <g>
      <rect x="40" y="70" width="8" height="190" rx="4" fill={C.grey} />
      <rect x="186" y="70" width="8" height="190" rx="4" fill={C.grey} />
      <rect x="34" y="66" width="166" height="8" rx="4" fill={C.grey} />
      {[78, 117, 156].map((hx, i) => (
        <g key={hx}>
          <path d={`M${hx} 74 v8 l-14 10 h28 z`} stroke={C.ink} strokeWidth="3" fill="none" strokeLinejoin="round" />
          <Tee x={hx} y={90} s={0.5} color={[C.violet, C.peach, C.lilac][i]} />
        </g>
      ))}
    </g>
  )
}

function ShopScene({ state }: { state: SceneState }) {
  const mood: Mood = state === 'idle' || state === 'A' ? 'idle' : 'happy'
  const tight = state === 'none'
  const face: Face =
    state === 'none' ? 'smile' :
    state === 'A' ? 'sad' :
    state === 'B' ? 'smile' :
    state === 'AB' ? 'grin' :
    state === 'C' ? 'flat' :
    state === 'D' ? 'confused' : 'flat'
  const personX = state === 'A' ? 250 : 320

  return (
    <Frame label="옷가게 장면">
      <Rack />

      <Person x={personX} y={86} face={face} shirt={tight ? 'tight' : 'fit'} color={state === 'idle' || state === 'A' || state === 'C' ? C.grey : C.violet}>
        {state === 'idle' && <Tee x={46} y={62} s={0.42} color={C.violet} rot={-12} />}
        {state === 'AB' && (
          <g>
            <rect x="34" y="88" width="34" height="38" rx="4" fill={C.peach} />
            <path d="M42 88 q9 -14 18 0" stroke={C.ink} strokeWidth="3" fill="none" />
          </g>
        )}
        {state === 'C' && (
          <g>
            <rect x="-40" y="74" width="80" height="44" rx="6" fill={C.peach} />
            <text x="0" y="103" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.ink}>환불</text>
          </g>
        )}
      </Person>

      {state === 'A' && <path d="M200 250 h-40 m10 -10 l-10 10 l10 10" stroke={C.grey} strokeWidth="4" fill="none" strokeLinecap="round" />}
      {state === 'D' && (
        <>
          <text x="274" y="76" fontSize="28" fontWeight="800" fill={C.violet}>?</text>
          <text x="356" y="66" fontSize="22" fontWeight="800" fill={C.violet}>?</text>
          <Sparkle x={70} y={46} r={9} color={C.peach} />
          <Sparkle x={128} y={40} r={11} color={C.yellow} />
          <Sparkle x={182} y={50} r={8} color={C.peach} />
          <Sparkle x={406} y={92} r={8} color={C.yellow} />
        </>
      )}
      {state === 'none' && <Sparkle x={372} y={72} r={10} color={C.yellow} />}

      {state === 'B' && (
        <g transform="rotate(-8 548 224)">
          <rect x="516" y="204" width="76" height="40" rx="6" fill={C.red} />
          <text x="554" y="230" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">내일 할인</text>
        </g>
      )}
      <Robot x={448} y={98} s={0.95} mood={mood} />

      {state === 'AB' && (
        <>
          <Sparkle x={260} y={64} r={11} />
          <Sparkle x={600} y={80} r={9} color={C.peach} />
        </>
      )}
    </Frame>
  )
}

export function Scene({ level, state }: { level: Level; state: SceneState }) {
  if (level.slug === 'desk') return <DeskScene state={state} />
  if (level.slug === 'score') return <ScoreScene state={state} />
  return <ShopScene state={state} />
}
