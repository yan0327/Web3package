import isNumber from '@antv/util/lib/is-number';
import isString from '@antv/util/lib/is-string';
import { formatPadding } from '../../util/base';
import { applyMatrix, invertMatrix } from '../../util/math';
import { mat3 } from '@antv/matrix-util';
import modifyCSS from '@antv/dom-util/lib/modify-css';

var ViewController =
/** @class */
function () {
  function ViewController(graph) {
    this.destroyed = false;
    this.graph = graph;
    this.destroyed = false;
  } // get view center coordinate


  ViewController.prototype.getViewCenter = function () {
    var padding = this.getFormatPadding();
    var graph = this.graph;
    var width = this.graph.get('width');
    var height = graph.get('height');
    return {
      x: (width - padding[2] - padding[3]) / 2 + padding[3],
      y: (height - padding[0] - padding[2]) / 2 + padding[0]
    };
  };

  ViewController.prototype.fitCenter = function () {
    var graph = this.graph;
    var width = graph.get('width');
    var height = graph.get('height');
    var group = graph.get('group');
    group.resetMatrix();
    var bbox = group.getCanvasBBox();
    if (bbox.width === 0 || bbox.height === 0) return;
    var viewCenter = this.getViewCenter();
    var groupCenter = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };
    graph.translate(viewCenter.x - groupCenter.x, viewCenter.y - groupCenter.y);
  }; // fit view graph


  ViewController.prototype.fitView = function () {
    var graph = this.graph;
    var padding = this.getFormatPadding();
    var width = graph.get('width');
    var height = graph.get('height');
    var group = graph.get('group');
    group.resetMatrix();
    var bbox = group.getCanvasBBox();
    if (bbox.width === 0 || bbox.height === 0) return;
    var viewCenter = this.getViewCenter();
    var groupCenter = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };
    graph.translate(viewCenter.x - groupCenter.x, viewCenter.y - groupCenter.y);
    var w = (width - padding[1] - padding[3]) / bbox.width;
    var h = (height - padding[0] - padding[2]) / bbox.height;
    var ratio = w;

    if (w > h) {
      ratio = h;
    }

    graph.zoom(ratio, viewCenter);
  };

  ViewController.prototype.getFormatPadding = function () {
    var padding = this.graph.get('fitViewPadding');
    return formatPadding(padding);
  };

  ViewController.prototype.focusPoint = function (point) {
    var viewCenter = this.getViewCenter();
    var modelCenter = this.getPointByCanvas(viewCenter.x, viewCenter.y);
    var viewportMatrix = this.graph.get('group').getMatrix();
    if (!viewportMatrix) viewportMatrix = mat3.create();
    this.graph.translate((modelCenter.x - point.x) * viewportMatrix[0], (modelCenter.y - point.y) * viewportMatrix[4]);
  };
  /**
   * ??? Canvas ????????????????????????
   * @param canvasX canvas x ??????
   * @param canvasY canvas y ??????
   */


  ViewController.prototype.getPointByCanvas = function (canvasX, canvasY) {
    var viewportMatrix = this.graph.get('group').getMatrix();

    if (!viewportMatrix) {
      viewportMatrix = mat3.create();
    }

    var point = invertMatrix({
      x: canvasX,
      y: canvasY
    }, viewportMatrix);
    return point;
  };
  /**
   * ?????????????????????????????????
   * @param clientX ?????? x ??????
   * @param clientY ?????? y ??????
   */


  ViewController.prototype.getPointByClient = function (clientX, clientY) {
    var canvas = this.graph.get('canvas');
    var canvasPoint = canvas.getPointByClient(clientX, clientY);
    return this.getPointByCanvas(canvasPoint.x, canvasPoint.y);
  };
  /**
   * ?????????????????????????????????
   * @param x ?????? x ??????
   * @param y ?????? y ??????
   */


  ViewController.prototype.getClientByPoint = function (x, y) {
    var canvas = this.graph.get('canvas');
    var canvasPoint = this.getCanvasByPoint(x, y);
    var point = canvas.getClientByPoint(canvasPoint.x, canvasPoint.y); // return { x: point.clientX, y: point.clientY };

    return {
      x: point.x,
      y: point.y
    };
  };
  /**
   * ????????????????????? Canvas ??????
   * @param x ?????? x ??????
   * @param y ?????? y ??????
   */


  ViewController.prototype.getCanvasByPoint = function (x, y) {
    var viewportMatrix = this.graph.get('group').getMatrix();

    if (!viewportMatrix) {
      viewportMatrix = mat3.create();
    }

    return applyMatrix({
      x: x,
      y: y
    }, viewportMatrix);
  };
  /**
   * ??????????????????????????????
   * @param item Item ????????? id
   */


  ViewController.prototype.focus = function (item) {
    if (isString(item)) {
      item = this.graph.findById(item);
    }

    if (item) {
      var group = item.get('group');
      var matrix = group.getMatrix();
      if (!matrix) matrix = mat3.create(); // ????????????????????????model??????x,y,????????????????????????????????????model???x,y??????????????????x,y

      this.focusPoint({
        x: matrix[6],
        y: matrix[7]
      });
    }
  };
  /**
   * ?????? canvas ????????????????????????
   * @param width canvas ??????
   * @param height canvas ??????
   */


  ViewController.prototype.changeSize = function (width, height) {
    var graph = this.graph;

    if (!isNumber(width) || !isNumber(height)) {
      throw Error('invalid canvas width & height, please make sure width & height type is number');
    }

    graph.set({
      width: width,
      height: height
    });
    var canvas = graph.get('canvas');
    canvas.changeSize(width, height); // change the size of grid plugin if it exists on graph

    var plugins = graph.get('plugins');
    plugins.forEach(function (plugin) {
      if (plugin.get('gridContainer')) {
        var minZoom = graph.get('minZoom');
        modifyCSS(plugin.get('container'), {
          width: width + "px",
          height: height + "px"
        });
        modifyCSS(plugin.get('gridContainer'), {
          width: width / minZoom + "px",
          height: height / minZoom + "px",
          left: 0,
          top: 0
        });
      }
    });
  };

  ViewController.prototype.destroy = function () {
    this.graph = null;
    this.destroyed = false;
  };

  return ViewController;
}();

export default ViewController;