"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTickMethod = exports.getTickMethod = void 0;
var cat_1 = require("./cat");
var d3_linear_1 = require("./d3-linear");
var linear_1 = require("./linear");
var log_1 = require("./log");
var pow_1 = require("./pow");
var quantile_1 = require("./quantile");
var r_prettry_1 = require("./r-prettry");
var register_1 = require("./register");
Object.defineProperty(exports, "getTickMethod", { enumerable: true, get: function () { return register_1.getTickMethod; } });
Object.defineProperty(exports, "registerTickMethod", { enumerable: true, get: function () { return register_1.registerTickMethod; } });
var time_1 = require("./time");
var time_cat_1 = require("./time-cat");
var time_pretty_1 = require("./time-pretty");
register_1.registerTickMethod('cat', cat_1.default);
register_1.registerTickMethod('time-cat', time_cat_1.default);
register_1.registerTickMethod('wilkinson-extended', linear_1.default);
register_1.registerTickMethod('r-pretty', r_prettry_1.default);
register_1.registerTickMethod('time', time_1.default);
register_1.registerTickMethod('time-pretty', time_pretty_1.default);
register_1.registerTickMethod('log', log_1.default);
register_1.registerTickMethod('pow', pow_1.default);
register_1.registerTickMethod('quantile', quantile_1.default);
register_1.registerTickMethod('d3-linear', d3_linear_1.default);
//# sourceMappingURL=index.js.map