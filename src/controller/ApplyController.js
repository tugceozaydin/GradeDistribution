"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = require("decimal.js");
class default_1 {
    static countFulfill(sectionGroup, fieldKey) {
        const uniq = new Set();
        for (let section of sectionGroup) {
            uniq.add(section[fieldKey]);
        }
        const results = Array.from(uniq);
        return Number(results.length);
    }
    static sumFulfill(sectionGroup, key) {
        let sum = 0;
        for (let section of sectionGroup) {
            sum += section[key];
        }
        return Number(sum.toFixed(2));
    }
    static averageFulfill(sectionGroup, key) {
        let sum = new decimal_js_1.default(0);
        for (let section of sectionGroup) {
            let toBeAdded = section[key];
            sum = new decimal_js_1.default(sum).plus(toBeAdded);
        }
        let avg = (sum.toNumber() / sectionGroup.length);
        return Number(avg.toFixed(2));
    }
    static maxFulfill(sectionGroup, key) {
        let max = sectionGroup[0][key];
        for (let section of sectionGroup) {
            if (section[key] > max) {
                max = section[key];
            }
        }
        return Number(max);
    }
    static minFulfill(sectionGroup, key) {
        let min = sectionGroup[0][key];
        for (let section of sectionGroup) {
            if (section[key] < min) {
                min = section[key];
            }
        }
        return Number(min);
    }
}
exports.default = default_1;
//# sourceMappingURL=ApplyController.js.map