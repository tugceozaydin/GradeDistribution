"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidateTransformationQuery {
    constructor() {
        this.datasetID = null;
        this.validKeys = ["avg", "pass", "fail", "audit", "year", "dept",
            "id", "uuid", "instructor", "title", "fullname", "shortname", "number", "name", "address", "lat", "lon",
            "seats", "type", "furniture", "href"];
        this.isValidKeys = ["dept", "id", "uuid", "instructor", "title", "fullname",
            "shortname", "number", "name", "address", "type", "furniture", "href"];
        this.validCompKeys = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        this.applyKeys = [];
        this.groupKeys = [];
        this.columnKeys = [];
    }
    isTransformationValid(transformationBlock) {
        if (Object.keys(transformationBlock).length !== 2) {
            return false;
        }
        if (transformationBlock === undefined || transformationBlock.constructor !== Object) {
            return false;
        }
        if (!(transformationBlock.hasOwnProperty("GROUP") && transformationBlock.hasOwnProperty("APPLY"))) {
            return false;
        }
        return this.isGroupValid(transformationBlock.GROUP) && this.isApplyValid(transformationBlock.APPLY);
    }
    isGroupValid(groupBlock) {
        if (groupBlock === undefined || groupBlock.constructor !== Array) {
            return false;
        }
        if (groupBlock.length === 0) {
            return false;
        }
        for (let group of groupBlock) {
            if (!(typeof group === "string")) {
                return false;
            }
            if (this.datasetID === null) {
                this.datasetID = group.slice(0, group.lastIndexOf("_"));
            }
            else if (group.slice(0, group.lastIndexOf("_")) !== this.datasetID) {
                return false;
            }
            if (!this.validKeys.includes(group.slice(group.lastIndexOf("_") + 1, group.length))) {
                return false;
            }
            this.groupKeys.push(group);
        }
        return true;
    }
    isApplyValid(applyBlock) {
        if (applyBlock === undefined || applyBlock === null || applyBlock.constructor !== Array) {
            return false;
        }
        for (let each of applyBlock) {
            if (!this.isApplyRuleValid(each)) {
                return false;
            }
        }
        return true;
    }
    isApplyRuleValid(applyRuleBlock) {
        if (applyRuleBlock === undefined || applyRuleBlock === null || applyRuleBlock.constructor !== Object) {
            return false;
        }
        let applyKey;
        if (Object.keys(applyRuleBlock).length !== 1) {
            return false;
        }
        else {
            applyKey = Object.keys(applyRuleBlock)[0];
        }
        if (applyKey === undefined || applyKey.constructor !== String || applyKey.includes("_")) {
            return false;
        }
        this.applyKeys.push(applyKey);
        return this.isApplyTokenValid(applyRuleBlock[applyKey]);
    }
    isApplyTokenValid(applyTokenBlock) {
        if (applyTokenBlock === undefined || applyTokenBlock === null || applyTokenBlock.constructor !== Object) {
            return false;
        }
        let applyTokens = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
        let applyToken;
        if (Object.keys(applyTokenBlock).length !== 1) {
            return false;
        }
        else {
            applyToken = Object.keys(applyTokenBlock)[0];
        }
        if (!applyTokens.includes(applyToken)) {
            return false;
        }
        let key = applyTokenBlock[applyToken];
        if (this.datasetID === null) {
            this.datasetID = key.slice(0, key.lastIndexOf("_"));
        }
        else if (key.slice(0, key.lastIndexOf("_")) !== this.datasetID) {
            return false;
        }
        let datasetKey = key.slice(key.lastIndexOf("_") + 1, key.length);
        if (this.validCompKeys.includes(datasetKey)) {
            return true;
        }
        else {
            return (applyToken === "COUNT" && this.validKeys.includes(datasetKey));
        }
    }
    isColumnsValid(comp) {
        if (comp.length === 0) {
            return false;
        }
        for (let courseAttribute of comp) {
            if (!(typeof courseAttribute === "string")) {
                return false;
            }
            if (this.datasetID === null) {
                this.datasetID = courseAttribute.slice(0, courseAttribute.lastIndexOf("_"));
            }
            else if (courseAttribute.slice(0, courseAttribute.lastIndexOf("_")) !== this.datasetID &&
                !this.applyKeys.includes(courseAttribute)) {
                return false;
            }
            let temp = courseAttribute.slice(courseAttribute.lastIndexOf("_") + 1, courseAttribute.length);
            if (this.groupKeys.length > 0) {
                if (!this.groupKeys.includes(courseAttribute) && !this.applyKeys.includes(courseAttribute)) {
                    return false;
                }
            }
            if (!this.validKeys.includes(temp) && !this.applyKeys.includes(courseAttribute)) {
                return false;
            }
            this.columnKeys.push(courseAttribute);
        }
        return true;
    }
    isOrderValid(orderBlock) {
        if (orderBlock === null || orderBlock === undefined ||
            (!(typeof orderBlock === "string") && !(typeof orderBlock === "object"))) {
            return false;
        }
        if ((typeof orderBlock === "string")) {
            if (!orderBlock.includes("_")) {
                if (!this.applyKeys.includes(orderBlock)) {
                    return false;
                }
            }
            if (this.datasetID === null) {
                this.datasetID = orderBlock.slice(0, orderBlock.lastIndexOf("_"));
            }
            else if (orderBlock.slice(0, orderBlock.lastIndexOf("_")) !== this.datasetID) {
                return false;
            }
            if (!this.validKeys.includes(orderBlock.slice(orderBlock.lastIndexOf("_") + 1, orderBlock.length))) {
                return false;
            }
            if (!this.columnKeys.includes(orderBlock)) {
                return false;
            }
        }
        if ((typeof orderBlock === "object")) {
            if (Object.keys(orderBlock).length !== 2) {
                return false;
            }
            if (Object.keys(orderBlock)[0] !== "dir" || Object.keys(orderBlock)[1] !== "keys") {
                return false;
            }
            let dir = Object.keys(orderBlock)[0];
            if (orderBlock[dir] !== "DOWN" && orderBlock[dir] !== "UP") {
                return false;
            }
            let keys = Object.keys(orderBlock)[1];
            if (orderBlock[keys] === undefined || orderBlock[keys].constructor !== Array) {
                return false;
            }
            for (let key of orderBlock[keys]) {
                if (!this.columnKeys.includes(key)) {
                    return false;
                }
            }
            return true;
        }
        return true;
    }
}
exports.default = ValidateTransformationQuery;
//# sourceMappingURL=ValidateTransformationQuery.js.map