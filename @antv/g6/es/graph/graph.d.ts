import EventEmitter from '@antv/event-emitter';
import { BBox, Point } from '@antv/g-base/lib/types';
import { IGraph } from '../interface/graph';
import { IEdge, INode, ICombo } from '../interface/item';
import { GraphOptions, EdgeConfig, GraphData, GroupConfig, Item, ITEM_TYPE, ModelConfig, NodeConfig, NodeMap, Padding, TreeGraphData, ComboConfig, ModeOption, ModeType, States } from '../types';
import PluginBase from '../plugins/base';
interface IGroupBBox {
    [key: string]: BBox;
}
export interface PrivateGraphOption extends GraphOptions {
    data: GraphData;
    event: boolean;
    nodes: NodeConfig[];
    edges: EdgeConfig[];
    vedges: EdgeConfig[];
    groups: GroupConfig[];
    combos: ComboConfig[];
    itemMap: NodeMap;
    callback: () => void;
    groupBBoxs: IGroupBBox;
    groupNodes: NodeMap;
    /**
     * 格式：
     * {
     *  hover: [Node, Node],
     *  selected: [Node]
     * }
     */
    states: States;
}
export default class Graph extends EventEmitter implements IGraph {
    private animating;
    private cfg;
    destroyed: boolean;
    constructor(cfg: GraphOptions);
    private init;
    private initCanvas;
    private initPlugin;
    private initGroups;
    getDefaultCfg(): Partial<PrivateGraphOption>;
    /**
     * 将值设置到 this.cfg 变量上面
     * @param key 键 或 对象值
     * @param val 值
     */
    set<T = any>(key: string | object, val?: T): Graph;
    /**
     * 获取 this.cfg 中的值
     * @param key 键
     */
    get(key: string): any;
    /**
     * 清理元素多个状态
     * @param {string|Item} item 元素id或元素实例
     * @param {string[]} states 状态
     */
    clearItemStates(item: Item | string, states?: string[] | string): void;
    /**
     * 设置各个节点样式，以及在各种状态下节点 keyShape 的样式。
     * 若是自定义节点切在各种状态下
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
     * @param {function} nodeFn 指定每个节点样式
     */
    node(nodeFn: (config: NodeConfig) => Partial<NodeConfig>): void;
    /**
     * 设置各个边样式
     * @param {function} edgeFn 指定每个边的样式,用法同 node
     */
    edge(edgeFn: (config: EdgeConfig) => Partial<EdgeConfig>): void;
    /**
     * 设置各个 combo 的配置
     * @param comboFn
     */
    combo(comboFn: (config: ComboConfig) => Partial<ComboConfig>): void;
    /**
     * 根据 ID 查询图元素实例
     * @param id 图元素 ID
     */
    findById(id: string): Item;
    /**
     * 根据对应规则查找单个元素
     * @param {ITEM_TYPE} type 元素类型(node | edge | group)
     * @param {(item: T, index: number) => T} fn 指定规则
     * @return {T} 元素实例
     */
    find<T extends Item>(type: ITEM_TYPE, fn: (item: T, index?: number) => boolean): T | undefined;
    /**
     * 查找所有满足规则的元素
     * @param {string} type 元素类型(node|edge)
     * @param {string} fn 指定规则
     * @return {array} 元素实例
     */
    findAll<T extends Item>(type: ITEM_TYPE, fn: (item: T, index?: number) => boolean): T[];
    /**
     * 查找所有处于指定状态的元素
     * @param {string} type 元素类型(node|edge)
     * @param {string} state 状态
     * @return {object} 元素实例
     */
    findAllByState<T extends Item>(type: ITEM_TYPE, state: string): T[];
    /**
     * 平移画布
     * @param dx 水平方向位移
     * @param dy 垂直方向位移
     */
    translate(dx: number, dy: number): void;
    /**
     * 平移画布到某点
     * @param {number} x 水平坐标
     * @param {number} y 垂直坐标
     */
    moveTo(x: number, y: number): void;
    /**
     * 调整视口适应视图
     * @param {object} padding 四周围边距
     */
    fitView(padding?: Padding): void;
    /**
     * 调整视口适应视图，不缩放，仅将图 bbox 中心对齐到画布中心
     */
    fitCenter(): void;
    /**
     * 新增行为
     * @param {string | ModeOption | ModeType[]} behaviors 添加的行为
     * @param {string | string[]} modes 添加到对应的模式
     * @return {Graph} Graph
     */
    addBehaviors(behaviors: string | ModeOption | ModeType[], modes: string | string[]): Graph;
    /**
     * 移除行为
     * @param {string | ModeOption | ModeType[]} behaviors 移除的行为
     * @param {string | string[]} modes 从指定的模式中移除
     * @return {Graph} Graph
     */
    removeBehaviors(behaviors: string | ModeOption | ModeType[], modes: string | string[]): Graph;
    /**
     * 伸缩窗口
     * @param ratio 伸缩比例
     * @param center 以center的x, y坐标为中心缩放
     */
    zoom(ratio: number, center?: Point): void;
    /**
     * 伸缩视口到一固定比例
     * @param {number} toRatio 伸缩比例
     * @param {Point} center 以center的x, y坐标为中心缩放
     */
    zoomTo(toRatio: number, center?: Point): void;
    /**
     * 将元素移动到视口中心
     * @param {Item} item 指定元素
     */
    focusItem(item: Item | string): void;
    /**
     * 自动重绘
     * @internal 仅供内部更新机制调用，外部根据需求调用 render 或 paint 接口
     */
    autoPaint(): void;
    /**
     * 仅画布重新绘制
     */
    paint(): void;
    /**
     * 将屏幕坐标转换为视口坐标
     * @param {number} clientX 屏幕x坐标
     * @param {number} clientY 屏幕y坐标
     * @return {Point} 视口坐标
     */
    getPointByClient(clientX: number, clientY: number): Point;
    /**
     * 将视口坐标转换为屏幕坐标
     * @param {number} x 视口x坐标
     * @param {number} y 视口y坐标
     * @return {Point} 视口坐标
     */
    getClientByPoint(x: number, y: number): Point;
    /**
     * 将画布坐标转换为视口坐标
     * @param {number} canvasX 画布 x 坐标
     * @param {number} canvasY 画布 y 坐标
     * @return {object} 视口坐标
     */
    getPointByCanvas(canvasX: number, canvasY: number): Point;
    /**
     * 将视口坐标转换为画布坐标
     * @param {number} x 视口 x 坐标
     * @param {number} y 视口 y 坐标
     * @return {object} 画布坐标
     */
    getCanvasByPoint(x: number, y: number): Point;
    /**
     * 显示元素
     * @param {Item} item 指定元素
     */
    showItem(item: Item | string): void;
    /**
     * 隐藏元素
     * @param {Item} item 指定元素
     */
    hideItem(item: Item | string): void;
    /**
     * 刷新元素
     * @param {string|object} item 元素id或元素实例
     */
    refreshItem(item: Item | string): void;
    /**
     * 设置是否在更新/刷新后自动重绘
     * @param {boolean} auto 自动重绘
     */
    setAutoPaint(auto: boolean): void;
    /**
     * 删除元素
     * @param {Item} item 元素id或元素实例
     */
    remove(item: Item | string): void;
    /**
     * 删除元素
     * @param {Item} item 元素id或元素实例
     */
    removeItem(item: Item | string): void;
    /**
     * 新增元素 或 节点分组
     * @param {string} type 元素类型(node | edge | group)
     * @param {ModelConfig} model 元素数据模型
     * @return {Item} 元素实例
     */
    addItem(type: ITEM_TYPE, model: ModelConfig): any;
    add(type: ITEM_TYPE, model: ModelConfig): Item;
    /**
     * 更新元素
     * @param {Item} item 元素id或元素实例
     * @param {Partial<NodeConfig> | EdgeConfig} cfg 需要更新的数据
     */
    updateItem(item: Item | string, cfg: Partial<NodeConfig> | EdgeConfig): void;
    /**
     * 更新元素
     * @param {Item} item 元素id或元素实例
     * @param {Partial<NodeConfig> | EdgeConfig} cfg 需要更新的数据
     */
    update(item: Item | string, cfg: Partial<NodeConfig> | EdgeConfig): void;
    /**
     * 设置元素状态
     * @param {Item} item 元素id或元素实例
     * @param {string} state 状态名称
     * @param {string | boolean} value 是否启用状态 或 状态值
     */
    setItemState(item: Item | string, state: string, value: string | boolean): void;
    /**
     * 设置视图初始化数据
     * @param {GraphData} data 初始化数据
     */
    data(data?: GraphData | TreeGraphData): void;
    /**
     * 根据data接口的数据渲染视图
     */
    render(): void;
    /**
     * 接收数据进行渲染
     * @Param {Object} data 初始化数据
     */
    read(data: GraphData): void;
    private diffItems;
    /**
     * 更改源数据，根据新数据重新渲染视图
     * @param {object} data 源数据
     * @return {object} this
     */
    changeData(data?: GraphData | TreeGraphData): Graph;
    /**
     * 私有方法，在 render 和 changeData 的时候批量添加数据中所有平铺的 combos
     * @param {ComboConfig[]} combos 平铺的 combos 数据
     */
    private addCombos;
    /**
     * 根据已经存在的节点或 combo 创建新的 combo
     * @param combo combo ID 或 Combo 配置
     * @param elements 添加到 Combo 中的元素，包括节点和 combo
     */
    createCombo(combo: string | ComboConfig, elements: string[]): void;
    /**
     * 解散 combo
     * @param {String | INode | ICombo} combo 需要被解散的 Combo item 或 id
     */
    uncombo(combo: string | ICombo): void;
    /**
     * 根据节点的 bbox 更新所有 combos 的绘制，包括 combos 的位置和范围
     */
    updateCombos(): void;
    /**
     * 根据节点的 bbox 更新 combo 及其祖先 combos 的绘制，包括 combos 的位置和范围
     * @param {String | ICombo} combo 需要被更新的 Combo 或 id，若指定，则该 Combo 及所有祖先 Combod 都会被更新
     */
    updateCombo(combo: string | ICombo): void;
    /**
     * 更新树结构，例如移动子树等
     * @param {String | INode | ICombo} item 需要被更新的 Combo 或 节点 id
     * @param {string | undefined} parentId 新的父 combo id，undefined 代表没有父 combo
     */
    updateComboTree(item: string | INode | ICombo, parentId?: string | undefined): void;
    /**
     * 根据数据渲染群组
     * @param {GraphData} data 渲染图的数据
     * @param {string} groupType group类型
     */
    renderCustomGroup(data: GraphData, groupType: string): void;
    /**
     * 导出图数据
     * @return {object} data
     */
    save(): TreeGraphData | GraphData;
    /**
     * 改变画布大小
     * @param  {number} width  画布宽度
     * @param  {number} height 画布高度
     * @return {object} this
     */
    changeSize(width: number, height: number): Graph;
    /**
     * 当源数据在外部发生变更时，根据新数据刷新视图。但是不刷新节点位置
     */
    refresh(): void;
    /**
     * 获取当前图中所有节点的item实例
     * @return {INode} item数组
     */
    getNodes(): INode[];
    /**
     * 获取当前图中所有边的item实例
     * @return {IEdge} item数组
     */
    getEdges(): IEdge[];
    /**
     * 获取图中所有的 combo 实例
     */
    getCombos(): ICombo[];
    /**
     * 获取指定 Combo 中所有的节点
     * @param comboId combo ID
     */
    getComboChildren(combo: string | ICombo): {
        nodes: INode[];
        combos: ICombo[];
    };
    /**
     * 根据 graph 上的 animateCfg 进行视图中节点位置动画接口
     */
    positionsAnimate(): void;
    /**
     * 当节点位置在外部发生改变时，刷新所有节点位置，重计算边
     */
    refreshPositions(): void;
    stopAnimate(): void;
    isAnimating(): boolean;
    /**
     * 获取当前视口伸缩比例
     * @return {number} 比例
     */
    getZoom(): number;
    /**
     * 获取当前的行为模式
     * @return {string} 当前行为模式
     */
    getCurrentMode(): string;
    /**
     * 切换行为模式
     * @param {string} mode 指定模式
     * @return {object} this
     */
    setMode(mode: string): Graph;
    /**
     * 清除画布元素
     * @return {object} this
     */
    clear(): Graph;
    /**
     * 返回图表的 dataUrl 用于生成图片
     * @return {string} 图片 dataURL
     */
    toDataURL(type?: string, backgroundColor?: string): string;
    /**
     * 导出包含全图的图片
     * @param {String} name 图片的名称
     */
    downloadFullImage(name?: string, imageConfig?: {
        backgroundColor?: string;
        padding?: number | number[];
    }): void;
    /**
     * 画布导出图片，图片仅包含画布可见区域部分内容
     * @param {String} name 图片的名称
     */
    downloadImage(name?: string, backgroundColor?: string): void;
    private dataURLToImage;
    /**
     * 更换布局配置项
     * @param {object} cfg 新布局配置项
     * 若 cfg 含有 type 字段或为 String 类型，且与现有布局方法不同，则更换布局
     * 若 cfg 不包括 type ，则保持原有布局方法，仅更新布局配置项
     */
    updateLayout(cfg: any): void;
    /**
     * 重新以当前示例中配置的属性进行一次布局
     */
    layout(): void;
    /**
     * 收起指定的 combo
     * @param {string | ICombo} combo combo ID 或 combo item
     */
    collapseCombo(combo: string | ICombo): void;
    /**
     * 展开指定的 combo
     * @param {string | ICombo} combo combo ID 或 combo item
     */
    expandCombo(combo: string | ICombo): void;
    collapseExpandCombo(combo: string | ICombo): void;
    /**
     * 收起分组
     * @param {string} groupId 分组ID
     */
    collapseGroup(groupId: string): void;
    /**
     * 展开分组
     * @param {string} groupId 分组ID
     */
    expandGroup(groupId: string): void;
    /**
     * 添加插件
     * @param {object} plugin 插件实例
     */
    addPlugin(plugin: PluginBase): void;
    /**
     * 添加插件
     * @param {object} plugin 插件实例
     */
    removePlugin(plugin: PluginBase): void;
    /**
     * 根据 comboTree 结构整理 Combo 相关的图形绘制层级，包括 Combo 本身、节点、边
     * @param {GraphData} data 数据
     */
    private sortCombos;
    /**
     * 获取节点所有的邻居节点
     *
     * @param {(string | INode)} node 节点 ID 或实例
     * @returns {INode[]}
     * @memberof IGraph
     */
    getNeighbors(node: string | INode): INode[];
    /**
     * 获取以 node 为起点的所有邻居节点
     *
     * @param {(string | INode)} node 节点 ID 或实例
     * @returns {INode[]}
     * @memberof IGraph
     */
    getSourceNeighbors(node: string | INode): INode[];
    /**
     * 获取以 node 为终点的所有邻居节点
     *
     * @param {(string | INode)} node 节点 ID 或实例
     * @returns {INode[]}
     * @memberof IGraph
     */
    getTargetNeighbors(node: string | INode): INode[];
    /**
     * 获取 node 的度数
     *
     * @param {(string | INode)} node 节点 ID 或实例
     * @param {('in' | 'out' | 'total' | 'all' | undefined)} 度数类型，in 入度，out 出度，total 总度数，all 返回三种类型度数的对象
     * @returns {Number | Object} 该节点的度数
     * @memberof IGraph
     */
    getNodeDegree(node: string | INode, type?: 'in' | 'out' | 'total' | 'all' | undefined): Number | Object;
    /**
     * 销毁画布
     */
    destroy(): void;
}
export {};
