"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _tslib = require("tslib");

var d3Force = _interopRequireWildcard(require("d3-force"));

var _isArray = _interopRequireDefault(require("@antv/util/lib/is-array"));

var _isFunction = _interopRequireDefault(require("@antv/util/lib/is-function"));

var _isNumber = _interopRequireDefault(require("@antv/util/lib/is-number"));

var _mix = _interopRequireDefault(require("@antv/util/lib/mix"));

var _layout = require("./layout");

var _layoutConst = require("./worker/layoutConst");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * @fileOverview random layout
 * @author shiwu.wyy@antfin.com
 */

/**
 * ?????????????????? force-directed
 */
var ForceLayout =
/** @class */
function (_super) {
  (0, _tslib.__extends)(ForceLayout, _super);

  function ForceLayout() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    /** ?????????????????? */


    _this.center = [0, 0];
    /** ??????????????? */

    _this.nodeStrength = null;
    /** ???????????????, ????????????????????????????????????????????? */

    _this.edgeStrength = null;
    /** ?????????????????????????????? */

    _this.preventOverlap = false;
    /** ??????????????? */

    _this.linkDistance = 50;
    /** ???????????????????????? [0, 1]???0.028 ???????????????????????? 300 */

    _this.alphaDecay = 0.028;
    /** ????????????????????? */

    _this.alphaMin = 0.001;
    /** ???????????? */

    _this.alpha = 0.3;
    /** ???????????????????????? */

    _this.collideStrength = 1;
    /** ????????????web worker???????????????web worker??????????????????????????????	*/

    _this.workerEnabled = false;

    _this.tick = function () {};
    /** ?????????????????? */


    _this.onLayoutEnd = function () {};
    /** ???????????????????????????????????? */


    _this.onTick = function () {};
    /** ?????????????????? */


    _this.ticking = undefined;
    return _this;
  }

  ForceLayout.prototype.getDefaultCfg = function () {
    return {
      center: [0, 0],
      nodeStrength: null,
      edgeStrength: null,
      preventOverlap: false,
      nodeSize: undefined,
      nodeSpacing: undefined,
      linkDistance: 50,
      forceSimulation: null,
      alphaDecay: 0.028,
      alphaMin: 0.001,
      alpha: 0.3,
      collideStrength: 1,
      tick: function tick() {},
      onLayoutEnd: function onLayoutEnd() {},
      onTick: function onTick() {},
      // ????????????web worker???????????????web worker??????????????????????????????
      workerEnabled: false
    };
  };
  /**
   * ?????????
   * @param {object} data ??????
   */


  ForceLayout.prototype.init = function (data) {
    var self = this;
    self.nodes = data.nodes || [];
    var edges = data.edges || [];
    self.edges = edges.map(function (edge) {
      var res = {};
      var expectKeys = ['targetNode', 'sourceNode', 'startPoint', 'endPoint'];
      Object.keys(edge).forEach(function (key) {
        if (!(expectKeys.indexOf(key) > -1)) {
          res[key] = edge[key];
        }
      });
      return res;
    });
    self.ticking = false;
  };
  /**
   * ????????????
   */


  ForceLayout.prototype.execute = function () {
    var self = this;
    var nodes = self.nodes;
    var edges = self.edges; // ???????????????????????????????????????

    if (self.ticking) {
      return;
    }

    var simulation = self.forceSimulation;
    var alphaMin = self.alphaMin;
    var alphaDecay = self.alphaDecay;
    var alpha = self.alpha;

    if (!simulation) {
      try {
        // ??????????????????
        var nodeForce = d3Force.forceManyBody();

        if (self.nodeStrength) {
          nodeForce.strength(self.nodeStrength);
        }

        simulation = d3Force.forceSimulation().nodes(nodes).force('center', d3Force.forceCenter(self.center[0], self.center[1])).force('charge', nodeForce).alpha(alpha).alphaDecay(alphaDecay).alphaMin(alphaMin);

        if (self.preventOverlap) {
          self.overlapProcess(simulation);
        } // ??????????????????????????????


        if (edges) {
          // d3 ??? forceLayout ???????????????????????????????????????????????????????????????
          var edgeForce = d3Force.forceLink().id(function (d) {
            return d.id;
          }).links(edges);

          if (self.edgeStrength) {
            edgeForce.strength(self.edgeStrength);
          }

          if (self.linkDistance) {
            edgeForce.distance(self.linkDistance);
          }

          simulation.force('link', edgeForce);
        }

        if (self.workerEnabled && !isInWorker()) {
          // ?????????????????????web worker????????????web worker??????
          self.workerEnabled = false;
          console.warn('workerEnabled option is only supported when running in web worker.');
        }

        if (!self.workerEnabled) {
          simulation.on('tick', function () {
            self.tick();
          }).on('end', function () {
            self.ticking = false;

            if (self.onLayoutEnd) {
              self.onLayoutEnd();
            }
          });
          self.ticking = true;
        } else {
          // worker is enabled
          simulation.stop();
          var totalTicks = getSimulationTicks(simulation);

          for (var currentTick = 1; currentTick <= totalTicks; currentTick++) {
            simulation.tick(); // currentTick starts from 1.

            postMessage({
              type: _layoutConst.LAYOUT_MESSAGE.TICK,
              currentTick: currentTick,
              totalTicks: totalTicks,
              nodes: nodes
            }, undefined);
          }

          self.ticking = false;
        }

        self.forceSimulation = simulation;
        self.ticking = true;
      } catch (e) {
        self.ticking = false;
        console.warn(e);
      }
    } else {
      if (self.preventOverlap) {
        self.overlapProcess(simulation);
      }

      simulation.alpha(alpha).restart();
      this.ticking = true;
    }
  };
  /**
   * ????????????
   * @param {object} simulation ???????????????
   */


  ForceLayout.prototype.overlapProcess = function (simulation) {
    var self = this;
    var nodeSize = self.nodeSize;
    var nodeSpacing = self.nodeSpacing;
    var nodeSizeFunc;
    var nodeSpacingFunc;
    var collideStrength = self.collideStrength;

    if ((0, _isNumber.default)(nodeSpacing)) {
      nodeSpacingFunc = function nodeSpacingFunc() {
        return nodeSpacing;
      };
    } else if ((0, _isFunction.default)(nodeSpacing)) {
      nodeSpacingFunc = nodeSpacing;
    } else {
      nodeSpacingFunc = function nodeSpacingFunc() {
        return 0;
      };
    }

    if (!nodeSize) {
      nodeSizeFunc = function nodeSizeFunc(d) {
        if (d.size) {
          if ((0, _isArray.default)(d.size)) {
            var res = d.size[0] > d.size[1] ? d.size[0] : d.size[1];
            return res / 2 + nodeSpacingFunc(d);
          }

          return d.size / 2 + nodeSpacingFunc(d);
        }

        return 10 + nodeSpacingFunc(d);
      };
    } else if ((0, _isFunction.default)(nodeSize)) {
      nodeSizeFunc = function nodeSizeFunc(d) {
        var size = nodeSize(d);
        return size + nodeSpacingFunc(d);
      };
    } else if ((0, _isArray.default)(nodeSize)) {
      var larger = nodeSize[0] > nodeSize[1] ? nodeSize[0] : nodeSize[1];
      var radius_1 = larger / 2;

      nodeSizeFunc = function nodeSizeFunc(d) {
        return radius_1 + nodeSpacingFunc(d);
      };
    } else if ((0, _isNumber.default)(nodeSize)) {
      var radius_2 = nodeSize / 2;

      nodeSizeFunc = function nodeSizeFunc(d) {
        return radius_2 + nodeSpacingFunc(d);
      };
    } else {
      nodeSizeFunc = function nodeSizeFunc() {
        return 10;
      };
    } // forceCollide's parameter is a radius


    simulation.force('collisionForce', d3Force.forceCollide(nodeSizeFunc).strength(collideStrength));
  };
  /**
   * ???????????????????????????????????????
   * @param {object} cfg ????????????????????????
   */


  ForceLayout.prototype.updateCfg = function (cfg) {
    var self = this;

    if (self.ticking) {
      self.forceSimulation.stop();
      self.ticking = false;
    }

    self.forceSimulation = null;
    (0, _mix.default)(self, cfg);
  };

  ForceLayout.prototype.destroy = function () {
    var self = this;

    if (self.ticking) {
      self.forceSimulation.stop();
      self.ticking = false;
    }

    self.nodes = null;
    self.edges = null;
    self.destroyed = true;
  };

  return ForceLayout;
}(_layout.BaseLayout);

var _default = ForceLayout; // Return total ticks of d3-force simulation

exports.default = _default;

function getSimulationTicks(simulation) {
  var alphaMin = simulation.alphaMin();
  var alphaTarget = simulation.alphaTarget();
  var alpha = simulation.alpha();
  var totalTicksFloat = Math.log((alphaMin - alphaTarget) / (alpha - alphaTarget)) / Math.log(1 - simulation.alphaDecay());
  var totalTicks = Math.ceil(totalTicksFloat);
  return totalTicks;
} // ?????????????????????web worker???


function isInWorker() {
  // eslint-disable-next-line no-undef
  return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
}