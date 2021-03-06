import { __assign, __extends, __spreadArrays } from "tslib";
import EventEmitter from '@antv/event-emitter';
import GCanvas from '@antv/g-canvas/lib/canvas';
import GSVGCanvas from '@antv/g-svg/lib/canvas';
import { mat3 } from '@antv/matrix-util/lib';
import clone from '@antv/util/lib/clone';
import deepMix from '@antv/util/lib/deep-mix';
import each from '@antv/util/lib/each';
import isPlainObject from '@antv/util/lib/is-plain-object';
import isString from '@antv/util/lib/is-string';
import isNumber from '@antv/util/lib/is-number';
import { getAllNodeInGroups } from '../util/group';
import { move } from '../util/math';
import { groupBy } from 'lodash';
import Global from '../global';
import { CustomGroup, EventController, ItemController, LayoutController, ModeController, StateController, ViewController } from './controller';
import createDom from '@antv/dom-util/lib/create-dom';
import { plainCombosToTrees, traverseTree, reconstructTree, traverseTreeUp } from '../util/graphic';
import degree from '../algorithm/degree';
var NODE = 'node';
var SVG = 'svg';
var CANVAS = 'canvas';

var Graph =
/** @class */
function (_super) {
  __extends(Graph, _super);

  function Graph(cfg) {
    var _this = _super.call(this) || this;

    _this.cfg = deepMix(_this.getDefaultCfg(), cfg);

    _this.init();

    _this.animating = false;
    _this.destroyed = false;
    return _this;
  }

  Graph.prototype.init = function () {
    this.initCanvas(); // instance controller

    var eventController = new EventController(this);
    var viewController = new ViewController(this);
    var modeController = new ModeController(this);
    var itemController = new ItemController(this);
    var layoutController = new LayoutController(this);
    var stateController = new StateController(this);
    var customGroupControll = new CustomGroup(this);
    this.set({
      eventController: eventController,
      viewController: viewController,
      modeController: modeController,
      itemController: itemController,
      layoutController: layoutController,
      stateController: stateController,
      customGroupControll: customGroupControll
    });
    this.initPlugin();
  };

  Graph.prototype.initCanvas = function () {
    var container = this.get('container');

    if (isString(container)) {
      container = document.getElementById(container);
      this.set('container', container);
    }

    if (!container) {
      throw new Error('invalid container');
    }

    var width = this.get('width');
    var height = this.get('height');
    var renderer = this.get('renderer');
    var canvas;

    if (renderer === SVG) {
      canvas = new GSVGCanvas({
        container: container,
        width: width,
        height: height
      });
    } else {
      canvas = new GCanvas({
        container: container,
        width: width,
        height: height
      });
    }

    this.set('canvas', canvas);
    this.initGroups();
  };

  Graph.prototype.initPlugin = function () {
    var self = this;
    each(self.get('plugins'), function (plugin) {
      if (!plugin.destroyed && plugin.initPlugin) {
        plugin.initPlugin(self);
      }
    });
  }; // ??????????????? Group


  Graph.prototype.initGroups = function () {
    var canvas = this.get('canvas');
    var el = this.get('canvas').get('el');
    var id = el.id;
    var group = canvas.addGroup({
      id: id + "-root",
      className: Global.rootContainerClassName
    });

    if (this.get('groupByTypes')) {
      var edgeGroup = group.addGroup({
        id: id + "-edge",
        className: Global.edgeContainerClassName
      });
      var nodeGroup = group.addGroup({
        id: id + "-node",
        className: Global.nodeContainerClassName
      });
      var comboGroup = group.addGroup({
        id: id + "-combo",
        className: Global.comboContainerClassName
      }); // ??????????????????????????????

      var customGroup = group.addGroup({
        id: id + "-group",
        className: Global.customGroupContainerClassName
      });
      customGroup.toBack();
      comboGroup.toBack();
      this.set({
        nodeGroup: nodeGroup,
        edgeGroup: edgeGroup,
        customGroup: customGroup,
        comboGroup: comboGroup
      });
    }

    var delegateGroup = group.addGroup({
      id: id + "-delegate",
      className: Global.delegateContainerClassName
    });
    this.set({
      delegateGroup: delegateGroup
    });
    this.set('group', group);
  }; // eslint-disable-next-line class-methods-use-this


  Graph.prototype.getDefaultCfg = function () {
    return {
      /**
       * Container could be dom object or dom id
       */
      container: undefined,

      /**
       * Canvas width
       * unit pixel if undefined force fit width
       */
      width: undefined,

      /**
       * Canvas height
       * unit pixel if undefined force fit height
       */
      height: undefined,

      /**
       * renderer canvas or svg
       * @type {string}
       */
      renderer: 'canvas',

      /**
       * control graph behaviors
       */
      modes: {},

      /**
       * ????????????
       */
      plugins: [],

      /**
       * source data
       */
      data: {},

      /**
       * Fit view padding (client scale)
       */
      fitViewPadding: 10,

      /**
       * Minimum scale size
       */
      minZoom: 0.2,

      /**
       * Maxmum scale size
       */
      maxZoom: 10,

      /**
       *  capture events
       */
      event: true,

      /**
       * group node & edges into different graphic groups
       */
      groupByTypes: true,

      /**
       * determine if it's a directed graph
       */
      directed: false,

      /**
       * when data or shape changed, should canvas draw automatically
       */
      autoPaint: true,

      /**
       * store all the node instances
       */
      nodes: [],

      /**
       * store all the edge instances
       */
      edges: [],

      /**
       * store all the combo instances
       */
      combos: [],

      /**
       * store all the edge instances which are virtual edges related to collapsed combo
       */
      vedges: [],

      /**
       * all the instances indexed by id
       */
      itemMap: {},

      /**
       * ??????????????????????????????????????????????????????
       */
      linkCenter: false,

      /**
       * ????????????????????????data ???????????????????????????????????????????????????
       * defaultNode: {
       *  type: 'rect',
       *  size: [60, 40],
       *  style: {
       *    //... ???????????????
       *  }
       * }
       * ??????????????? { id: 'node', x: 100, y: 100 }
       * ?????????????????????????????? { id: 'node', x: 100, y: 100??? type: 'rect', size: [60, 40] }
       * ??????????????? { id: 'node', x: 100, y: 100, type: 'circle' }
       * ?????????????????????????????? { id: 'node', x: 100, y: 100??? type: 'circle', size: [60, 40] }
       */
      defaultNode: {},

      /**
       * ??????????????????data ??????????????????????????????????????????????????? defaultNode
       */
      defaultEdge: {},

      /**
       * ????????????????????????????????????????????????
       * ?????????
       * const graph = new G6.Graph({
       *  nodeStateStyles: {
       *    selected: { fill: '#ccc', stroke: '#666' },
       *    active: { lineWidth: 2 }
       *  },
       *  ...
       * });
       *
       */
      nodeStateStyles: {},

      /**
       * ???????????????????????????nodeStateStyle
       */
      edgeStateStyles: {},

      /**
       * graph ??????
       */
      states: {},

      /**
       * ????????????????????????
       */
      animate: false,

      /**
       * ????????????,?????? animate ??? true ?????????
       */
      animateCfg: {
        /**
         * ???????????????????????????????????????????????????????????????????????????
         */
        onFrame: undefined,

        /**
         * ????????????(ms)
         */
        duration: 500,

        /**
         * ??????????????????
         */
        easing: 'easeLinear'
      },
      callback: undefined,

      /**
       * group??????
       */
      groupType: 'circle',

      /**
       * group bbox ??????
       * @private
       */
      groupBBoxs: {},

      /**
       * ???groupid?????????????????????
       * @private
       */
      groupNodes: {},

      /**
       * group ??????
       */
      groups: [],

      /**
       * group??????
       */
      groupStyle: {}
    };
  };
  /**
   * ??????????????? this.cfg ????????????
   * @param key ??? ??? ?????????
   * @param val ???
   */


  Graph.prototype.set = function (key, val) {
    if (isPlainObject(key)) {
      this.cfg = Object.assign({}, this.cfg, key);
    } else {
      this.cfg[key] = val;
    }

    return this;
  };
  /**
   * ?????? this.cfg ?????????
   * @param key ???
   */


  Graph.prototype.get = function (key) {
    return this.cfg[key];
  };
  /**
   * ????????????????????????
   * @param {string|Item} item ??????id???????????????
   * @param {string[]} states ??????
   */


  Graph.prototype.clearItemStates = function (item, states) {
    if (isString(item)) {
      item = this.findById(item);
    }

    var itemController = this.get('itemController');
    itemController.clearItemStates(item, states);

    if (!states) {
      states = item.get('states');
    }

    var stateController = this.get('stateController');
    stateController.updateStates(item, states, false);
  };
  /**
   * ????????????????????????????????????????????????????????? keyShape ????????????
   * ??????????????????????????????????????????
   * graph.node(node => {
   *  return {
   *    type: 'rect',
   *    label: node.id,
   *    style: { fill: '#666' },
   *    stateStyles: {
   *       selected: { fill: 'blue' },
   *       custom: { fill: 'green' }
   *     }
   *   }
   * });
   * @param {function} nodeFn ????????????????????????
   */


  Graph.prototype.node = function (nodeFn) {
    if (typeof nodeFn === 'function') {
      this.set('nodeMapper', nodeFn);
    }
  };
  /**
   * ?????????????????????
   * @param {function} edgeFn ????????????????????????,????????? node
   */


  Graph.prototype.edge = function (edgeFn) {
    if (typeof edgeFn === 'function') {
      this.set('edgeMapper', edgeFn);
    }
  };
  /**
   * ???????????? combo ?????????
   * @param comboFn
   */


  Graph.prototype.combo = function (comboFn) {
    if (typeof comboFn === 'function') {
      this.set('comboMapper', comboFn);
    }
  };
  /**
   * ?????? ID ?????????????????????
   * @param id ????????? ID
   */


  Graph.prototype.findById = function (id) {
    return this.get('itemMap')[id];
  };
  /**
   * ????????????????????????????????????
   * @param {ITEM_TYPE} type ????????????(node | edge | group)
   * @param {(item: T, index: number) => T} fn ????????????
   * @return {T} ????????????
   */


  Graph.prototype.find = function (type, fn) {
    var result;
    var items = this.get(type + "s"); // eslint-disable-next-line consistent-return

    each(items, function (item, i) {
      if (fn(item, i)) {
        result = item;
        return result;
      }
    });
    return result;
  };
  /**
   * ?????????????????????????????????
   * @param {string} type ????????????(node|edge)
   * @param {string} fn ????????????
   * @return {array} ????????????
   */


  Graph.prototype.findAll = function (type, fn) {
    var result = [];
    each(this.get(type + "s"), function (item, i) {
      if (fn(item, i)) {
        result.push(item);
      }
    });
    return result;
  };
  /**
   * ???????????????????????????????????????
   * @param {string} type ????????????(node|edge)
   * @param {string} state ??????
   * @return {object} ????????????
   */


  Graph.prototype.findAllByState = function (type, state) {
    return this.findAll(type, function (item) {
      return item.hasState(state);
    });
  };
  /**
   * ????????????
   * @param dx ??????????????????
   * @param dy ??????????????????
   */


  Graph.prototype.translate = function (dx, dy) {
    var group = this.get('group');
    var matrix = clone(group.getMatrix());

    if (!matrix) {
      matrix = mat3.create();
    }

    mat3.translate(matrix, matrix, [dx, dy]);
    group.setMatrix(matrix);
    this.emit('viewportchange', {
      action: 'translate',
      matrix: group.getMatrix()
    });
    this.autoPaint();
  };
  /**
   * ?????????????????????
   * @param {number} x ????????????
   * @param {number} y ????????????
   */


  Graph.prototype.moveTo = function (x, y) {
    var group = this.get('group');
    move(group, {
      x: x,
      y: y
    });
    this.emit('viewportchange', {
      action: 'move',
      matrix: group.getMatrix()
    });
  };
  /**
   * ????????????????????????
   * @param {object} padding ???????????????
   */


  Graph.prototype.fitView = function (padding) {
    if (padding) {
      this.set('fitViewPadding', padding);
    }

    var viewController = this.get('viewController');
    viewController.fitView();
    this.autoPaint();
  };
  /**
   * ???????????????????????????????????????????????? bbox ???????????????????????????
   */


  Graph.prototype.fitCenter = function () {
    var viewController = this.get('viewController');
    viewController.fitCenter();
    this.autoPaint();
  };
  /**
   * ????????????
   * @param {string | ModeOption | ModeType[]} behaviors ???????????????
   * @param {string | string[]} modes ????????????????????????
   * @return {Graph} Graph
   */


  Graph.prototype.addBehaviors = function (behaviors, modes) {
    var modeController = this.get('modeController');
    modeController.manipulateBehaviors(behaviors, modes, true);
    return this;
  };
  /**
   * ????????????
   * @param {string | ModeOption | ModeType[]} behaviors ???????????????
   * @param {string | string[]} modes ???????????????????????????
   * @return {Graph} Graph
   */


  Graph.prototype.removeBehaviors = function (behaviors, modes) {
    var modeController = this.get('modeController');
    modeController.manipulateBehaviors(behaviors, modes, false);
    return this;
  };
  /**
   * ????????????
   * @param ratio ????????????
   * @param center ???center???x, y?????????????????????
   */


  Graph.prototype.zoom = function (ratio, center) {
    var group = this.get('group');
    var matrix = clone(group.getMatrix());
    var minZoom = this.get('minZoom');
    var maxZoom = this.get('maxZoom');

    if (!matrix) {
      matrix = mat3.create();
    }

    if (center) {
      mat3.translate(matrix, matrix, [-center.x, -center.y]);
      mat3.scale(matrix, matrix, [ratio, ratio]);
      mat3.translate(matrix, matrix, [center.x, center.y]);
    } else {
      mat3.scale(matrix, matrix, [ratio, ratio]);
    }

    if (minZoom && matrix[0] < minZoom || maxZoom && matrix[0] > maxZoom) {
      return;
    }

    group.setMatrix(matrix);
    this.emit('viewportchange', {
      action: 'zoom',
      matrix: matrix
    });
    this.autoPaint();
  };
  /**
   * ??????????????????????????????
   * @param {number} toRatio ????????????
   * @param {Point} center ???center???x, y?????????????????????
   */


  Graph.prototype.zoomTo = function (toRatio, center) {
    var ratio = toRatio / this.getZoom();
    this.zoom(ratio, center);
  };
  /**
   * ??????????????????????????????
   * @param {Item} item ????????????
   */


  Graph.prototype.focusItem = function (item) {
    var viewController = this.get('viewController');
    viewController.focus(item);
    this.autoPaint();
  };
  /**
   * ????????????
   * @internal ????????????????????????????????????????????????????????? render ??? paint ??????
   */


  Graph.prototype.autoPaint = function () {
    if (this.get('autoPaint')) {
      this.paint();
    }
  };
  /**
   * ?????????????????????
   */


  Graph.prototype.paint = function () {
    this.emit('beforepaint');
    this.get('canvas').draw();
    this.emit('afterpaint');
  };
  /**
   * ????????????????????????????????????
   * @param {number} clientX ??????x??????
   * @param {number} clientY ??????y??????
   * @return {Point} ????????????
   */


  Graph.prototype.getPointByClient = function (clientX, clientY) {
    var viewController = this.get('viewController');
    return viewController.getPointByClient(clientX, clientY);
  };
  /**
   * ????????????????????????????????????
   * @param {number} x ??????x??????
   * @param {number} y ??????y??????
   * @return {Point} ????????????
   */


  Graph.prototype.getClientByPoint = function (x, y) {
    var viewController = this.get('viewController');
    return viewController.getClientByPoint(x, y);
  };
  /**
   * ????????????????????????????????????
   * @param {number} canvasX ?????? x ??????
   * @param {number} canvasY ?????? y ??????
   * @return {object} ????????????
   */


  Graph.prototype.getPointByCanvas = function (canvasX, canvasY) {
    var viewController = this.get('viewController');
    return viewController.getPointByCanvas(canvasX, canvasY);
  };
  /**
   * ????????????????????????????????????
   * @param {number} x ?????? x ??????
   * @param {number} y ?????? y ??????
   * @return {object} ????????????
   */


  Graph.prototype.getCanvasByPoint = function (x, y) {
    var viewController = this.get('viewController');
    return viewController.getCanvasByPoint(x, y);
  };
  /**
   * ????????????
   * @param {Item} item ????????????
   */


  Graph.prototype.showItem = function (item) {
    var itemController = this.get('itemController');
    itemController.changeItemVisibility(item, true);
  };
  /**
   * ????????????
   * @param {Item} item ????????????
   */


  Graph.prototype.hideItem = function (item) {
    var itemController = this.get('itemController');
    itemController.changeItemVisibility(item, false);
  };
  /**
   * ????????????
   * @param {string|object} item ??????id???????????????
   */


  Graph.prototype.refreshItem = function (item) {
    var itemController = this.get('itemController');
    itemController.refreshItem(item);
  };
  /**
   * ?????????????????????/?????????????????????
   * @param {boolean} auto ????????????
   */


  Graph.prototype.setAutoPaint = function (auto) {
    var self = this;
    self.set('autoPaint', auto);
    var canvas = self.get('canvas');
    canvas.set('autoDraw', auto);
  };
  /**
   * ????????????
   * @param {Item} item ??????id???????????????
   */


  Graph.prototype.remove = function (item) {
    this.removeItem(item);
  };
  /**
   * ????????????
   * @param {Item} item ??????id???????????????
   */


  Graph.prototype.removeItem = function (item) {
    // ??????item?????????????????????????????????????????????????????????????????????group
    var nodeItem = item;
    if (isString(item)) nodeItem = this.findById(item);

    if (!nodeItem && isString(item)) {
      console.warn('The item to be removed does not exist!');
      var customGroupControll = this.get('customGroupControll');
      customGroupControll.remove(item);
    } else if (nodeItem) {
      var type = '';
      if (nodeItem.getType) type = nodeItem.getType();
      var itemController = this.get('itemController');
      itemController.removeItem(item);

      if (type === 'combo') {
        var newComboTrees = reconstructTree(this.get('comboTrees'));
        this.set('comboTrees', newComboTrees);
      }
    }
  };
  /**
   * ???????????? ??? ????????????
   * @param {string} type ????????????(node | edge | group)
   * @param {ModelConfig} model ??????????????????
   * @return {Item} ????????????
   */


  Graph.prototype.addItem = function (type, model) {
    var itemController = this.get('itemController');

    if (type === 'group') {
      var groupId = model.groupId,
          nodes = model.nodes,
          groupType = model.type,
          zIndex = model.zIndex,
          title = model.title;
      var groupTitle = title;

      if (isString(title)) {
        groupTitle = {
          text: title
        };
      }

      return this.get('customGroupControll').create(groupId, nodes, groupType, zIndex, true, groupTitle);
    }

    if (model.id && this.findById(model.id)) {
      console.warn('This item exists already. Be sure the id is unique.');
      return;
    }

    var item;
    var comboTrees = this.get('comboTrees');
    if (!comboTrees) comboTrees = [];

    if (type === 'combo') {
      var itemMap_1 = this.get('itemMap');
      var foundParent_1 = false;
      comboTrees.forEach(function (ctree) {
        if (foundParent_1) return; // terminate the forEach after the tree containing the item is done

        traverseTreeUp(ctree, function (child) {
          // find the parent
          if (model.parentId === child.id) {
            foundParent_1 = true;

            var newCombo = __assign({
              id: model.id,
              depth: child.depth + 2
            }, model);

            if (child.children) child.children.push(newCombo);else child.children = [newCombo];
            model.depth = newCombo.depth;
            item = itemController.addItem(type, model);
          }

          var childItem = itemMap_1[child.id]; // after the parent is found, update all the ancestors

          if (foundParent_1 && childItem && childItem.getType && childItem.getType() === 'combo') {
            itemController.updateCombo(childItem, child.children);
          }

          return true;
        });
      }); // if the parent is not found, add it to the root

      if (!foundParent_1) {
        var newCombo = __assign({
          id: model.id,
          depth: 0
        }, model);

        model.depth = newCombo.depth;
        comboTrees.push(newCombo);
        item = itemController.addItem(type, model);
      }

      this.set('comboTrees', comboTrees);
    } else if (type === 'node' && isString(model.comboId) && comboTrees) {
      var parentCombo = this.findById(model.comboId);

      if (parentCombo && parentCombo.getType && parentCombo.getType() !== 'combo') {
        console.warn("'" + model.comboId + "' is a not id of a combo in the graph, the node will be added without combo.");
        return;
      }

      item = itemController.addItem(type, model);
      var itemMap_2 = this.get('itemMap');
      var foundParent_2 = false,
          foundNode_1 = false;
      comboTrees && comboTrees.forEach(function (ctree) {
        if (foundNode_1 || foundParent_2) return; // terminate the forEach

        traverseTreeUp(ctree, function (child) {
          if (child.id === model.id) {
            // if the item exists in the tree already, terminate
            foundNode_1 = true;
            return false;
          }

          if (model.comboId === child.id && !foundNode_1) {
            // found the parent, add the item to the children of its parent in the tree
            foundParent_2 = true;
            var cloneNode = clone(model);
            cloneNode.itemType = 'node';
            if (child.children) child.children.push(cloneNode);else child.children = [cloneNode];
            model.depth = child.depth + 1;
          } // update the size of all the ancestors


          if (foundParent_2 && itemMap_2[child.id].getType && itemMap_2[child.id].getType() === 'combo') {
            itemController.updateCombo(itemMap_2[child.id], child.children);
          }

          return true;
        });
      });
    } else {
      item = itemController.addItem(type, model);
    }

    if (type === 'node' && model.comboId || type === 'combo' && model.parentId) {
      // add the combo to the parent's children array
      var parentCombo = this.findById(model.comboId || model.parentId);
      if (parentCombo) parentCombo.addChild(item);
    }

    var combos = this.get('combos');

    if (combos && combos.length > 0) {
      this.sortCombos();
    }

    this.autoPaint();
    return item;
  };

  Graph.prototype.add = function (type, model) {
    return this.addItem(type, model);
  };
  /**
   * ????????????
   * @param {Item} item ??????id???????????????
   * @param {Partial<NodeConfig> | EdgeConfig} cfg ?????????????????????
   */


  Graph.prototype.updateItem = function (item, cfg) {
    var _this = this;

    var itemController = this.get('itemController');
    var currentItem;

    if (isString(item)) {
      currentItem = this.findById(item);
    } else {
      currentItem = item;
    }

    var type = '';
    if (currentItem.getType) type = currentItem.getType();

    var states = __spreadArrays(currentItem.getStates());

    if (type === 'combo') {
      each(states, function (state) {
        return _this.setItemState(currentItem, state, false);
      });
    }

    itemController.updateItem(currentItem, cfg);

    if (type === 'combo') {
      each(states, function (state) {
        return _this.setItemState(currentItem, state, true);
      });
    }
  };
  /**
   * ????????????
   * @param {Item} item ??????id???????????????
   * @param {Partial<NodeConfig> | EdgeConfig} cfg ?????????????????????
   */


  Graph.prototype.update = function (item, cfg) {
    this.updateItem(item, cfg);
  };
  /**
   * ??????????????????
   * @param {Item} item ??????id???????????????
   * @param {string} state ????????????
   * @param {string | boolean} value ?????????????????? ??? ?????????
   */


  Graph.prototype.setItemState = function (item, state, value) {
    if (isString(item)) {
      item = this.findById(item);
    }

    var itemController = this.get('itemController');
    itemController.setItemState(item, state, value);
    var stateController = this.get('stateController');

    if (isString(value)) {
      stateController.updateState(item, state + ":" + value, true);
    } else {
      stateController.updateState(item, state, value);
    }
  };
  /**
   * ???????????????????????????
   * @param {GraphData} data ???????????????
   */


  Graph.prototype.data = function (data) {
    this.set('data', data);
  };
  /**
   * ??????data???????????????????????????
   */


  Graph.prototype.render = function () {
    var self = this;
    var data = this.get('data');

    if (!data) {
      throw new Error('data must be defined first');
    }

    var _a = data.nodes,
        nodes = _a === void 0 ? [] : _a,
        _b = data.edges,
        edges = _b === void 0 ? [] : _b,
        _c = data.combos,
        combos = _c === void 0 ? [] : _c;
    this.clear();
    this.emit('beforerender');
    each(nodes, function (node) {
      self.add('node', node);
    }); // process the data to tree structure

    if (combos && combos.length !== 0) {
      var comboTrees = plainCombosToTrees(combos, nodes);
      this.set('comboTrees', comboTrees); // add combos

      self.addCombos(combos);
    }

    each(edges, function (edge) {
      self.add('edge', edge);
    }); // layout

    var layoutController = self.get('layoutController');

    if (!layoutController.layout(success)) {
      success();
    }

    function success() {
      if (self.get('fitView')) {
        self.fitView();
      } else if (self.get('fitCenter')) {
        self.fitCenter();
      }

      self.autoPaint();
      self.emit('afterrender');
    }

    if (!this.get('groupByTypes')) {
      if (combos && combos.length !== 0) {
        this.sortCombos();
      } else {
        // ????????????????????????????????????????????????
        if (data.nodes && data.edges && data.nodes.length < data.edges.length) {
          var nodesArr = this.getNodes(); // ?????????????????????????????????????????????

          nodesArr.forEach(function (node) {
            node.toFront();
          });
        } else {
          var edgesArr = this.getEdges(); // ?????????????????????????????????????????????

          edgesArr.forEach(function (edge) {
            edge.toBack();
          });
        }
      }
    } // ??????????????????????????????nodes


    if (data.nodes) {
      // ???????????????groupID???node
      var nodeInGroup = data.nodes.filter(function (node) {
        return node.groupId;
      }); // ??????node?????????groupID????????????????????????

      if (nodeInGroup.length > 0) {
        // ????????????
        var groupType = self.get('groupType');
        this.renderCustomGroup(data, groupType);
      }
    }
  };
  /**
   * ????????????????????????
   * @Param {Object} data ???????????????
   */


  Graph.prototype.read = function (data) {
    this.data(data);
    this.render();
  }; // ??????item


  Graph.prototype.diffItems = function (type, items, models) {
    var self = this;
    var item;
    var itemMap = this.get('itemMap');
    each(models, function (model) {
      item = itemMap[model.id];

      if (item) {
        if (self.get('animate') && type === NODE) {
          var containerMatrix = item.getContainer().getMatrix();
          if (!containerMatrix) containerMatrix = mat3.create();
          item.set('originAttrs', {
            x: containerMatrix[6],
            y: containerMatrix[7]
          });
        }

        self.updateItem(item, model);
      } else {
        item = self.addItem(type, model);
      }

      items[type + "s"].push(item);
    });
  };
  /**
   * ???????????????????????????????????????????????????
   * @param {object} data ?????????
   * @return {object} this
   */


  Graph.prototype.changeData = function (data) {
    var self = this;

    if (!data) {
      return this;
    } // ???????????????????????????????????????


    this.getNodes().map(function (node) {
      return self.clearItemStates(node);
    });
    this.getEdges().map(function (edge) {
      return self.clearItemStates(edge);
    });
    var canvas = this.get('canvas');
    var localRefresh = canvas.get('localRefresh');
    canvas.set('localRefresh', false);

    if (!self.get('data')) {
      self.data(data);
      self.render();
    }

    var itemMap = this.get('itemMap');
    var items = {
      nodes: [],
      edges: []
    };
    var combosData = data.combos;

    if (combosData) {
      var comboTrees = plainCombosToTrees(combosData, data.nodes);
      this.set('comboTrees', comboTrees);
    }

    this.diffItems('node', items, data.nodes);
    this.diffItems('edge', items, data.edges);
    each(itemMap, function (item, id) {
      itemMap[id].getModel().depth = 0;

      if (item.getType && item.getType() === 'combo') {
        delete itemMap[id];
        item.destroy();
      } else if (items.nodes.indexOf(item) < 0 && items.edges.indexOf(item) < 0) {
        delete itemMap[id];
        self.remove(item);
      }
    }); // clear the destroyed combos here to avoid removing sub nodes before removing the parent combo

    var comboItems = this.getCombos();
    var combosLength = comboItems.length;

    for (var i = combosLength - 1; i >= 0; i--) {
      if (comboItems[i].destroyed) {
        comboItems.splice(i, 1);
      }
    } // process the data to tree structure


    if (combosData) {
      // add combos
      self.addCombos(combosData);
      if (!this.get('groupByTypes')) this.sortCombos();
    }

    this.set({
      nodes: items.nodes,
      edges: items.edges
    });
    var layoutController = this.get('layoutController');
    layoutController.changeData();

    if (self.get('animate') && !layoutController.getLayoutType()) {
      // ????????????????????????
      self.positionsAnimate();
    } else {
      self.autoPaint();
    }

    setTimeout(function () {
      canvas.set('localRefresh', localRefresh);
    }, 16);
    return this;
  };
  /**
   * ?????????????????? render ??? changeData ????????????????????????????????????????????? combos
   * @param {ComboConfig[]} combos ????????? combos ??????
   */


  Graph.prototype.addCombos = function (combos) {
    var self = this;
    var comboTrees = self.get('comboTrees');
    var itemController = this.get('itemController');
    itemController.addCombos(comboTrees, combos);
  };
  /**
   * ?????????????????????????????? combo ???????????? combo
   * @param combo combo ID ??? Combo ??????
   * @param elements ????????? Combo ?????????????????????????????? combo
   */


  Graph.prototype.createCombo = function (combo, elements) {
    var _this = this; // step 1: ???????????? Combo


    var comboId = '';

    if (isString(combo)) {
      comboId = combo;
      this.addItem('combo', {
        id: combo
      });
    } else {
      comboId = combo.id;

      if (!comboId) {
        console.warn('Create combo failed. Please assign a unique string id for the adding combo.');
        return;
      }

      this.addItem('combo', combo);
    }

    var currentCombo = this.findById(comboId);
    var trees = elements.map(function (elementId) {
      var item = _this.findById(elementId); // step 2: ?????????????????? Combo ???


      currentCombo.addChild(item);
      var model = item.getModel();
      var type = '';
      if (item.getType) type = item.getType();

      if (type === 'combo') {
        model.parentId = comboId;
      } else if (type === 'node') {
        model.comboId = comboId;
      }

      return __assign({
        depth: 1,
        itemType: type
      }, model);
    }); // step3: ?????? comboTrees ??????

    var comboTrees = this.get('comboTrees');
    comboTrees && comboTrees.forEach(function (ctree) {
      if (ctree.id === comboId) {
        ctree.itemType = 'combo';
        ctree.children = trees;
      }
    });
    this.updateCombos();
  };
  /**
   * ?????? combo
   * @param {String | INode | ICombo} combo ?????????????????? Combo item ??? id
   */


  Graph.prototype.uncombo = function (combo) {
    var _this = this;

    var self = this;
    var comboItem = combo;

    if (isString(combo)) {
      comboItem = this.findById(combo);
    }

    if (!comboItem || comboItem.getType && comboItem.getType() !== 'combo') {
      console.warn('The item is not a combo!');
      return;
    }

    var parentId = comboItem.getModel().parentId;
    var comboTrees = self.get('comboTrees');
    if (!comboTrees) comboTrees = [];
    var itemMap = this.get('itemMap');
    var comboId = comboItem.get('id');
    var treeToBeUncombo;
    var brothers = [];
    var comboItems = this.get('combos');
    var parentItem = this.findById(parentId);
    comboTrees.forEach(function (ctree) {
      if (treeToBeUncombo) return; // terminate the forEach

      traverseTreeUp(ctree, function (subtree) {
        // find the combo to be uncomboed, delete the combo from map and cache
        if (subtree.id === comboId) {
          treeToBeUncombo = subtree; // delete the related edges

          var edges = comboItem.getEdges();
          edges.forEach(function (edge) {
            _this.removeItem(edge);
          });
          var index = comboItems.indexOf(combo);
          comboItems.splice(index, 1);
          delete itemMap[comboId];
          comboItem.destroy();
        } // find the parent to remove the combo from the combo's brothers array and add the combo's children to the combo's brothers array in the tree


        if (parentId && treeToBeUncombo && subtree.id === parentId) {
          parentItem.removeCombo(comboItem);
          brothers = subtree.children; // the combo's brothers
          // remove the combo from its brothers array

          var index = brothers.indexOf(treeToBeUncombo);

          if (index !== -1) {
            brothers.splice(index, 1);
          } // append the combo's children to the combo's brothers array


          treeToBeUncombo.children && treeToBeUncombo.children.forEach(function (child) {
            var item = _this.findById(child.id);

            var childModel = item.getModel();

            if (item.getType && item.getType() === 'combo') {
              child.parentId = parentId;
              delete child.comboId;
              childModel.parentId = parentId; // update the parentId of the model

              delete childModel.comboId;
            } else if (item.getType && item.getType() === 'node') {
              child.comboId = parentId;
              childModel.comboId = parentId; // update the parentId of the model
            }

            parentItem.addChild(item);
            brothers.push(child);
          });
          return false;
        }

        return true;
      });
    }); // if the parentId is not found, remove the combo from the roots

    if (!parentId && treeToBeUncombo) {
      var index = comboTrees.indexOf(treeToBeUncombo);
      comboTrees.splice(index, 1); // modify the parentId of the children

      treeToBeUncombo.children && treeToBeUncombo.children.forEach(function (child) {
        child.parentId = undefined;

        var childModel = _this.findById(child.id).getModel();

        childModel.parentId = undefined; // update the parentId of the model

        if (child.itemType !== 'node') comboTrees.push(child);
      });
    }
  };
  /**
   * ??????????????? bbox ???????????? combos ?????????????????? combos ??????????????????
   */


  Graph.prototype.updateCombos = function () {
    var _this = this;

    var self = this;
    var comboTrees = this.get('comboTrees');
    var itemController = self.get('itemController');
    var itemMap = self.get('itemMap');
    comboTrees && comboTrees.forEach(function (ctree) {
      traverseTreeUp(ctree, function (child) {
        if (!child) {
          return true;
        }

        var childItem = itemMap[child.id];

        if (childItem && childItem.getType && childItem.getType() === 'combo') {
          // ??????????????? Combo ???????????????????????????????????????????????? state ????????????????????? Combo ?????????
          var states = __spreadArrays(childItem.getStates());

          each(states, function (state) {
            return _this.setItemState(childItem, state, false);
          }); // ??????????????? Combo

          itemController.updateCombo(childItem, child.children); // ?????? Combo ???????????????????????????

          each(states, function (state) {
            return _this.setItemState(childItem, state, true);
          });
        }

        return true;
      });
    });
    self.sortCombos();
  };
  /**
   * ??????????????? bbox ?????? combo ???????????? combos ?????????????????? combos ??????????????????
   * @param {String | ICombo} combo ?????????????????? Combo ??? id????????????????????? Combo ??????????????? Combod ???????????????
   */


  Graph.prototype.updateCombo = function (combo) {
    var _this = this;

    var self = this;
    var comboItem = combo;
    var comboId;

    if (isString(combo)) {
      comboItem = this.findById(combo);
    }

    if (!comboItem || comboItem.getType && comboItem.getType() !== 'combo') {
      console.warn('The item to be updated is not a combo!');
      return;
    }

    comboId = comboItem.get('id');
    var comboTrees = this.get('comboTrees');
    var itemController = self.get('itemController');
    var itemMap = self.get('itemMap');
    comboTrees && comboTrees.forEach(function (ctree) {
      traverseTreeUp(ctree, function (child) {
        if (!child) {
          return true;
        }

        var childItem = itemMap[child.id];

        if (comboId === child.id && childItem && childItem.getType && childItem.getType() === 'combo') {
          // ??????????????? Combo ???????????????????????????????????????????????? state ????????????????????? Combo ?????????
          var states = __spreadArrays(childItem.getStates());

          each(states, function (state) {
            return _this.setItemState(childItem, state, false);
          }); // ??????????????? Combo

          itemController.updateCombo(childItem, child.children); // ?????? Combo ???????????????????????????

          each(states, function (state) {
            return _this.setItemState(childItem, state, true);
          });
          if (comboId) comboId = child.parentId;
        }

        return true;
      });
    });
  };
  /**
   * ???????????????????????????????????????
   * @param {String | INode | ICombo} item ?????????????????? Combo ??? ?????? id
   * @param {string | undefined} parentId ????????? combo id???undefined ??????????????? combo
   */


  Graph.prototype.updateComboTree = function (item, parentId) {
    var self = this;
    var uItem;

    if (isString(item)) {
      uItem = self.findById(item);
    } else {
      uItem = item;
    }

    var model = uItem.getModel();
    var oldParentId = model.comboId || model.parentId; // ??? combo ??????parentId ??? comboId ?????????????????????

    if (model.parentId || model.comboId) {
      var combo = this.findById(model.parentId || model.comboId);

      if (combo) {
        combo.removeChild(uItem);
      }
    }

    var type = '';
    if (uItem.getType) type = uItem.getType();

    if (type === 'combo') {
      model.parentId = parentId;
    } else if (type === 'node') {
      model.comboId = parentId;
    } // ???????????????????????? combo ????????????


    if (parentId) {
      var parentCombo = this.findById(parentId);

      if (parentCombo) {
        // ?????????????????? parentCombo ???
        parentCombo.addChild(uItem);
      }
    } // ????????????????????? combo??????????????? combo ???????????????????????????


    if (oldParentId) {
      var parentCombo = this.findById(oldParentId);

      if (parentCombo) {
        // ???????????? parentCombo ?????????
        parentCombo.removeChild(uItem);
      }
    }

    var newComboTrees = reconstructTree(this.get('comboTrees'), model.id, parentId);
    this.set('comboTrees', newComboTrees);
    this.updateCombos();
  };
  /**
   * ????????????????????????
   * @param {GraphData} data ??????????????????
   * @param {string} groupType group??????
   */


  Graph.prototype.renderCustomGroup = function (data, groupType) {
    var _this = this;

    var groups = data.groups,
        _a = data.nodes,
        nodes = _a === void 0 ? [] : _a; // ??????????????????????????????groups???????????????????????????

    var groupIndex = 10;

    if (!groups) {
      // ??????????????????
      // ???????????????groupID???node
      var nodeInGroup = nodes.filter(function (node) {
        return node.groupId;
      });
      var groupsArr_1 = []; // ??????groupID??????

      var groupIds_1 = groupBy(nodeInGroup, 'groupId'); // tslint:disable-next-line:forin

      Object.keys(groupIds_1).forEach(function (groupId) {
        var nodeIds = groupIds_1[groupId].map(function (node) {
          return node.id;
        });

        _this.get('customGroupControll').create(groupId, nodeIds, groupType, groupIndex);

        groupIndex--; // ???????????????????????? groupId

        if (!groupsArr_1.find(function (d) {
          return d.id === groupId;
        })) {
          groupsArr_1.push({
            id: groupId
          });
        }
      });
      this.set({
        groups: groupsArr_1
      });
    } else {
      // ???groups???????????????groups???
      this.set({
        groups: groups
      }); // ??????????????????????????????????????????????????????groups??????

      var groupNodes_1 = getAllNodeInGroups(data); // tslint:disable-next-line:forin

      Object.keys(groupNodes_1).forEach(function (groupId) {
        var tmpNodes = groupNodes_1[groupId];

        _this.get('customGroupControll').create(groupId, tmpNodes, groupType, groupIndex);

        groupIndex--;
      }); // ?????????Group??????

      var customGroup = this.get('customGroup');
      customGroup.sort();
    }
  };
  /**
   * ???????????????
   * @return {object} data
   */


  Graph.prototype.save = function () {
    var nodes = [];
    var edges = [];
    var combos = [];
    each(this.get('nodes'), function (node) {
      nodes.push(node.getModel());
    });
    each(this.get('edges'), function (edge) {
      edges.push(edge.getModel());
    });
    each(this.get('combos'), function (combo) {
      combos.push(combo.getModel());
    });
    return {
      nodes: nodes,
      edges: edges,
      combos: combos,
      groups: this.get('groups')
    };
  };
  /**
   * ??????????????????
   * @param  {number} width  ????????????
   * @param  {number} height ????????????
   * @return {object} this
   */


  Graph.prototype.changeSize = function (width, height) {
    var viewController = this.get('viewController');
    viewController.changeSize(width, height);
    return this;
  };
  /**
   * ????????????????????????????????????????????????????????????????????????????????????????????????
   */


  Graph.prototype.refresh = function () {
    var self = this;
    self.emit('beforegraphrefresh');

    if (self.get('animate')) {
      self.positionsAnimate();
    } else {
      var nodes = self.get('nodes');
      var edges = self.get('edges');
      var vedges = self.get('edges');
      each(nodes, function (node) {
        node.refresh();
      });
      each(edges, function (edge) {
        edge.refresh();
      });
      each(vedges, function (vedge) {
        vedge.refresh();
      });
    }

    self.emit('aftergraphrefresh');
    self.autoPaint();
  };
  /**
   * ?????????????????????????????????item??????
   * @return {INode} item??????
   */


  Graph.prototype.getNodes = function () {
    return this.get('nodes');
  };
  /**
   * ??????????????????????????????item??????
   * @return {IEdge} item??????
   */


  Graph.prototype.getEdges = function () {
    return this.get('edges');
  };
  /**
   * ????????????????????? combo ??????
   */


  Graph.prototype.getCombos = function () {
    return this.get('combos');
  };
  /**
   * ???????????? Combo ??????????????????
   * @param comboId combo ID
   */


  Graph.prototype.getComboChildren = function (combo) {
    if (isString(combo)) {
      combo = this.findById(combo);
    }

    if (!combo || combo.getType && combo.getType() !== 'combo') {
      console.warn('The combo does not exist!');
      return;
    }

    return combo.getChildren();
  };
  /**
   * ?????? graph ?????? animateCfg ???????????????????????????????????????
   */


  Graph.prototype.positionsAnimate = function () {
    var self = this;
    self.emit('beforeanimate');
    var animateCfg = self.get('animateCfg');
    var onFrame = animateCfg.onFrame;
    var nodes = self.getNodes();
    var toNodes = nodes.map(function (node) {
      var model = node.getModel();
      return {
        id: model.id,
        x: model.x,
        y: model.y
      };
    });

    if (self.isAnimating()) {
      self.stopAnimate();
    }

    var canvas = self.get('canvas');
    canvas.animate(function (ratio) {
      each(toNodes, function (data) {
        var node = self.findById(data.id);

        if (!node || node.destroyed) {
          return;
        }

        var originAttrs = node.get('originAttrs');
        var model = node.get('model');

        if (!originAttrs) {
          var containerMatrix = node.getContainer().getMatrix();
          if (!containerMatrix) containerMatrix = mat3.create();
          originAttrs = {
            x: containerMatrix[6],
            y: containerMatrix[7]
          };
          node.set('originAttrs', originAttrs);
        }

        if (onFrame) {
          var attrs = onFrame(node, ratio, data, originAttrs);
          node.set('model', Object.assign(model, attrs));
        } else {
          model.x = originAttrs.x + (data.x - originAttrs.x) * ratio;
          model.y = originAttrs.y + (data.y - originAttrs.y) * ratio;
        }
      });
      self.refreshPositions();
    }, {
      duration: animateCfg.duration,
      easing: animateCfg.easing,
      callback: function callback() {
        each(nodes, function (node) {
          node.set('originAttrs', null);
        });

        if (animateCfg.callback) {
          animateCfg.callback();
        }

        self.emit('afteranimate');
        self.animating = false;
      }
    });
  };
  /**
   * ?????????????????????????????????????????????????????????????????????????????????
   */


  Graph.prototype.refreshPositions = function () {
    var self = this;
    self.emit('beforegraphrefreshposition');
    var nodes = self.get('nodes');
    var edges = self.get('edges');
    var vedges = self.get('vedges');
    var combos = self.get('combos');
    var model;
    var updatedNodes = {};
    each(nodes, function (node) {
      model = node.getModel();
      var originAttrs = node.get('originAttrs');

      if (originAttrs && model.x === originAttrs.x && model.y === originAttrs.y) {
        return;
      }

      node.updatePosition({
        x: model.x,
        y: model.y
      });
      updatedNodes[model.id] = true;
      if (model.comboId) updatedNodes[model.comboId] = true;
    });

    if (combos && combos.length !== 0) {
      self.updateCombos();
    }

    each(edges, function (edge) {
      var sourceModel = edge.getSource().getModel();
      var targetModel = edge.getTarget().getModel();

      if (updatedNodes[sourceModel.id] || updatedNodes[targetModel.id] || edge.getModel().isComboEdge) {
        edge.refresh();
      }
    });
    each(vedges, function (vedge) {
      vedge.refresh();
    });
    self.emit('aftergraphrefreshposition');
    self.autoPaint();
  };

  Graph.prototype.stopAnimate = function () {
    this.get('canvas').stopAnimate();
  };

  Graph.prototype.isAnimating = function () {
    return this.animating;
  };
  /**
   * ??????????????????????????????
   * @return {number} ??????
   */


  Graph.prototype.getZoom = function () {
    var matrix = this.get('group').getMatrix();
    return matrix ? matrix[0] : 1;
  };
  /**
   * ???????????????????????????
   * @return {string} ??????????????????
   */


  Graph.prototype.getCurrentMode = function () {
    var modeController = this.get('modeController');
    return modeController.getMode();
  };
  /**
   * ??????????????????
   * @param {string} mode ????????????
   * @return {object} this
   */


  Graph.prototype.setMode = function (mode) {
    var modeController = this.get('modeController');
    modeController.setMode(mode);
    return this;
  };
  /**
   * ??????????????????
   * @return {object} this
   */


  Graph.prototype.clear = function () {
    var canvas = this.get('canvas');
    canvas.clear();
    this.initGroups(); // ?????????????????????????????????

    this.set({
      itemMap: {},
      nodes: [],
      edges: [],
      groups: []
    });
    return this;
  };
  /**
   * ??????????????? dataUrl ??????????????????
   * @return {string} ?????? dataURL
   */


  Graph.prototype.toDataURL = function (type, backgroundColor) {
    var canvas = this.get('canvas');
    var renderer = canvas.getRenderer();
    var canvasDom = canvas.get('el');
    if (!type) type = 'image/png';
    var dataURL = '';

    if (renderer === 'svg') {
      var clone_1 = canvasDom.cloneNode(true);
      var svgDocType = document.implementation.createDocumentType('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
      var svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
      svgDoc.replaceChild(clone_1, svgDoc.documentElement);
      var svgData = new XMLSerializer().serializeToString(svgDoc);
      dataURL = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgData);
    } else {
      var imageData = void 0;
      var context = canvasDom.getContext('2d');
      var width = this.get('width');
      var height = this.get('height');
      var compositeOperation = void 0;

      if (backgroundColor) {
        var pixelRatio = window.devicePixelRatio;
        imageData = context.getImageData(0, 0, width * pixelRatio, height * pixelRatio);
        compositeOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = "destination-over";
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
      }

      dataURL = canvasDom.toDataURL(type);

      if (backgroundColor) {
        context.clearRect(0, 0, width, height);
        context.putImageData(imageData, 0, 0);
        context.globalCompositeOperation = compositeOperation;
      }
    }

    return dataURL;
  };
  /**
   * ???????????????????????????
   * @param {String} name ???????????????
   */


  Graph.prototype.downloadFullImage = function (name, imageConfig) {
    var _this = this;

    var bbox = this.get('group').getCanvasBBox();
    var height = bbox.height;
    var width = bbox.width;
    var renderer = this.get('renderer');
    var vContainerDOM = createDom('<id="virtual-image"></div>');
    var backgroundColor = imageConfig ? imageConfig.backgroundColor : undefined;
    var padding = imageConfig ? imageConfig.padding : undefined;
    if (!padding) padding = [0, 0, 0, 0];else if (isNumber(padding)) padding = [padding, padding, padding, padding];
    var vHeight = height + padding[0] + padding[2];
    var vWidth = width + padding[1] + padding[3];
    var canvasOptions = {
      container: vContainerDOM,
      height: vHeight,
      width: vWidth
    };
    var vCanvas = renderer === 'svg' ? new GSVGCanvas(canvasOptions) : new GCanvas(canvasOptions);
    var group = this.get('group');
    var vGroup = group.clone();
    var matrix = clone(vGroup.getMatrix());
    if (!matrix) matrix = mat3.create();
    var centerX = (bbox.maxX + bbox.minX) / 2;
    var centerY = (bbox.maxY + bbox.minY) / 2;
    mat3.translate(matrix, matrix, [-centerX, -centerY]);
    mat3.translate(matrix, matrix, [width / 2 + padding[3], height / 2 + padding[0]]);
    vGroup.resetMatrix();
    vGroup.setMatrix(matrix);
    vCanvas.add(vGroup);
    var vCanvasEl = vCanvas.get('el');
    setTimeout(function () {
      var type = 'image/png';
      var dataURL = '';

      if (renderer === 'svg') {
        var clone_2 = vCanvasEl.cloneNode(true);
        var svgDocType = document.implementation.createDocumentType('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
        var svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
        svgDoc.replaceChild(clone_2, svgDoc.documentElement);
        var svgData = new XMLSerializer().serializeToString(svgDoc);
        dataURL = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgData);
      } else {
        var imageData = void 0;
        var context = vCanvasEl.getContext('2d');
        var compositeOperation = void 0;

        if (backgroundColor) {
          var pixelRatio = window.devicePixelRatio;
          imageData = context.getImageData(0, 0, vWidth * pixelRatio, vHeight * pixelRatio);
          compositeOperation = context.globalCompositeOperation;
          context.globalCompositeOperation = "destination-over";
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, vWidth, vHeight);
        }

        dataURL = vCanvasEl.toDataURL(type);

        if (backgroundColor) {
          context.clearRect(0, 0, vWidth, vHeight);
          context.putImageData(imageData, 0, 0);
          context.globalCompositeOperation = compositeOperation;
        }
      }

      var link = document.createElement('a');
      var fileName = (name || 'graph') + (renderer === 'svg' ? '.svg' : '.png');

      _this.dataURLToImage(dataURL, renderer, link, fileName);

      var e = document.createEvent('MouseEvents');
      e.initEvent('click', false, false);
      link.dispatchEvent(e);
    }, 16);
  };
  /**
   * ??????????????????????????????????????????????????????????????????
   * @param {String} name ???????????????
   */


  Graph.prototype.downloadImage = function (name, backgroundColor) {
    var _this = this;

    var self = this;

    if (self.isAnimating()) {
      self.stopAnimate();
    }

    var canvas = self.get('canvas');
    var renderer = canvas.getRenderer();
    var fileName = (name || 'graph') + (renderer === 'svg' ? '.svg' : '.png');
    var link = document.createElement('a');
    setTimeout(function () {
      var dataURL = self.toDataURL('image/png', backgroundColor);

      _this.dataURLToImage(dataURL, renderer, link, fileName);

      var e = document.createEvent('MouseEvents');
      e.initEvent('click', false, false);
      link.dispatchEvent(e);
    }, 16);
  };

  Graph.prototype.dataURLToImage = function (dataURL, renderer, link, fileName) {
    if (typeof window !== 'undefined') {
      if (window.Blob && window.URL && renderer !== 'svg') {
        var arr = dataURL.split(',');
        var mime = '';

        if (arr && arr.length > 0) {
          var match = arr[0].match(/:(.*?);/); // eslint-disable-next-line prefer-destructuring

          if (match && match.length >= 2) mime = match[1];
        }

        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        var blobObj_1 = new Blob([u8arr], {
          type: mime
        });

        if (window.navigator.msSaveBlob) {
          window.navigator.msSaveBlob(blobObj_1, fileName);
        } else {
          link.addEventListener('click', function () {
            link.download = fileName;
            link.href = window.URL.createObjectURL(blobObj_1);
          });
        }
      } else {
        link.addEventListener('click', function () {
          link.download = fileName;
          link.href = dataURL;
        });
      }
    }
  };
  /**
   * ?????????????????????
   * @param {object} cfg ??????????????????
   * ??? cfg ?????? type ???????????? String ?????????????????????????????????????????????????????????
   * ??? cfg ????????? type ?????????????????????????????????????????????????????????
   */


  Graph.prototype.updateLayout = function (cfg) {
    var layoutController = this.get('layoutController');
    var newLayoutType;

    if (isString(cfg)) {
      newLayoutType = cfg;
      cfg = {
        type: newLayoutType
      };
    } else {
      newLayoutType = cfg.type;
    }

    var oriLayoutCfg = this.get('layout');
    var oriLayoutType = oriLayoutCfg ? oriLayoutCfg.type : undefined;

    if (!newLayoutType || oriLayoutType === newLayoutType) {
      // no type or same type, update layout
      var layoutCfg = {};
      Object.assign(layoutCfg, oriLayoutCfg, cfg);
      layoutCfg.type = oriLayoutType || 'random';
      this.set('layout', layoutCfg);
      layoutController.updateLayoutCfg(layoutCfg);
    } else {
      // has different type, change layout
      this.set('layout', cfg);
      layoutController.changeLayout(newLayoutType);
    }
  };
  /**
   * ?????????????????????????????????????????????????????????
   */


  Graph.prototype.layout = function () {
    var layoutController = this.get('layoutController');
    var layoutCfg = this.get('layout');
    if (!layoutCfg) return;

    if (layoutCfg.workerEnabled) {
      // ????????????web worker??????
      layoutController.layout();
      return;
    }

    if (layoutController.layoutMethod) {
      layoutController.relayout(true);
    } else {
      layoutController.layout();
    }
  };
  /**
   * ??????????????? combo
   * @param {string | ICombo} combo combo ID ??? combo item
   */


  Graph.prototype.collapseCombo = function (combo) {
    var _this = this;

    if (isString(combo)) {
      combo = this.findById(combo);
    }

    if (!combo) {
      console.warn('The combo to be collapsed does not exist!');
      return;
    }

    var comboModel = combo.getModel(); // add virtual edges

    var edges = this.getEdges().concat(this.get('vedges')); // find all the descendant nodes and combos

    var cnodes = [];
    var ccombos = [];
    var comboTrees = this.get('comboTrees');
    var found = false;
    var brothers = {};
    comboTrees && comboTrees.forEach(function (ctree) {
      brothers[ctree.id] = ctree;
    });
    comboTrees && comboTrees.forEach(function (ctree) {
      if (found) return; // if the combo is found, terminate the forEach

      traverseTree(ctree, function (subTree) {
        // if the combo is found and the it is traversing the other brothers, terminate
        if (found && brothers[subTree.id]) return false;

        if (comboModel.parentId === subTree.id) {
          // if the parent is found, store the brothers
          brothers = {};
          subTree.children.forEach(function (child) {
            brothers[child.id] = child;
          });
        } else if (comboModel.id === subTree.id) {
          // if the combo is found
          found = true;
        }

        if (found) {
          // if the combo is found, concat the descendant nodes and combos
          var item = _this.findById(subTree.id);

          if (item && item.getType && item.getType() === 'combo') {
            cnodes = cnodes.concat(item.getNodes());
            ccombos = ccombos.concat(item.getCombos());
          }
        }

        return true;
      });
    });
    var edgeWeightMap = {};
    var addedVEdges = [];
    edges.forEach(function (edge) {
      var source = edge.getSource();
      var target = edge.getTarget();

      if ((cnodes.includes(source) || ccombos.includes(source)) && !cnodes.includes(target) && !ccombos.includes(target) || source.getModel().id === comboModel.id) {
        var edgeModel = edge.getModel();

        if (edgeModel.isVEdge) {
          _this.removeItem(edge);

          return;
        }

        var targetModel = target.getModel();

        while (!target.isVisible()) {
          target = _this.findById(targetModel.parentId || targetModel.comboId);
          if (!target || !targetModel.parentId && !targetModel.comboId) return; // all the ancestors are hidden, then ignore the edge

          targetModel = target.getModel();
        }

        var targetId = targetModel.id;

        if (edgeWeightMap[comboModel.id + "-" + targetId]) {
          edgeWeightMap[comboModel.id + "-" + targetId] += edgeModel.size || 1;
          return;
        } // the source is in the combo, the target is not


        var vedge = _this.addItem('vedge', {
          source: comboModel.id,
          target: targetId,
          isVEdge: true
        });

        edgeWeightMap[comboModel.id + "-" + targetId] = edgeModel.size || 1;
        addedVEdges.push(vedge);
      } else if (!cnodes.includes(source) && !ccombos.includes(source) && (cnodes.includes(target) || ccombos.includes(target)) || target.getModel().id === comboModel.id) {
        var edgeModel = edge.getModel();

        if (edgeModel.isVEdge) {
          _this.removeItem(edge);

          return;
        }

        var sourceModel = source.getModel();

        while (!source.isVisible()) {
          source = _this.findById(sourceModel.parentId || sourceModel.comboId);
          if (!source || !sourceModel.parentId && !sourceModel.comboId) return; // all the ancestors are hidden, then ignore the edge

          sourceModel = source.getModel();
        }

        var sourceId = sourceModel.id;

        if (edgeWeightMap[sourceId + "-" + comboModel.id]) {
          edgeWeightMap[sourceId + "-" + comboModel.id] += edgeModel.size || 1;
          return;
        } // the target is in the combo, the source is not


        var vedge = _this.addItem('vedge', {
          target: comboModel.id,
          source: sourceId,
          isVEdge: true
        });

        edgeWeightMap[sourceId + "-" + comboModel.id] = edgeModel.size || 1;
        addedVEdges.push(vedge);
      }
    }); // update the width of the virtual edges, which is the sum of merged actual edges
    // be attention that the actual edges with same endpoints but different directions will be represented by two different virtual edges

    addedVEdges.forEach(function (vedge) {
      var vedgeModel = vedge.getModel();

      _this.updateItem(vedge, {
        size: edgeWeightMap[vedgeModel.source + "-" + vedgeModel.target]
      });
    });
    var itemController = this.get('itemController');
    itemController.collapseCombo(combo);
    comboModel.collapsed = true;
  };
  /**
   * ??????????????? combo
   * @param {string | ICombo} combo combo ID ??? combo item
   */


  Graph.prototype.expandCombo = function (combo) {
    var _this = this;

    if (isString(combo)) {
      combo = this.findById(combo);
    }

    if (!combo || combo.getType && combo.getType() !== 'combo') {
      console.warn('The combo to be collapsed does not exist!');
      return;
    }

    var comboModel = combo.getModel();
    var itemController = this.get('itemController');
    itemController.expandCombo(combo);
    comboModel.collapsed = false; // add virtual edges

    var edges = this.getEdges().concat(this.get('vedges')); // find all the descendant nodes and combos

    var cnodes = [];
    var ccombos = [];
    var comboTrees = this.get('comboTrees');
    var found = false;
    var brothers = {};
    comboTrees && comboTrees.forEach(function (ctree) {
      brothers[ctree.id] = ctree;
    });
    comboTrees && comboTrees.forEach(function (ctree) {
      if (found) return; // if the combo is found, terminate

      traverseTree(ctree, function (subTree) {
        if (found && brothers[subTree.id]) {
          return false;
        }

        if (comboModel.parentId === subTree.id) {
          brothers = {};
          subTree.children.forEach(function (child) {
            brothers[child.id] = child;
          });
        } else if (comboModel.id === subTree.id) {
          found = true;
        }

        if (found) {
          var item = _this.findById(subTree.id);

          if (item && item.getType && item.getType() === 'combo') {
            cnodes = cnodes.concat(item.getNodes());
            ccombos = ccombos.concat(item.getCombos());
          }
        }

        return true;
      });
    });
    var edgeWeightMap = {};
    var addedVEdges = {};
    edges.forEach(function (edge) {
      var source = edge.getSource();
      var target = edge.getTarget();
      var sourceId = source.get('id');
      var targetId = target.get('id');

      if ((cnodes.includes(source) || ccombos.includes(source)) && !cnodes.includes(target) && !ccombos.includes(target) || sourceId === comboModel.id) {
        // the source is in the combo, the target is not
        // ignore the virtual edges
        if (edge.getModel().isVEdge) {
          _this.removeItem(edge);

          return;
        }

        var targetModel = target.getModel(); // find the nearest visible ancestor

        while (!target.isVisible()) {
          target = _this.findById(targetModel.comboId || targetModel.parentId);

          if (!target || !targetModel.parentId && !targetModel.comboId) {
            return; // if all the ancestors of the oppsite are all hidden, ignore the edge
          }

          targetModel = target.getModel();
        }

        targetId = targetModel.id;
        var sourceModel = source.getModel(); // find the nearest visible ancestor

        while (!source.isVisible()) {
          source = _this.findById(sourceModel.comboId || sourceModel.parentId);

          if (!source || !sourceModel.parentId && !sourceModel.comboId) {
            return; // if all the ancestors of the oppsite are all hidden, ignore the edge
          }

          if (sourceModel.comboId === comboModel.id || sourceModel.parentId === comboModel.id) {
            break; // if the next ancestor is the combo, break the while
          }

          sourceModel = source.getModel();
        }

        sourceId = sourceModel.id;

        if (targetId) {
          var vedgeId = sourceId + "-" + targetId; // update the width of the virtual edges, which is the sum of merged actual edges
          // be attention that the actual edges with same endpoints but different directions will be represented by two different virtual edges

          if (edgeWeightMap[vedgeId]) {
            edgeWeightMap[vedgeId] += edge.getModel().size || 1;

            _this.updateItem(addedVEdges[vedgeId], {
              size: edgeWeightMap[vedgeId]
            });

            return;
          }

          var vedge = _this.addItem('vedge', {
            source: sourceId,
            target: targetId,
            isVEdge: true
          });

          edgeWeightMap[vedgeId] = edge.getModel().size || 1;
          addedVEdges[vedgeId] = vedge;
        }
      } else if (!cnodes.includes(source) && !ccombos.includes(source) && (cnodes.includes(target) || ccombos.includes(target)) || targetId === comboModel.id) {
        // the target is in the combo, the source is not
        // ignore the virtual edges
        if (edge.getModel().isVEdge) {
          _this.removeItem(edge);

          return;
        }

        var sourceModel = source.getModel(); // find the nearest visible ancestor

        while (!source.isVisible()) {
          source = _this.findById(sourceModel.comboId || sourceModel.parentId);

          if (!source || !sourceModel.parentId && !sourceModel.comboId) {
            return; // if all the ancestors of the oppsite are all hidden, ignore the edge
          }

          sourceModel = source.getModel();
        }

        sourceId = sourceModel.id;
        var targetModel = target.getModel(); // find the nearest visible ancestor

        while (!target.isVisible()) {
          target = _this.findById(targetModel.comboId || targetModel.parentId);

          if (!target || !targetModel.parentId && !targetModel.comboId) {
            return; // if all the ancestors of the oppsite are all hidden, ignore the edge
          }

          if (targetModel.comboId === comboModel.id || targetModel.parentId === comboModel.id) {
            break; // if the next ancestor is the combo, break the while
          }

          targetModel = target.getModel();
        }

        targetId = targetModel.id;

        if (sourceId) {
          var vedgeId = sourceId + "-" + targetId; // update the width of the virtual edges, which is the sum of merged actual edges
          // be attention that the actual edges with same endpoints but different directions will be represented by two different virtual edges

          if (edgeWeightMap[vedgeId]) {
            edgeWeightMap[vedgeId] += edge.getModel().size || 1;

            _this.updateItem(addedVEdges[vedgeId], {
              size: edgeWeightMap[vedgeId]
            });

            return;
          }

          var vedge = _this.addItem('vedge', {
            target: targetId,
            source: sourceId,
            isVEdge: true
          });

          edgeWeightMap[vedgeId] = edge.getModel().size || 1;
          addedVEdges[vedgeId] = vedge;
        }
      }
    });
  };

  Graph.prototype.collapseExpandCombo = function (combo) {
    if (isString(combo)) {
      combo = this.findById(combo);
    }

    if (combo.getType && combo.getType() !== 'combo') return;
    var comboModel = combo.getModel(); // if one ancestor combo of the combo is collapsed, it should not be collapsed or expanded

    var parentItem = this.findById(comboModel.parentId);

    while (parentItem) {
      var parentModel = parentItem.getModel();

      if (parentModel.collapsed) {
        console.warn("Fail to expand the combo since it's ancestor combo is collapsed.");
        parentItem = undefined;
        return;
      }

      parentItem = this.findById(parentModel.parentId);
    }

    var collapsed = comboModel.collapsed; // ????????????????????????????????????????????????

    if (collapsed) {
      this.expandCombo(combo);
    } else {
      this.collapseCombo(combo);
    }
  };
  /**
   * ????????????
   * @param {string} groupId ??????ID
   */


  Graph.prototype.collapseGroup = function (groupId) {
    var customGroupControll = this.get('customGroupControll');
    customGroupControll.collapseGroup(groupId);
  };
  /**
   * ????????????
   * @param {string} groupId ??????ID
   */


  Graph.prototype.expandGroup = function (groupId) {
    var customGroupControll = this.get('customGroupControll');
    customGroupControll.expandGroup(groupId);
  };
  /**
   * ????????????
   * @param {object} plugin ????????????
   */


  Graph.prototype.addPlugin = function (plugin) {
    var self = this;

    if (plugin.destroyed) {
      return;
    }

    self.get('plugins').push(plugin);
    plugin.initPlugin(self);
  };
  /**
   * ????????????
   * @param {object} plugin ????????????
   */


  Graph.prototype.removePlugin = function (plugin) {
    var plugins = this.get('plugins');
    var index = plugins.indexOf(plugin);

    if (index >= 0) {
      plugin.destroyPlugin();
      plugins.splice(index, 1);
    }
  };
  /**
   * ?????? comboTree ???????????? Combo ???????????????????????????????????? Combo ?????????????????????
   * @param {GraphData} data ??????
   */


  Graph.prototype.sortCombos = function () {
    var _this = this;

    var depthMap = [];
    var dataDepthMap = {};
    var comboTrees = this.get('comboTrees');
    comboTrees && comboTrees.forEach(function (cTree) {
      traverseTree(cTree, function (child) {
        if (depthMap[child.depth]) depthMap[child.depth].push(child.id);else depthMap[child.depth] = [child.id];
        dataDepthMap[child.id] = child.depth;
        return true;
      });
    });
    var edges = this.getEdges().concat(this.get('vedges'));
    edges && edges.forEach(function (edgeItem) {
      var edge = edgeItem.getModel();
      var sourceDepth = dataDepthMap[edge.source] || 0;
      var targetDepth = dataDepthMap[edge.target] || 0;
      var depth = Math.max(sourceDepth, targetDepth);
      if (depthMap[depth]) depthMap[depth].push(edge.id);else depthMap[depth] = [edge.id];
    });
    depthMap.forEach(function (array) {
      if (!array || !array.length) return;

      for (var i = array.length - 1; i >= 0; i--) {
        var item = _this.findById(array[i]);

        item && item.toFront();
      }
    });
  };
  /**
   * ?????????????????????????????????
   *
   * @param {(string | INode)} node ?????? ID ?????????
   * @returns {INode[]}
   * @memberof IGraph
   */


  Graph.prototype.getNeighbors = function (node) {
    var item = node;

    if (isString(node)) {
      item = this.findById(node);
    }

    return item.getNeighbors();
  };
  /**
   * ????????? node ??????????????????????????????
   *
   * @param {(string | INode)} node ?????? ID ?????????
   * @returns {INode[]}
   * @memberof IGraph
   */


  Graph.prototype.getSourceNeighbors = function (node) {
    var item = node;

    if (isString(node)) {
      item = this.findById(node);
    }

    return item.getSourceNeighbors();
  };
  /**
   * ????????? node ??????????????????????????????
   *
   * @param {(string | INode)} node ?????? ID ?????????
   * @returns {INode[]}
   * @memberof IGraph
   */


  Graph.prototype.getTargetNeighbors = function (node) {
    var item = node;

    if (isString(node)) {
      item = this.findById(node);
    }

    return item.getTargetNeighbors();
  };
  /**
   * ?????? node ?????????
   *
   * @param {(string | INode)} node ?????? ID ?????????
   * @param {('in' | 'out' | 'total' | 'all' | undefined)} ???????????????in ?????????out ?????????total ????????????all ?????????????????????????????????
   * @returns {Number | Object} ??????????????????
   * @memberof IGraph
   */


  Graph.prototype.getNodeDegree = function (node, type) {
    if (type === void 0) {
      type = undefined;
    }

    var item = node;

    if (isString(node)) {
      item = this.findById(node);
    }

    var degrees = this.get('degrees');

    if (!degrees) {
      degrees = degree(this);
    }

    this.set('degees', degrees);
    var nodeDegrees = degrees[item.getID()];
    var res;

    switch (type) {
      case 'in':
        res = nodeDegrees.inDegree;
        break;

      case 'out':
        res = nodeDegrees.outDegree;
        break;

      case 'all':
        res = nodeDegrees;
        break;

      default:
        res = nodeDegrees.degree;
        break;
    }

    return res;
  };
  /**
   * ????????????
   */


  Graph.prototype.destroy = function () {
    this.clear();
    each(this.get('plugins'), function (plugin) {
      plugin.destroyPlugin();
    });
    this.get('eventController').destroy();
    this.get('itemController').destroy();
    this.get('modeController').destroy();
    this.get('viewController').destroy();
    this.get('stateController').destroy();
    this.get('layoutController').destroy();
    this.get('customGroupControll').destroy();
    this.get('canvas').destroy();
    this.cfg = null;
    this.destroyed = true;
  };

  return Graph;
}(EventEmitter);

export default Graph;