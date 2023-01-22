"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HtmlRelativeRetrieval {
    static retrieveCap(room) {
        if (room.nodeName === "td" && room.attrs[0] !== undefined &&
            room.attrs[0].value.startsWith("views-field views-field-field-room-capacity")) {
            return Number(room.childNodes[0].value);
        }
        if (room.childNodes && room.childNodes.length > 0) {
            for (let child of room.childNodes) {
                let capacity = this.retrieveCap(child);
                if (capacity !== -1) {
                    return capacity;
                }
            }
        }
        return -1;
    }
    static retrieveRoomType(room) {
        if (room.nodeName === "td" && room.attrs[0] !== undefined &&
            room.attrs[0].value.startsWith("views-field views-field-field-room-type")) {
            return room.childNodes[0].value.trim();
        }
        if (room.childNodes && room.childNodes.length > 0) {
            for (let child of room.childNodes) {
                let roomType = this.retrieveRoomType(child);
                if (roomType !== "") {
                    return roomType;
                }
            }
        }
        return "";
    }
    static retrieveFurniture(room) {
        if (room.nodeName === "td" && room.attrs[0] !== undefined &&
            room.attrs[0].value.startsWith("views-field views-field-field-room-furniture")) {
            return room.childNodes[0].value.trim();
        }
        if (room.childNodes && room.childNodes.length > 0) {
            for (let child of room.childNodes) {
                let furn = this.retrieveFurniture(child);
                if (furn !== "") {
                    return furn;
                }
            }
        }
        return "";
    }
    static retrieveHref(room) {
        if (room.nodeName === "a" && room.attrs[0] !== undefined &&
            room.attrs[0].name.startsWith("href")) {
            return room.attrs[0].value;
        }
        if (room.childNodes && room.childNodes.length > 0) {
            for (let child of room.childNodes) {
                let linky = this.retrieveHref(child);
                if (linky !== "") {
                    return linky;
                }
            }
        }
        return "";
    }
    static retrieveFullName(building) {
        if (building.nodeName === "span" && building.attrs[0] !== undefined &&
            building.attrs[0].value.startsWith("field-content")) {
            return building.childNodes[0].value;
        }
        if (building.childNodes && building.childNodes.length > 0) {
            for (let child of building.childNodes) {
                let possibleFullName = this.retrieveFullName(child);
                if (possibleFullName !== "") {
                    return possibleFullName;
                }
            }
        }
        return "";
    }
    static retrieveShortName(building) {
        if (building.nodeName === "a" && building.attrs[1] !== undefined &&
            building.attrs[1].value.startsWith("Room Details")) {
            return building.attrs[0].value;
        }
        if (building.childNodes && building.childNodes.length > 0) {
            for (let child of building.childNodes) {
                let possibleShortName = this.retrieveShortName(child);
                if (possibleShortName !== "") {
                    return possibleShortName;
                }
            }
        }
        return "";
    }
    static retrieveBuildingAddress(building) {
        if (building.nodeName === "div" && building.attrs[0] !== undefined &&
            building.attrs[0].value.startsWith("field-content")) {
            return building.childNodes[0].value;
        }
        if (building.childNodes && building.childNodes.length > 0) {
            for (let child of building.childNodes) {
                let possibleAddress = this.retrieveBuildingAddress(child);
                if (possibleAddress !== "") {
                    return possibleAddress;
                }
            }
        }
        return "";
    }
    static retrieveRooms(building) {
        if (building.nodeName === "table" && building.attrs[0] !== undefined &&
            building.attrs[0].value.startsWith("views-table")) {
            return this.findTBody(building);
        }
        if (building.childNodes && building.childNodes.length > 0) {
            for (let child of building.childNodes) {
                let roomsExistence = this.retrieveRooms(child);
                if (roomsExistence !== false) {
                    return roomsExistence;
                }
            }
        }
        return false;
    }
    static findTBody(htmlDoc) {
        if (htmlDoc.nodeName === "tbody") {
            return htmlDoc.childNodes;
        }
        if (htmlDoc.childNodes && htmlDoc.childNodes.length > 0) {
            for (let child of htmlDoc.childNodes) {
                let tList = this.findTBody(child);
                if (tList !== false) {
                    return tList;
                }
            }
        }
        return false;
    }
}
exports.default = HtmlRelativeRetrieval;
//# sourceMappingURL=HtmlRelativeRetrieval.js.map