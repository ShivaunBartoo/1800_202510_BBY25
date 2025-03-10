export async function loadContent(selector, filePath) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
        try {
            const response = await fetch(filePath); // Fetch the content from the specified file path
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            const html = await response.text(); // Wait for the response to be converted to text
            element.innerHTML = html; // Insert the fetched HTML content into the element
        } catch (error) {
            console.error(`Error loading ${filePath} into ${selector}:`, error);
        }
    }
}

// function getDataTest(html) {
//     const el = document.querySelectorAll('[data-value]');
//     console.log(el);
//     el.forEach( (currentValue, currentIndex) => {
//         currentValue.addEventListener("click", () => {
//             console.log("");
//         });
//     });
// }
