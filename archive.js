function getTabsInActiveWindow () {
    var queryInfo = {
        currentWindow: true
    }
    chrome.tabs.query(queryInfo, saveTabList);
}

function saveTabList (tabList) {
    console.log(tabList);
}

document.addEventListener("DOMContentLoaded", () => {
    var button = document.getElementById('archive-button');
    button.addEventListener('click', getTabsInActiveWindow);
});