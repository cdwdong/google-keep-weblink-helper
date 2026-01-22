# Google Keep Link Helper

Google Keep에서 링크를 붙여넣으면 자동으로 웹페이지의 제목을 가져와 노트 제목으로 설정하고, 내용을 링크로 채워주는 Tampermonkey UserScript입니다.

## 기능

- 🔗 링크를 붙여넣으면 자동으로 웹페이지 제목을 가져옵니다
- 📝 노트 제목을 웹페이지의 `<title>` 태그 내용으로 자동 설정합니다
- ✨ 노트 내용은 링크 URL로 깔끔하게 정리됩니다
- 🚀 실시간으로 동작하여 즉시 적용됩니다

## 설치 방법

### 1. Tampermonkey 설치

먼저 브라우저에 Tampermonkey 확장 프로그램을 설치해야 합니다:

- [Chrome용 Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox용 Tampermonkey](https://addons.mozilla.org/ko/firefox/addon/tampermonkey/)
- [Edge용 Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- [Safari용 Tampermonkey](https://apps.apple.com/app/tampermonkey/id1482490089)

### 2. UserScript 설치

1. Tampermonkey가 설치되면 브라우저 도구 모음에서 Tampermonkey 아이콘을 클릭합니다
2. "대시보드"를 선택합니다
3. "새 스크립트 추가" 탭을 클릭합니다
4. `google-keep-link-helper.user.js` 파일의 내용을 복사하여 붙여넣습니다
5. Ctrl+S (또는 Cmd+S)를 눌러 저장합니다

또는:

1. `google-keep-link-helper.user.js` 파일을 클릭합니다
2. Tampermonkey가 자동으로 설치 화면을 표시합니다
3. "설치" 버튼을 클릭합니다

## 사용 방법

1. [Google Keep](https://keep.google.com)에 접속합니다
2. 새 노트를 만들거나 기존 노트를 엽니다
3. 노트 내용 영역에 웹사이트 링크를 붙여넣습니다
4. 자동으로:
   - 웹페이지의 제목을 가져와 노트 제목으로 설정됩니다
   - 노트 내용이 링크 URL로 정리됩니다

### 예시

링크 붙여넣기 전:
```
제목: (비어있음)
내용: (비어있음)
```

`https://www.example.com` 붙여넣기 후:
```
제목: Example Domain (웹페이지의 실제 제목)
내용: https://www.example.com
```

## 주의사항

- 이 스크립트는 Google Keep 웹 버전에서만 작동합니다 (모바일 앱에서는 작동하지 않습니다)
- 웹페이지의 제목을 가져오기 위해 CORS 요청을 사용하므로 일부 웹사이트에서는 작동하지 않을 수 있습니다
- 제목을 가져올 수 없는 경우 URL이 제목으로 사용됩니다

## 문제 해결

### 스크립트가 작동하지 않는 경우

1. Tampermonkey가 활성화되어 있는지 확인합니다
2. 브라우저 콘솔(F12)을 열어 "Google Keep Link Helper is running" 메시지가 표시되는지 확인합니다
3. 페이지를 새로고침(F5)해 봅니다
4. Tampermonkey 대시보드에서 스크립트가 활성화되어 있는지 확인합니다

### 특정 웹사이트의 제목을 가져올 수 없는 경우

일부 웹사이트는 CORS 정책으로 인해 제목을 가져올 수 없습니다. 이 경우 URL이 제목으로 사용됩니다.

## 라이선스

MIT License

## 기여

버그 리포트나 기능 제안은 이슈로 등록해 주세요.
