// ==UserScript==
// @name         Google Keep Link Helper
// @namespace    http://tampermonkey.net/
// @version      1.4
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
        const url = prompt('링크를 입력하세요:');
        if (!url) return;

        console.log('입력된 링크:', url);

        // 첫 번째 메모 찾기
        const firstPinButton = document.querySelector('[aria-label="메모 고정"][aria-pressed="false"]');
        if (!firstPinButton) {
            console.log('첫 번째 메모를 찾을 수 없습니다');
            return;
        }

        // 메모 컨테이너 찾기
        const noteContainer = firstPinButton.closest('[role="dialog"]') ||
                              firstPinButton.closest('.IZ65Hb-n0tgWb');
        if (!noteContainer) {
            console.log('메모 컨테이너를 찾을 수 없습니다');
            return;
        }

        // URL에서 페이지 제목 가져오기
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const title = doc.querySelector('title')?.textContent || url;

                    console.log('가져온 제목:', title);

                    // 첫 번째 메모의 제목과 내용 필드 찾기
                    const editableElements = noteContainer.querySelectorAll('[contenteditable="true"]');

                    if (editableElements.length >= 2) {
                        // 첫 번째는 제목, 두 번째는 내용
                        const titleField = editableElements[0];
                        const contentField = editableElements[1];

                        // 제목 설정
                        titleField.textContent = title;
                        titleField.dispatchEvent(new Event('input', { bubbles: true }));
                        titleField.dispatchEvent(new Event('change', { bubbles: true }));

                        // 내용 설정 (URL)
                        contentField.textContent = ' ' + url;
                        contentField.dispatchEvent(new Event('input', { bubbles: true }));
                        contentField.dispatchEvent(new Event('change', { bubbles: true }));

                        console.log('메모 제목과 내용이 설정되었습니다');
                    } else {
                        console.log('제목/내용 필드를 찾을 수 없습니다');
                    }
                } catch (error) {
                    console.error('제목 추출 실패:', error);

                    // 제목 추출 실패시 URL을 그대로 사용
                    const editableElements = noteContainer.querySelectorAll('[contenteditable="true"]');
                    if (editableElements.length >= 2) {
                        const titleField = editableElements[0];
                        const contentField = editableElements[1];

                        titleField.textContent = url;
                        titleField.dispatchEvent(new Event('input', { bubbles: true }));

                        contentField.textContent = ' ' + url;
                        contentField.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            },
            onerror: function(error) {
                console.error('페이지 가져오기 실패:', error);
                alert('페이지를 가져오는데 실패했습니다.');
            }
        });
    }

    // 첫 번째 메모에만 링크 추가 버튼 삽입
    function addLinkButtonToFirstNote() {
        // DOM 순서상 첫 번째 메모 고정 버튼 찾기 (aria-label 사용)
        const firstPinButton = document.querySelector('[aria-label="메모 고정"][aria-pressed="false"]');
        if (!firstPinButton) {
            console.log('메모 고정 버튼을 찾을 수 없습니다');
            return;
        }

        // 버튼 컨테이너 찾기
        const buttonContainer = firstPinButton.parentElement;
        if (!buttonContainer) return;

        // 이미 링크 추가 버튼이 있는지 확인
        if (buttonContainer.querySelector('[aria-label="링크 추가"]')) {
            return;
        }

        // 링크 추가 버튼 생성 및 삽입
        const linkButton = createLinkButton();

        // 고정 버튼 다음에 삽입
        if (firstPinButton.nextSibling) {
            buttonContainer.insertBefore(linkButton, firstPinButton.nextSibling);
        } else {
            buttonContainer.appendChild(linkButton);
        }

        console.log('첫 번째 메모에 링크 추가 버튼이 추가되었습니다');
    }

    // 새로운 노트 감지
    function observeNotes() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // 메모 고정 버튼이 추가되었는지 확인 (DOM 구조 기반)
                        if (node.querySelector && node.querySelector('[aria-label="메모 고정"]')) {
                            addLinkButtonToFirstNote();
                        }

                        // 또는 직접 메모 고정 버튼인 경우
                        if (node.getAttribute && node.getAttribute('aria-label') === '메모 고정') {
                            addLinkButtonToFirstNote();
                        }
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

        // 첫 번째 메모에 버튼 추가
        addLinkButtonToFirstNote();

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
