export function escapeRegExp(str) {
    if (!str) return '';
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
