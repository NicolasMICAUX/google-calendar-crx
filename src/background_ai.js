function check_tab(tabId) {
    // chrome.storage.local.get('__IS_ACTIVE__', function (items) {
    //     // get ON/OFF state
    //     const state = items['__IS_ACTIVE__'];
    //     // if extension is active
    //     if (state) {
    //     }
    // });
    chrome.tabs.get(tabId, function (tab) {
        if (tab.url !== 'chrome://newtab/' && tab.url !== undefined && tab.url !== lastUrl) {
            console.log(tab.url);
            // real tab change
            lastUrl = tab.url;

            const events = feeds.events;
            // find current events
            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                const start = utils.fromIso8601(event.start);
                const end = utils.fromIso8601(event.end);
                const now =  moment();
                if (now.diff(start) >= 0 && end.diff(now) >= 0) {

                }
            }
            // TODO : compute tab embedding
            // TODO : store tab embedding
        }
    });
}

let activeTabId, lastUrl;

chrome.tabs.onActivated.addListener(function (activeInfo) {
    check_tab(activeTabId = activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
    if (activeTabId === tabId) {
        check_tab(tabId);
    }
});