const sanitizeHtml = require('sanitize-html');

/**
 * 모든 태그 제거하는 공통 정리 함수
 * input: 문자열
 * options: sanitize-html의 옵션 객체 (선택)
 */
function clean(input, options = {}) {
    const defaultOptions = {
        allowedTags: [],
        allowedAttributes: {}
    };
    const finalOptions = { ...defaultOptions, ...options };
    return sanitizeHtml(input || '', finalOptions);
}

module.exports = {
    clean
};
