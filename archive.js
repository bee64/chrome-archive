const { v4: uuidv4 } = require('uuid');

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
    addArchiveToDom(archive, isNextEven);
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
        addArchiveToDom(archive, isEven);
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
function addArchiveToDom (archive, isEven) {
    var archiveListItem = document.createElement('div');
    archiveListItem.classList.add('archiveListItem');

    if (isEven) {
        archiveListItem.classList.add('even');
    }

    var archiveInfo = document.createElement('div');
    archiveInfo.classList.add('archiveInfo');

    var header = document.createElement('h2');
    header.classList.add('archiveListItem--header');
    var headerLink = document.createElement('a');
    headerLink.href = '#';
    headerLink.appendChild(document.createTextNode(archive.name));
    header.appendChild(headerLink);
    header.addEventListener('click', () => {
        createTabsInNewWindow(archive.id);
    });

    var numItems = document.createElement('p');
    numItems.classList.add('archiveListItem--item-count');
    numItems.appendChild(document.createTextNode(archive.tabs.length + ' Tabs'));
    var titlesString = getTitlesString(archive);
    numItems.title = titlesString;

    archiveInfo.appendChild(header);
    archiveInfo.appendChild(numItems);

    archiveListItem.appendChild(archiveInfo);

    // TODO Add the controls

    getListRootElement().appendChild(archiveListItem);
}

function getTitlesString (archive) {
    var titles = archive.tabs.map((tab) => {
        return tab.name;
    });
    var maxNumberOfTitles = 3;
    var titlesString = 'Includes: ';

    if (titles.length === 1) {
        titlesString += titles[0] + '.';
    } else {
        for (var i = 0; i < maxNumberOfTitles && i < titles.length; i++) {
            // if it's the last title
            if (i == titles.length - 1) {
                titlesString += 'and ' + titles[i];
            }
            // if it's the last to display, but there are more
            else if (i == maxNumberOfTitles - 1) {
                var titlesNotDisplayed = titles.length - maxNumberOfTitles;
                titlesString += titles[i] + ', and ' + titlesNotDisplayed + ' more tabs.';
            } else {
                titlesString += titles[i] + ', ';
            }
        }
    }
    return titlesString;
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

function getListRootElement () {
    return document.getElementById('archive-list');
}

document.addEventListener("DOMContentLoaded", () => {
    loadArchives();
    addEventListeners();
});