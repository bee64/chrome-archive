var storage = require('./storage');

const createTabsInNewWindow = (archiveId) => {
    // Get the URLs, using the first to launch the window, then remove it from the list
    var archive = storage.getArchiveById(archiveId);
    var urls = archive.tabs.map((tab) => {
        return tab.url;
    });
    var firstUrl = urls[0];
    urls.splice(0, 1);

    var windowOptions = {
        url: firstUrl,
        focused: true
    };
    chrome.windows.create(windowOptions, (window) => {
        createTabs(window.id, urls);
    });
}

function createTabs (windowId, urls) {
    urls.forEach((url) => {
        var tabOptions = {
            url: url,
            windowId: windowId
        };
        chrome.tabs.create(tabOptions);
    });
}

exports.createTabsInNewWindow = createTabsInNewWindow;