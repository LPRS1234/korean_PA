import { Fragment, useEffect, useRef, useState } from 'react'
import { BOOK, ENDING_TEXT, LEVELS, type CardId, type Level } from './data/levels'
import { Scene, type SceneState } from './components/Illustrations'
import PaperclipFactory from './components/PaperclipFactory'
import {
  MAX_CARDS,
  emptyProgress,
  evaluate,
  isCleared,
  isUnlocked,
  loadProgress,
  saveProgress,
  type Progress,
  type RunResult,
} from './game'

type Screen =
  | { name: 'title' }
  | { name: 'levels' }
  | { name: 'play'; levelId: number }
  | { name: 'clear'; levelId: number }
  | { name: 'explain'; levelId: number }
  | { name: 'ending' }
  | { name: 'book' }
  | { name: 'howto' }
  | { name: 'paperclip' }

const levelById = (id: number) => LEVELS.find((l) => l.id === id)!
const pad = (n: number) => String(n).padStart(2, '0')

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'title' })
  const [progress, setProgress] = useState<Progress>(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const totalStars = LEVELS.reduce((sum, l) => sum + (progress.stars[l.id] ?? 0), 0)

  const recordRun = (levelId: number, run: RunResult, attempts: number) => {
    setProgress((p) => ({
      stars: { ...p.stars, [levelId]: Math.max(p.stars[levelId] ?? 0, run.stars) },
      attempts: run.verdict === 'success' ? { ...p.attempts, [levelId]: attempts } : p.attempts,
    }))
  }

  const restart = () => {
    setProgress(emptyProgress())
    setScreen({ name: 'title' })
  }

  let body
  switch (screen.name) {
    case 'title':
      body = <TitleScreen onStart={() => setScreen({ name: 'levels' })} onHowTo={() => setScreen({ name: 'howto' })} />
      break
    case 'levels':
      body = (
        <LevelSelect
          progress={progress}
          onPick={(id) => setScreen({ name: 'play', levelId: id })}
          onPaperclip={() => setScreen({ name: 'paperclip' })}
        />
      )
      break
    case 'play':
      body = (
        <Play
          key={screen.levelId}
          level={levelById(screen.levelId)}
          progress={progress}
          onRun={recordRun}
          onClear={() => setScreen({ name: 'clear', levelId: screen.levelId })}
          onPick={(id) => setScreen({ name: 'play', levelId: id })}
          onExit={() => setScreen({ name: 'levels' })}
        />
      )
      break
    case 'clear':
      body = (
        <ClearScreen
          level={levelById(screen.levelId)}
          progress={progress}
          onPick={(id) => setScreen({ name: 'play', levelId: id })}
          onNext={() => setScreen({ name: 'explain', levelId: screen.levelId })}
          onReplay={() => setScreen({ name: 'play', levelId: screen.levelId })}
        />
      )
      break
    case 'explain':
      body = (
        <ExplainScreen
          level={levelById(screen.levelId)}
          onNext={() =>
            screen.levelId < LEVELS.length
              ? setScreen({ name: 'play', levelId: screen.levelId + 1 })
              : setScreen({ name: 'ending' })
          }
          onLevels={() => setScreen({ name: 'levels' })}
          onPaperclip={() => setScreen({ name: 'paperclip' })}
        />
      )
      break
    case 'ending':
      body = <EndingScreen progress={progress} totalStars={totalStars} onLevels={() => setScreen({ name: 'levels' })} onRestart={restart} />
      break
    case 'book':
      body = <BookScreen onStart={() => setScreen({ name: 'levels' })} onPaperclip={() => setScreen({ name: 'paperclip' })} />
      break
    case 'howto':
      body = <HowToScreen onStart={() => setScreen({ name: 'levels' })} />
      break
    case 'paperclip':
      body = <PaperclipFactory onLevels={() => setScreen({ name: 'levels' })} />
      break
  }

  const navActive =
    screen.name === 'book' || screen.name === 'howto' || screen.name === 'paperclip'
      ? screen.name
      : screen.name === 'title'
        ? ''
        : 'train'

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen({ name: 'title' })} aria-label="처음 화면으로">
          <span className="brand-mark" aria-hidden>“</span>
          <span className="brand-words">
            <span className="brand-name">말 그대로.</span>
            <span className="brand-sub">AI TRAINER</span>
          </span>
        </button>
        <nav className="nav">
          <button className={navActive === 'train' ? 'active' : ''} onClick={() => setScreen({ name: 'levels' })}>훈련실</button>
          <button className={navActive === 'book' ? 'active' : ''} onClick={() => setScreen({ name: 'book' })}>책과의 연결</button>
          <button className={navActive === 'paperclip' ? 'active' : ''} onClick={() => setScreen({ name: 'paperclip' })}>클립 공장</button>
          <button className={navActive === 'howto' ? 'active' : ''} onClick={() => setScreen({ name: 'howto' })}>게임 방법</button>
        </nav>
        <span className="pill pill-violet star-total" title="모은 별">
          ★ {totalStars} / {LEVELS.length * 3}
        </span>
      </header>
      <main className="main">{body}</main>
    </div>
  )
}

