export default class RowTController {
    public static getTransformationKeys(query: any) {
        const result = [];
        let keys = query["GROUP"];
        for (let key of keys) {
            result.push(key);
        }
        return result;
    }

    public static varCount(fulfilledQuery: any, transformationKeys: any, varInstances: any) {
        let stringio = "";
        for (let key of transformationKeys) {
            stringio = stringio + fulfilledQuery[key];
        }
        varInstances.add(stringio);
        return varInstances;
    }

    public static checkIfResultsWillBeTooLarge(varInstances: any) {
        return varInstances.size > 5000;
    }
}
