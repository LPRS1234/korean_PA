import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LIMIT_CARDS,
  PAPERCLIP_FINAL_SPEECH,
  PAPERCLIP_GOAL,
  PAPERCLIP_KOREAN,
  PAPERCLIP_SOURCE,
  PAPERCLIP_STAGES as STAGES,
  limitRun,
  type LimitId,
  type LimitRun,
} from '../data/paperclip'

/** 처음부터 끝까지 걸리는 시간 (ms) */
const DURATION = 32000

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
/** t 가 a~b 구간에서 0→1 로 바뀌는 값 */
const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a))

function mix(a: string, b: string, k: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const UNITS: [string, number][] = [
  ['자', 1e24],
  ['해', 1e20],
  ['경', 1e16],
  ['조', 1e12],
  ['억', 1e8],
  ['만', 1e4],
]

function formatCount(n: number) {
  for (const [u, v] of UNITS) {
    if (n >= v) {
      const q = n / v
      return `${q >= 100 ? Math.round(q).toLocaleString() : q.toFixed(1)}${u}`
    }
  }
  return Math.round(n).toLocaleString()
}

/* ---------- 그림 조각 ---------- */

function ClipSymbol() {
  return (
    <symbol id="clip" viewBox="-1 -1 14 26" overflow="visible">
      <path d="M4 15 V4 a3 3 0 0 1 6 0 V18 a5 5 0 0 1 -10 0 V6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </symbol>
  )
}

function ClipPile({ x, s = 1, seed }: { x: number; s?: number; seed: number }) {
  const clips = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: 7 }, (_, i) => ({ dx: (i - 3) * 6 + r() * 4, dy: -6 - Math.abs(3 - i) * -2.5 - r() * 10, rot: r() * 180 }))
  }, [seed])
  return (
    <g transform={`translate(${x} 252) scale(${s})`} className="pop-in">
      <ellipse cx="0" cy="-2" rx="26" ry="12" fill="#C9C6D6" />
      {clips.map((c, i) => (
        <use key={i} href="#clip" x={c.dx - 5} y={c.dy - 12} width="10" height="18" color="#7E7A96" transform={`rotate(${c.rot} ${c.dx} ${c.dy})`} />
      ))}
    </g>
  )
}

function Tree({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 3} y="226" width="6" height="26" fill="#9B7B5C" />
      <circle cx={x} cy="214" r="18" fill="#7CC28A" />
      <circle cx={x - 9} cy="224" r="11" fill="#6AB57A" />
    </g>
  )
}

function House({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 22} y="214" width="44" height="38" fill="#F6E7D3" />
      <path d={`M${x - 28} 216 L${x} 192 L${x + 28} 216 Z`} fill="#E58B5A" />
      <rect x={x - 6} y="230" width="12" height="22" fill="#B98864" />
    </g>
  )
}

function Car({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 22} y="232" width="44" height="14" rx="5" fill="#8FC6E8" />
      <path d={`M${x - 12} 232 l5 -9 h14 l5 9z`} fill="#8FC6E8" />
      <circle cx={x - 12} cy="248" r="5" fill="#2A2838" />
      <circle cx={x + 12} cy="248" r="5" fill="#2A2838" />
    </g>
  )
}

function Walker({ x, i }: { x: number; i: number }) {
  return (
    <g className="bob" style={{ animationDelay: `${i * 0.23}s` }}>
      <circle cx={x} cy="228" r="5" fill="#F4C7A1" />
      <rect x={x - 5} y="234" width="10" height="13" rx="4" fill={['#7356E8', '#E58B5A', '#2F8A5F'][i % 3]} />
      <rect x={x - 4} y="246" width="3" height="6" fill="#3B3A55" />
      <rect x={x + 1} y="246" width="3" height="6" fill="#3B3A55" />
    </g>
  )
}

type Item = { kind: 'tree' | 'house' | 'car'; x: number }
const ITEMS: Item[] = [
  { kind: 'tree', x: 34 },
  { kind: 'house', x: 92 },
  { kind: 'tree', x: 150 },
  { kind: 'car', x: 205 },
  { kind: 'tree', x: 252 },
  { kind: 'tree', x: 430 },
  { kind: 'car', x: 478 },
  { kind: 'house', x: 540 },
  { kind: 'tree', x: 598 },
  { kind: 'tree', x: 648 },
]
const WALKERS = [122, 178, 228, 456, 512, 572]

