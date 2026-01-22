// ==UserScript==
// @name         Google Keep Link Helper
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Google Keep에서 링크 추가 버튼으로 제목을 링크의 title로 설정하고 내용을 링크로 채웁니다
// @author       You
// @match        https://keep.google.com/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

if (window.trustedTypes && window.trustedTypes.createPolicy) {
    if (!window.trustedTypes.defaultPolicy) {
        window.trustedTypes.createPolicy('default', {
            createHTML: (string) => string,
            createScriptURL: (string) => string,
            createScript: (string) => string,
        });
    }
}

(function() {
    'use strict';

    // 링크 추가 버튼 생성
    function createLinkButton() {
        const button = document.createElement('div');
        button.role = 'button';
        button.className = 'Q0hgme-LgbsSe Q0hgme-Bz112c-LgbsSe VIpgJd-LgbsSe';
        button.setAttribute('data-tooltip-text', '링크 추가');
        button.setAttribute('aria-label', '링크 추가');
        button.setAttribute('aria-disabled', 'false');
        button.style.userSelect = 'none';
        button.tabIndex = 0;

        // 링크 아이콘 추가 (간단한 SVG 아이콘)
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
        `;

        // 클릭 이벤트 추가
        button.addEventListener('click', function() {
            handleLinkButtonClick(button);
        });

        return button;
    }

    // 링크 추가 버튼 클릭 처리
    function handleLinkButtonClick(button) {
        const noteElement = button.closest('.IZ65Hb-TBnied');
        if (!noteElement) return;

        const url = prompt('링크를 입력하세요:');
        if (!url) return;

        console.log('입력된 링크:', url);
        // TODO: 실제 링크 처리 로직 추가
    }

    // 메모에 링크 추가 버튼 삽입
    function addLinkButtonToNote(noteElement) {
        // 이미 버튼이 있는지 확인
        if (noteElement.querySelector('[aria-label="링크 추가"]')) {
            return;
        }

        // 새 메모 작성 영역인지 확인 (di8rgd-r4nke 클래스를 가진 부모 요소가 있는지)
        const noteContainer = noteElement.closest('.IZ65Hb-n0tgWb');
        if (!noteContainer || !noteContainer.classList.contains('di8rgd-r4nke')) {
            console.log('새 메모 작성 영역이 아니므로 버튼을 추가하지 않습니다');
            return;
        }

        // 메모 고정 버튼 찾기
        const pinButton = noteElement.querySelector('.IZ65Hb-nQ1Faf');
        if (!pinButton) return;

        // 버튼 컨테이너 찾기
        const buttonContainer = pinButton.parentElement;
        if (!buttonContainer) return;

        // 링크 추가 버튼 생성 및 삽입
        const linkButton = createLinkButton();

        // 고정 버튼 다음에 삽입
        if (pinButton.nextSibling) {
            buttonContainer.insertBefore(linkButton, pinButton.nextSibling);
        } else {
            buttonContainer.appendChild(linkButton);
        }

        console.log('링크 추가 버튼이 추가되었습니다');
    }

    // 새로운 노트 감지
    function observeNotes() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // 노트 편집 모달 감지
                        if (node.classList && node.classList.contains('IZ65Hb-TBnied')) {
                            addLinkButtonToNote(node);
                        }

                        // 하위 요소에서 노트 찾기
                        const notes = node.querySelectorAll('.IZ65Hb-TBnied');
                        notes.forEach(note => {
                            addLinkButtonToNote(note);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 초기화
    function init() {
        console.log('Google Keep Link Helper 초기화 중...');

        // 기존 노트에 버튼 추가
        const existingNotes = document.querySelectorAll('.IZ65Hb-TBnied');
        existingNotes.forEach(note => {
            addLinkButtonToNote(note);
        });

        // 새 노트 감지 시작
        observeNotes();

        console.log('Google Keep Link Helper가 실행 중입니다');
    }

    // 페이지 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
