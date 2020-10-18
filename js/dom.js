let dom = new Map();

export function $(selector) {
    let el = dom.get(selector);
    if (!el) {
        el = document.body.querySelector(selector);
        if (el) {
            dom.set(selector, el);
        }
    }
    return el;
}