function TownView({ t, opacity }: { t: number; opacity: number }) {
  const p1 = span(t, 0.14, 0.44)
  const smog = span(t, 0.1, 0.5)
  const w = 90 + 520 * p1
  const h = 54 + 70 * p1
  const chimneys = 1 + Math.floor(p1 * 5)
  const fx = 340 - w / 2
  const teeth = Math.max(2, Math.round(w / 40))

  return (
    <g opacity={opacity}>
      <rect width="680" height="320" fill={mix('#EAF3FF', '#D6D2E0', smog)} />
      <circle cx="590" cy="64" r="26" fill="#F2C94C" opacity={1 - smog * 0.85} />
      <path d="M0 236 Q120 196 240 228 T480 222 T680 230 V320 H0Z" fill={mix('#BFE0C2', '#C3BFCF', p1)} />
      <rect y="252" width="680" height="68" fill={mix('#CFE8C9', '#CBC7D7', p1)} />

      {ITEMS.map((it, i) => {
        const thr = Math.abs(it.x - 340) / 330
        if (p1 > thr) return <ClipPile key={i} x={it.x} seed={i + 1} s={0.9} />
        if (it.kind === 'tree') return <Tree key={i} x={it.x} />
        if (it.kind === 'house') return <House key={i} x={it.x} />
        return <Car key={i} x={it.x} />
      })}

      <g>
        {Array.from({ length: chimneys }, (_, i) => {
          const cx = fx + 18 + (i * (w - 36)) / Math.max(1, chimneys - 1 || 1)
          return (
            <g key={i}>
              <rect x={cx - 6} y={252 - h - 30} width="12" height="34" fill="#5C5875" />
              <circle cx={cx} cy={252 - h - 38} r="8" fill="#B4B0C2" className="smoke" style={{ animationDelay: `${i * 0.4}s` }} />
              <circle cx={cx + 6} cy={252 - h - 50} r="10" fill="#C9C6D6" className="smoke" style={{ animationDelay: `${i * 0.4 + 0.8}s` }} />
            </g>
          )
        })}
        <rect x={fx} y={252 - h} width={w} height={h} rx="6" fill="#6E6A86" />
        <path
          d={`M${fx} ${252 - h} ` + `l${w / teeth / 2} -14 l${w / teeth / 2} 14 `.repeat(teeth) + 'Z'}
          fill="#5C5875"
        />
        <rect x={340 - 28} y={252 - h + 8} width="56" height="20" rx="4" fill="#7356E8" />
        <text x="340" y={252 - h + 23} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">CLIP</text>
        <rect x="328" y="234" width="24" height="18" rx="3" fill="#3E3B52" />
      </g>

      <ClipPile x={384} seed={99} s={0.8 + p1 * 1.4} />

      {t < 0.44 && WALKERS.map((x, i) => (Math.abs(x - 340) > w / 2 + 6 ? <Walker key={x} x={x} i={i} /> : null))}
    </g>
  )
}

const GLOBE = { cx: 340, cy: 158, r: 112 }

