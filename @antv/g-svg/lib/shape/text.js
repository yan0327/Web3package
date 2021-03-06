"use strict";
/**
 * @fileoverview text
 * @author dengfuping_develop@163.com
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var util_1 = require("@antv/util");
var detect_browser_1 = require("detect-browser");
var svg_1 = require("../util/svg");
var constant_1 = require("../constant");
var base_1 = require("./base");
var LETTER_SPACING = 0.3;
var BASELINE_MAP = {
    top: 'before-edge',
    middle: 'central',
    bottom: 'after-edge',
    alphabetic: 'baseline',
    hanging: 'hanging',
};
// for FireFox
var BASELINE_MAP_FOR_FIREFOX = {
    top: 'text-before-edge',
    middle: 'central',
    bottom: 'text-after-edge',
    alphabetic: 'alphabetic',
    hanging: 'hanging',
};
var ANCHOR_MAP = {
    left: 'left',
    start: 'left',
    center: 'middle',
    right: 'end',
    end: 'end',
};
var Text = /** @class */ (function (_super) {
    tslib_1.__extends(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'text';
        _this.canFill = true;
        _this.canStroke = true;
        return _this;
    }
    Text.prototype.getDefaultAttrs = function () {
        var attrs = _super.prototype.getDefaultAttrs.call(this);
        return tslib_1.__assign(tslib_1.__assign({}, attrs), { x: 0, y: 0, text: null, fontSize: 12, fontFamily: 'sans-serif', fontStyle: 'normal', fontWeight: 'normal', fontVariant: 'normal', textAlign: 'start', textBaseline: 'bottom' });
    };
    Text.prototype.createPath = function (context, targetAttrs) {
        var _this = this;
        var attrs = this.attr();
        var el = this.get('el');
        this._setFont();
        util_1.each(targetAttrs || attrs, function (value, attr) {
            if (attr === 'text') {
                _this._setText("" + value);
            }
            else if (attr === 'matrix' && value) {
                svg_1.setTransform(_this);
            }
            else if (constant_1.SVG_ATTR_MAP[attr]) {
                el.setAttribute(constant_1.SVG_ATTR_MAP[attr], value);
            }
        });
        el.setAttribute('paint-order', 'stroke');
        el.setAttribute('style', 'stroke-linecap:butt; stroke-linejoin:miter;');
    };
    Text.prototype._setFont = function () {
        var el = this.get('el');
        var _a = this.attr(), textBaseline = _a.textBaseline, textAlign = _a.textAlign;
        var browser = detect_browser_1.detect();
        if (browser && browser.name === 'firefox') {
            // compatible with FireFox browser, ref: https://github.com/antvis/g/issues/119
            el.setAttribute('dominant-baseline', BASELINE_MAP_FOR_FIREFOX[textBaseline] || 'alphabetic');
        }
        else {
            el.setAttribute('alignment-baseline', BASELINE_MAP[textBaseline] || 'baseline');
        }
        el.setAttribute('text-anchor', ANCHOR_MAP[textAlign] || 'left');
    };
    Text.prototype._setText = function (text) {
        var el = this.get('el');
        var _a = this.attr(), x = _a.x, _b = _a.textBaseline, baseline = _b === void 0 ? 'bottom' : _b;
        if (!text) {
            el.innerHTML = '';
        }
        else if (~text.indexOf('\n')) {
            var textArr = text.split('\n');
            var textLen_1 = textArr.length - 1;
            var arr_1 = '';
            util_1.each(textArr, function (segment, i) {
                if (i === 0) {
                    if (baseline === 'alphabetic') {
                        arr_1 += "<tspan x=\"" + x + "\" dy=\"" + -textLen_1 + "em\">" + segment + "</tspan>";
                    }
                    else if (baseline === 'top') {
                        arr_1 += "<tspan x=\"" + x + "\" dy=\"0.9em\">" + segment + "</tspan>";
                    }
                    else if (baseline === 'middle') {
                        arr_1 += "<tspan x=\"" + x + "\" dy=\"" + -(textLen_1 - 1) / 2 + "em\">" + segment + "</tspan>";
                    }
                    else if (baseline === 'bottom') {
                        arr_1 += "<tspan x=\"" + x + "\" dy=\"-" + (textLen_1 + LETTER_SPACING) + "em\">" + segment + "</tspan>";
                    }
                    else if (baseline === 'hanging') {
                        arr_1 += "<tspan x=\"" + x + "\" dy=\"" + (-(textLen_1 - 1) - LETTER_SPACING) + "em\">" + segment + "</tspan>";
                    }
                }
                else {
                    arr_1 += "<tspan x=\"" + x + "\" dy=\"1em\">" + segment + "</tspan>";
                }
            });
            el.innerHTML = arr_1;
        }
        else {
            el.innerHTML = text;
        }
    };
    return Text;
}(base_1.default));
exports.default = Text;
//# sourceMappingURL=text.js.map