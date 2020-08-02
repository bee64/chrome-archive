const { v4: uuidv4 } = require('uuid');

var ARCHIVE_ID_LIST_KEY = 'archive-id-list';

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
    var archive = createArchive(newArchiveName, tabList);
    saveArchive(archive);
    addArchiveToDom(archive);
}

function getNewArchiveName () {
    // TODO sanitize this a bit
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
    getArchiveIds().forEach((id) => {
        var archive = getArchiveById(id);
        addArchiveToDom(archive);
    });
}

/**
 * Archive block should look like this
 * <div>
 *  <div>
 *      <h2>archive.name</h2>
 *      <p>n items</p>
 *  </div>
 *  <div>
 *      <Actions go here>
 *  </div>
 * </div>
 */
/**
 * archive {
 *  id
 *  name
 *  tabs []
 *     name
 *     url 
 * }
 * 
 */
function addArchiveToDom (archive) {
    var archiveListItem = document.createElement('div');

    var archiveInfo = document.createElement('div');

    var header = document.createElement('h2');
    header.appendChild(document.createTextNode(archive.name));
    header.addEventListener('click', () => {
        createTabsInNewWindow(archive.id);
    });

    var numItems = document.createElement('p');
    numItems.appendChild(document.createTextNode(archive.tabs.length + ' tabs'));

    archiveInfo.appendChild(header);
    archiveInfo.appendChild(numItems);

    archiveListItem.appendChild(archiveInfo);

    // TODO Add the controls
    // TODO should the header be clickable? Probably

    getListRootElement().appendChild(archiveListItem);
}

function createTabsInNewWindow (archiveId) {
    var windowOptions = {
        focused: true
    };
    chrome.windows.create(windowOptions, (window) => {
        createTabs(window.id, archiveId);
    });
}

function createTabs (windowId, archiveId) {
    var archive = getArchiveById(archiveId);
    var urls = archive.tabs.map((tab) => {
        return tab.url;
    });
    urls.forEach((url) => {
        var tabOptions = {
            url: url,
            windowId: windowId
        };
        chrome.tabs.create(tabOptions);
    });
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
    loadArchives();
    addEventListeners();
});