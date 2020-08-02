const createDom = require('./src/create-dom');
const storage = require('./src/storage');

// Query for the tabs on the current window, and save the resulting list
function onSaveArchive () {
    var queryInfo = {
        currentWindow: true
    }
    chrome.tabs.query(queryInfo, storage.saveTabList);
}

function loadArchives () {
    storage.getArchiveIds().forEach((id, index) => {
        var isEven = index % 2 === 0;
        var archive = storage.getArchiveById(id);
        createDom.addArchiveToDom(archive, isEven);
    });
}

function addEventListeners() {
    addSaveArchiveListeners();
}

function addSaveArchiveListeners() {
    var button = document.getElementById('archive-button');
    button.addEventListener('click', onSaveArchive);

    var input = document.getElementById('archive-name');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            onSaveArchive();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadArchives();
    addEventListeners();
});