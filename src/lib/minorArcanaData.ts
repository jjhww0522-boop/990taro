// 마이너 아르카나 56장 데이터
// 4개 수트 × 14장: Ace~10 + Jack(시동) + Knight(기사) + Queen(여왕) + King(왕)
// 별빛 타로 한국 테마 이름 적용

export type MinorCard = {
    id: string; // e.g. "wands_01"
    suit: "wands" | "cups" | "swords" | "pentacles";
    number: number; // 1~14
    name: string; // 한국어 이름
    original: string; // 영어 원명
    upright: string; // 정방향 키워드
    reversed: string; // 역방향 키워드
};

const WANDS: MinorCard[] = [
    { id: "wands_01", suit: "wands", number: 1, name: "불씨의 탄생", original: "Ace of Wands", upright: "새로운 열정, 창조적 시작, 영감", reversed: "창의력 막힘, 방향 부재, 동기 저하" },
    { id: "wands_02", suit: "wands", number: 2, name: "화룡의 시선", original: "Two of Wands", upright: "계획과 비전, 세계를 향한 도전", reversed: "두려움, 계획 지연, 좁은 시야" },
    { id: "wands_03", suit: "wands", number: 3, name: "출항의 봉화", original: "Three of Wands", upright: "확장, 기회 포착, 선견지명", reversed: "지연, 기대 실망, 준비 부족" },
    { id: "wands_04", suit: "wands", number: 4, name: "풍년의 정자", original: "Four of Wands", upright: "축하, 결실, 가정의 안정", reversed: "불안정한 기반, 축하 지연, 갈등" },
    { id: "wands_05", suit: "wands", number: 5, name: "다섯 장수의 겨룸", original: "Five of Wands", upright: "경쟁, 마찰, 활발한 논쟁", reversed: "내적 갈등, 회피, 불필요한 싸움" },
    { id: "wands_06", suit: "wands", number: 6, name: "개선문의 기수", original: "Six of Wands", upright: "승리, 인정, 자신감", reversed: "실패의 두려움, 자만, 불인정" },
    { id: "wands_07", suit: "wands", number: 7, name: "산상의 홀로서기", original: "Seven of Wands", upright: "방어, 끈질긴 저항, 확신", reversed: "굴복, 자신감 상실, 도망" },
    { id: "wands_08", suit: "wands", number: 8, name: "여덟 화살", original: "Eight of Wands", upright: "빠른 진행, 메시지, 여행", reversed: "지연, 혼란, 잘못된 방향" },
    { id: "wands_09", suit: "wands", number: 9, name: "상처 입은 수호자", original: "Nine of Wands", upright: "인내, 방어, 마지막 저항", reversed: "번아웃, 포기, 과도한 경계심" },
    { id: "wands_10", suit: "wands", number: 10, name: "짐 진 나그네", original: "Ten of Wands", upright: "과중한 부담, 책임, 완수 직전", reversed: "짐 내려놓기, 위임, 탈진" },
    { id: "wands_11", suit: "wands", number: 11, name: "불꽃 시동", original: "Page of Wands", upright: "모험심, 탐구, 창의적 메시지", reversed: "무모함, 미완성, 의욕만 있음" },
    { id: "wands_12", suit: "wands", number: 12, name: "화염 기사", original: "Knight of Wands", upright: "열정적 행동, 여행, 충동", reversed: "무모한 돌진, 분산된 에너지, 충동적" },
    { id: "wands_13", suit: "wands", number: 13, name: "불꽃 여왕", original: "Queen of Wands", upright: "자신감, 카리스마, 사교성", reversed: "독단, 질투, 자기중심적" },
    { id: "wands_14", suit: "wands", number: 14, name: "화룡 대왕", original: "King of Wands", upright: "리더십, 대담함, 비전 실현", reversed: "독재, 충동적 결정, 오만" },
];

