/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open("POST", "/query", true);
            request.onload = function () {
                try {
                    resolve(JSON.parse(request.responseText));
                } catch (err) {
                    reject(request.responseText);
                }
            }
            request.send(JSON.stringify(query));
    });
};
