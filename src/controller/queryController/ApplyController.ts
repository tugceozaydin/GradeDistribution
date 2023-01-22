import Decimal from "decimal.js";

export default class {

    public static countFulfill(sectionGroup: any, fieldKey: any) {
        const uniq = new Set();
        for (let section of sectionGroup) {
            uniq.add(section[fieldKey]);
        }
        const results = Array.from(uniq);
        return Number(results.length);
    }

    public static sumFulfill(sectionGroup: any, key: any) {
        let sum = 0;
        for (let section of sectionGroup) {
            sum += section[key];
        }
        return Number(sum.toFixed(2));
    }

    public static averageFulfill(sectionGroup: any, key: any) {
        let sum = new Decimal(0);
        for (let section of sectionGroup) {
            let toBeAdded = section[key];
            sum = new Decimal(sum).plus(toBeAdded);
        }
        let avg = (sum.toNumber() / sectionGroup.length);
        return Number(avg.toFixed(2));
    }

    public static maxFulfill(sectionGroup: any, key: any) {
        let max = sectionGroup[0][key];
        for (let section of sectionGroup) {
            if (section[key] > max) {
                max = section[key];
            }
        }
        return Number(max);
    }

    public static minFulfill(sectionGroup: any, key: any) {
        let min = sectionGroup[0][key];
        for (let section of sectionGroup) {
            if (section[key] < min) {
                min = section[key];
            }
        }
        return Number(min);
    }
}
