"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ApplyController_1 = require("./ApplyController");
class FulfillQuery {
    constructor() {
        this.listOfColumns = [];
        this.applyKeys = [];
        this.applyKeysCategories = [];
        this.applyKeyNames = [];
    }
    fulfillQuery(query, section, datasetName) {
        if (query.hasOwnProperty("TRANSFORMATIONS")) {
            this.fulfillApply(query["TRANSFORMATIONS"]);
        }
        this.fulfillOptions(query["OPTIONS"]);
        if (this.fulfillWhere(query["WHERE"], section)) {
            let result = Object.create(null);
            for (let column of this.listOfColumns) {
                if (column === "number") {
                    let fullColumnName = datasetName.concat("_", column);
                    result[fullColumnName] = section["num"];
                }
                else {
                    let fullColumnName = datasetName.concat("_", column);
                    result[fullColumnName] = section[column];
                }
            }
            return result;
        }
        else {
            return null;
        }
    }
    fulfillApply(query) {
        this.applyKeys = [];
        this.applyKeysCategories = [];
        this.applyKeyNames = [];
        const apply = query["APPLY"];
        for (let applyKey of apply) {
            let holder = applyKey[Object.keys(applyKey)[0]];
            let holder2 = holder[Object.keys(holder)[0]];
            let key = holder2.slice(holder2.lastIndexOf("_") + 1, holder2.length);
            this.applyKeys.push(key);
            this.applyKeysCategories.push(Object.keys(holder)[0]);
            this.applyKeyNames.push(Object.keys(applyKey)[0]);
        }
    }
    fulfillOptions(query) {
        this.listOfColumns = [];
        for (let key of query.COLUMNS) {
            if (key.includes("_")) {
                key = key.slice(key.lastIndexOf("_") + 1, key.length);
                this.listOfColumns.push(key);
            }
        }
        for (let key of this.applyKeys) {
            this.listOfColumns.push(key);
        }
    }
    fulfillWhere(query, section) {
        if (query.hasOwnProperty("LT")) {
            return this.fulfillLT(query["LT"], section);
        }
        else if (query.hasOwnProperty("GT")) {
            return this.fulfillGT(query["GT"], section);
        }
        else if (query.hasOwnProperty("EQ")) {
            return this.fulfillEQ(query["EQ"], section);
        }
        else if (query.hasOwnProperty("IS")) {
            return this.fulfillIS(query["IS"], section);
        }
        else if (query.hasOwnProperty("AND")) {
            return this.fulfillAND(query["AND"], section);
        }
        else if (query.hasOwnProperty("OR")) {
            return this.fulfillOR(query["OR"], section);
        }
        else if (query.hasOwnProperty("NOT")) {
            return this.fulfillNOT(query["NOT"], section);
        }
        else if (Object.keys(query).length === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    fulfillGT(gtClause, section) {
        let keyName = Object.keys(gtClause)[0];
        let fieldType = keyName.slice(keyName.lastIndexOf("_") + 1, keyName.length);
        let comparisonValue = gtClause[keyName];
        return section[fieldType] > comparisonValue;
    }
    fulfillLT(ltClause, section) {
        let keyName = Object.keys(ltClause)[0];
        let fieldType = keyName.slice(keyName.lastIndexOf("_") + 1, keyName.length);
        let comparisonValue = ltClause[keyName];
        return section[fieldType] < comparisonValue;
    }
    fulfillEQ(eqClause, section) {
        let keyName = Object.keys(eqClause)[0];
        let fieldType = keyName.slice(keyName.lastIndexOf("_") + 1, keyName.length);
        let comparisonValue = eqClause[keyName];
        return section[fieldType] === comparisonValue;
    }
    fulfillIS(isClause, section) {
        let keyName = Object.keys(isClause)[0];
        let fieldType = keyName.slice(keyName.lastIndexOf("_") + 1, keyName.length);
        let comparisonValue = isClause[keyName];
        if (comparisonValue.charAt(0) === "*" && comparisonValue.charAt(comparisonValue.length - 1) === "*") {
            comparisonValue = ".*".concat(comparisonValue.slice(1, comparisonValue.length - 1), ".*", "$");
        }
        else if (comparisonValue.charAt(0) === "*") {
            comparisonValue = "^".concat(".*", comparisonValue.slice(1, comparisonValue.length), "$");
        }
        else if (comparisonValue.charAt(comparisonValue.length - 1) === "*") {
            let temp = comparisonValue.slice(0, comparisonValue.length - 1);
            comparisonValue = "^".concat(temp, ".*", "$");
        }
        let regExpressions = new RegExp(comparisonValue);
        return regExpressions.test(section[fieldType]) || section[fieldType] === comparisonValue;
    }
    fulfillAND(andClause, section) {
        for (let item of andClause) {
            if (!this.fulfillWhere(item, section)) {
                return false;
            }
        }
        return true;
    }
    fulfillOR(orClause, section) {
        for (let item of orClause) {
            if (this.fulfillWhere(item, section)) {
                return true;
            }
        }
        return false;
    }
    fulfillNOT(notClause, section) {
        return !this.fulfillWhere(notClause, section);
    }
    fulfillTransformations(query, result) {
        return this.fulfillGroup(query, result);
    }
    fulfillGroup(query, result) {
        let listOfGrouping = [];
        let groupBlock = query["GROUP"];
        const uniq = new Set(groupBlock);
        groupBlock = Array.from(uniq);
        let check = [];
        for (let section of result) {
            let groups = [];
            let str = String();
            for (let key of groupBlock) {
                let val = section[key];
                let temp = val.toString();
                str = str + temp;
                if (!groups.includes(val) && val !== undefined) {
                    groups.push(val);
                }
            }
            if (!check.includes(str)) {
                listOfGrouping.push(groups);
                check.push(str);
            }
        }
        let i;
        let results = [];
        for (i = 0; i < listOfGrouping.length; i++) {
            const intermediateHolder = [];
            for (let section of result) {
                let shouldAdd = true;
                for (let j = 0; j < listOfGrouping[i].length; j++) {
                    let test = listOfGrouping[i][j];
                    if (section[groupBlock[j]] !== test) {
                        shouldAdd = false;
                    }
                }
                if (shouldAdd) {
                    intermediateHolder.push(section);
                }
            }
            results.push(intermediateHolder);
        }
        return this.fulfillApplyKeys(results, query);
    }
    fulfillApplyKeys(listOfSectionGroup, query) {
        let result = [];
        for (let sectionGroup of listOfSectionGroup) {
            result.push(this.doApplyKeyAction(sectionGroup, query["GROUP"]));
        }
        return result;
    }
    doApplyKeyAction(sectionGroup, query) {
        let result = Object.create(null);
        for (let item of query) {
            result[item] = sectionGroup[0][item];
        }
        const datasetID = query[0].slice(0, query[0].lastIndexOf("_"));
        for (let i = 0; i < this.applyKeys.length; i++) {
            const fieldKey = datasetID.concat("_", this.applyKeys[i]);
            const keyName = this.applyKeyNames[i];
            if (this.applyKeysCategories[i] === "AVG") {
                result[keyName] = ApplyController_1.default.averageFulfill(sectionGroup, fieldKey);
            }
            else if (this.applyKeysCategories[i] === "SUM") {
                result[keyName] = ApplyController_1.default.sumFulfill(sectionGroup, fieldKey);
            }
            else if (this.applyKeysCategories[i] === "MAX") {
                result[keyName] = ApplyController_1.default.maxFulfill(sectionGroup, fieldKey);
            }
            else if (this.applyKeysCategories[i] === "MIN") {
                result[keyName] = ApplyController_1.default.minFulfill(sectionGroup, fieldKey);
            }
            else if (this.applyKeysCategories[i] === "COUNT") {
                result[keyName] = ApplyController_1.default.countFulfill(sectionGroup, fieldKey);
            }
        }
        return result;
    }
    orderResult(result, queryOptions) {
        if (!queryOptions.hasOwnProperty("ORDER")) {
            return result;
        }
        let orderBy = queryOptions.ORDER;
        if (orderBy.constructor !== Object) {
            result.sort(function (a, b) {
                if (a[orderBy] > b[orderBy]) {
                    return 1;
                }
                else if (a[orderBy] < b[orderBy]) {
                    return -1;
                }
            });
        }
        if (orderBy.constructor === Object) {
            let keys = Object.keys(orderBy)[1];
            let prevKeys = [];
            if (orderBy["dir"] === "UP") {
                for (let key of orderBy[keys]) {
                    this.sortHelper(result, prevKeys, key, 1);
                    prevKeys.push(key);
                }
            }
            else if (orderBy["dir"] === "DOWN") {
                for (let key of orderBy[keys]) {
                    this.sortHelper(result, prevKeys, key, -1);
                    prevKeys.push(key);
                }
            }
        }
        return result;
    }
    sortHelper(result, prevKeys, key, dir) {
        result.sort(function (a, b) {
            let sort = true;
            for (let prev of prevKeys) {
                if (a[prev] !== b[prev]) {
                    sort = false;
                    break;
                }
            }
            if (sort) {
                if (a[key] > b[key]) {
                    return dir;
                }
                else if (a[key] < b[key]) {
                    return -(dir);
                }
            }
        });
    }
}
exports.default = FulfillQuery;
//# sourceMappingURL=FulfillQuery.js.map