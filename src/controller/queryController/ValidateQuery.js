"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ValidateTransformationQuery_1 = require("./ValidateTransformationQuery");
class ValidateQuery {
    constructor() {
        this.validCompRoomsKeys = ["lat", "lon", "seats"];
        this.validIsRoomsKeys = ["fullname",
            "shortname", "number", "name", "address", "type", "furniture", "href"];
        this.validCompCoursesKeys = ["avg", "pass", "fail", "audit", "year"];
        this.validIsCoursesKeys = ["dept", "id", "uuid", "instructor", "title"];
        this.transformationValidity = new ValidateTransformationQuery_1.default();
    }
    validateQuery(query) {
        if (query === undefined || query === null || query.constructor !== Object) {
            return false;
        }
        if (!query.hasOwnProperty("WHERE") || !query.hasOwnProperty("OPTIONS")) {
            return false;
        }
        if (Object.keys(query).length === 3) {
            if (!query.hasOwnProperty("TRANSFORMATIONS")) {
                return false;
            }
            else {
                return this.transformationValidity.isTransformationValid(query.TRANSFORMATIONS) &&
                    this.isWhereValid(query.WHERE) &&
                    this.isOptionsValid(query.OPTIONS);
            }
        }
        if (Object.keys(query).length === 2) {
            return this.isWhereValid(query.WHERE) && this.isOptionsValid(query.OPTIONS);
        }
    }
    isWhereValid(whereBlock) {
        if (Object.keys(whereBlock).length === 0) {
            return true;
        }
        if (whereBlock === undefined || whereBlock === null || whereBlock.constructor !== Object ||
            (Object.keys(whereBlock).length > 1)) {
            return false;
        }
        return this.isFilterValid(whereBlock);
    }
    isFilterValid(filterBlock) {
        if (filterBlock.hasOwnProperty("LT")) {
            return this.isMCompValid(filterBlock.LT);
        }
        else if (filterBlock.hasOwnProperty("GT")) {
            return this.isMCompValid(filterBlock.GT);
        }
        else if (filterBlock.hasOwnProperty("EQ")) {
            return this.isMCompValid(filterBlock.EQ);
        }
        else if (filterBlock.hasOwnProperty("IS")) {
            return this.isSCompValid(filterBlock.IS);
        }
        else if (filterBlock.hasOwnProperty("AND")) {
            return this.isLogicValid(filterBlock.AND);
        }
        else if (filterBlock.hasOwnProperty("OR")) {
            return this.isLogicValid(filterBlock.OR);
        }
        else if (filterBlock.hasOwnProperty("NOT")) {
            return this.isNegationValid(filterBlock.NOT);
        }
        else {
            return false;
        }
    }
    basicCompValidity(comp) {
        if (comp === undefined || comp === null || Object.keys(comp).length !== 1) {
            return false;
        }
        if (this.transformationValidity.datasetID === null) {
            let key = Object.keys(comp)[0];
            this.transformationValidity.datasetID =
                key.slice(0, key.lastIndexOf("_"));
            const tempKey = key.slice(key.lastIndexOf("_") + 1, key.length);
            if (this.transformationValidity.validCoursesKeys.includes(tempKey)) {
                this.transformationValidity.datasetType = "courses";
            }
            else if (this.transformationValidity.validRoomsKeys.includes(tempKey)) {
                this.transformationValidity.datasetType = "rooms";
            }
        }
        else if (Object.keys(comp)[0].slice(0, Object.keys(comp)[0].lastIndexOf("_")) !==
            this.transformationValidity.datasetID) {
            return false;
        }
        let datasetKey = Object.keys(comp)[0].slice(Object.keys(comp)[0].lastIndexOf("_") + 1, Object.keys(comp)[0].length);
        if (!this.transformationValidity.validKeys.includes(datasetKey)) {
            return false;
        }
        else if (this.transformationValidity.datasetType === "courses"
            && !this.validCompCoursesKeys.includes(datasetKey)) {
            return false;
        }
        else if (this.transformationValidity.datasetType === "rooms"
            && !this.validCompRoomsKeys.includes(datasetKey)) {
            return false;
        }
        else if (Object.keys(comp).length > 1) {
            return false;
        }
        else {
            return true;
        }
    }
    isMCompValid(mComp) {
        if (!this.basicCompValidity(mComp)) {
            return false;
        }
        let hold = (typeof mComp[Object.keys(mComp)[0]] === "number");
        return hold;
    }
    isSCompValid(sComp) {
        if (!this.basicISValidity(sComp)) {
            return false;
        }
        let value = sComp[Object.keys(sComp)[0]];
        if (!(typeof value === "string")) {
            return false;
        }
        let i;
        let asteriskCount = 0;
        let prevChar = "";
        for (i = 0; i < value.length; i++) {
            if (asteriskCount === 2) {
                if (value.charAt(0) !== "*" || value.charAt(value.length - 1) !== "*") {
                    return false;
                }
            }
            if (asteriskCount > 2) {
                return false;
            }
            if ((prevChar === "*" && value.charAt(i) === "*")) {
                return false;
            }
            prevChar = value.charAt(i);
            if (value.charAt(i) === "*") {
                asteriskCount = asteriskCount + 1;
            }
        }
        if (asteriskCount > 0 && (value.charAt(0) !== "*") && (value.charAt(value.length - 1) !== "*")) {
            return false;
        }
        return true;
    }
    isLogicValid(lComp) {
        if (lComp === undefined || lComp === null || Object.keys(lComp).length === 0) {
            return false;
        }
        for (let item of lComp) {
            if (!this.isFilterValid(item)) {
                return false;
            }
        }
        return true;
    }
    isNegationValid(nComp) {
        if (nComp === undefined || nComp === null) {
            return false;
        }
        return this.isFilterValid(nComp);
    }
    isOptionsValid(optionBlock) {
        if (optionBlock === undefined || optionBlock === null || optionBlock.constructor !== Object ||
            Object.keys(optionBlock).length > 2) {
            return false;
        }
        if (!(optionBlock.hasOwnProperty("COLUMNS")) ||
            !(this.transformationValidity.isColumnsValid(optionBlock.COLUMNS))) {
            return false;
        }
        if ((optionBlock.hasOwnProperty("ORDER")) &&
            !(this.transformationValidity.isOrderValid(optionBlock["ORDER"]))) {
            return false;
        }
        if (!optionBlock.hasOwnProperty("ORDER") && Object.keys(optionBlock).length > 1) {
            return false;
        }
        return true;
    }
    basicISValidity(comp) {
        if (comp === undefined || comp === null || Object.keys(comp).length === 0) {
            return false;
        }
        if (this.transformationValidity.datasetID === null) {
            const key = Object.keys(comp)[0];
            this.transformationValidity.datasetID =
                key.slice(0, key.lastIndexOf("_"));
            const tempKey = key.slice(key.lastIndexOf("_") + 1, key.length);
            if (this.transformationValidity.validCoursesKeys.includes(tempKey)) {
                this.transformationValidity.datasetType = "courses";
            }
            else if (this.transformationValidity.validRoomsKeys.includes(tempKey)) {
                this.transformationValidity.datasetType = "rooms";
            }
        }
        else if (Object.keys(comp)[0].slice(0, Object.keys(comp)[0].lastIndexOf("_")) !==
            this.transformationValidity.datasetID) {
            return false;
        }
        let datasetKey = Object.keys(comp)[0].slice(Object.keys(comp)[0].lastIndexOf("_") + 1, Object.keys(comp)[0].length);
        if (!this.transformationValidity.validKeys.includes(datasetKey)) {
            return false;
        }
        else if (this.transformationValidity.datasetType === "courses"
            && !this.validIsCoursesKeys.includes(datasetKey)) {
            return false;
        }
        else if (this.transformationValidity.datasetType === "rooms" && !this.validIsRoomsKeys.includes(datasetKey)) {
            return false;
        }
        else if (Object.keys(comp).length > 1) {
            return false;
        }
        else if (!(typeof Object.keys(comp)[0] === "string")) {
            return false;
        }
        else {
            return true;
        }
    }
}
exports.default = ValidateQuery;
//# sourceMappingURL=ValidateQuery.js.map