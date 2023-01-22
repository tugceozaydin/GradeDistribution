"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const Server_1 = require("./Server");
const IInsightFacade_1 = require("../controller/IInsightFacade");
class FulfillEndpoint {
    static datasets(req, res, next) {
        Util_1.default.trace("Server::datasets(..) - params: " + JSON.stringify(req.params));
        try {
            Server_1.default.insightFacade.listDatasets().then((datasets) => {
                Util_1.default.trace("Successfully listed Datasets");
                res.json(200, { result: datasets });
                return next();
            }).catch((err) => {
                Util_1.default.error("Shouldn't be an error with listing datasets");
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Shouldn't be an error with listing datasets");
            return next();
        }
    }
    static addDatasetToServer(req, res, next) {
        try {
            let submittedKind = req.params.kind;
            if (submittedKind === "rooms") {
                submittedKind = IInsightFacade_1.InsightDatasetKind.Rooms;
            }
            else if (submittedKind === "courses") {
                submittedKind = IInsightFacade_1.InsightDatasetKind.Courses;
            }
            let submittedID = req.params.id;
            let submittedZip = req.body;
            let encodedZip = submittedZip.toString("base64");
            Server_1.default.insightFacade.addDataset(submittedID, encodedZip, submittedKind).then((listOfIDs) => {
                Util_1.default.trace("Successfully added Dataset to server");
                res.json(200, { result: listOfIDs });
                return next();
            }).catch((err) => {
                Util_1.default.error("Server::addDatasetToServer(..) - responding 400");
                res.json(400, { error: err.message });
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Server::addDatasetToServer(..) - responding 400");
            res.json(400, { error: err.message });
            return next();
        }
    }
    static removeDatasetFromServer(req, res, next) {
        try {
            const submittedID = req.params.id;
            Server_1.default.insightFacade.removeDataset(submittedID).then((deletedID) => {
                Util_1.default.trace("Successfully removed dataset from server");
                res.json(200, { result: deletedID });
                return next();
            }).catch((err) => {
                if (err.message === "NotFoundError") {
                    Util_1.default.error("Server::removeDatasetFromServer(..) - responding 404");
                    res.json(404, { error: err.message });
                }
                else {
                    Util_1.default.error("Server::removeDatasetFromServer(..) - responding 400");
                    res.json(400, { error: err.message });
                }
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Server::removeDatasetFromServer(..) - responding 400");
            res.json(400, { error: err.message });
            return next();
        }
    }
    static fulfillQuery(req, res, next) {
        try {
            const query = JSON.parse(req.body);
            console.log(typeof query === "string");
            console.log(typeof query === "object");
            Server_1.default.insightFacade.performQuery(query).then((results) => {
                Util_1.default.trace("Successfully performed query");
                res.json(200, { result: results });
                return next();
            }).catch((err) => {
                Util_1.default.error("Server::fulfillQuery(..) - responding 400");
                res.json(400, { error: err.message });
                return next();
            });
        }
        catch (err) {
            Util_1.default.error("Server::fulfillQuery(..) - responding 400");
            res.json(400, { error: err.message });
            return next();
        }
    }
    static echo(req, res, next) {
        Util_1.default.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        try {
            const response = FulfillEndpoint.performEcho(req.params.msg);
            Util_1.default.info("Server::echo(..) - responding " + 200);
            res.json(200, { result: response });
        }
        catch (err) {
            Util_1.default.error("Server::echo(..) - responding 400");
            res.json(400, { error: err });
        }
        return next();
    }
    static performEcho(msg) {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        }
        else {
            return "Message not provided";
        }
    }
}
exports.default = FulfillEndpoint;
//# sourceMappingURL=FulfillEndpoint.js.map