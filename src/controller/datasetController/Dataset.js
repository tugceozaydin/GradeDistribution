"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CourseSection_1 = require("./CourseSection");
const fs = require("fs");
const parse5 = require("parse5");
const BuildingRoom_1 = require("./BuildingRoom");
const HtmlRelativeRetrieval_1 = require("./HtmlRelativeRetrieval");
class Dataset {
    constructor(id, kind, rows) {
        this.id = id;
        this.kind = kind;
        this.rows = rows;
    }
    static courseSectionIterator(listOfCourses, rows, storage) {
        let course;
        let results = [];
        for (course of listOfCourses) {
            if (course === undefined) {
                return;
            }
            try {
                let parsedCourseData = JSON.parse(course);
                let listOfSections = parsedCourseData.result;
                if (listOfSections.length >= 0 && listOfSections !== undefined) {
                    let i;
                    for (i = 0; i < listOfSections.length; i++) {
                        if (listOfSections[i] !== undefined) {
                            let firstInstance = listOfSections[0];
                            let courseCode = firstInstance.Subject;
                            let courseNumber = firstInstance.Course.toString();
                            let uniqueCourseKey = courseCode + courseNumber;
                            let sectionsContent = this.createListOfSections(listOfSections);
                            storage.set(uniqueCourseKey, sectionsContent);
                            break;
                        }
                    }
                }
                rows = rows + listOfSections.length;
            }
            catch (error) {
                continue;
            }
        }
        this.addToStorage(storage, results, rows);
        return results;
    }
    static addToStorage(storage, results, rows) {
        if (storage.size > 0) {
            results.push(storage);
            results.push(rows);
        }
    }
    static createListOfSections(listOfSections) {
        let item;
        let content2 = [];
        for (item of listOfSections) {
            if (!this.validSectionCheck(item)) {
                let department = item.Subject;
                let id2 = item.Course;
                let avg = item.Avg;
                let instructor = item.Professor;
                let title = item.Title;
                let pass = item.Pass;
                let fail = item.Fail;
                let audit = item.Audit;
                let uuid = item["id"].toString();
                let year;
                if (item.Section === "overall") {
                    year = 1900;
                }
                else {
                    year = parseInt(item.Year, 10);
                }
                let section = new CourseSection_1.default(department, id2, avg, instructor, title, pass, fail, audit, uuid, year);
                content2.push(section);
            }
        }
        return content2;
    }
    static validSectionCheck(item) {
        return item.Subject === undefined || item.Course === undefined || item.Avg === undefined ||
            item.Professor === undefined || item.Title === undefined || item.Pass === undefined ||
            item.Fail === undefined || item.Audit === undefined || item["id"] === undefined ||
            item.Year === undefined;
    }
    static fileWriter(storage, id) {
        const directory = "data";
        const path = directory + "/" + id + ".json";
        if (!fs.existsSync(directory)) {
            fs.mkdir(path, (err) => {
                if (err) {
                    alert("couldn't add directory");
                }
            });
        }
        function mapToObject(map) {
            let jsonObject = Object.create(null);
            map.forEach((value, key) => {
                if (value instanceof Map) {
                    jsonObject[key] = mapToObject(value);
                }
                else {
                    jsonObject[key] = value;
                }
            });
            return jsonObject;
        }
        let fileToWrite = mapToObject(storage);
        fs.writeFileSync(path, JSON.stringify(fileToWrite));
    }
    static roomsIterator(listOfBuilding, rows, storage) {
        let results = [];
        for (let building of listOfBuilding) {
            building = parse5.parse(building);
            let listOfRooms = HtmlRelativeRetrieval_1.default.retrieveRooms(building);
            if (!(Array.isArray(listOfRooms)) || listOfRooms.length <= 0) {
                continue;
            }
            let shortBName = HtmlRelativeRetrieval_1.default.retrieveShortName(building);
            shortBName = shortBName.slice(shortBName.lastIndexOf("/") + 1, shortBName.lastIndexOf("-"));
            listOfRooms = this.findListOfRooms(listOfRooms, building, shortBName);
            if (listOfRooms === undefined || listOfRooms.length <= 0) {
                continue;
            }
            storage.set(shortBName, listOfRooms);
            rows = rows + listOfRooms.length;
        }
        this.addToStorage(storage, results, rows);
        return results;
    }
    static findListOfRooms(listOfRooms, building, shortName) {
        let results = [];
        let buildingName = HtmlRelativeRetrieval_1.default.retrieveFullName(building);
        let address = HtmlRelativeRetrieval_1.default.retrieveBuildingAddress(building);
        let roomLat = -1;
        let roomLon = -1;
        for (let room of listOfRooms) {
            if (room.nodeName === "#text") {
                continue;
            }
            let href = HtmlRelativeRetrieval_1.default.retrieveHref(room);
            let roomNum = href.slice(href.lastIndexOf("-") + 1, href.length);
            let roomName = shortName.concat("_", roomNum);
            let roomCap = HtmlRelativeRetrieval_1.default.retrieveCap(room);
            let roomType = HtmlRelativeRetrieval_1.default.retrieveRoomType(room);
            let roomFurniture = HtmlRelativeRetrieval_1.default.retrieveFurniture(room);
            let buildingRoom = new BuildingRoom_1.default(buildingName, shortName, roomNum, roomName, address, roomLat, roomLon, roomCap, roomType, roomFurniture, href);
            results.push(buildingRoom);
        }
        return results;
    }
}
exports.default = Dataset;
//# sourceMappingURL=Dataset.js.map