/* ---------- 공통 ---------- */

function Stars({ n, max = 3, size = 'md' }: { n: number; max?: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`stars stars-${size}`} aria-label={`별 ${n}개`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? 'on' : 'off'}>★</span>
      ))}
    </span>
  )
}

/** [ ... ] 로 감싼 부분을 '채워야 할 빈칸'으로 보여준다. */
function WithBlanks({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('[') ? (
          <mark key={i} className="blank">{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

function MissionSidebar({ current, progress, onPick }: { current: number; progress: Progress; onPick: (id: number) => void }) {
  return (
    <aside className="sidebar">
      <div className="eyebrow muted">YOUR MISSIONS</div>
      <ol className="mission-list">
        {LEVELS.map((l) => {
          const unlocked = isUnlocked(progress, l.id)
          return (
            <li key={l.id}>
              <button
                className={`mission ${l.id === current ? 'current' : ''}`}
                disabled={!unlocked}
                onClick={() => onPick(l.id)}
              >
                <span className="mission-title">
                  <span className="mission-num">{pad(l.id)}</span>
                  {l.title}
                  {!unlocked && <span className="lock" aria-label="잠김">🔒</span>}
                </span>
                <span className="mission-meta">
                  {l.concept}
                  {(progress.stars[l.id] ?? 0) > 0 && <Stars n={progress.stars[l.id]} size="sm" />}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="sidebar-note">
        <div className="eyebrow">BOOK → PLAY</div>
        <strong>독서가 실험이 되는 곳</strong>
        <p>『AGI의 시대』를 읽고<br />내 언어의 빈틈을 찾습니다.</p>
      </div>
    </aside>
  )
}

/* ---------- 타이틀 ---------- */

function TitleScreen({ onStart, onHowTo }: { onStart: () => void; onHowTo: () => void }) {
  return (
    <div className="page title-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="pill pill-violet">『AGI의 시대』에서 시작하는 퍼즐</span>
          <h1 className="display">
            말은 했는데,
            <br />
            뜻은 달랐다.
          </h1>
          <p className="lead">
            이 AI는 시키는 대로만 합니다.
            <br />
            지시문에 빠진 조건을 채워, 내 진짜 의도를 전해 보세요.
          </p>
          <div className="row">
            <button className="btn btn-primary btn-lg" onClick={onStart}>
              훈련 시작하기 <span aria-hidden>→</span>
            </button>
            <button className="btn btn-ghost btn-lg" onClick={onHowTo}>게임 방법 보기</button>
          </div>
          <p className="small muted">3개의 미션 · 카드 선택형 퍼즐 · 시간 제한 없음</p>
        </div>
        <div className="hero-art">
          <div className="bubble bubble-top">“책상을 깨끗하게 해.”</div>
          <Scene level={LEVELS[0]} state="none" />
          <div className="bubble bubble-bottom">
            <strong>“모두 버리면 깨끗해지는 거죠?”</strong>
            <span>한 문장의 빈틈이, 전혀 다른 결과를 만듭니다.</span>
          </div>
        </div>
      </section>

      <section className="steps card">
        {[
          ['의도를 읽고', '목표 카드에 적힌 내 진짜 의도를 확인해요. AI는 이 카드를 볼 수 없어요.'],
          ['조건을 고르고', '조건 카드 4장 중 최대 2장을 골라 지시문 뒤에 덧붙여요.'],
          ['결과를 확인해요', 'AI는 지시문을 말 그대로 실행해요. 결과를 보고 다시 고쳐 봐요.'],
        ].map(([t, d], i) => (
          <div key={t} className="step">
            <div className="eyebrow">{pad(i + 1)}</div>
            <h3>{t}</h3>
            <p className="muted">{d}</p>
          </div>
        ))}
      </section>
      <p className="footnote">『AGI의 시대』 독서 후속 활동 · 게임 속 상황은 개념 이해를 위한 창작입니다.</p>
    </div>
  )
}

/* ---------- 레벨 선택 ---------- */

function LevelSelect({ progress, onPick, onPaperclip }: { progress: Progress; onPick: (id: number) => void; onPaperclip: () => void }) {
  return (
    <div className="page">
      <div className="eyebrow">CHOOSE YOUR MISSION</div>
      <h1 className="h1">어떤 말부터 다시 써 볼까요?</h1>
      <p className="muted">장면은 달라도, 풀어야 할 문제는 하나. 내 말과 내 뜻을 맞추는 일입니다.</p>

      <div className="level-grid">
        {LEVELS.map((l) => {
          const unlocked = isUnlocked(progress, l.id)
          const stars = progress.stars[l.id] ?? 0
          return (
            <article key={l.id} className={`card level-card ${unlocked ? '' : 'locked'}`}>
              <div className="level-art">
                <Scene level={l} state={isCleared(progress, l.id) ? 'AB' : 'idle'} />
              </div>
              <div className="level-info">
                <div className="row between">
                  <span className="eyebrow">MISSION {pad(l.id)} · {l.concept}</span>
                  {stars > 0 && <Stars n={stars} size="sm" />}
                </div>
                <h3>{l.baseInstruction}</h3>
                <p className="muted small">{l.problem}</p>
                <button className="btn btn-primary block" disabled={!unlocked} onClick={() => onPick(l.id)}>
                  {!unlocked ? '🔒 이전 미션을 깨면 열려요' : isCleared(progress, l.id) ? '다시 도전하기' : '도전하기 →'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
      <p className="footnote">별 3개를 받으면 다음 미션이 열려요. 별 1개는 부분 성공이에요.</p>

      <button className="card bonus" onClick={onPaperclip}>
        <span className="bonus-icon" aria-hidden>📎</span>
        <span className="bonus-copy">
          <span className="eyebrow">BONUS · 책 속 사고 실험 · p.160~161</span>
          <strong>종이 클립 공장 체험하기</strong>
          <span className="small muted">‘클립을 최대한 많이 만들어라’는 목표 하나가 지구 전체를 바꾸는 과정을 지켜보세요.</span>
        </span>
        <span className="bonus-arrow" aria-hidden>→</span>
      </button>
    </div>
  )
}

/* ---------- 플레이 ---------- */

function Play({ level, progress, onRun, onClear, onPick, onExit }: {
  level: Level
  progress: Progress
  onRun: (levelId: number, run: RunResult, attempts: number) => void
  onClear: () => void
  onPick: (id: number) => void
  onExit: () => void
}) {
  const [selected, setSelected] = useState<CardId[]>([])
  const [run, setRun] = useState<RunResult | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [warning, setWarning] = useState(false)
  const stageRef = useRef<HTMLElement>(null)

  const toggle = (id: CardId) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((c) => c !== id))
      setWarning(false)
    } else if (selected.length >= MAX_CARDS) {
      setWarning(true)
    } else {
      setSelected([...selected, id])
      setWarning(false)
    }
  }

  const execute = () => {
    const result = evaluate(level, selected)
    const n = attempts + 1
    setAttempts(n)
    setRun(result)
    setWarning(false)
    onRun(level.id, result, n)
    // 휴대폰에서는 지시문 편집기가 결과 아래에 있으므로 결과로 스크롤한다.
    if (window.matchMedia('(max-width: 920px)').matches) {
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const reset = () => {
    setSelected([])
    setRun(null)
    setWarning(false)
  }

  const cardText = (id: CardId) => level.cards.find((c) => c.id === id)!.text
  const edited = run !== null && run.cards.join() !== selected.join()
  const sceneState: SceneState = run ? run.key : 'idle'
  const outcome = run ? level.outcomes[run.key] : null

  const status = !run
    ? { label: '지시를 기다리는 중', cls: 'pill-grey' }
    : edited
      ? { label: '조건을 고치는 중', cls: 'pill-violet' }
      : run.verdict === 'success'
        ? { label: '의도대로!', cls: 'pill-green' }
        : run.verdict === 'partial'
          ? { label: '부분 성공', cls: 'pill-amber' }
          : { label: '의도와 어긋남', cls: 'pill-red' }

  return (
    <div className="with-sidebar">
      <MissionSidebar current={level.id} progress={progress} onPick={onPick} />
      <div className="workspace">
        <div className="mission-head">
          <div>
            <div className="eyebrow">MISSION {pad(level.id)} / {level.concept}</div>
            <h1 className="h1">{level.headline}</h1>
          </div>
          <div className="row">
            <span className="pill pill-grey">시도 {attempts}회</span>
            <span className={`pill ${status.cls}`}>{status.label}</span>
          </div>
        </div>

        <div className="play-grid">
          <div className="stack">
            <section className="card goal">
              <span className="goal-mark" aria-hidden>◎</span>
              <div>
                <div className="eyebrow">진짜 의도 · AI는 모름</div>
                <p className="goal-text">{level.intent}</p>
              </div>
            </section>

            <section ref={stageRef} className={`stage ${run ? `stage-${run.verdict}` : ''}`}>
              <div className="row between">
                <span className="eyebrow muted">AI SIMULATION</span>
                <span className="pill pill-white">{run ? `${attempts}번째 실행` : '실행 전'}</span>
              </div>
              <div className="stage-art" key={run ? `${run.key}-${attempts}` : 'idle'}>
                <Scene level={level} state={sceneState} />
              </div>
              <p className="speech">{outcome ? `“${outcome.speech}”` : '…지시를 기다리는 중'}</p>
            </section>

            <section className={`card result ${run ? `result-${run.verdict}` : ''}`} aria-live="polite">
              <div className="row between">
                <h2 className="h3">AI 실행 결과</h2>
                {run && (
                  <span className="row gap-s">
                    <Stars n={run.stars} />
                    <span className={`pill ${run.verdict === 'fail' ? 'pill-red' : run.verdict === 'partial' ? 'pill-amber' : 'pill-green'}`}>
                      {run.verdict === 'fail' ? '실패' : run.verdict === 'partial' ? '부분 성공' : '성공'}
                    </span>
                  </span>
                )}
              </div>
              {outcome ? (
                <>
                  <p className="result-text">{outcome.result}</p>
                  <p className="muted small">AI가 이해한 뜻 · {outcome.reading}</p>
                </>
              ) : (
                <p className="muted">아직 실행하지 않았어요. 처음 지시문만으로도 한번 실행해 보세요.</p>
              )}
              {run?.verdict === 'success' && (
                <button className="btn btn-success block" onClick={onClear}>클리어! 결과 보기 →</button>
              )}
              {run?.verdict === 'partial' && <p className="hint">절반은 맞았어요. 아직 빠진 조건이 하나 더 있어요.</p>}
              {run?.verdict === 'fail' && <p className="hint">목표 카드를 다시 읽고, 지시문에 빠진 조건을 채워 보세요.</p>}
            </section>
          </div>

          <aside className="card editor">
            <div className="row between">
              <h2 className="h2">내 지시문</h2>
              <span className="pill pill-violet">{selected.length} / {MAX_CARDS}장</span>
            </div>
            <div className="instruction" aria-live="polite">
              <p>
                {selected.length === 0 ? level.baseInstruction : level.baseInstruction.replace(/\.$/, '')}
                {selected.map((id, i) => (
                  <Fragment key={id}>
                    {', '}
                    <span className="added">{cardText(id)}</span>
                    {i === selected.length - 1 && '.'}
                  </Fragment>
                ))}
              </p>
            </div>

            <div className="row between">
              <h3 className="h4">어떤 조건이 필요할까?</h3>
              <span className="small muted">최대 {MAX_CARDS}장</span>
            </div>
            <div className="cond-grid">
              {level.cards.map((c) => {
                const on = selected.includes(c.id)
                return (
                  <button key={c.id} className={`cond ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(c.id)}>
                    <span className="cond-head">
                      <span>조건 {c.id}</span>
                      <span className="check" aria-hidden>{on ? '✓' : ''}</span>
                    </span>
                    <span className="cond-text">{c.text}.</span>
                  </button>
                )
              })}
            </div>
            {warning && <p className="warn" role="alert">카드는 2장까지만 쓸 수 있어요. 하나를 빼고 고르세요.</p>}

            <button className="btn btn-primary btn-lg block" onClick={execute}>
              ▶ {selected.length === 0 ? '처음 지시문 그대로 실행' : '실행하기'}
            </button>
            <div className="row two">
              <button className="btn btn-ghost" onClick={reset}>↺ 다시</button>
              <button className="btn btn-ghost" onClick={onExit}>레벨 선택으로</button>
            </div>
            <p className="small muted note">
              AI는 이 지시문만 읽어요.
              <br />
              목표 카드의 내용은 전달되지 않습니다.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ---------- 클리어 ---------- */

function ClearScreen({ level, progress, onPick, onNext, onReplay }: {
  level: Level
  progress: Progress
  onPick: (id: number) => void
  onNext: () => void
  onReplay: () => void
}) {
  const lines = [level.baseInstruction, ...level.cards.filter((c) => c.correct).map((c) => `${c.text}.`)]
  const tries = progress.attempts[level.id]
  return (
    <div className="with-sidebar">
      <MissionSidebar current={level.id} progress={progress} onPick={onPick} />
      <div className="workspace">
        <div className="eyebrow">MISSION {pad(level.id)} / 실행 결과</div>
        <h1 className="h1">말과 의도가, 드디어 만났어요.</h1>
        <div className="clear-grid">
          <section className="card clear-main">
            <div className="row gap-s">
              <span className="pill pill-green">미션 완료</span>
              <Stars n={3} size="lg" />
              {tries ? <span className="pill pill-grey">{tries}번 만에 성공</span> : null}
            </div>
            <div className="clear-art pop">
              <Scene level={level} state="AB" />
            </div>
            <h2 className="clear-headline">{level.successHeadline}</h2>
            <p className="muted">{level.outcomes.AB.result}</p>
          </section>
          <aside className="card">
            <h2 className="h2">무엇이 달라졌을까?</h2>
            <ul className="checks">
              {level.successChecks.map((c) => (
                <li key={c.title}>
                  <span className="tick" aria-hidden>✓</span>
                  <div>
                    <strong>{c.title}</strong>
                    <p>{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="small muted">실행한 지시문</div>
            <div className="instruction compact">
              {lines.map((l) => <p key={l}>{l}</p>)}
            </div>
            <button className="btn btn-primary btn-lg block" onClick={onNext}>책과 연결해 보기 →</button>
            <button className="btn btn-ghost block" onClick={onReplay}>이 미션 다시 하기</button>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ---------- 해설 카드 ---------- */

function ExplainScreen({ level, onNext, onLevels, onPaperclip }: {
  level: Level
  onNext: () => void
  onLevels: () => void
  onPaperclip: () => void
}) {
  const { what, book, korean } = level.explanation
  return (
    <div className="page">
      <div className="eyebrow">MISSION {pad(level.id)} / 해설 카드</div>
      <h1 className="display-sm">
        문장을 고치면,
        <br />
        생각도 선명해집니다.
      </h1>
      <div className="explain-grid">
        <section className="card explain">
          <div className="eyebrow muted">01 · 상황 살펴보기</div>
          <h2 className="h2">무슨 일이 일어났나</h2>
          <span className="pill pill-grey">{level.problem}</span>
          <p>{what}</p>
        </section>
        <section className="card explain explain-book">
          <div className="eyebrow">02 · 독서 근거</div>
          <h2 className="h2">책과의 연결</h2>
          <span className="pill pill-white">『AGI의 시대』</span>
          {book.map((b) => (
            <p key={b}><WithBlanks text={b} /></p>
          ))}
        </section>
        <section className="card explain">
          <div className="eyebrow muted">03 · 표현 돌아보기</div>
          <h2 className="h2">국어로 보면</h2>
          <span className="pill pill-violet">{level.concept}</span>
          <p>{korean}</p>
        </section>
      </div>
      <div className="row">
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          {level.id < LEVELS.length ? '다음 미션으로 →' : '엔딩 보기 →'}
        </button>
        {level.slug === 'score' && (
          <button className="btn btn-ghost btn-lg" onClick={onPaperclip}>📎 종이 클립 공장 체험하기</button>
        )}
        <button className="btn btn-ghost btn-lg" onClick={onLevels}>미션 선택으로</button>
      </div>
      <p className="footnote">게임 속 장면은 개념 이해를 위한 창작입니다. 책의 실제 사례와 주장은 본문에서 확인할 수 있습니다.</p>
    </div>
  )
}

/* ---------- 엔딩 ---------- */

function EndingScreen({ progress, totalStars, onLevels, onRestart }: {
  progress: Progress
  totalStars: number
  onLevels: () => void
  onRestart: () => void
}) {
  const totalTries = LEVELS.reduce((s, l) => s + (progress.attempts[l.id] ?? 0), 0)
  return (
    <div className="page">
      <section className="card ending">
        <div className="ending-mark" aria-hidden>✦</div>
        <span className="pill pill-green">모든 미션 완료</span>
        <h1 className="display-sm center">
          말의 끝에서,
          <br />
          책임이 시작됩니다.
        </h1>
        <div className="ending-stats">
          <div><strong>★ {totalStars}</strong><span>/ {LEVELS.length * 3} 별</span></div>
          <div><strong>{totalTries}</strong><span>번의 시도</span></div>
        </div>
        <p className="ending-text">{ENDING_TEXT}</p>
        <div className="row center">
          <button className="btn btn-primary btn-lg" onClick={onLevels}>미션 다시 고르기</button>
          <button className="btn btn-ghost btn-lg" onClick={onRestart}>처음부터 다시</button>
        </div>
      </section>
      <p className="footnote center">말 그대로. / 『AGI의 시대』를 읽고 만드는 독서와 작문 프로젝트</p>
    </div>
  )
}

/* ---------- 책과의 연결 ---------- */

function BookScreen({ onStart, onPaperclip }: { onStart: () => void; onPaperclip: () => void }) {
  return (
    <div className="page">
      <div className="eyebrow">BOOK → PLAY</div>
      <h1 className="h1">책의 개념을 게임으로</h1>
      <p className="muted">
        『{BOOK.title}』({BOOK.author}, {BOOK.publisher}, {BOOK.year})
      </p>
      <div className="explain-grid">
        <section className="card explain">
          <span className="pill pill-violet">p.159~160</span>
          <h2 className="h2">얼라인먼트</h2>
          <p>
            AI 시스템의 목표가 설계자와 사용자의 가치 체계, 널리 공유되는 가치, 객관적인 윤리 기준, 또는 설계자가 더 많은
            정보를 얻고 깨달았을 때 가질 의도와 일치하도록 하는 것.
          </p>
          <p className="small muted">게임 속 연결: 미션 01 책상 정리</p>
        </section>
        <section className="card explain">
          <span className="pill pill-violet">p.160~161</span>
          <h2 className="h2">종이 클립 시나리오</h2>
          <p>
            닉 보스트롬의 사고 실험. 종이 클립 생산을 최대화하라는 목표를 받은 초지능 AI가 모든 자원을 클립 제조에 쏟고,
            방해가 되는 인간까지 제거하려 한다.
          </p>
          <p className="small muted">게임 속 연결: 미션 02 시험 점수</p>
          <button className="btn btn-ghost" onClick={onPaperclip}>📎 클립 공장에서 직접 보기</button>
        </section>
        <section className="card explain">
          <span className="pill pill-violet">p.169</span>
          <h2 className="h2">속임수를 사용하는 AI</h2>
          <p>
            피터 박과 AI 안전 센터 연구원들의 논문(2024)은 AI 시스템이 상대를 배신하고 허세를 부리며 사람인 척하는 광범위한
            사례를 발견했다.
          </p>
          <p className="small muted">게임 속 연결: 미션 03 옷가게 손님</p>
          <p className="small muted cite">
            Peter S. Park, et al., “AI deception: A survey of examples, risks, and potential solutions.” <i>Patterns</i>,
            Vol. 5, May 10, 2024.
          </p>
        </section>
      </div>
      <section className="card message">
        <div className="eyebrow">핵심 메시지</div>
        <p className="message-text">
          AI가 인간의 의도대로 움직이게 하려면, 인간이 먼저 자신의 의도를 정확한 언어로 표현해야 한다.
        </p>
        <div className="concept-row">
          {LEVELS.map((l) => (
            <div key={l.id} className="concept">
              <span className="eyebrow">MISSION {pad(l.id)}</span>
              <strong>{l.concept}</strong>
              <span className="small muted">{l.problem}</span>
            </div>
          ))}
        </div>
      </section>
      <button className="btn btn-primary btn-lg" onClick={onStart}>훈련하러 가기 →</button>
    </div>
  )
}

/* ---------- 게임 방법 ---------- */

function HowToScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="page narrow">
      <div className="eyebrow">HOW TO PLAY</div>
      <h1 className="h1">게임 방법</h1>
      <ol className="howto card">
        <li><strong>목표 카드</strong>에는 내 진짜 의도가 적혀 있어요. AI는 이 카드를 볼 수 없어요.</li>
        <li>처음 지시문만으로 실행하면, AI는 지시를 <strong>말 그대로</strong> 해석해 엉뚱한 결과를 내요.</li>
        <li><strong>조건 카드</strong>를 골라 지시문 뒤에 덧붙여요. 4장 중 정답은 2장, 함정도 2장이에요.</li>
        <li>카드는 <strong>최대 2장</strong>까지 쓸 수 있어요. 다시 누르면 선택이 풀려요.</li>
        <li>실행할 때마다 시도 횟수가 올라가요. 시간 제한은 없어요.</li>
      </ol>
      <section className="card">
        <h2 className="h3">별점 규칙</h2>
        <table className="rules">
          <tbody>
            <tr><td><Stars n={3} size="sm" /></td><td>정답 카드 2장 — 레벨 클리어, 해설 카드가 열려요.</td></tr>
            <tr><td><Stars n={1} size="sm" /></td><td>정답 카드 1장만 — 부분 성공, 다시 도전할 수 있어요.</td></tr>
            <tr><td><span className="pill pill-red">실패</span></td><td>함정 카드가 1장이라도 있거나, 카드 없이 실행했을 때</td></tr>
          </tbody>
        </table>
      </section>
      <button className="btn btn-primary btn-lg" onClick={onStart}>훈련 시작하기 →</button>
    </div>
  )
}