const CUPS: MinorCard[] = [
    { id: "cups_01", suit: "cups", number: 1, name: "달빛 잔", original: "Ace of Cups", upright: "새로운 감정, 사랑의 시작, 영적 충만", reversed: "감정 억압, 공허함, 사랑 거부" },
    { id: "cups_02", suit: "cups", number: 2, name: "두 마음의 맹세", original: "Two of Cups", upright: "연결, 파트너십, 상호 이해", reversed: "불화, 단절, 불균형 관계" },
    { id: "cups_03", suit: "cups", number: 3, name: "꽃잎 연회", original: "Three of Cups", upright: "축하, 우정, 공동체 기쁨", reversed: "과도한 방종, 소문, 삼각관계" },
    { id: "cups_04", suit: "cups", number: 4, name: "연꽃 아래 명상", original: "Four of Cups", upright: "무관심, 내면 탐색, 새 기회 놓침", reversed: "새 관점, 기회 수용, 권태 극복" },
    { id: "cups_05", suit: "cups", number: 5, name: "쏟아진 술잔들", original: "Five of Cups", upright: "상실감, 후회, 아직 남은 것", reversed: "회복, 용서, 앞으로 나아감" },
    { id: "cups_06", suit: "cups", number: 6, name: "어린 날의 뜰", original: "Six of Cups", upright: "향수, 어린 시절 기억, 순수함", reversed: "과거 집착, 미성숙, 기억의 왜곡" },
    { id: "cups_07", suit: "cups", number: 7, name: "일곱 환영", original: "Seven of Cups", upright: "공상, 선택 과부하, 환상", reversed: "현실 직면, 명확한 선택, 환상 깨짐" },
    { id: "cups_08", suit: "cups", number: 8, name: "달빛 이별", original: "Eight of Cups", upright: "포기, 더 깊은 것을 향한 출발", reversed: "미련, 두려움으로 인한 잔류" },
    { id: "cups_09", suit: "cups", number: 9, name: "소원 성취의 잔", original: "Nine of Cups", upright: "만족, 소원 성취, 행복", reversed: "자만, 과도한 쾌락, 욕심" },
    { id: "cups_10", suit: "cups", number: 10, name: "무지개 가족", original: "Ten of Cups", upright: "완전한 행복, 가정의 조화, 영적 충만", reversed: "깨진 가정, 불화, 이상과 현실의 차이" },
    { id: "cups_11", suit: "cups", number: 11, name: "물의 시동", original: "Page of Cups", upright: "직관적 메시지, 감수성, 창의적 감성", reversed: "감정 미숙, 공상 과잉, 나쁜 소식" },
    { id: "cups_12", suit: "cups", number: 12, name: "물 기사", original: "Knight of Cups", upright: "낭만적 행동, 감성적 제안, 따뜻함", reversed: "비실용적, 감정 변덕, 유혹" },
    { id: "cups_13", suit: "cups", number: 13, name: "달의 여왕", original: "Queen of Cups", upright: "공감, 직관, 감정적 안정", reversed: "감정 의존, 자기기만, 순교자적 태도" },
    { id: "cups_14", suit: "cups", number: 14, name: "바다 대왕", original: "King of Cups", upright: "감정 성숙, 외교, 지혜로운 마음", reversed: "감정 억압, 조종, 변덕스러운 분위기" },
];

const SWORDS: MinorCard[] = [
    { id: "swords_01", suit: "swords", number: 1, name: "진실의 검", original: "Ace of Swords", upright: "명확함, 진실, 새로운 아이디어", reversed: "혼란, 거짓, 잘못된 판단" },
    { id: "swords_02", suit: "swords", number: 2, name: "눈 가린 결정", original: "Two of Swords", upright: "교착 상태, 결단 회피, 균형", reversed: "정보 과부하, 거짓의 드러남, 결단" },
    { id: "swords_03", suit: "swords", number: 3, name: "가슴의 세 검", original: "Three of Swords", upright: "슬픔, 이별, 마음의 상처", reversed: "회복, 상처 치유, 용서" },
    { id: "swords_04", suit: "swords", number: 4, name: "묘탑의 휴식", original: "Four of Swords", upright: "휴식, 회복, 재충전", reversed: "불안한 회복, 복귀 거부, 번아웃" },
    { id: "swords_05", suit: "swords", number: 5, name: "쓴 승리", original: "Five of Swords", upright: "갈등, 승자 없는 싸움, 배신", reversed: "화해, 상처 받아들임, 앙심 내려놓기" },
    { id: "swords_06", suit: "swords", number: 6, name: "강 위의 뗏목", original: "Six of Swords", upright: "이동, 더 나은 곳으로의 전환", reversed: "이동 거부, 과거 미련, 불안한 여정" },
    { id: "swords_07", suit: "swords", number: 7, name: "도둑의 술수", original: "Seven of Swords", upright: "교활함, 기만, 단독 행동", reversed: "들통난 거짓, 양심, 자백" },
    { id: "swords_08", suit: "swords", number: 8, name: "스스로 묶인 자", original: "Eight of Swords", upright: "정신적 구속, 피해의식, 자기 제한", reversed: "해방, 새로운 시각, 자유의지" },
    { id: "swords_09", suit: "swords", number: 9, name: "한밤의 공포", original: "Nine of Swords", upright: "불안, 악몽, 극심한 걱정", reversed: "걱정 과장, 터널 끝의 빛, 희망 회복" },
    { id: "swords_10", suit: "swords", number: 10, name: "등에 꽂힌 칼들", original: "Ten of Swords", upright: "완전한 패배, 끝, 배신", reversed: "최악 탈출, 서서히 회복, 재기" },
    { id: "swords_11", suit: "swords", number: 11, name: "바람의 시동", original: "Page of Swords", upright: "호기심, 빠른 사고, 소식", reversed: "소문, 경솔한 말, 충동적 판단" },
    { id: "swords_12", suit: "swords", number: 12, name: "폭풍 기사", original: "Knight of Swords", upright: "결단력, 빠른 행동, 직접적", reversed: "무모함, 분노, 독단적 행동" },
    { id: "swords_13", suit: "swords", number: 13, name: "바람의 여왕", original: "Queen of Swords", upright: "명석함, 독립, 직설적 진실", reversed: "냉담함, 쓴소리, 편견" },
    { id: "swords_14", suit: "swords", number: 14, name: "하늘 대왕", original: "King of Swords", upright: "공정한 판단, 지적 권위, 명확한 소통", reversed: "독재, 냉혹한 판단, 조종" },
];

