# 마음프리즘 (Maum Prism)

Next.js + Vercel + Supabase 기반 감정 기록/분석 서비스

## 환경 변수 설정

`.env.local` 파일에 아래와 같이 입력하세요:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## OpenAI 프록시 API 사용법

- 엔드포인트: `/api/openai-proxy`
- POST 요청으로 OpenAI Chat API와 동일한 body를 전달
- 서버사이드에서만 사용 (API 키 노출 금지)

## 테스트 자동화

```
npm run test
```

## 코드 품질 자동화

- ESLint, Prettier, Husky 등 적용
- 커밋/푸시 시 자동 검사
