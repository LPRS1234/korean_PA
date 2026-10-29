import type { CardId, Level, OutcomeKey } from './data/levels'

export const MAX_CARDS = 2

export type Verdict = 'fail' | 'partial' | 'success'

export interface RunResult {
  key: OutcomeKey
  verdict: Verdict
  stars: 0 | 1 | 3
  cards: CardId[]
}

/** 설명서 4장의 별점 규칙. 함정 카드가 여러 장이면 먼저 고른 카드의 결과를 쓴다. */
export function evaluate(level: Level, selected: CardId[]): RunResult {
  const cards = selected.map((id) => level.cards.find((c) => c.id === id)!)
  const trap = cards.find((c) => !c.correct)
  if (trap) return { key: trap.id as OutcomeKey, verdict: 'fail', stars: 0, cards: selected }

  const correct = cards.filter((c) => c.correct)
  if (correct.length === 2) return { key: 'AB', verdict: 'success', stars: 3, cards: selected }
  if (correct.length === 1) return { key: correct[0].id as OutcomeKey, verdict: 'partial', stars: 1, cards: selected }
  return { key: 'none', verdict: 'fail', stars: 0, cards: selected }
}

export interface Progress {
  stars: Record<number, number>
  attempts: Record<number, number>
}

const STORAGE_KEY = 'ai-trainer-progress-v1'

export const emptyProgress = (): Progress => ({ stars: {}, attempts: {} })

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...emptyProgress(), ...JSON.parse(raw) }
  } catch {
    // 저장소를 쓸 수 없는 환경이면 새로 시작한다.
  }
  return emptyProgress()
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // 무시
  }
}

export const isCleared = (p: Progress, levelId: number) => (p.stars[levelId] ?? 0) >= 3
export const isUnlocked = (p: Progress, levelId: number) => levelId === 1 || isCleared(p, levelId - 1)
