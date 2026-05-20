# CLAUDE.md
> 이 파일은 Claude Code가 프로젝트 폴더에서 자동으로 읽습니다.
> 모든 작업은 이 파일의 규칙을 따릅니다. 규칙과 충돌하는 코드는 작성하지 않습니다.

---

## 1. 프로젝트 목적 및 주요 기능 요약

**목적**
중도 입국 학생(다문화 배경)이 수학 수업 중 한국어 교과서를 스스로 읽고 이해할 수 있도록
실시간 언어 비계(Scaffolding)를 제공하는 웹앱. 번역 도구가 아니라 한국어 자립을 돕는 도구.

**핵심 기능 5가지**
1. **4단계 번역 모드** — 전체번역 → 핵심단어 제외 번역 → 핵심단어만 번역 → 번역 없음
2. **클릭 툴팁** — 용어 클릭 시 모국어 번역 + 정의 표시
3. **자동 페이딩** — 같은 단계 3차시 연속 시 다음 단계로 자동 이동
4. **2층위 번역** — 확정 용어집(JSON) 우선, 없으면 Claude API 호출
5. **교사 화면** — 학생별 단계 현황 확인 및 수동 조정

**대상 사용자**
- 학생: 중도 입국 중학생 (태블릿 PC 사용)
- 교사: 학생 단계 관리 (PC 또는 태블릿)

**지원 언어 (현재):** 한국어, 영어, 독일어
**추후 추가 예정:** 베트남어, 중국어, 러시아어

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프론트엔드 | HTML + CSS + Vanilla JavaScript | 코딩 경험 없는 교사가 유지보수 가능 |
| 번들러 | 없음 | 복잡도 최소화 |
| 배포 | Vercel (GitHub 연동) | 무료, 자동 배포 |
| DB / 인증 | Supabase JS SDK v2 (CDN) | 무료, 실시간 지원 |
| AI API | Anthropic Claude API | 수학 맥락 번역 정확도 |
| PDF 렌더링 | pdf.js (Mozilla CDN) | 무료, 텍스트 좌표 추출 가능 |
| 폰트 | Google Fonts — Noto Sans KR | 한국어 최적화 |
| 패키지 매니저 | **사용하지 않음** | npm/node_modules 금지 |

---

## 3. 폴더 구조

```
adaptive-vacab-translator/
  ├── CLAUDE.md                  ← 이 파일 (규칙 외 수정 금지)
  ├── 작업지시서.md               ← 개발 명세 (수정 금지)
  ├── index.html                 ← 메인 웹앱 (기존 파일 기반으로 확장)
  ├── math_vocab_geometry.json   ← 용어집 (내용 수정 금지)
  ├── api/
  │   └── config.js              ← Vercel 서버리스 함수 (환경변수 클라이언트 전달)
  ├── .env                       ← 로컬 환경변수 (gitignore 대상, 커밋 금지)
  ├── .env.example               ← 환경변수 형식 안내 (실제 값 없음)
  ├── .gitignore                 ← .env 반드시 포함
  └── README.md                  ← 배포/실행/계정등록 방법
```

새 파일이 필요하면 아래 폴더만 허용:
- `assets/` — 이미지, 아이콘
- `scripts/` — JS 분리 시
- `styles/` — CSS 분리 시

---

## 4. 개발 규칙

### 4-1. 언어
- 주석은 **한국어**로 작성
- 함수명, 변수명은 **영어 camelCase**
- 사용자에게 보이는 텍스트(버튼, 안내문 등)는 **한국어**

### 4-2. JavaScript
- `var` 사용 **금지** → `const`, `let`만 사용
- 비동기 처리는 `async/await` 방식 사용 (`.then().catch()` 지양)
- 한 함수는 한 가지 일만 함. 100줄 초과 시 분리
- `console.log`는 디버깅 후 반드시 제거

### 4-3. HTML / CSS
- `<!DOCTYPE html>`, `<meta charset="UTF-8">`, viewport 메타태그 필수
- 인라인 스타일(`style=""`) 사용 **금지** → CSS 변수와 class만 사용
- 기존 CSS 변수 체계 유지 (아래 참고)
- 태블릿 우선 반응형. breakpoint 기준: `900px` (중간), `720px` (모바일)

**기존 CSS 변수 (변경 금지)**
```css
:root {
  --bg, --surface, --surface2, --border,
  --text-main, --text-sub, --text-light,
  --accent, --accent2, --accent-light
}
```

### 4-4. 보안
- API 키, Supabase URL/KEY를 코드에 직접 쓰는 것 **절대 금지**
- 로컬 개발: `.env` 파일에서 읽기
- Vercel 배포: Vercel 환경변수에서 읽기
- `.env`는 반드시 `.gitignore`에 포함

### 4-5. 기존 파일 보호
- `math_vocab_geometry.json` — 내용 수정 **금지**. 언어 추가 시에만 필드 추가
- `index.html` 기존 기능(툴팁, 4단계 전환, 용어 검색) — 제거하거나 덮어쓰지 않고 확장

---

## 5. 절대 금지 사항

