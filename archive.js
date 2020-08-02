const { v4: uuidv4 } = require('uuid');
const createDom = require('./src/create-dom');

var ARCHIVE_ID_LIST_KEY = 'archive-id-list';

// Query for the tabs on the current window, and save the resulting list
function onSaveArchive () {
    var queryInfo = {
        currentWindow: true
    }
    chrome.tabs.query(queryInfo, saveTabList);
}

function saveTabList (tabList) {
    // Get the name of the archive from an input?
    var newArchiveName = getNewArchiveName();
    var archive = createArchive(newArchiveName, tabList);
    var numArchives = getArchiveIds().length;
    var isNextEven = numArchives === 0 || numArchives % 2 === 0;
    saveArchive(archive);
    // TODO delete button
    //      Should the delete button say "are you sure" or something?
    //      If I can do the "are you sure" popup I can probably do the "show you a list and let you remove individual items"
    createDom.addArchiveToDom(archive, isNextEven, createTabsInNewWindow);
}

function getNewArchiveName () {
    return document.getElementById('archive-name').value;
}

function getArchiveIds () {
    var rawIds = localStorage.getItem(ARCHIVE_ID_LIST_KEY);
    return rawIds ? JSON.parse(rawIds) : [];
}

function setArchiveIds(ids) {
    localStorage.setItem(ARCHIVE_ID_LIST_KEY, JSON.stringify(ids));
}

function getArchiveById (id) {
    return JSON.parse(localStorage.getItem(id));
}

function saveArchive(archive) {
    localStorage.setItem(archive.id, JSON.stringify(archive));
    addIdToList(archive.id);
}

function addIdToList (id) {
    var ids = getArchiveIds();
    ids.push(id);
    setArchiveIds(ids);
}

function createArchive (name, tabList) {
    // Get a list of URLs, removing empty items
    var tabs = tabList
        .map((tab) => {
            var tabUrlAndName = {};
            tabUrlAndName.url = tab.url ? tab.url : '';
            tabUrlAndName.name = tab.title ? tab.title : '';
            return tabUrlAndName;
        })
        .filter((tab) => {
            // Tab names can be empty, but it's unuseable without a url
            return tab.url !== '';
        });
    return {
        id: uuidv4(),
        name: name,
        tabs: tabs
    };
}

function loadArchives () {
    getArchiveIds().forEach((id, index) => {
        var isEven = index % 2 === 0;
        var archive = getArchiveById(id);
        createDom.addArchiveToDom(archive, isEven, createTabsInNewWindow);
    });
}

function createTabsInNewWindow (archiveId) {
    // Get the URLs, using the first to launch the window, then remove it from the list
    var archive = getArchiveById(archiveId);
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