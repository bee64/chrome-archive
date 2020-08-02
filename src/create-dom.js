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
const addArchiveToDom = (archive, isEven, createTabs) => {
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
        createTabs(archive.id);
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

function getListRootElement () {
    return document.getElementById('archive-list');
}

exports.addArchiveToDom = addArchiveToDom;