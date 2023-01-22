import Log from "../../Util";

export default class ValidateTransformationQuery {

    public datasetID: string = null;

    public datasetType: string = null;

    public validKeys: string[] = ["avg", "pass", "fail", "audit", "year", "dept",
        "id", "uuid", "instructor", "title", "fullname", "shortname", "number", "name", "address", "lat", "lon",
        "seats", "type", "furniture", "href"];

    public validCoursesKeys: string[] = ["avg", "pass", "fail", "audit", "year", "dept",
        "id", "uuid", "instructor", "title"];

    public validRoomsKeys: string[] = ["fullname", "shortname", "number", "name", "address", "lat", "lon",
        "seats", "type", "furniture", "href"];

    public validCompRoomsKeys: string[] = ["lat", "lon", "seats"];

    public validCompCoursesKeys: string[] = ["avg", "pass", "fail", "audit", "year"];

    public applyKeys: string[] = [];

    public groupKeys: string[] = [];

    public columnKeys: string[] = [];


    public isTransformationValid(transformationBlock: any) {
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

// made it similar to isColumnsValid
    public isGroupValid(groupBlock: any): boolean {
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
                const tempKey = group.slice(group.lastIndexOf("_") + 1, group.length);
                if (this.validCoursesKeys.includes(tempKey)) {
                    this.datasetType = "courses";
                } else if (this.validRoomsKeys.includes(tempKey)) {
                    this.datasetType = "rooms";
                }
            } else if (group.slice(0, group.lastIndexOf("_")) !== this.datasetID) {
                return false;
            }
            if (this.datasetType === "courses") {
                if (!this.validCoursesKeys.includes(group.slice(group.lastIndexOf("_") + 1, group.length))) {
                    return false;
                }
            } else if (this.datasetType === "rooms") {
                if (!this.validRoomsKeys.includes(group.slice(group.lastIndexOf("_") + 1, group.length))) {
                    return false;
                }
            }
            if (!this.validCoursesKeys.includes(group.slice(group.lastIndexOf("_") + 1, group.length)) &&
                !this.validRoomsKeys.includes(group.slice(group.lastIndexOf("_") + 1, group.length))) {
                return false;
            }
            this.groupKeys.push(group);
        }
        return true;
    }

    // I should check if each is also given in columns or not.
    public isApplyValid(applyBlock: any): boolean {
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

    public isApplyRuleValid(applyRuleBlock: any): boolean {
        if (applyRuleBlock === undefined || applyRuleBlock === null || applyRuleBlock.constructor !== Object) {
            return false;
        }
        let applyKey;
        if (Object.keys(applyRuleBlock).length !== 1) {
            return false;
        } else {
            applyKey = Object.keys(applyRuleBlock)[0];
        }
        // check if applyKey contains underscore as well
        if (applyKey === undefined || applyKey.constructor !== String || applyKey.includes("_") ||
            this.applyKeys.includes(applyKey)) {
            return false;
        }
        this.applyKeys.push(applyKey);
        return this.isApplyTokenValid(applyRuleBlock[applyKey]);
    }

    public isApplyTokenValid(applyTokenBlock: any): boolean {
        if (applyTokenBlock === undefined || applyTokenBlock === null || applyTokenBlock.constructor !== Object) {
            return false;
        }
        let applyTokens = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
        let applyToken;
        if (Object.keys(applyTokenBlock).length !== 1) {
            return false;
        } else {
            applyToken = Object.keys(applyTokenBlock)[0];
        }
        if (!applyTokens.includes(applyToken)) {
            return false;
        }
        // getting key such as courses_avg
        let key = applyTokenBlock[applyToken];
        // checking courses_avg
        if (this.datasetID === null) {
            this.datasetID = key.slice(0, key.lastIndexOf("_"));
            const tempKey = key.slice(key.lastIndexOf("_") + 1, key.length);
            if (this.validCoursesKeys.includes(tempKey)) {
                this.datasetType = "courses";
            } else if (this.validRoomsKeys.includes(tempKey)) {
                this.datasetType = "rooms";
            }
        } else if (key.slice(0, key.lastIndexOf("_")) !== this.datasetID) {
            return false;
        }
        let datasetKey = key.slice(key.lastIndexOf("_") + 1, key.length);

        if ((this.datasetType === "courses" && this.validCompCoursesKeys.includes(datasetKey)) ||
            (this.datasetType === "rooms" && this.validCompRoomsKeys.includes(datasetKey))) {
            return true;
        } else {
            return (applyToken === "COUNT" &&
                ((this.validCoursesKeys.includes(datasetKey) && this.datasetType === "courses") ||
                    (this.validRoomsKeys.includes(datasetKey) && this.datasetType === "rooms")));
        }
    }

    public isColumnsValid(comp: any): boolean {
        if (comp.length === 0) {
            return false;
        }
        for (let courseAttribute of comp) {
            if (!(typeof courseAttribute === "string")) {
                return false;
            }
            if (this.datasetID === null) {
                this.datasetID = courseAttribute.slice(0, courseAttribute.lastIndexOf("_"));
                const tempKey = courseAttribute.slice(courseAttribute.lastIndexOf("_") + 1, courseAttribute.length);
                if (this.validCoursesKeys.includes(tempKey)) {
                    this.datasetType = "courses";
                } else if (this.validRoomsKeys.includes(tempKey)) {
                    this.datasetType = "rooms";
                }
            } else if (courseAttribute.slice(0, courseAttribute.lastIndexOf("_")) !== this.datasetID &&
                !this.applyKeys.includes(courseAttribute)) {
                return false;
            }
            let temp = courseAttribute.slice(courseAttribute.lastIndexOf("_") + 1, courseAttribute.length);
            if (this.groupKeys.length > 0) {
                if (!this.groupKeys.includes(courseAttribute) && !this.applyKeys.includes(courseAttribute)) {
                    return false;
                }
            }
            if (((!this.validCoursesKeys.includes(temp) && this.datasetType === "courses") ||
                (!this.validRoomsKeys.includes(temp) && this.datasetType === "rooms"))
                && !this.applyKeys.includes(temp)) {
                return false;
            }
            if (!this.validKeys.includes(temp) && !this.applyKeys.includes(temp)) {
                return false;
            }
            this.columnKeys.push(courseAttribute);
        }
        return true;
    }

    public isOrderValid(orderBlock: any): boolean {
        if (orderBlock === null || orderBlock === undefined ||
            (!(typeof orderBlock === "string") && !(typeof orderBlock === "object"))) {
            return false;
        }
        if ((typeof orderBlock === "string")) {
            if (!orderBlock.includes("_")) {
                if (!this.applyKeys.includes(orderBlock)) {
                    return false;
                }
            } else {
                if (this.datasetID === null) {
                    this.setID(orderBlock);
                } else if (orderBlock.slice(0, orderBlock.lastIndexOf("_")) !== this.datasetID) {
                    return false;
                }
                const temp = orderBlock.slice(orderBlock.lastIndexOf("_") + 1, orderBlock.length);
                if (((!this.validCoursesKeys.includes(temp) && this.datasetType === "courses") ||
                    (!this.validRoomsKeys.includes(temp) && this.datasetType === "rooms"))) {
                    return false;
                }
            }
            if (!this.columnKeys.includes(orderBlock)) {
                return false;
            }
        }
        if ((typeof orderBlock === "object")) {
            if (Object.keys(orderBlock).length !== 2) {
                return false;
            }
            if (!Object.keys(orderBlock).includes("keys") || !Object.keys(orderBlock).includes("dir")) {
                return false;
            }
            let dir = orderBlock["dir"];
            if (dir !== "DOWN" && dir !== "UP") {
                return false;
            }
            let keys = orderBlock["keys"];
            if (keys === undefined || keys.constructor !== Array || keys.length <= 0) {
                return false;
            }
            for (let key of keys) {
                if (!this.columnKeys.includes(key)) {
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    private setID(orderBlock: string) {
        this.datasetID = orderBlock.slice(0, orderBlock.lastIndexOf("_"));
        const tempKey = orderBlock.slice(orderBlock.lastIndexOf("_") + 1, orderBlock.length);
        if (this.validCoursesKeys.includes(tempKey)) {
            this.datasetType = "courses";
        } else if (this.validRoomsKeys.includes(tempKey)) {
            this.datasetType = "rooms";
        }
    }
}
