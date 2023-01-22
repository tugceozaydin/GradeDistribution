import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
    ResultTooLargeError
} from "./IInsightFacade";
import * as JSZip from "jszip";
import * as fs from "fs";
import InsightDatasetType from "./datasetController/InsightDatasetType";
import Dataset from "./datasetController/Dataset";
import FulfillQuery from "./queryController/FulfillQuery";
import * as parse5 from "parse5";
import Geolocation from "./datasetController/Geolocation";
import ValidateQuery from "./queryController/ValidateQuery";
import RowTController from "./queryController/RowTController";
import HtmlRelativeRetrieval from "./datasetController/HtmlRelativeRetrieval";

export default class InsightFacade implements IInsightFacade {

    public ids: string[] = [];
    public datasets: Dataset[] = [];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

// ===================================================================================================================
    // Add Dataset
// ===================================================================================================================

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (this.invalidID(id, kind)) {
                return reject(new InsightError("InsightError"));
            }
            const zip = new JSZip();
            let storage = new Map<string, any[]>();
            let datasetChildren: any[] = [];
            let rows: number = 0;
            zip.loadAsync(content, {base64: true}).then((data) => {
                if (kind === InsightDatasetKind.Courses) {
                    if (data.folder("courses").length <= 0) {
                        return reject(new InsightError("InsightError"));
                    }
                    data.folder("courses").forEach((relativePath: string, files) => {
                        datasetChildren.push(zip.file(files.name).async("string"));
                    });
                    Promise.all(datasetChildren).then((listOfCourses: string[]) => {
                        if (listOfCourses.length <= 0) {
                            return reject(new InsightError("InsightError"));
                        }
                        let storageAndRows = Dataset.courseSectionIterator(listOfCourses, rows, storage);
                        if ((storageAndRows === undefined || storageAndRows.length <= 0)) {
                            return reject(new InsightError("InsightError"));
                        }
                        this.storeAndWriteToFile(storage, storageAndRows, rows, id, InsightDatasetKind.Courses);
                        return resolve(this.ids);
                    });
                } else if (kind === InsightDatasetKind.Rooms) {
                    return this.roomsDataset(data, reject, datasetChildren, rows, storage, id, resolve);
                }
            }).catch(() => {
                return reject(new InsightError("InsightError"));
            });
        });
    }

    private roomsDataset(data: JSZip, reject: (reason?: any) => void, datasetChildren: any[],
                         rows: number, storage: Map<string, any[]>, id: string,
                         resolve: (value?: (PromiseLike<string[]> | string[])) => void) {
        if (data.folder("rooms").length <= 0 ||
            !data.files.hasOwnProperty("rooms/index.htm")) {
            return reject(new InsightError("InsightError"));
        }
        data.folder("rooms").file("index.htm").async("string").then((buildingIndex: any) => {
            try {
                buildingIndex = parse5.parse(buildingIndex);
            } catch (e) {
                return reject(new InsightError("InsightError"));
            }
            let lob = this.findListOfBuilding(buildingIndex);
            if (lob === false) {
                return reject(new InsightError("InsightError"));
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

    public parseAndStoreRooms(datasetChildren: any[], rows: number, storage: Map<string, any[]>,
                              reject: (reason?: any) => void, id: string,
                              resolve: (value?: (PromiseLike<string[]> | string[])) => void) {
        Promise.all(datasetChildren).then((listOfBuildings: string[]) => {
            let storageAndRows = Dataset.roomsIterator(listOfBuildings, rows, storage);
            if (storageAndRows.length <= 0) {
                return reject(new InsightError("InsightError"));
            }
            storage = storageAndRows[0];
            rows = storageAndRows[1];
            Geolocation.addGeolocationDetails(storage).then((finalStorage: any) => {
                if (finalStorage.size <= 0) {
                    return reject(new InsightError("InsightError"));
                }
                this.localStore(rows, id, finalStorage, InsightDatasetKind.Rooms);
                Dataset.fileWriter(storage, id);
                return resolve(this.ids);
            });
        });
    }

    public storeAndWriteToFile(storage: Map<string, any[]>, storageAndRows: any[], rows: number,
                               id: string, kind: any) {
        storage = storageAndRows[0];
        rows = storageAndRows[1];
        this.localStore(rows, id, storage, kind);
        Dataset.fileWriter(storage, id);
    }

// helper function that locally stores the dataset and lists of dataset for quick and easy access
    public localStore(rows: number, id: string, storage: any, kind: any) {
        this.ids.push(id);
        const tempDataset = new Dataset(id, kind, rows);
        tempDataset.datasetContent = storage;
        this.datasets.push(tempDataset);

    }

    public invalidID(id: string, kind: InsightDatasetKind): boolean {
        return id === null || id === undefined || id.includes("_") || id === " " ||
            this.ids.includes(id) === true || kind === undefined || kind == null;
    }

    public findBuildingPath(tableOfBuildings: any): any {
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

    public findListOfBuilding(htmlDoc: any): any {
        if (htmlDoc.nodeName === "table" && htmlDoc.attrs[0] !== undefined &&
            htmlDoc.attrs[0].value.startsWith("views-table cols-5 table")) {
            return HtmlRelativeRetrieval.findTBody(htmlDoc);
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

// ===================================================================================================================
    // Remove Dataset
// ===================================================================================================================

    public removeDataset(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (id === null || id === undefined || id.includes("_") || id === " " || id === "") {
                return reject(new InsightError());
            }
            let path = "data/" + id + ".json";
            if (!fs.existsSync(path)) {
                return reject(new NotFoundError("NotFoundError"));
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

// ===================================================================================================================
    // Perform Query
// ===================================================================================================================

    public performQuery(query: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const validator = new ValidateQuery();
            if (!validator.validateQuery(query)) {
                return reject(new InsightError("InsightError"));
            }
            let optionsClause = query["OPTIONS"];
            let columnsArray = optionsClause["COLUMNS"];
            let justDatasetName = validator.transformationValidity.datasetID;
            let datasetToQuery;
            if (this.ids.includes(justDatasetName)) {
                let i;
                datasetToQuery = this.datasetParser(i, justDatasetName);
            } else {
                let path = "data/" + justDatasetName + ".json";
                if (!fs.existsSync(path)) {
                    return reject(new InsightError("InsightError"));
                } else {
                    let datasetStr = fs.readFileSync(path, {encoding:"utf8", flag:"r"});
                    datasetToQuery = JSON.parse(datasetStr);
                }
            }
            let {fulfill, result, row, transformationKeys, varInst} = this.setUp(query);
            for (let course of Object.entries(datasetToQuery)) {
                let listOfSections = course[1];
                for (let section of listOfSections) {
                    let fulfilledQuery = fulfill.fulfillQuery(query, section, justDatasetName);
                    if (fulfilledQuery !== undefined && fulfilledQuery !== null) {
                        result.push(fulfilledQuery);
                        if (query.hasOwnProperty("TRANSFORMATIONS")) {
                            varInst = RowTController.varCount(fulfilledQuery, transformationKeys, varInst);
                        }
                        row = row + 1;
                    }
                    if (query.hasOwnProperty("TRANSFORMATIONS") &&
                        RowTController.checkIfResultsWillBeTooLarge(varInst)) {
                        return reject(new ResultTooLargeError());
                    } else if (!query.hasOwnProperty("TRANSFORMATIONS") && row > 5000) {
                        return reject(new ResultTooLargeError());
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

    public setUp(query: any) {
        const fulfill = new FulfillQuery();
        let result: any[] = [];
        let row = 0;
        let transformationKeys;
        let varInstances = new Set();
        if (query.hasOwnProperty("TRANSFORMATIONS")) {
            transformationKeys = RowTController.getTransformationKeys(query["TRANSFORMATIONS"]);
        }
        return {fulfill, result, row, transformationKeys, varInst: varInstances};
    }

    private datasetParser(i: number, justDatasetName: any) {
        let datasetToQuery;
        for (i = 0; i < this.datasets.length; i++) {
            if (this.datasets[i].id === justDatasetName) {
                datasetToQuery = this.datasets[i].datasetContent;
            }
        }
        return datasetToQuery;
    }

// ===================================================================================================================
    // List Dataset
// ===================================================================================================================
    public listDatasets(): Promise<InsightDataset[]> {
        return new Promise((resolve) => {
            let dataset;
            let listOfInsightDatasets: InsightDataset[] = [];
            for (dataset of this.datasets) {
                let insightDataset: InsightDataset = new InsightDatasetType();
                insightDataset.id = dataset.id;
                insightDataset.kind = dataset.kind;
                insightDataset.numRows = dataset.rows;
                listOfInsightDatasets.push(insightDataset);
            }
            return resolve(listOfInsightDatasets);
        });
    }
}
