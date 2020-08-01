document.addEventListener("DOMContentLoaded", () => {
    var button = document.getElementById('archive-button');

    button.addEventListener('click', (e) => {
        console.log(chrome.tabs);
    });
})