const PENTACLES: MinorCard[] = [
    { id: "pentacles_01", suit: "pentacles", number: 1, name: "황금 씨앗", original: "Ace of Pentacles", upright: "새로운 금전 기회, 물질적 시작, 번영", reversed: "기회 낭비, 물질적 집착, 탐욕" },
    { id: "pentacles_02", suit: "pentacles", number: 2, name: "저글링의 달인", original: "Two of Pentacles", upright: "균형, 다재다능, 우선순위", reversed: "자원 낭비, 불균형, 혼란" },
    { id: "pentacles_03", suit: "pentacles", number: 3, name: "석공의 솜씨", original: "Three of Pentacles", upright: "협력, 기술 연마, 인정받음", reversed: "불화, 소통 미흡, 퀄리티 저하" },
    { id: "pentacles_04", suit: "pentacles", number: 4, name: "금화 수호자", original: "Four of Pentacles", upright: "안정 추구, 절약, 소유욕", reversed: "인색함, 통제욕, 물질 집착" },
    { id: "pentacles_05", suit: "pentacles", number: 5, name: "눈 속의 가난", original: "Five of Pentacles", upright: "물질적 어려움, 고립감, 도움 필요", reversed: "회복, 도움 수용, 빈곤 탈출" },
    { id: "pentacles_06", suit: "pentacles", number: 6, name: "저울의 나눔", original: "Six of Pentacles", upright: "관대함, 자선, 균형 잡힌 나눔", reversed: "조건부 도움, 빚, 이기심" },
    { id: "pentacles_07", suit: "pentacles", number: 7, name: "기다림의 농부", original: "Seven of Pentacles", upright: "장기적 투자, 인내, 결과 기다림", reversed: "조급함, 낭비, 노력 부족" },
    { id: "pentacles_08", suit: "pentacles", number: 8, name: "장인의 집중", original: "Eight of Pentacles", upright: "숙련, 기술 연마, 성실한 반복", reversed: "완벽주의 함정, 단순 반복, 발전 없음" },
    { id: "pentacles_09", suit: "pentacles", number: 9, name: "풍요의 정원", original: "Nine of Pentacles", upright: "독립, 물질적 풍요, 자기 충족", reversed: "의존, 과시, 물질적 손실" },
    { id: "pentacles_10", suit: "pentacles", number: 10, name: "대가의 유산", original: "Ten of Pentacles", upright: "완전한 풍요, 가문의 번영, 세대 전수", reversed: "유산 분쟁, 불안정한 기반, 가정 불화" },
    { id: "pentacles_11", suit: "pentacles", number: 11, name: "흙의 시동", original: "Page of Pentacles", upright: "새로운 배움, 실용적 메시지, 성실함", reversed: "게으름, 미루기, 기초 부족" },
    { id: "pentacles_12", suit: "pentacles", number: 12, name: "대지 기사", original: "Knight of Pentacles", upright: "꾸준함, 신뢰성, 실용적 행동", reversed: "완고함, 정체, 지나친 보수성" },
    { id: "pentacles_13", suit: "pentacles", number: 13, name: "풍요의 여왕", original: "Queen of Pentacles", upright: "풍성한 돌봄, 실용적 지혜, 안정", reversed: "과보호, 자기 희생, 물질 집착" },
    { id: "pentacles_14", suit: "pentacles", number: 14, name: "황금 대왕", original: "King of Pentacles", upright: "물질적 성공, 사업 수완, 신뢰", reversed: "탐욕, 물질주의, 권력 남용" },
];

export const MINOR_ARCANA: MinorCard[] = [
    ...WANDS,
    ...CUPS,
    ...SWORDS,
    ...PENTACLES,
];

export const SUIT_LABELS: Record<MinorCard["suit"], string> = {
    wands: "🔥 지팡이",
    cups: "🌙 잔",
    swords: "⚔️ 검",
    pentacles: "🌿 동전",
};

/** 무작위 N장 뽑기 */
export function drawMinorCards(count = 5): MinorCard[] {
    const shuffled = [...MINOR_ARCANA].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