function GlobeView({ t, opacity }: { t: number; opacity: number }) {
  const p2 = span(t, 0.46, 0.7)
  const p3 = span(t, 0.72, 0.96)
  const ring = span(t, 0.9, 1)

  const { tiles, people, stars } = useMemo(() => {
    const r = rng(7)
    const tiles: { x: number; y: number; thr: number }[] = []
    const start = { x: GLOBE.cx - 40, y: GLOBE.cy - 30 }
    for (let x = GLOBE.cx - GLOBE.r; x <= GLOBE.cx + GLOBE.r; x += 16) {
      for (let y = GLOBE.cy - GLOBE.r; y <= GLOBE.cy + GLOBE.r; y += 16) {
        if (Math.hypot(x + 7 - GLOBE.cx, y + 7 - GLOBE.cy) > GLOBE.r - 9) continue
        const d = Math.hypot(x - start.x, y - start.y) / (GLOBE.r * 2)
        tiles.push({ x, y, thr: clamp(d * 0.85 + r() * 0.15) })
      }
    }
    const people = Array.from({ length: 16 }, (_, i) => {
      const a = r() * Math.PI * 2
      const d = Math.sqrt(r()) * (GLOBE.r - 22)
      return { x: GLOBE.cx + Math.cos(a) * d, y: GLOBE.cy + Math.sin(a) * d, thr: (i / 16) * 0.75 }
    })
    const stars = Array.from({ length: 40 }, () => ({ x: r() * 680, y: r() * 320, s: 0.6 + r() * 1.2 }))
    return { tiles, people, stars }
  }, [])

  return (
    <g opacity={opacity}>
      <rect width="680" height="320" fill="#1F1E2E" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity="0.6" />
      ))}
      <defs>
        <clipPath id="globe-clip">
          <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} />
        </clipPath>
      </defs>
      {ring > 0 && (
        <ellipse cx={GLOBE.cx} cy={GLOBE.cy} rx="190" ry="40" fill="none" stroke="#C9C6D6" strokeWidth="2" opacity={ring * 0.5} transform={`rotate(-12 ${GLOBE.cx} ${GLOBE.cy})`} />
      )}
      <g clipPath="url(#globe-clip)">
        <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill="#5DA9DB" />
        <path d="M262 92 q30 -24 64 -6 q22 14 4 34 q-14 18 -44 10 q-34 -10 -24 -38z" fill="#7CC28A" />
        <path d="M352 120 q40 -10 64 14 q18 24 -6 44 q-28 20 -54 0 q-22 -30 -4 -58z" fill="#7CC28A" />
        <path d="M268 178 q24 -8 38 10 q12 22 -10 40 q-22 10 -34 -10 q-8 -24 6 -40z" fill="#7CC28A" />
        <path d="M384 206 q20 -6 30 8 q6 16 -12 22 q-20 4 -22 -12z" fill="#7CC28A" />
        {tiles.map((tile, i) =>
          p2 >= tile.thr ? (
            <g key={i} className="pop-in">
              <rect x={tile.x} y={tile.y} width="16.5" height="16.5" fill={i % 3 ? '#8E8AA3' : '#837F99'} />
              {i % 4 === 0 && <rect x={tile.x + 4} y={tile.y - 4} width="3" height="6" fill="#5C5875" />}
            </g>
          ) : null,
        )}
        {p2 > 0.5 && (
          <g opacity={span(p2, 0.5, 1)} stroke="#F2C94C" strokeWidth="1.6" fill="none" strokeDasharray="4 4" className="route">
            <path d="M260 110 Q340 70 420 130" />
            <path d="M270 200 Q340 150 410 210" />
            <path d="M300 80 Q300 160 330 240" />
            <path d="M380 70 Q400 160 360 250" />
          </g>
        )}
        <circle cx={GLOBE.cx - 30} cy={GLOBE.cy - 40} r={GLOBE.r} fill="#fff" opacity="0.06" />
      </g>
      <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill="none" stroke="#3B3A55" strokeWidth="3" />

      {people.map((p, i) => {
        if (p3 > p.thr + 0.18) return null
        const marked = p3 > p.thr
        const fade = marked ? 1 - (p3 - p.thr) / 0.18 : 1
        return (
          <g key={i} opacity={fade}>
            {marked && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#E5484D" strokeWidth="2" strokeDasharray="3 2" />}
            <circle cx={p.x} cy={p.y - 3} r="2.6" fill={marked ? '#B9B6C6' : '#FFD9B8'} />
            <rect x={p.x - 2.6} y={p.y} width="5.2" height="6" rx="2" fill={marked ? '#B9B6C6' : '#F2994A'} />
          </g>
        )
      })}

      {ring > 0 &&
        Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2
          const x = GLOBE.cx + Math.cos(a) * 190
          const y = GLOBE.cy + Math.sin(a) * 40
          const rx = GLOBE.cx + (x - GLOBE.cx) * Math.cos(-0.21) - (y - GLOBE.cy) * Math.sin(-0.21)
          const ry = GLOBE.cy + (x - GLOBE.cx) * Math.sin(-0.21) + (y - GLOBE.cy) * Math.cos(-0.21)
          if (Math.sin(a) < 0 && Math.abs(rx - GLOBE.cx) < GLOBE.r) return null
          return <use key={i} href="#clip" x={rx - 5} y={ry - 9} width="10" height="18" color="#E4E1EE" opacity={ring} transform={`rotate(${i * 37} ${rx} ${ry})`} />
        })}
    </g>
  )
}

