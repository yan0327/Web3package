import { head, indexOf, size, last } from '@antv/util';
export var DEFAULT_Q = [1, 5, 2, 2.5, 4, 3];
export var ALL_Q = [1, 5, 2, 2.5, 4, 3, 1.5, 7, 6, 8, 9];
var eps = Number.EPSILON * 100;
function mod(n, m) {
    return ((n % m) + m) % m;
}
function simplicity(q, Q, j, lmin, lmax, lstep) {
    var n = size(Q);
    var i = indexOf(Q, q);
    var v = 0;
    var m = mod(lmin, lstep);
    if ((m < eps || lstep - m < eps) && lmin <= 0 && lmax >= 0) {
        v = 1;
    }
    return 1 - i / (n - 1) - j + v;
}
function simplicityMax(q, Q, j) {
    var n = size(Q);
    var i = indexOf(Q, q);
    var v = 1;
    return 1 - i / (n - 1) - j + v;
}
function density(k, m, dMin, dMax, lMin, lMax) {
    var r = (k - 1) / (lMax - lMin);
    var rt = (m - 1) / (Math.max(lMax, dMax) - Math.min(dMin, lMin));
    return 2 - Math.max(r / rt, rt / r);
}
function densityMax(k, m) {
    if (k >= m) {
        return 2 - (k - 1) / (m - 1);
    }
    return 1;
}
function coverage(dMin, dMax, lMin, lMax) {
    var range = dMax - dMin;
    return 1 - (0.5 * (Math.pow((dMax - lMax), 2) + Math.pow((dMin - lMin), 2))) / Math.pow((0.1 * range), 2);
}
function coverageMax(dMin, dMax, span) {
    var range = dMax - dMin;
    if (span > range) {
        var half = (span - range) / 2;
        return 1 - Math.pow(half, 2) / Math.pow((0.1 * range), 2);
    }
    return 1;
}
function legibility() {
    return 1;
}
// 解决 js 计算精度问题
function pretty(n) {
    return n < 1e-15 ? n : parseFloat(n.toFixed(15));
}
/**
 * An Extension of Wilkinson's Algorithm for Position Tick Labels on Axes
 * https://www.yuque.com/preview/yuque/0/2019/pdf/185317/1546999150858-45c3b9c2-4e86-4223-bf1a-8a732e8195ed.pdf
 * @param dMin 最小值
 * @param dMax 最大值
 * @param m tick个数
 * @param onlyLoose 是否允许扩展min、max，不绝对强制，例如[3, 97]
 * @param Q nice numbers集合
 * @param w 四个优化组件的权重
 */
export default function extended(dMin, dMax, m, onlyLoose, Q, w) {
    if (m === void 0) { m = 5; }
    if (onlyLoose === void 0) { onlyLoose = true; }
    if (Q === void 0) { Q = DEFAULT_Q; }
    if (w === void 0) { w = [0.25, 0.2, 0.5, 0.05]; }
    // nan 也会导致异常
    if (Number.isNaN(dMin) || Number.isNaN(dMax) || typeof dMin !== 'number' || typeof dMax !== 'number' || !m) {
        return {
            min: 0,
            max: 0,
            ticks: [],
        };
    }
    // js 极大值极小值问题，差值小于 1e-15 会导致计算出错
    if (dMax - dMin < 1e-15 || m === 1) {
        return {
            min: dMin,
            max: dMax,
            ticks: [dMin],
        };
    }
    var best = {
        score: -2,
        lmin: 0,
        lmax: 0,
        lstep: 0,
    };
    var j = 1;
    while (j < Infinity) {
        for (var i_1 = 0; i_1 < Q.length; i_1 += 1) {
            var q = Q[i_1];
            var sm = simplicityMax(q, Q, j);
            if (w[0] * sm + w[1] + w[2] + w[3] < best.score) {
                j = Infinity;
                break;
            }
            var k = 2;
            while (k < Infinity) {
                var dm = densityMax(k, m);
                if (w[0] * sm + w[1] + w[2] * dm + w[3] < best.score) {
                    break;
                }
                var delta = (dMax - dMin) / (k + 1) / j / q;
                var z = Math.ceil(Math.log10(delta));
                while (z < Infinity) {
                    var step = j * q * Math.pow(10, z);
                    var cm = coverageMax(dMin, dMax, step * (k - 1));
                    if (w[0] * sm + w[1] * cm + w[2] * dm + w[3] < best.score) {
                        break;
                    }
                    var minStart = Math.floor(dMax / step) * j - (k - 1) * j;
                    var maxStart = Math.ceil(dMin / step) * j;
                    if (minStart > maxStart) {
                        z += 1;
                        // eslint-disable-next-line no-continue
                        continue;
                    }
                    for (var start = minStart; start <= maxStart; start += 1) {
                        var lMin = start * (step / j);
                        var lMax = lMin + step * (k - 1);
                        var lStep = step;
                        var s = simplicity(q, Q, j, lMin, lMax, lStep);
                        var c = coverage(dMin, dMax, lMin, lMax);
                        var g = density(k, m, dMin, dMax, lMin, lMax);
                        var l = legibility();
                        var score = w[0] * s + w[1] * c + w[2] * g + w[3] * l;
                        if (score > best.score && (!onlyLoose || (lMin <= dMin && lMax >= dMax))) {
                            best.lmin = lMin;
                            best.lmax = lMax;
                            best.lstep = lStep;
                            best.score = score;
                        }
                    }
                    z += 1;
                }
                k += 1;
            }
        }
        j += 1;
    }
    var size = Math.floor((best.lmax - best.lmin) / best.lstep);
    var ticks = new Array(size);
    var i = 0;
    for (var tick = best.lmin; tick <= best.lmax; tick += best.lstep) {
        ticks[i] = pretty(tick);
        i += 1;
    }
    return {
        min: Math.min(dMin, head(ticks)),
        max: Math.max(dMax, last(ticks)),
        ticks: ticks,
    };
}
//# sourceMappingURL=extended.js.map