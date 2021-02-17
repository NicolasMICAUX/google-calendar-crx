let tf_model;
use.load().then(model => {
    tf_model = model;

    // TODO : permanently store those parameters
    const ALPHA = 0.75;
    let MEAN = 0;
    let VAR = 0;    // variance
    let N = 0;

    // * UTILS *
    function update(simil) {
        N++;
        // update mean
        let last_mean = MEAN;
        MEAN = ((N - 1) * MEAN + simil) / N;
        // update Variance
        VAR = ((N - 2) * VAR + (simil - MEAN) * (simil - last_mean)) / (N - 1 || 1);  // https://math.stackexchange.com/q/775391
    }

    // * dot product *
    function dot(x, y) {
        let sum;
        sum = 0;
        for (let i = 0; i < x.length; i++)
            sum = sum + x[i] * y[i];
        return sum;
    }

    // * cosine similarity *
    function similarity(a, b) {
        const magnitudeA = Math.sqrt(dot(a, a));
        const magnitudeB = Math.sqrt(dot(b, b));
        if (magnitudeA && magnitudeB)
            return dot(a, b) / (magnitudeA * magnitudeB);
        else return false
    }

    // * extract text content from html string *
    function extractContent(html) {
        return new DOMParser().parseFromString(html, "text/html").documentElement.textContent;
    }

    Mercury.parse().then(result => {
        const text = extractContent(result['content']).substring(0, 2000);
        chrome.runtime.sendMessage({method: "pre_embed", text: text}, function (response) {
            const tmp = response.translated.split("|||||");
            const page_translated = tmp[0];
            const events_translated = tmp[1].split("|||");

            console.log(page_translated);
            console.log(events_translated);

            // compute webpage text embedding
            tf_model.embed(page_translated).then(page_embedding => {
                // compute embeddings for events
                tf_model.embed(events_translated).then(embeddings => {
                    let AUTHORIZED = false;
                    for (let i = 0; i < embeddings.length; i++) {
                        let embedding = embeddings[i];
                        let simil = similarity(page_embedding, embedding)
                        update(simil);

                        // if similar enough
                        if (simil > MEAN + ALPHA * Math.sqrt(VAR)) {
                            AUTHORIZED = true;
                        }
                    }

                    if (!AUTHORIZED) {
                        alert("IRRELEVANT");
                    }
                    //embeddings.dispose(); // supprimer un tensor de la mémoire
                    // TODO : free memory
                });
            });
        });
    });
});