"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const IInsightFacade_1 = require("./IInsightFacade");
const JSZip = require("jszip");
const fs = require("fs");
const InsightDatasetType_1 = require("./datasetController/InsightDatasetType");
const Dataset_1 = require("./datasetController/Dataset");
const FulfillQuery_1 = require("./queryController/FulfillQuery");
const parse5 = require("parse5");
const Geolocation_1 = require("./datasetController/Geolocation");
const ValidateQuery_1 = require("./queryController/ValidateQuery");
const RowTController_1 = require("./queryController/RowTController");
const HtmlRelativeRetrieval_1 = require("./datasetController/HtmlRelativeRetrieval");
class InsightFacade {
    constructor() {
        this.ids = [];
        this.datasets = [];
        Util_1.default.trace("InsightFacadeImpl::init()");
    }
    addDataset(id, content, kind) {
        return new Promise((resolve, reject) => {
            if (this.invalidID(id, kind)) {
                return reject(new IInsightFacade_1.InsightError("InsightError"));
            }
            const zip = new JSZip();
            let storage = new Map();
            let datasetChildren = [];
            let rows = 0;
            zip.loadAsync(content, { base64: true }).then((data) => {
                if (kind === IInsightFacade_1.InsightDatasetKind.Courses) {
                    if (data.folder("courses").length <= 0) {
                        return reject(new IInsightFacade_1.InsightError("InsightError"));
                    }
                    data.folder("courses").forEach((relativePath, files) => {
                        datasetChildren.push(zip.file(files.name).async("string"));
                    });
                    Promise.all(datasetChildren).then((listOfCourses) => {
                        if (listOfCourses.length <= 0) {
                            return reject(new IInsightFacade_1.InsightError("InsightError"));
                        }
                        let storageAndRows = Dataset_1.default.courseSectionIterator(listOfCourses, rows, storage);
                        if ((storageAndRows === undefined || storageAndRows.length <= 0)) {
                            return reject(new IInsightFacade_1.InsightError("InsightError"));
                        }
                        this.storeAndWriteToFile(storage, storageAndRows, rows, id, IInsightFacade_1.InsightDatasetKind.Courses);
                        return resolve(this.ids);
                    });
                }
                else if (kind === IInsightFacade_1.InsightDatasetKind.Rooms) {
                    return this.roomsDataset(data, reject, datasetChildren, rows, storage, id, resolve);
                }
            }).catch(() => {
                return reject(new IInsightFacade_1.InsightError("InsightError"));
            });
        });
    }
    roomsDataset(data, reject, datasetChildren, rows, storage, id, resolve) {
        if (data.folder("rooms").length <= 0 ||
            !data.files.hasOwnProperty("rooms/index.htm")) {
            return reject(new IInsightFacade_1.InsightError("InsightError"));
        }
        data.folder("rooms").file("index.htm").async("string").then((buildingIndex) => {
            try {
                buildingIndex = parse5.parse(buildingIndex);
            }
            catch (e) {
                return reject(new IInsightFacade_1.InsightError("InsightError"));
            }
            let lob = this.findListOfBuilding(buildingIndex);
            if (lob === false) {
                return reject(new IInsightFacade_1.InsightError("InsightError"));
            }
            for (let building of lob) {
                if (building.nodeName !== "#text") {
                    let path = this.findBuildingPath(building);
                    path = path.slice(2, path.length);
                    if (data.folder("rooms").file(path) !== null) {
                        datasetChildren.push(data.folder("rooms").file(path).async("string"));
                    }
                }
            }
            this.parseAndStoreRooms(datasetChildren, rows, storage, reject, id, resolve);
        });
    }
    parseAndStoreRooms(datasetChildren, rows, storage, reject, id, resolve) {
        Promise.all(datasetChildren).then((listOfBuildings) => {
            let storageAndRows = Dataset_1.default.roomsIterator(listOfBuildings, rows, storage);
            if (storageAndRows.length <= 0) {
                return reject(new IInsightFacade_1.InsightError("InsightError"));
            }
            storage = storageAndRows[0];
            rows = storageAndRows[1];
            Geolocation_1.default.addGeolocationDetails(storage).then((finalStorage) => {
                if (finalStorage.size <= 0) {
                    return reject(new IInsightFacade_1.InsightError("InsightError"));
                }
                this.localStore(rows, id, finalStorage, IInsightFacade_1.InsightDatasetKind.Rooms);
                Dataset_1.default.fileWriter(storage, id);
                return resolve(this.ids);
            });
        });
    }
    storeAndWriteToFile(storage, storageAndRows, rows, id, kind) {
        storage = storageAndRows[0];
        rows = storageAndRows[1];
        this.localStore(rows, id, storage, kind);
        Dataset_1.default.fileWriter(storage, id);
    }
    localStore(rows, id, storage, kind) {
        this.ids.push(id);
        const tempDataset = new Dataset_1.default(id, kind, rows);
        tempDataset.datasetContent = storage;
        this.datasets.push(tempDataset);
    }
    invalidID(id, kind) {
        return id === null || id === undefined || id.includes("_") || id === " " ||
            this.ids.includes(id) === true || kind === undefined || kind == null;
    }
    findBuildingPath(tableOfBuildings) {
        if (tableOfBuildings.nodeName === "a" && tableOfBuildings.attrs[0] !== undefined &&
            tableOfBuildings.attrs[0].name.startsWith("href")) {
            return tableOfBuildings.attrs[0].value;
        }
        if (tableOfBuildings.childNodes && tableOfBuildings.childNodes.length > 0) {
            for (let child of tableOfBuildings.childNodes) {
                let buildingList = this.findBuildingPath(child);
                if (buildingList !== false) {
                    return buildingList;
                }
            }
        }
        return false;
    }
    findListOfBuilding(htmlDoc) {
        if (htmlDoc.nodeName === "table" && htmlDoc.attrs[0] !== undefined &&
            htmlDoc.attrs[0].value.startsWith("views-table cols-5 table")) {
            return HtmlRelativeRetrieval_1.default.findTBody(htmlDoc);
        }
        if (htmlDoc.childNodes && htmlDoc.childNodes.length > 0) {
            for (let child of htmlDoc.childNodes) {
                let roomList = this.findListOfBuilding(child);
                if (roomList !== false) {
                    return roomList;
                }
            }
        }
        return false;
    }
    removeDataset(id) {
        return new Promise((resolve, reject) => {
            if (id === null || id === undefined || id.includes("_") || id === " " || id === "") {
                return reject(new IInsightFacade_1.InsightError());
            }
            let path = "data/" + id + ".json";
            if (!fs.existsSync(path)) {
                return reject(new IInsightFacade_1.NotFoundError("NotFoundError"));
            }
            if (this.ids.includes(id)) {
                for (let i = 0; i < this.ids.length; i++) {
                    if (this.ids[i] === id) {
                        this.ids.splice(i, (i + 1));
                    }
                }
                for (let i = 0; i < this.datasets.length; i++) {
                    if (this.datasets[i].id === id) {
                        this.datasets.splice(i, (i + 1));
                    }
                }
            }
            fs.unlinkSync(path);
            return resolve(id);
        });
    }
    performQuery(query) {
        return new Promise((resolve, reject) => {
            const validator = new ValidateQuery_1.default();
            if (!validator.validateQuery(query)) {
                return reject(new IInsightFacade_1.InsightError("InsightError"));
            }
            let optionsClause = query["OPTIONS"];
            let columnsArray = optionsClause["COLUMNS"];
            let justDatasetName = validator.transformationValidity.datasetID;
            let datasetToQuery;
            if (this.ids.includes(justDatasetName)) {
                let i;
                datasetToQuery = this.datasetParser(i, justDatasetName);
            }
            else {
                let path = "data/" + justDatasetName + ".json";
                if (!fs.existsSync(path)) {
                    return reject(new IInsightFacade_1.InsightError("InsightError"));
                }
                else {
                    let datasetStr = fs.readFileSync(path, { encoding: "utf8", flag: "r" });
                    datasetToQuery = JSON.parse(datasetStr);
                }
            }
            let { fulfill, result, row, transformationKeys, varInst } = this.setUp(query);
            for (let course of Object.entries(datasetToQuery)) {
                let listOfSections = course[1];
                for (let section of listOfSections) {
                    let fulfilledQuery = fulfill.fulfillQuery(query, section, justDatasetName);
                    if (fulfilledQuery !== undefined && fulfilledQuery !== null) {
                        result.push(fulfilledQuery);
                        if (query.hasOwnProperty("TRANSFORMATIONS")) {
                            varInst = RowTController_1.default.varCount(fulfilledQuery, transformationKeys, varInst);
                        }
                        row = row + 1;
                    }
                    if (query.hasOwnProperty("TRANSFORMATIONS") &&
                        RowTController_1.default.checkIfResultsWillBeTooLarge(varInst)) {
                        return reject(new IInsightFacade_1.ResultTooLargeError());
                    }
                    else if (!query.hasOwnProperty("TRANSFORMATIONS") && row > 5000) {
                        return reject(new IInsightFacade_1.ResultTooLargeError());
                    }
                }
            }
            if (query.hasOwnProperty("TRANSFORMATIONS")) {
                result = fulfill.fulfillTransformations(query["TRANSFORMATIONS"], result, columnsArray);
            }
            result = fulfill.orderResult(result, query["OPTIONS"]);
            return resolve(result);
        });
    }
    setUp(query) {
        const fulfill = new FulfillQuery_1.default();
        let result = [];
        let row = 0;
        let transformationKeys;
        let varInstances = new Set();
        if (query.hasOwnProperty("TRANSFORMATIONS")) {
            transformationKeys = RowTController_1.default.getTransformationKeys(query["TRANSFORMATIONS"]);
        }
        return { fulfill, result, row, transformationKeys, varInst: varInstances };
    }
    datasetParser(i, justDatasetName) {
        let datasetToQuery;
        for (i = 0; i < this.datasets.length; i++) {
            if (this.datasets[i].id === justDatasetName) {
                datasetToQuery = this.datasets[i].datasetContent;
            }
        }
        return datasetToQuery;
    }
    listDatasets() {
        return new Promise((resolve) => {
            let dataset;
            let listOfInsightDatasets = [];
            for (dataset of this.datasets) {
                let insightDataset = new InsightDatasetType_1.default();
                insightDataset.id = dataset.id;
                insightDataset.kind = dataset.kind;
                insightDataset.numRows = dataset.rows;
                listOfInsightDatasets.push(insightDataset);
            }
            return resolve(listOfInsightDatasets);
        });
    }
}
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map