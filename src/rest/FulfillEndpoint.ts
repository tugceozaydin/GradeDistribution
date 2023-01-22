import Log from "../Util";
import restify = require("restify");
import Server from "./Server";
import {InsightDataset, InsightDatasetKind} from "../controller/IInsightFacade";

export default class FulfillEndpoint {

    // returns a list of datasets that were added
    public static datasets(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::datasets(..) - params: " + JSON.stringify(req.params));
        try {
            Server.insightFacade.listDatasets().then((datasets: InsightDataset[]) => {
                Log.trace("Successfully listed Datasets");
                res.json(200, {result: datasets});
                return next();
            }).catch((err) => {
                Log.error("Shouldn't be an error with listing datasets");
                return next();
            });
        } catch (err) {
            Log.error("Shouldn't be an error with listing datasets");
            return next();
        }
    }

    // add dataset to server if valid
    public static addDatasetToServer(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let submittedKind = req.params.kind;
            if (submittedKind === "rooms") {
                submittedKind = InsightDatasetKind.Rooms;
            } else if (submittedKind === "courses") {
                submittedKind = InsightDatasetKind.Courses;
            }
            let submittedID = req.params.id;
            let submittedZip: Buffer = req.body;
            let encodedZip = submittedZip.toString("base64");
            Server.insightFacade.addDataset(submittedID, encodedZip, submittedKind).then((listOfIDs: string[]) => {
                Log.trace("Successfully added Dataset to server");
                res.json(200, {result: listOfIDs});
                return next();
            }).catch((err) => {
                Log.error("Server::addDatasetToServer(..) - responding 400");
                res.json(400, {error: err.message});
                return next();
            });
        } catch (err) {
            Log.error("Server::addDatasetToServer(..) - responding 400");
            res.json(400, {error: err.message});
            return next();
        }
    }

    // remove dataset from server
    public static removeDatasetFromServer(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            const submittedID = req.params.id;
            Server.insightFacade.removeDataset(submittedID).then((deletedID) => {
                Log.trace("Successfully removed dataset from server");
                res.json(200, {result: deletedID});
                return next();
            }).catch((err) => {
                if (err.message === "NotFoundError") {
                    Log.error("Server::removeDatasetFromServer(..) - responding 404");
                    res.json(404, {error: err.message});
                } else {
                    Log.error("Server::removeDatasetFromServer(..) - responding 400");
                    res.json(400, {error: err.message});
                }
                return next();
            });
        } catch (err) {
            Log.error("Server::removeDatasetFromServer(..) - responding 400");
            res.json(400, {error: err.message});
            return next();
        }
    }

    // fulfill submitted query within the server
    public static fulfillQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            // it was req.body only before. it looks like it should work like this.
            const query = JSON.parse(req.body);
            console.log(typeof query === "string");
            console.log(typeof query === "object");
            Server.insightFacade.performQuery(query).then((results: any[]) => {
                Log.trace("Successfully performed query");
                res.json(200, {result: results});
                return next();
            }).catch((err) => {
                Log.error("Server::fulfillQuery(..) - responding 400");
                res.json(400, {error: err.message});
                return next();
            });
        } catch (err) {
            Log.error("Server::fulfillQuery(..) - responding 400");
            res.json(400, {error: err.message});
            return next();
        }
    }

    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.
    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        try {
            const response = FulfillEndpoint.performEcho(req.params.msg);
            Log.info("Server::echo(..) - responding " + 200);
            res.json(200, {result: response});
        } catch (err) {
            Log.error("Server::echo(..) - responding 400");
            res.json(400, {error: err});
        }
        return next();
    }

    public static performEcho(msg: string): string {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        } else {
            return "Message not provided";
        }
    }
}
