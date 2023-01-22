"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class default_1 {
    static getTransformationKeys(query) {
        const result = [];
        let keys = query["GROUP"];
        for (let key of keys) {
            result.push(key);
        }
        return result;
    }
    static varCount(fulfilledQuery, transformationKeys, varInstances) {
        let stringio = "";
        for (let key of transformationKeys) {
            stringio = stringio + fulfilledQuery[key];
        }
        varInstances.add(stringio);
        return varInstances;
    }
    static checkIfResultsWillBeTooLarge(varInstances) {
        return varInstances.size > 5000;
    }
}
exports.default = default_1;
//# sourceMappingURL=RowTController.js.map