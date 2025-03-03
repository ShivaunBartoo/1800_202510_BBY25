export function loadContent(selector, filePath) {
    document.querySelectorAll(selector).forEach(element => {
        fetch(filePath)
            .then(response => response.text())
            .then(html => element.innerHTML = html)
            .catch(error => console.error(`Error loading ${filePath} into ${selector}:`, error));
    });
}