| 금지 항목 | 이유 |
|-----------|------|
| `npm install`, `node_modules` | 유지보수 불가 |
| React, Vue, Next.js 등 프레임워크 | 코딩 경험 없는 교사가 유지보수 불가 |
| TypeScript | 동일 이유 |
| API 키 하드코딩 | 보안 사고 위험 |
| `math_vocab_geometry.json` 내용 수정 | 검증된 용어집 |
| 기존 CSS 변수 체계 변경 | 디자인 일관성 파괴 |
| 외부 유료 라이브러리 | 비용 발생 |
| `.env` 파일 커밋 | API 키 유출 |

---

## 6. Claude API 호출 규칙

- 모델: `claude-sonnet-4-20250514`
- max_tokens: `200`
- **용어집 히트 시 API 호출 금지** — JSON에서 즉시 반환
- 시스템 프롬프트 (고정, 변경 금지):

```
너는 중학교 수학 교과서 번역 전문가야.
지금 텍스트는 중1 수학 기본도형 단원이야.
요청받은 한국어 단어의 번역어와 한 줄 정의를 아래 JSON 형식으로만 반환해.
다른 말은 절대 하지 마.
{"translation": "번역어", "definition": "정의 한 줄"}
```

- 호출 실패 시 fallback: 툴팁에 "번역을 불러올 수 없습니다" 표시

---

## 7. Supabase 테이블 구조

### `students` 테이블

| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `id` | uuid | — | Supabase Auth UID (PK) |
| `name` | text | — | 학생 이름 |
| `role` | text | `'student'` | `'student'` 또는 `'teacher'` |
| `current_stage` | int | `1` | 현재 번역 단계 (1~4) |
| `session_count` | int | `0` | 누적 차시 수 |
| `stage_session_count` | int | `0` | 현재 단계 연속 차시 수 |
| `updated_at` | timestamp | now() | 마지막 업데이트 |

> ⚠️ **컬럼명 주의** — JS 변수명과 DB 컬럼명이 다름

| JS 변수명 | Supabase 컬럼명 | 혼동 주의 |
|-----------|----------------|-----------|
| `currentStage` | `current_stage` | JS는 camelCase |
| `currentUser.id` | `id` | `user_id` 아님 |
| `stageSessionCount` | `stage_session_count` | 동일 |
| `sessionCount` | `session_count` | 동일 |

### Supabase 쿼리 패턴 (확정)

```javascript
// 조회
await supabaseClient
  .from('students')
  .select('name, current_stage, session_count, stage_session_count')
  .eq('id', userId)
  .single();

// 저장 — update 대신 upsert 사용 (첫 로그인 학생에게 행이 없어서 update는 동작 안 함)
await supabaseClient
  .from('students')
  .upsert({ id: currentUser.id, current_stage: ..., updated_at: new Date().toISOString() });
```

### RLS 정책 (필수)

```sql
create policy "본인 조회" on public.students for select using (auth.uid() = id);
create policy "본인 삽입" on public.students for insert with check (auth.uid() = id);
create policy "본인 수정" on public.students for update using (auth.uid() = id);
```

---

## 8. 마일스톤 진행 원칙

1. 마일스톤 하나가 **완전히 작동하는 것을 확인**한 후 다음으로 넘어간다
2. 한 번에 여러 마일스톤을 동시에 진행하지 않는다
3. 각 마일스톤 완료 후 Vercel에 배포하여 실제 태블릿에서 테스트한다
4. 오류가 나면 다음 마일스톤으로 넘어가지 않고 해당 마일스톤 안에서 해결한다

**순서:** MVP(v0.1) → v0.2 → v0.3 → v0.4 → v0.5 → v1.0.0

---

## 9. 개발 현황 (2026-05-20 기준)

| 버전 | 내용 | 상태 |
|------|------|------|
| v0.1 | 로그인 + 단계 저장 | ✅ 완료 |
| v0.2 | 자동 페이딩 로직 | ✅ 완료 |
| v0.3 | PDF 업로드 + 텍스트 레이어 | 🔧 다음 |
| v0.4 | Claude API 연결 | 🔜 예정 |
| v0.5 | 교사 화면 | 🔜 예정 |
| v1.0.0 | 안정화 + 현장 테스트 준비 | 🔜 예정 |

### v0.2에서 구현된 기능 (참고용)
- 수업 시작 바: "이번 단계 X/3차시" + "누적 N차시" + 수업 시작 버튼
- 3차시 연속 → 다음 수업 시작 시 단계 자동 +1, `stage_session_count` 1로 초기화
- 수동 단계 변경 시 `stage_session_count` 0 초기화
- 저장 실패 시 빨간 에러 토스트 (5초), 성공 시 어두운 토스트 (3초)
- 900px 중간 브레이크포인트, 720px 이하 수업 정보 숨김

### v0.3 구현 예정 기능
- PDF 업로드 버튼 (파일 선택)
- pdf.js (Mozilla CDN) 로 페이지별 이미지 렌더링
- 이미지 위 투명 텍스트 레이어 오버레이
- `math_vocab_geometry.json` 용어 → 점선 밑줄 + 클릭 툴팁
