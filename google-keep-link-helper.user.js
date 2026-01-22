// ==UserScript==
// @name         Google Keep Link Helper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Google Keep에서 링크를 붙여넣으면 자동으로 제목을 링크의 title로 설정하고 내용을 링크로 채웁니다
// @author       You
// @match        https://keep.google.com/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // URL 패턴 정규식
    const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

    // URL에서 타이틀 가져오기
    function fetchPageTitle(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const title = doc.querySelector('title');
                    if (title && title.textContent) {
                        resolve(title.textContent.trim());
                    } else {
                        resolve(url);
                    }
                },
                onerror: function() {
                    resolve(url);
                }
            });
        });
    }

    // 노트가 비어있는지 확인
    function isNoteEmpty(noteElement) {
        // 제목 필드 확인
        const titleField = noteElement.querySelector('div[contenteditable="true"]:first-of-type, div[aria-label*="제목"], div[aria-label*="Title"]');
        if (titleField && titleField.textContent.trim()) {
            return false; // 제목이 있으면 빈 메모가 아님
        }

        // 모든 contenteditable 요소 확인
        const allEditables = noteElement.querySelectorAll('[contenteditable="true"]');
        for (let editable of allEditables) {
            const text = editable.textContent || editable.innerText;
            if (text.trim()) {
                // URL만 있는 경우는 빈 메모로 간주 (이미 처리 중인 경우)
                const urls = text.match(urlPattern);
                if (!urls || text.trim() !== urls[0]) {
                    return false; // URL 외의 다른 내용이 있으면 빈 메모가 아님
                }
            }
        }

        return true; // 비어있음
    }

    // 노트 편집 감지 및 처리
    function handleNoteEdit(noteElement) {
        // 내용 입력 필드 찾기
        const contentEditable = noteElement.querySelector('[contenteditable="true"]');
        if (!contentEditable) return;

        let processingPaste = false;
        let contentBeforePaste = '';

        // paste 이벤트 전에 현재 내용 저장
        contentEditable.addEventListener('beforeinput', function(e) {
            if (e.inputType === 'insertFromPaste') {
                contentBeforePaste = contentEditable.textContent || contentEditable.innerText;
            }
        });

        contentEditable.addEventListener('paste', async function(e) {
            if (processingPaste) return;

            // 붙여넣기 전에 내용이 비어있지 않으면 작동하지 않음
            if (contentBeforePaste.trim() !== '') {
                return;
            }

            // 제목이 있으면 작동하지 않음
            const titleField = noteElement.querySelector('div[contenteditable="true"]:first-of-type, div[aria-label*="제목"], div[aria-label*="Title"]');
            if (titleField && titleField.textContent.trim()) {
                return;
            }

            processingPaste = true;

            setTimeout(async () => {
                const text = contentEditable.textContent || contentEditable.innerText;
                const urls = text.match(urlPattern);

                if (urls && urls.length > 0) {
                    const url = urls[0];

                    // 타이틀 필드 찾기
                    const titleInput = noteElement.querySelector('div[aria-label*="제목"], div[aria-label*="Title"], input[aria-label*="제목"], input[aria-label*="Title"]');

                    if (!titleInput) {
                        // 제목 필드가 없으면 "메모 옵션 더보기" 버튼을 찾아 클릭
                        const moreButton = noteElement.querySelector('[aria-label*="메모 옵션"], [aria-label*="Note options"], [aria-label*="더보기"], [aria-label*="More"]');
                        if (moreButton) {
                            moreButton.click();
                            // 약간의 지연 후 다시 시도
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }

                    try {
                        const pageTitle = await fetchPageTitle(url);

                        // 제목 설정
                        const titleField = noteElement.querySelector('div[contenteditable="true"]:first-of-type, div[aria-label*="제목"], div[aria-label*="Title"]');
                        if (titleField && !titleField.textContent.trim()) {
                            titleField.textContent = pageTitle;
                            titleField.dispatchEvent(new Event('input', { bubbles: true }));
                            titleField.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        // 내용을 링크로만 설정
                        if (contentEditable.textContent.trim() !== url) {
                            contentEditable.textContent = url;
                            contentEditable.dispatchEvent(new Event('input', { bubbles: true }));
                            contentEditable.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    } catch (error) {
                        console.error('Error fetching page title:', error);
                    }
                }

                processingPaste = false;
            }, 100);
        });

        // 입력 이벤트로도 감지 (직접 타이핑하는 경우)
        contentEditable.addEventListener('input', function(e) {
            if (processingPaste) return;

            const text = contentEditable.textContent || contentEditable.innerText;
            const urls = text.match(urlPattern);

            // 제목이 있으면 작동하지 않음
            const titleField = noteElement.querySelector('div[contenteditable="true"]:first-of-type, div[aria-label*="제목"], div[aria-label*="Title"]');
            if (titleField && titleField.textContent.trim()) {
                return;
            }

            if (urls && urls.length > 0 && text.trim() === urls[0]) {
                const url = urls[0];
                processingPaste = true;

                fetchPageTitle(url).then(pageTitle => {
                    const titleField = noteElement.querySelector('div[contenteditable="true"]:first-of-type, div[aria-label*="제목"], div[aria-label*="Title"]');
                    if (titleField && !titleField.textContent.trim()) {
                        titleField.textContent = pageTitle;
                        titleField.dispatchEvent(new Event('input', { bubbles: true }));
                        titleField.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    processingPaste = false;
                }).catch(() => {
                    processingPaste = false;
                });
            }
        });
    }

    // 새로운 노트 감지
    function observeNotes() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // 새 노트 작성 영역
                        if (node.matches && (
                            node.matches('[aria-label*="메모 작성"], [aria-label*="Take a note"]') ||
                            node.querySelector('[aria-label*="메모 작성"], [aria-label*="Take a note"]')
                        )) {
                            handleNoteEdit(node);
                        }

                        // 노트 편집 모달
                        if (node.matches && (
                            node.matches('[role="dialog"]') ||
                            node.querySelector('[role="dialog"]')
                        )) {
                            const dialog = node.matches('[role="dialog"]') ? node : node.querySelector('[role="dialog"]');
                            if (dialog) {
                                handleNoteEdit(dialog);
                            }
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
        // 기존 노트 편집 영역 감지
        const existingNotes = document.querySelectorAll('[contenteditable="true"]');
        existingNotes.forEach(note => {
            const noteElement = note.closest('[role="dialog"], [aria-label*="메모"], [aria-label*="Note"]') || note.parentElement;
            if (noteElement) {
                handleNoteEdit(noteElement);
            }
        });

        // 새 노트 감지 시작
        observeNotes();
    }

    // 페이지 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('Google Keep Link Helper is running');
})();
