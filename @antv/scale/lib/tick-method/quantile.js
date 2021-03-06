"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 计算几分位 https://github.com/simple-statistics/simple-statistics/blob/master/src/quantile_sorted.js
 * @param x  数组
 * @param p  百分比
 */
function quantileSorted(x, p) {
    var idx = x.length * p;
    /*if (x.length === 0) { // 当前场景这些条件不可能命中
      throw new Error('quantile requires at least one value.');
    } else if (p < 0 || p > 1) {
      throw new Error('quantiles must be between 0 and 1');
    } else */
    if (p === 1) {
        // If p is 1, directly return the last element
        return x[x.length - 1];
    }
    else if (p === 0) {
        // If p is 0, directly return the first element
        return x[0];
    }
    else if (idx % 1 !== 0) {
        // If p is not integer, return the next element in array
        return x[Math.ceil(idx) - 1];
    }
    else if (x.length % 2 === 0) {
        // If the list has even-length, we'll take the average of this number
        // and the next value, if there is one
        return (x[idx - 1] + x[idx]) / 2;
    }
    else {
        // Finally, in the simple case of an integer value
        // with an odd-length list, return the x value at the index.
        return x[idx];
    }
}
function calculateTicks(cfg) {
    var tickCount = cfg.tickCount, values = cfg.values;
    if (!values || !values.length) {
        return [];
    }
    var sorted = values.slice().sort(function (a, b) {
        return a - b;
    });
    var ticks = [];
    for (var i = 0; i < tickCount; i++) {
        var p = i / (tickCount - 1);
        ticks.push(quantileSorted(sorted, p));
    }
    return ticks;
}
exports.default = calculateTicks;
//# sourceMappingURL=quantile.js.map