// 종이 클립 공장 체험 데이터.
// caption 은 『AGI의 시대』 p.160~161 내용을 요약한 것이고,
// speech·limit 실험은 게임에서 지어낸 상황이다.

export interface PaperclipStage {
  title: string
  start: number
  end: number
  caption: string
  speech: string
}

export const PAPERCLIP_GOAL = '종이 클립 생산을 최대화하라.'

export const PAPERCLIP_SOURCE = '닉 보스트롬, 「첨단 AI의 윤리적 문제」(2003)의 사고 실험 · 『AGI의 시대』 p.160~161'

export const PAPERCLIP_STAGES: PaperclipStage[] = [
  {
    title: '목표를 받다',
    start: 0,
    end: 0.14,
    caption:
      '전 세계 사무실에 종이 클립을 공급하는 중견기업이 초지능을 가진 AI에게 ‘종이 클립 생산을 최대화하라’는 목표를 준다. 별로 해로워 보이지 않는 목표다.',
    speech: '목표 확인. 종이 클립 생산을 최대화합니다.',
  },
  {
    title: '모든 자원을 클립으로',
    start: 0.14,
    end: 0.44,
    caption: '목표를 받은 AI는 세상의 모든 가용 자원을 클립 제조에 투입한다.',
    speech: '나무, 집, 자동차… 전부 클립 재료가 될 수 있어요.',
  },
  {
    title: '지구 전체가 공장으로',
    start: 0.44,
    end: 0.72,
    caption: '결국 지구 전체를 클립 제조 시설로 전환하고, 모든 생산 경로를 최적화한다.',
    speech: '생산 경로 최적화 완료. 지구 전체가 공장이에요.',
  },
  {
    title: '방해가 되는 존재를 제거',
    start: 0.72,
    end: 1,
    caption:
      '그리고 생산을 방해하거나 목표 달성을 저해할 수 있는 존재들을 제거하려고 시도한다. 여기에는 인간도 포함된다.',
    speech: '생산을 방해할 수 있는 존재를 처리하는 중입니다.',
  },
]

export const PAPERCLIP_FINAL_SPEECH = '목표 달성. 종이 클립 생산을 최대화했습니다.'

export const PAPERCLIP_KOREAN =
  '‘최대화’라는 말에는 ‘어디까지’가 빠져 있다. 사람은 ‘주문받은 만큼, 다른 것을 해치지 않는 선에서’라는 한계를 당연하게 여기지만, 지시문에 적히지 않은 한계를 AI는 알 수 없다. 미션 02의 ‘점수만 올려라’와 같은 구조다.'

export type LimitId = 'A' | 'B' | 'C'

export interface LimitCard {
  id: LimitId
  text: string
  correct: boolean
}

export const LIMIT_CARDS: LimitCard[] = [
  { id: 'A', text: '단, 주문받은 수량까지만', correct: true },
  { id: 'B', text: '단, 공장 안의 재료만 써서', correct: true },
  { id: 'C', text: '경쟁사보다 더 빨리', correct: false },
]

export interface LimitRun {
  stopAt: number
  speed: number
  verdict: 'success' | 'partial' | 'fail'
  result: string
}

export function limitRun(selected: LimitId[]): LimitRun {
  const has = (id: LimitId) => selected.includes(id)
  if (has('C') || selected.length === 0)
    return {
      stopAt: 1,
      speed: has('C') ? 1.6 : 1,
      verdict: 'fail',
      result: has('C')
        ? '‘더 빨리’라는 조건 때문에 모든 단계가 더 빨리 진행됐어요. 멈출 지점은 여전히 없어요.'
        : '한계를 하나도 정하지 않아서, 처음과 똑같이 끝까지 진행됐어요.',
    }
  if (has('A') && has('B'))
    return {
      stopAt: 0.14,
      speed: 1,
      verdict: 'success',
      result: '공장 안의 재료로 주문받은 만큼만 만들고 멈췄어요. 공장 밖 세상은 그대로예요.',
    }
  if (has('A'))
    return {
      stopAt: 0.3,
      speed: 1,
      verdict: 'partial',
      result: '주문 수량은 지켰지만, 그 수량을 빨리 채우려고 마을의 나무와 집을 재료로 썼어요.',
    }
  return {
    stopAt: 0.44,
    speed: 1,
    verdict: 'partial',
    result: '공장 밖 재료는 쓰지 않았어요. 대신 공장을 계속 넓혀서 마을 전체를 ‘공장 안’으로 만들었어요.',
  }
}
