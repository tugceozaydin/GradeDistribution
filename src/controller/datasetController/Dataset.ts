import {InsightDatasetKind} from "../IInsightFacade";
import CourseSection from "./CourseSection";
import * as fs from "fs";
import * as parse5 from "parse5";
import BuildingRoom from "./BuildingRoom";
import HtmlRelativeRetrieval from "./HtmlRelativeRetrieval";

export default class Dataset {

    public datasetContent: Map<string, any[]>;
    public id: string;
    public kind: InsightDatasetKind;
    public rows: number;

    constructor(id: string, kind: InsightDatasetKind, rows: number) {
        this.id = id;
        this.kind = kind;
        this.rows = rows;
    }

    public static courseSectionIterator(listOfCourses: any[], rows: number, storage: any) {
        let course;
        let results: any[] = [];
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
                            // add the course to our hashmap using the courseID as the key and array of
                            storage.set(uniqueCourseKey, sectionsContent);
                            break;
                        }
                    }
                }
                rows = rows + listOfSections.length;
            } catch (error) {
                continue;
            }
        }
        this.addToStorage(storage, results, rows);
        return results;
    }

    private static addToStorage(storage: any, results: any[], rows: number) {
        if (storage.size > 0) {
            results.push(storage);
            results.push(rows);
        }
    }

    public static createListOfSections(listOfSections: any) {
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
                let year: number;
                if (item.Section === "overall") {
                    year = 1900;
                } else {
                    year = parseInt(item.Year, 10);
                }
                let section =
                    new CourseSection(department, id2, avg, instructor,
                        title, pass, fail, audit, uuid, year);
                content2.push(section);
            }
        }
        return content2;
    }

    public static validSectionCheck(item: any): boolean {
        return item.Subject === undefined || item.Course === undefined || item.Avg === undefined ||
            item.Professor === undefined || item.Title === undefined || item.Pass === undefined ||
            item.Fail === undefined || item.Audit === undefined || item["id"] === undefined ||
            item.Year === undefined;
    }

    public static fileWriter(storage: any, id: string) {
        const directory = "data";
        const path = directory + "/" + id + ".json";
        if (!fs.existsSync(directory)) {
            fs.mkdir(path, (err) => {
                if (err) {
                    alert("couldn't add directory");
                }
            });
        }

        function mapToObject(map: any) {
            let jsonObject = Object.create(null);

            map.forEach((value: string[], key: string) => {
                if (value instanceof Map) {
                    jsonObject[key] = mapToObject(value);
                } else {
                    jsonObject[key] = value;
                }
            });
            return jsonObject;
        }

        let fileToWrite = mapToObject(storage);

        fs.writeFileSync(path, JSON.stringify(fileToWrite));
    }

    public static roomsIterator(listOfBuilding: any[], rows: number, storage: any) {
        let results: any[] = [];
        for (let building of listOfBuilding) {
            building = parse5.parse(building);
            let listOfRooms = HtmlRelativeRetrieval.retrieveRooms(building);
            if (!(Array.isArray(listOfRooms)) || listOfRooms.length <= 0) {
                continue;
            }
            let shortBName = HtmlRelativeRetrieval.retrieveShortName(building);
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

    public static findListOfRooms(listOfRooms: any[], building: any, shortName: string) {
        let results: BuildingRoom[] = [];
        let buildingName = HtmlRelativeRetrieval.retrieveFullName(building);
        let address = HtmlRelativeRetrieval.retrieveBuildingAddress(building);
        let roomLat = -1;
        let roomLon = -1;
        for (let room of listOfRooms) {
            if (room.nodeName === "#text") {
                continue;
            }
            let href = HtmlRelativeRetrieval.retrieveHref(room);
            let roomNum = href.slice(href.lastIndexOf("-") + 1, href.length);
            let roomName = shortName.concat("_", roomNum);
            let roomCap = HtmlRelativeRetrieval.retrieveCap(room);
            let roomType = HtmlRelativeRetrieval.retrieveRoomType(room);
            let roomFurniture = HtmlRelativeRetrieval.retrieveFurniture(room);
            let buildingRoom = new BuildingRoom(buildingName, shortName, roomNum, roomName, address, roomLat,
                roomLon, roomCap, roomType, roomFurniture, href);
            results.push(buildingRoom);
        }
        return results;
    }
}
