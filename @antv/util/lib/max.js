"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var is_array_1 = require("./is-array");
/**
 * @param {Array} arr The array to iterate over.
 * @return {*} Returns the maximum value.
 * @example
 *
 * max([1, 2]);
 * // => 2
 *
 * max([]);
 * // => undefined
 *
 * const data = new Array(1250010).fill(1).map((d,idx) => idx);
 *
 * max(data);
 * // => 1250010
 * // Math.max(...data) will encounter "Maximum call stack size exceeded" error
 */
exports.default = (function (arr) {
    if (!is_array_1.default(arr)) {
        return undefined;
    }
    return arr.reduce(function (prev, curr) {
        return Math.max(prev, curr);
    }, arr[0]);
});
//# sourceMappingURL=max.js.map