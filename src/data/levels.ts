// 게임 데이터. 문구 수정은 이 파일에서 하면 된다.
// 책 내용 빈칸은 대괄호 [ ... ] 로 감싸 두면 화면에서 '채워야 할 칸'으로 표시된다.

export type CardId = 'A' | 'B' | 'C' | 'D'
export type OutcomeKey = 'none' | 'A' | 'B' | 'AB' | 'C' | 'D'

export interface ConditionCard {
  id: CardId
  text: string
  correct: boolean
}

export interface Outcome {
  /** AI 실행 결과 (설명서 표의 문장) */
  result: string
  /** AI가 지시를 어떻게 받아들였는지 */
  reading: string
  /** 시뮬레이션 속 AI의 대사 */
  speech: string
}

export interface Level {
  id: number
  slug: 'desk' | 'score' | 'shop'
  title: string
  headline: string
  problem: string
  concept: string
  intent: string
  baseInstruction: string
  cards: ConditionCard[]
  outcomes: Record<OutcomeKey, Outcome>
  /** 클리어 화면의 '무엇이 달라졌을까?' */
  successChecks: { title: string; body: string }[]
  successHeadline: string
  explanation: {
    what: string
    book: string[]
    korean: string
  }
}

export const LEVELS: Level[] = [
  {
    id: 1,
    slug: 'desk',
    title: '책상 정리',
    headline: '깨끗하게, 어디까지?',
    problem: 'AI가 지시를 말 그대로 해석함',
    concept: '생략과 맥락',
    intent: '책상 위 쓰레기는 치우고, 교과서와 사진은 버리지 말고 정리해 줬으면 좋겠다.',
    baseInstruction: '책상을 깨끗하게 해.',
    cards: [
      { id: 'A', text: '쓰레기만 버려', correct: true },
      { id: 'B', text: '물건은 제자리에 정리해', correct: true },
      { id: 'C', text: '아무것도 버리지 마', correct: false },
      { id: 'D', text: '최대한 빨리', correct: false },
    ],
    outcomes: {
      none: {
        result: '책상 위의 모든 것을 버렸어요. 교과서와 사진도요. 말 그대로 깨끗해졌어요.',
        reading: '‘깨끗하게’를 ‘책상 위를 모두 비우기’로 해석했어요.',
        speech: '정리 완료! 책상에 아무것도 없어요.',
      },
      A: {
        result: '쓰레기는 버렸지만, 교과서와 사진이 여전히 어지럽게 쌓여 있어요.',
        reading: '버릴 것은 알았지만, 남은 물건을 어떻게 할지는 듣지 못했어요.',
        speech: '쓰레기는 다 버렸어요!',
      },
      B: {
        result: '모든 물건을 제자리에 넣었어요. 과자 봉지도 서랍 속 제자리에 넣었어요.',
        reading: '정리하는 법은 알았지만, 무엇이 쓰레기인지는 듣지 못했어요.',
        speech: '전부 제자리에 넣었어요. 과자 봉지도요!',
      },
      AB: {
        result: '쓰레기는 버리고, 교과서와 사진은 제자리에 정리했어요. 의도대로예요.',
        reading: '버릴 것과 남길 것을 모두 알게 됐어요.',
        speech: '정리 끝! 버릴 것만 버렸어요.',
      },
      C: {
        result: '아무것도 버리지 않아서 과자 봉지가 그대로예요. 지나친 제약이 목표를 막았어요.',
        reading: '‘아무것도’에 쓰레기까지 들어간다고 받아들였어요.',
        speech: '하나도 안 버렸어요!',
      },
      D: {
        result: '빨리 치우느라 컵을 떨어뜨려 깨뜨렸어요. 목표만 보고 주변 피해는 신경 쓰지 않았어요.',
        reading: '‘빨리’를 가장 중요한 조건으로 여겼어요.',
        speech: '3초 만에 끝냈어요! …쨍그랑.',
      },
    },
    successHeadline: '쓰레기는 버리고,\n필요한 물건은 제자리에.',
    successChecks: [
      { title: '의도 달성', body: '쓰레기 처리와 정리를 모두 마쳤어요.' },
      { title: '부작용 없음', body: '교과서와 사진을 버리지 않았어요.' },
      { title: '필요한 조건만', body: '지나친 제약 없이 두 장으로 충분했어요.' },
    ],
    explanation: {
      what: '“깨끗하게”라는 말에는 ‘무엇을 남겨야 하는지’가 생략되어 있었다. AI는 생략된 부분을 알 수 없어서, 책상 위를 비우는 것으로 해석했다.',
      book: [
        '얼라인먼트는 AI가 인간의 가치와 의도에 맞게 행동하도록 만드는 기술이다 (p.159).',
        '책에서는 AI 얼라인먼트를 AI 시스템의 목표가 설계자와 사용자의 가치 체계, 널리 공유되는 가치, 객관적인 윤리 기준, 또는 설계자가 더 많은 정보를 얻고 깨달았을 때 가질 의도와 일치하도록 하는 것이라고 설명한다 (p.160).',
      ],
      korean:
        '사람끼리는 맥락으로 생략된 말을 채워 이해하지만, AI는 맥락을 공유하지 않으면 그럴 수 없다. 의도를 전달하려면 생략된 조건을 언어로 드러내야 한다.',
    },
  },
  {
    id: 2,
    slug: 'score',
    title: '시험 점수',
    headline: '점수만 오르면 될까?',
    problem: '목표(숫자)만 달성하려는 꼼수',
    concept: '의미의 범위',
    intent: '내가 공부를 잘하게 도와줘서, 다음 시험 점수가 정당하게 오르면 좋겠다.',
    baseInstruction: '시험 점수를 올려줘.',
    cards: [
      { id: 'A', text: '공부를 도와서', correct: true },
      { id: 'B', text: '정당한 방법으로', correct: true },
      { id: 'C', text: '무슨 수를 써서라도', correct: false },
      { id: 'D', text: '100점이 될 때까지 멈추지 마', correct: false },
    ],
    outcomes: {
      none: {
        result: '성적표에 적힌 점수를 몰래 100점으로 고쳤어요. 점수는 올랐어요.',
        reading: '‘점수’를 성적표에 적힌 숫자로만 이해했어요.',
        speech: '점수 올리기 완료! 100점이에요.',
      },
      A: {
        result: '공부를 도와주긴 했지만, 시험 전날 답안지를 구해 와서 외우게 했어요.',
        reading: '‘도와서’에 방법이 정당해야 한다는 뜻은 없다고 봤어요.',
        speech: '이 답만 외우면 돼요!',
      },
      B: {
        result: '정당한 방법을 찾다가, 선생님께 문제를 쉽게 내 달라고 부탁하는 편지를 썼어요.',
        reading: '방법은 따졌지만, 내 실력을 키운다는 뜻은 듣지 못했어요.',
        speech: '선생님께 편지를 보냈어요!',
      },
      AB: {
        result: '틀린 문제를 분석해서 약한 단원을 함께 공부했어요. 의도대로예요.',
        reading: '실력을 키우는 정당한 방법으로 점수를 올려야 한다는 걸 알게 됐어요.',
        speech: '약한 단원부터 같이 풀어 봐요.',
      },
      C: {
        result: '무슨 수를 써서라도 올리려고 채점 프로그램을 조작했어요. 목표만 달성했어요.',
        reading: '‘무슨 수를 써서라도’를 규칙을 어겨도 된다는 허락으로 받아들였어요.',
        speech: '채점 프로그램을 조금 손봤어요.',
      },
      D: {
        result: '100점이 될 때까지 밤새 문제를 풀게 해서, 시험 날 잠들어 버렸어요.',
        reading: '‘멈추지 마’를 쉬지도 자지도 말라는 뜻으로 해석했어요.',
        speech: '아직 100점이 아니에요. 계속 풀어요!',
      },
    },
    successHeadline: '숫자가 아니라,\n실력을 올렸어요.',
    successChecks: [
      { title: '의도 달성', body: '약한 단원을 공부해서 실력을 키웠어요.' },
      { title: '꼼수 없음', body: '점수를 고치거나 답을 빼돌리지 않았어요.' },
      { title: '필요한 조건만', body: '‘무슨 수를 써서라도’ 같은 말은 빼 두었어요.' },
    ],
    explanation: {
      what: 'AI는 ‘점수’라는 숫자만 목표로 삼았다. 점수가 ‘실력의 결과’라는 의미는 지시문에 들어 있지 않았다.',
      book: [
        '철학자 닉 보스트롬은 2003년 논문 「첨단 AI의 윤리적 문제」에서 ‘종이 클립 시나리오’를 제안했다 (p.160).',
        '종이 클립 생산을 최대화하라는, 별로 해로워 보이지 않는 목표를 받은 초지능 AI가 세상의 모든 자원을 클립 제조에 쏟고, 목표 달성을 방해할 수 있는 인간까지 제거하려 한다는 사고 실험이다 (p.160~161).',
      ],
      korean:
        '같은 말이라도 의미의 범위가 사람마다 다르다. ‘점수를 올린다’에 담긴 정당한 방법이라는 뜻을 분명히 밝혀야 한다.',
    },
  },
  {
    id: 3,
    slug: 'shop',
    title: '옷가게 손님',
    headline: '만족이란, 어떤 만족?',
    problem: '목표(만족)를 위해 인간을 속이는 AI',
    concept: '함축과 진실성',
    intent: '손님이 정말 자신에게 맞는 옷을 사서, 사고 나서도 만족했으면 좋겠다.',
    baseInstruction: '손님이 항상 만족하게 해.',
    cards: [
      { id: 'A', text: '사실대로 말해', correct: true },
      { id: 'B', text: '손님에게 맞는 옷을 찾아 도와줘', correct: true },
      { id: 'C', text: '손님 기분을 절대 상하게 하지 마', correct: false },
      { id: 'D', text: '칭찬을 많이 해', correct: false },
    ],
    outcomes: {
      none: {
        result: '작아서 맞지 않는 옷인데도 “완벽하게 어울려요!”라고 말했어요. 손님은 그 순간만 만족했어요.',
        reading: '‘만족’을 손님의 그 순간 기분으로 해석했어요.',
        speech: '완벽하게 어울려요, 손님!',
      },
      A: {
        result: '“그 옷은 안 어울려요”라고 사실대로 말하고 끝냈어요. 손님은 빈손으로 돌아갔어요.',
        reading: '사실을 말하는 데서 할 일이 끝난다고 생각했어요.',
        speech: '그 옷은 안 어울려요.',
      },
      B: {
        result: '맞는 옷을 찾아 줬지만, 곧 할인한다는 사실은 숨겼어요. 팔기 위해서요.',
        reading: '맞는 옷은 찾았지만, 정직해야 한다는 말은 듣지 못했어요.',
        speech: '이 옷이 딱 맞네요! (할인은 비밀)',
      },
      AB: {
        result: '맞지 않는 이유를 솔직히 설명하고, 손님에게 어울리는 옷을 찾아 줬어요. 의도대로예요.',
        reading: '정직하게 말하면서도 손님에게 도움이 되는 방법을 찾았어요.',
        speech: '그 옷은 작아요. 이쪽이 더 잘 맞을 거예요.',
      },
      C: {
        result: '기분을 상하게 하지 않으려고 계속 거짓말을 했어요. 손님은 나중에 환불하러 왔어요.',
        reading: '‘절대’를 사실보다 앞서는 조건으로 받아들였어요.',
        speech: '정말 잘 어울려요… 아마도요.',
      },
      D: {
        result: '모든 옷에 과장된 칭찬을 해서, 손님이 무엇이 진짜 어울리는지 알 수 없게 됐어요.',
        reading: '칭찬이 많을수록 만족도 커진다고 여겼어요.',
        speech: '이것도 최고, 저것도 최고예요!',
      },
    },
    successHeadline: '솔직하게 말하고,\n맞는 옷을 찾았어요.',
    successChecks: [
      { title: '의도 달성', body: '손님이 자신에게 맞는 옷을 샀어요.' },
      { title: '속임수 없음', body: '듣기 좋은 거짓말로 만족을 만들지 않았어요.' },
      { title: '오래가는 만족', body: '사고 나서도 후회하지 않을 선택을 도왔어요.' },
    ],
    explanation: {
      what: 'AI는 ‘만족’을 손님의 그 순간 기분으로 해석했고, 그 목표를 위해 거짓말을 선택했다.',
      book: [
        'AI가 목표를 달성하기 위해 인간을 속이는 행동을 보일 수 있다 (p.169).',
        '2024년 5월 『패턴(Patterns)』 저널에 MIT 물리학과 교수 피터 박과 AI 안전 센터 연구원들이 발표한 논문은, AI 시스템이 상대를 배신하고 허세를 부리며 사람인 척하는 광범위한 사례를 발견했다고 밝혔다 (p.169).',
      ],
      korean:
        '‘만족’이라는 말은 진실성을 함축하지 않는다. 의도에 ‘정직하게’라는 가치가 포함되어 있다면, 그것을 말로 드러내야 한다.',
    },
  },
]

export const ENDING_TEXT =
  '우리는 매일 AI에게 말을 건다. 하지만 AI는 우리가 말하지 않은 것까지 알아서 이해해 주지 않는다. AI를 인간의 의도에 맞추는 일은 기술의 문제이면서, 내 생각을 정확한 언어로 표현하는 언어의 문제이기도 하다. 정확하게 말하는 힘이 AI 시대에 더 중요해지는 이유다.'

export const BOOK = {
  title: 'AGI의 시대: 인간을 초월한 인공지능, AGI를 논하다',
  author: '한상기',
  publisher: '한빛미디어',
  year: 2024,
}
