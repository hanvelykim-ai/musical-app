# I ❤ 동선 관리 앱

뮤지컬 "I ❤" 배우별 상수/하수 퇴장 방향 관리 앱

## 실행 방법

```bash
npm install
npm run dev
```

## GitHub Pages 배포

1. GitHub 저장소 생성 후 push
2. `vite.config.js`의 `base`를 저장소 이름으로 수정:
   ```js
   base: '/저장소이름/',
   ```
3. GitHub Actions 또는 수동 배포:
   ```bash
   npm run build
   # dist 폴더를 gh-pages 브랜치에 push
   ```

### GitHub Actions 자동 배포 (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 기능
- 배우 10명별 장면별 상수/하수 퇴장 방향 입력
- 직전/다음 장면 컨텍스트 표시
- 동선 충돌 자동 감지 (⚠)
- 결과: 배우별 동선표 + 상수/하수 의상 대기 목록
- 로컬스토리지 자동 저장
