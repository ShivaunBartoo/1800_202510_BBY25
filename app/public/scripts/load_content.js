export function loadContent(selector, filePath) {
    document.querySelectorAll(selector).forEach(element => {
        fetch(filePath)
            .then(response => response.text())
            .then(html => element.innerHTML = html)
            .then(html => getDataTest(html))
            .catch(error => console.error(`Error loading ${filePath} into ${selector}:`, error));
    });
}

function getDataTest(html) {
    const el = document.querySelectorAll('[data-value]');
    console.log(el);
    el.forEach( (currentValue, currentIndex) => {
        currentValue.addEventListener("click", () => {
            console.log("");
        });
    });
}
