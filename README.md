# Google Keep Link Helper

Google Keep에서 웹 링크를 쉽게 저장할 수 있도록 도와주는 Tampermonkey UserScript입니다.

## 주요 기능

- Google Keep의 첫 번째 메모에 "링크 추가" 버튼을 자동으로 추가
- 버튼 클릭 시 URL 입력 프롬프트 표시
- 입력한 URL의 웹페이지 제목을 자동으로 가져와 메모 제목으로 설정
- URL을 메모 내용에 자동으로 입력 (앞에 공백 포함)
- 첫 번째 메모만 수정하며, 다른 메모는 절대 건드리지 않음

## 설치 방법

1. 브라우저에 [Tampermonkey](https://www.tampermonkey.net/) 확장 프로그램 설치
2. Tampermonkey 대시보드 열기
3. 새 스크립트 생성
4. `google-keep-link-helper.user.js` 파일의 내용을 복사하여 붙여넣기
5. 저장 (Ctrl+S 또는 File > Save)

## 사용 방법

1. [Google Keep](https://keep.google.com) 접속
2. 새 메모 작성 시작
3. 메모 고정 버튼 옆에 나타나는 링크 아이콘 클릭
4. 프롬프트에 URL 입력
5. 자동으로 웹페이지 제목이 메모 제목으로 설정되고, URL이 메모 내용에 입력됨

## 동작 방식

### 버튼 추가
- `aria-label="메모 고정"` 속성을 가진 첫 번째 요소를 찾아 메모 식별
- 메모 고정 버튼 옆에 링크 추가 버튼 삽입
- MutationObserver를 사용하여 새 메모가 생성될 때 자동으로 버튼 추가

### 링크 처리
1. 사용자가 입력한 URL로 GM_xmlhttpRequest를 통해 웹페이지 가져오기
2. DOMParser로 HTML 파싱하여 `<title>` 태그 추출
3. 추출한 제목을 메모의 제목 필드에 설정
4. URL을 메모의 내용 필드에 설정 (앞에 공백 1개 추가)
5. 제목 추출 실패 시 URL을 제목으로도 사용

### 안전장치
- 첫 번째 메모만 선택하기 위해 `querySelector` 사용 (첫 번째 일치 요소만 반환)
- 다른 메모는 절대 수정하지 않음
- Trusted Types 정책을 설정하여 Google Keep의 CSP와 호환

## 요구사항

- Tampermonkey (또는 호환되는 UserScript 관리자)
- Google Keep 접속 권한
- GM_xmlhttpRequest 권한 (모든 도메인 연결 허용)

## 기술 세부사항

- **버전**: 1.4
- **대상 사이트**: https://keep.google.com/*
- **필수 권한**: GM_xmlhttpRequest, 모든 도메인 연결
- **안정적인 선택자**: `aria-label` 속성 사용 (임시 클래스명 대신)
- **Trusted Types**: Google Keep의 Content Security Policy 준수

## 주의사항

- 이 스크립트는 DOM 순서상 첫 번째 메모만 수정합니다
- CORS 제한이 있는 일부 웹사이트는 제목을 가져오지 못할 수 있습니다
- Google Keep의 UI 구조가 변경되면 스크립트가 작동하지 않을 수 있습니다
