var chromeUtils = require('./chrome-utils');
var storage = require('./storage');

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
const addArchiveToDom = (archive, isEven) => {
    var archiveListItem = document.createElement('div');
    archiveListItem.classList.add('archive-list-item');
    archiveListItem.id = archive.id;

    if (isEven) {
        archiveListItem.classList.add('even');
    }

    var archiveInfo = document.createElement('div');
    archiveInfo.classList.add('archiveInfo');

    var header = document.createElement('h2');
    header.classList.add('archive-list-item--header');
    var headerLink = document.createElement('a');
    headerLink.classList.add('archive-header-link');
    headerLink.href = '#';
    headerLink.appendChild(document.createTextNode(archive.name));
    header.appendChild(headerLink);
    header.addEventListener('click', () => {
        chromeUtils.createTabsInNewWindow(archive.id);
    });

    var numItems = document.createElement('p');
    numItems.classList.add('archive-list-item--item-count');
    numItems.appendChild(document.createTextNode(archive.tabs.length + ' Tabs'));
    var titlesString = getTitlesString(archive);
    numItems.title = titlesString;

    archiveInfo.appendChild(header);
    archiveInfo.appendChild(numItems);

    archiveListItem.appendChild(archiveInfo);

    var archiveActions = document.createElement('div');
    archiveActions.classList.add('archive-list-item--archive-actions');

    var deleteButton = document.createElement('div');
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#B191FF" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"/><line x1="4" y1="7" x2="20" y2="7" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>';
    deleteButton.addEventListener('click', () => {
        deleteWithConfirmation(archive);
    });
    
    archiveActions.appendChild(deleteButton);
    archiveListItem.appendChild(archiveActions);

    // TODO Launch Button & Edit button? (Edit for removing 1 item from an archive)

    getListRootElement().appendChild(archiveListItem);
}

function deleteWithConfirmation (archive) {
    var response  = window.confirm('Are you sure you want to delete ' + archive.name + '?');
    if (response) {
        storage.deleteArchive(archive.id);
        removeArchiveFromDom(archive.id);
        // TODO, reset "even"-s?
    } else {
        // do nothing
    }
}

function removeArchiveFromDom (archiveId) {
    var archiveListItem = document.getElementById(archiveId);
    archiveListItem.parentNode.removeChild(archiveListItem);
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

function getListRootElement () {
    return document.getElementById('archive-list');
}

exports.addArchiveToDom = addArchiveToDom;