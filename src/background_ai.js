// * extract text content from html string *
function extractContent(html) {
    return new DOMParser().parseFromString(html, "text/html").documentElement.textContent;
}

const HttpClient = function () {
    this.get = function (aUrl, aCallback) {
        const anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function () {
            if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send(null);
    }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method === "pre_embed") {
        let events = feeds.events;
        // find current events
        let curr_events = [];
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            const start = utils.fromIso8601(event.start);
            const end = utils.fromIso8601(event.end);
            const now = moment();
            if (now.diff(start) >= 0 && end.diff(now) >= 0) {
                // create current events list
                curr_events.push(event['title']);
                curr_events.push(extractContent(event['description'].replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')));
            }
        }
        let text = request.text;
        // if foreign, translate
        let events_str = curr_events.join(" ||| ");
        let to_translate = text.concat(' ||||| ' + events_str);
        const client = new HttpClient();
        // get translation
        client.get(`https://nmtransl.herokuapp.com/?text=${to_translate}`, function (translated) {
            sendResponse({translated: translated});
        });
    } else
        sendResponse({}); // snub them.
});