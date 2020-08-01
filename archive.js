var ARCHIVE_ID_LIST_KEY = 'archive-id-list';
var ARCHIVE_KEY_ROOT = 'archive-list-item-';

// Query for the tabs on the current window, and save the resulting list
function onSaveArchiveClick () {
    var queryInfo = {
        currentWindow: true
    }
    chrome.tabs.query(queryInfo, saveTabList);
}

function saveTabList (tabList) {
    // Get the name of the archive from an input?
    var newArchiveName = getNewArchiveName();
    createArchive(newArchiveName, tabList);
    addArchiveToDom();
}

function getNewArchiveName () {
    // TODO sanitize this a bit
    return document.getElementById('archive-name').textContent;
}

function getArchiveIds () {
    return localStorage.getItem(ARCHIVE_ID_LIST_KEY) || [];
}

function setArchiveIds(ids) {
    localStorage.setItem(ARCHIVE_ID_LIST_KEY, ids);
}

function getArchiveById (id) {
    localStorage.getItem(ARCHIVE_KEY_ROOT + id);
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
    console.log(tabs)
    var id = getUniqueId();
    var archive = {
        name: name,
        tabs: tabs
    };
    // localStorage.set(id, archive);
    // update archiveIds
}

function getUniqueId () {
    // return a unique id
}

function loadArchives () {
    getArchiveIds().forEach((id) => {
        var archive = getArchiveById(id);
        // add the archive to the dom
        // TODO define parameters
    });
}

function addArchiveToDom () {
    var archiveListItem = document.createElement('div');

    // TODO this
    archiveListItem.appendChild(document.createTextNode('a dom item'));

    getListRootElement().appendChild(archiveListItem);
}

function addEventListeners() {
    addSaveArchiveListener();
}

function addSaveArchiveListener() {
    var button = document.getElementById('archive-button');
    button.addEventListener('click', onSaveArchiveClick);
}

function getListRootElement () {
    return document.getElementById('archive-list');
}

document.addEventListener("DOMContentLoaded", () => {
    initializeLocalStorage();
    loadArchives();
    addEventListeners();
});