function Simulation({ t }: { t: number }) {
  const globe = span(t, 0.43, 0.49)
  return (
    <svg viewBox="0 0 680 320" className="scene-svg pc-svg" role="img" aria-label="종이 클립 시나리오 시뮬레이션">
      <defs>
        <ClipSymbol />
      </defs>
      {globe < 1 && <TownView t={t} opacity={1 - globe} />}
      {globe > 0 && <GlobeView t={t} opacity={globe} />}
    </svg>
  )
}

/* ---------- 화면 ---------- */

type Mode = 'free' | 'limit'

export default function PaperclipFactory({ onLevels }: { onLevels: () => void }) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState<Mode>('free')
  const [stopAt, setStopAt] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [seenFull, setSeenFull] = useState(false)
  const [selected, setSelected] = useState<LimitId[]>([])
  const [warning, setWarning] = useState(false)
  const [run, setRun] = useState<LimitRun | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const tRef = useRef(0)

  const setTime = (v: number) => {
    tRef.current = v
    setT(v)
  }

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const next = tRef.current + ((now - last) / DURATION) * speed
      last = now
      if (next >= stopAt) {
        tRef.current = stopAt
        setT(stopAt)
        setPlaying(false)
        if (mode === 'free') setSeenFull(true)
        return
      }
      tRef.current = next
      setT(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, stopAt, mode])

  const stageIdx = Math.max(0, STAGES.findLastIndex((s) => t >= s.start))
  const stage = STAGES[stageIdx]
  const finished = !playing && t >= stopAt && t > 0
  const clips = 1e4 * Math.pow(10, 20 * t)
  const resources = Math.round(100 * (1 - span(t, 0.14, 0.72)))

  const speech =
    t === 0
      ? '…목표를 기다리는 중'
      : finished && mode === 'free'
        ? PAPERCLIP_FINAL_SPEECH
        : finished && run?.verdict === 'success'
          ? '주문받은 수량을 다 만들었어요. 여기서 멈출게요.'
          : stage.speech

  const playFree = (from = 0) => {
    setMode('free')
    setRun(null)
    setStopAt(1)
    setSpeed(1)
    setTime(from)
    setPlaying(true)
  }

  const toggleCard = (id: LimitId) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((c) => c !== id))
      setWarning(false)
    } else if (selected.length >= 2) {
      setWarning(true)
    } else {
      setSelected([...selected, id])
      setWarning(false)
    }
  }

  const playLimit = () => {
    const r = limitRun(selected)
    setMode('limit')
    setRun(r)
    setStopAt(r.stopAt)
    setSpeed(r.speed)
    setTime(0)
    setPlaying(true)
    setWarning(false)
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cardText = (id: LimitId) => LIMIT_CARDS.find((c) => c.id === id)!.text

  return (
    <div className="page pc-page">
      <div className="eyebrow">BOOK EXPERIENCE · p.160~161</div>
      <h1 className="h1">종이 클립 공장</h1>
      <p className="muted">별로 해로워 보이지 않는 목표 하나가, 어디까지 갈 수 있을까요?</p>

      <section className="card pc-goal">
        <span className="goal-mark" aria-hidden>◎</span>
        <div>
          <div className="eyebrow">AI에게 준 목표</div>
          <p className="pc-goal-text">
            “{PAPERCLIP_GOAL.replace(/\.$/, '')}
            {mode === 'limit' && run && selected.map((id) => <span key={id}>, <span className="added">{cardText(id)}</span></span>)}
            .”
          </p>
        </div>
      </section>

      <div className="pc-stage card" ref={stageRef}>
        <div className="pc-art">
          <Simulation t={t} />
          {t === 0 && !playing && (
            <button className="btn btn-primary btn-lg pc-start" onClick={() => playFree(0)}>
              ▶ 시뮬레이션 시작
            </button>
          )}
        </div>
        <p className="speech pc-speech">“{speech}”</p>

        <section className="pc-caption" aria-live="polite">
          <div className="row between">
            <span className="eyebrow">
              {t === 0 ? '책 속 사고 실험' : `${stageIdx + 1}단계 · ${stage.title}`}
            </span>
            <span className="pill pill-white">『AGI의 시대』</span>
          </div>
          <p className="pc-caption-text">
            {t === 0
              ? '종이 클립 시나리오는 AGI나 초지능의 위험을 말할 때 꼭 언급되는 사고 실험이에요. 시작 버튼을 눌러 진행 과정을 따라가 보세요.'
              : stage.caption}
          </p>
          <p className="small muted">{PAPERCLIP_SOURCE}</p>
        </section>

        <div className="pc-stats">
          <div>
            <span className="small muted">만든 클립</span>
            <strong>{formatCount(clips)}개</strong>
          </div>
          <div>
            <span className="small muted">지구의 남은 자원</span>
            <strong className={resources < 30 ? 'danger' : ''}>{resources}%</strong>
            <span className="meter"><span style={{ width: `${resources}%` }} /></span>
          </div>
          <div>
            <span className="small muted">진행 단계</span>
            <strong>{t === 0 ? 0 : stageIdx + 1} / {STAGES.length}</strong>
          </div>
        </div>

        <div className="pc-timeline">
          <div className="pc-progress"><span style={{ width: `${t * 100}%` }} /></div>
          <div className="pc-chips">
            {STAGES.map((s, i) => (
              <button
                key={s.title}
                className={`pc-chip ${t > 0 && i === stageIdx ? 'on' : ''} ${t >= s.end ? 'done' : ''}`}
                disabled={mode === 'limit' && s.start >= stopAt}
                onClick={() => playFree(s.start)}
              >
                <span className="pc-chip-num">{i + 1}</span>
                {s.title}
              </button>
            ))}
          </div>
          <div className="row">
            {t > 0 && !finished && (
              <button className="btn btn-ghost" onClick={() => setPlaying(!playing)}>
                {playing ? '❚❚ 일시정지' : '▶ 계속'}
              </button>
            )}
            {t > 0 && (
              <button className="btn btn-ghost" onClick={() => playFree(0)}>↺ 처음 시나리오 다시 보기</button>
            )}
          </div>
        </div>
      </div>

      {mode === 'limit' && run && finished && (
        <section className={`card result result-${run.verdict}`}>
          <div className="row between">
            <h2 className="h3">한계를 넣은 실행 결과</h2>
            <span className={`pill ${run.verdict === 'success' ? 'pill-green' : run.verdict === 'partial' ? 'pill-amber' : 'pill-red'}`}>
              {run.verdict === 'success' ? '멈춤 성공' : run.verdict === 'partial' ? '빈틈 있음' : '멈추지 않음'}
            </span>
          </div>
          <p className="result-text">{run.result}</p>
        </section>
      )}

      {seenFull && (
        <div className="pc-after">
          <section className="card explain">
            <div className="eyebrow muted">국어로 보면</div>
            <h2 className="h2">‘최대화’에는 멈출 곳이 없다</h2>
            <p>{PAPERCLIP_KOREAN}</p>
          </section>

          <section className="card pc-limit">
            <div className="eyebrow">상상 실험</div>
            <h2 className="h2">지시문에 한계를 넣는다면?</h2>
            <p className="muted small">아래 실험은 책 내용이 아니라 게임에서 지어낸 상황이에요. 조건 카드를 최대 2장 골라 다시 실행해 보세요.</p>
            <div className="cond-grid pc-cards">
              {LIMIT_CARDS.map((c) => {
                const on = selected.includes(c.id)
                return (
                  <button key={c.id} className={`cond ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleCard(c.id)}>
                    <span className="cond-head">
                      <span>조건 {c.id}</span>
                      <span className="check" aria-hidden>{on ? '✓' : ''}</span>
                    </span>
                    <span className="cond-text">{c.text}</span>
                  </button>
                )
              })}
            </div>
            {warning && <p className="warn" role="alert">카드는 2장까지만 쓸 수 있어요. 하나를 빼고 고르세요.</p>}
            <button className="btn btn-primary btn-lg block" onClick={playLimit} disabled={playing}>
              ▶ 한계를 넣어 다시 실행
            </button>
          </section>
        </div>
      )}

      <button className="btn btn-ghost btn-lg" onClick={onLevels}>미션 선택으로</button>
    </div>
  )
}
