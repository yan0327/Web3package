import GraphEvent from '@antv/g-base/lib/event/graph-event';
import { BBox, AnimateCfg } from '@antv/g-base/lib/types';
import Canvas from '@antv/g-canvas/lib/canvas';
import ShapeBase from '@antv/g-canvas/lib/shape/base';
import Node from '../item/node';
import { IGraph } from '../interface/graph';
import { IEdge, INode, ICombo } from '../interface/item';
import { ILabelConfig } from '../interface/shape';
export interface IPoint {
    x: number;
    y: number;
    anchorIndex?: number;
    [key: string]: number | undefined;
}
export declare type IPointTuple = [number, number];
export declare type Matrix = number[];
export interface IBBox extends BBox {
    centerX?: number;
    centerY?: number;
    [key: string]: number | undefined;
}
export declare type Padding = number | string | number[];
export interface ArrowConfig {
    d?: number;
    path?: string;
    stroke?: string;
    fill?: string;
}
export declare type ShapeStyle = Partial<{
    x: number;
    y: number;
    r: number;
    radius: number;
    width: number;
    height: number;
    offset: number | number[];
    stroke: string | null;
    strokeOpacity: number;
    fill: string | null;
    fillOpacity: number;
    lineWidth: number;
    lineAppendWidth: number;
    path: string | object[];
    points: object[];
    matrix: number[];
    opacity: number;
    size: number | number[];
    endArrow: boolean | ArrowConfig;
    startArrow: boolean | ArrowConfig;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    cursor: string;
    position: string;
    fontSize: number;
}>;
export interface IShapeBase extends ShapeBase {
    isKeyShape: boolean;
}
export interface IRect extends IPoint {
    width: number;
    height: number;
}
export interface ICircle extends IPoint {
    r: number;
}
export interface IEllipse extends IPoint {
    rx: number;
    ry: number;
}
export declare type SourceTarget = 'source' | 'target';
export declare type LoopConfig = Partial<{
    dist: number;
    position: string;
    clockwise: boolean;
}>;
export interface LayoutConfig {
    type?: string;
    [key: string]: unknown;
}
export interface GraphAnimateConfig extends AnimateCfg {
    /**
     * ???????????????????????????????????????????????????
     */
    onFrame?: (item: Item, ratio: number, data?: GraphData, originAttrs?: ShapeStyle) => unknown;
}
export interface ModeOption {
    type: string;
    delegate?: boolean;
    delegateStyle?: object;
    updateEdge?: boolean;
    trigger?: string;
    enableDelegate?: boolean;
    maxZoom?: number;
    minZoom?: number;
    enableOptimize?: boolean;
    optimizeZoom?: number;
    multiple?: boolean;
    activeState?: string;
    comboActiveState?: string;
    selectedState?: string;
    onlyChangeComboSize?: boolean;
    includeEdges?: boolean;
    direction?: 'x' | 'y';
    shouldUpdate?: (e: IG6GraphEvent) => boolean;
    shouldBegin?: (e: IG6GraphEvent) => boolean;
    shouldEnd?: (e: IG6GraphEvent) => boolean;
    onChange?: (item?: Item, judge?: boolean) => unknown;
    onSelect?: (selectedNodes?: Item[], selectedEdges?: Item[]) => unknown;
    onDeselect?: (selectedNodes?: Item[], selectedEdges?: Item[]) => unknown;
    formatText?: (data: {
        [key: string]: unknown;
    }) => string;
}
export declare type ModeType = string | ModeOption;
export interface Modes {
    default?: ModeType[];
    [key: string]: ModeType[] | undefined;
}
export interface States {
    [key: string]: INode[];
}
export interface GraphOptions {
    /**
     * ?????? DOM ???????????????????????? DOM ??? id ??????????????????????????? HTML ????????????
     */
    container: string | HTMLElement;
    /**
     * ?????????????????????????????? 'px'
     */
    width: number;
    /**
     * ?????????????????????????????? 'px'
     */
    height: number;
    /**
     * renderer canvas or svg
     */
    renderer?: string;
    fitView?: boolean;
    fitCenter?: boolean;
    layout?: LayoutConfig;
    /**
     * ?????????????????????????????????????????????
     * ??????????????????, ?????????fitViewPadding: 20
     * ????????????????????????????????????fitViewPadding: [20, 40, 50,20]
     * ??????????????????????????????????????????????????????????????????????????????????????????????????? ???????????????????????????????????????
     */
    fitViewPadding?: Padding;
    /**
     * ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? false ?????????????????????????????????????????????????????????
     * ????????????true
     */
    groupByTypes?: boolean;
    directed?: boolean;
    groupStyle?: {
        style?: {
            [key: string]: ShapeStyle;
        };
    };
    /**
     * ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? setAutoPaint() ?????????
     * ????????????true
     */
    autoPaint?: boolean;
    /**
     * ????????????????????????????????????G6??????Mode?????????
     */
    modes?: Modes;
    /**
     * ??????????????????????????????????????? type, size, color?????????????????? data ?????????
     */
    defaultNode?: Partial<{
        shape: string;
        type: string;
        size: number | number[];
        color: string;
    }> & ModelStyle;
    /**
     * ???????????????????????????????????? type, size, color?????????????????? data ?????????
     */
    defaultEdge?: Partial<{
        shape: string;
        type: string;
        size: number | number[];
        color: string;
    }> & ModelStyle;
    /**
     * Combo ????????????
     */
    defaultCombo?: Partial<{
        type: string;
        size: number | number[];
        color: string;
    }> & ModelStyle;
    nodeStateStyles?: StateStyles;
    edgeStateStyles?: StateStyles;
    comboStateStyles?: StateStyles;
    /**
     * ??? graph ????????????????????????????????????plugin
     */
    plugins?: any[];
    /**
     * ???????????????????????????
     */
    animate?: boolean;
    /**
     * ????????????????????????animate???true????????????
     */
    animateCfg?: GraphAnimateConfig;
    /**
     * ??????????????????
     * ????????? 0.2
     */
    minZoom?: number;
    /**
     * ??????????????????
     * ????????? 10
     */
    maxZoom?: number;
    groupType?: string;
    /**
     * Edge ???????????????????????????
     */
    linkCenter?: boolean;
}
interface StateStyles {
    [key: string]: ShapeStyle | {
        [key: string]: ShapeStyle;
    };
}
export declare type ModelStyle = Partial<{
    [key: string]: unknown;
    style: ShapeStyle;
    stateStyles: StateStyles;
}>;
export declare type LabelStyle = Partial<{
    rotate: number;
    textAlign: string;
    angle: number;
    x: number;
    y: number;
    text: string;
    stroke: string | null;
    opacity: number;
    fontSize: number;
    fontStyle: string;
    fill: string | null;
    rotateCenter: string;
    lineWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    position: string;
    textBaseline: string;
    offset: number;
    background?: {
        fill?: string;
        stroke?: string;
        lineWidth?: number;
        radius?: number[] | number;
        padding?: number[] | number;
    };
}>;
export declare type Easeing = 'easeLinear' | 'easePolyIn' | 'easePolyOut' | 'easePolyInOut' | 'easeQuad' | 'easeQuadIn' | 'easeQuadOut' | 'easeQuadInOut' | string;
export interface ModelConfig extends ModelStyle {
    shape?: string;
    type?: string;
    label?: string | LabelStyle;
    labelCfg?: ILabelConfig;
    x?: number;
    y?: number;
    size?: number | number[];
    color?: string;
    anchorPoints?: number[][];
}
export interface NodeConfig extends ModelConfig {
    id: string;
    groupId?: string;
    comboId?: string;
    children?: TreeGraphData[];
    description?: string;
    descriptionCfg?: {
        style?: object;
        [key: string]: unknown;
    };
    img?: string;
    innerR?: number;
    direction?: string;
    preRect?: {
        show?: boolean;
        [key: string]: unknown;
    };
    logoIcon?: {
        show?: boolean;
        [key: string]: unknown;
    };
    stateIcon?: {
        show?: boolean;
        [key: string]: unknown;
    };
    linkPoints?: {
        top?: boolean;
        right?: boolean;
        bottom?: boolean;
        left?: boolean;
        size?: number;
        lineWidth?: number;
        fill?: string;
        stroke?: string;
        r?: number;
        [key: string]: unknown;
    };
    icon?: {
        show?: boolean;
        img?: string;
        width?: number;
        height?: number;
        offset?: number;
    };
    clipCfg?: {
        show?: boolean;
        type?: string;
        r?: number;
        rx?: number;
        ry?: number;
        width?: number;
        height?: number;
        points?: number[][];
        path?: Array<Array<string | number>>;
        x?: number;
        y?: number;
    };
}
export interface ComboConfig extends ModelConfig {
    id: string;
    parentId?: string;
    children?: ComboTree[];
    depth?: number;
    padding?: number | number[];
    startPoint: {
        x: number;
        y: number;
    };
    endPoint: {
        x: number;
        y: number;
    };
    collapseIcon?: Partial<{
        show: boolean;
        collapseSymbol: any;
        expandSymbol: any;
        r: number;
        lineWidth: number;
        stroke: string;
        offsetX: number;
        offsetY: number;
    }>;
}
export interface EdgeConfig extends ModelConfig {
    id?: string;
    source?: string;
    target?: string;
    sourceNode?: Node;
    targetNode?: Node;
    startPoint?: IPoint;
    endPoint?: IPoint;
    controlPoints?: IPoint[];
    curveOffset?: number | number[];
    loopCfg?: LoopConfig;
    labelCfg?: ILabelConfig;
}
export declare type EdgeData = EdgeConfig & {
    sourceNode: Node;
    targetNode: Node;
    startPoint: IPoint;
    endPoint: IPoint;
};
export interface NodeMap {
    [key: string]: INode;
}
export interface NodeConfigMap {
    [key: string]: NodeConfig;
}
export interface GroupConfig {
    id: string;
    parentId?: string;
    [key: string]: string | ModelStyle | undefined;
}
export interface GroupNodeIds {
    [key: string]: string[];
}
export interface GraphData {
    nodes?: NodeConfig[];
    edges?: EdgeConfig[];
    groups?: GroupConfig[];
    combos?: ComboConfig[];
}
export interface TreeGraphData {
    id: string;
    label?: string;
    x?: number;
    y?: number;
    children?: TreeGraphData[];
    data?: ModelConfig;
    side?: 'left' | 'right';
    depth?: number;
    collapsed?: boolean;
    style?: ShapeStyle | {
        [key: string]: ShapeStyle;
    };
    stateStyles?: StateStyles;
}
export interface ComboTree {
    id: string;
    label?: string | LabelStyle;
    children?: ComboTree[];
    depth?: number;
    parentId?: string;
    removed?: boolean;
    itemType?: 'node' | 'combo';
    [key: string]: unknown;
}
export declare enum G6Event {
    CLICK = "click",
    MOUSEDOWN = "mousedown",
    MOUDEUP = "mouseup",
    DBLCLICK = "dblclick",
    CONTEXTMENU = "contextmenu",
    MOUSEENTER = "mouseenter",
    MOUSEOUT = "mouseout",
    MOUSEOVER = "mouseover",
    MOUSEMOVE = "mousemove",
    MOUSELEAVE = "mouseleave",
    DRAGSTART = "dragstart",
    DRAGEND = "dragend",
    DRAG = "drag",
    DRAGENTER = "dragenter",
    DRAGLEAVE = "dragleave",
    DRAGOVER = "dragover",
    DRAGOUT = "dragout",
    DDROP = "drop",
    KEYUP = "keyup",
    KEYDOWN = "keydown",
    WHEEL = "wheel",
    FOCUS = "focus",
    NODE_CLICK = "node:click",
    NODE_CONTEXTMENU = "node:contextmenu",
    NODE_DBLCLICK = "node:dblclick",
    NODE_DRAGSTART = "node:dragstart",
    NODE_DRAG = "node:drag",
    NODE_DRAGEND = "node:dragend",
    NODE_MOUSEENTER = "node:mouseenter",
    NODE_MOUSELEAVE = "node:mouseleave",
    NODE_MOUSEMOVE = "node:mousemove",
    NODE_DROP = "node:drop",
    NODE_DRAGENTER = "node:dragenter",
    NODE_DRAGLEAVE = "node:dragleave",
    EDGE_CLICK = "edge:click",
    EDGE_CONTEXTMENU = "edge:contextmenu",
    EDGE_DBLCLICK = "edge:dblclick",
    EDGE_MOUSEENTER = "edge:mouseenter",
    EDGE_MOUSELEAVE = "edge:mouseleave",
    EDGE_MOUSEMOVE = "edge:mousemove",
    CANVAS_MOUSEDOWN = "canvas:mousedown",
    CANVAS_MOUSEMOVE = "canvas:mousemove",
    CANVAS_MOUSEUP = "canvas:mouseup",
    CANVAS_CLICK = "canvas:click",
    CANVAS_MOSUELEAVE = "canvas:mouseleave",
    CANVAS_DRAGSTART = "canvas:dragstart",
    CANVAS_DRAG = "canvas:drag",
    CANVAS_DRAGEND = "canvas:dragend",
    COMBO_CLICK = "combo:click",
    COMBO_CONTEXTMENU = "combo:contextmenu",
    COMBO_DBLCLICK = "combo:dblclick",
    COMBO_DRAGSTART = "combo:dragstart",
    COMBO_DRAG = "combo:drag",
    COMBO_DRAGEND = "combo:dragend",
    COMBO_MOUSEENTER = "combo:mouseenter",
    COMBO_MOUSELEAVE = "combo:mouseleave",
    COMBO_MOUSEMOVE = "combo:mousemove",
    COMBO_DROP = "combo:drop",
    COMBO_DRAGOVER = "combo:dragover",
    COMBO_DRAGLEAVE = "combo:dragleave",
    COMBO_DRAGENTER = "combo:dragenter"
}
export declare type DefaultBehaviorType = IG6GraphEvent | string | number | object;
export interface BehaviorOption {
    getEvents(): {
        [key in G6Event]?: string;
    };
    getDefaultCfg?(): object;
    shouldBegin?(e?: IG6GraphEvent): boolean;
    shouldUpdate?(e?: IG6GraphEvent): boolean;
    shouldEnd?(e?: IG6GraphEvent): boolean;
    bind?(e: IGraph): void;
    unbind?(e: IGraph): void;
    [key: string]: unknown;
}
export declare type IEvent = Record<G6Event, string>;
export interface IG6GraphEvent extends GraphEvent {
    item: Item | null;
    canvasX: number;
    canvasY: number;
    wheelDelta: number;
    detail: number;
    key?: string;
    target: Item & Canvas;
}
export declare type Item = INode | IEdge | ICombo;
export declare type ITEM_TYPE = 'node' | 'edge' | 'combo' | 'group' | 'vedge';
export declare type NodeIdxMap = {
    [key: string]: number;
};
export interface ViewPortEventParam {
    action: string;
    matrix: Matrix;
}
export interface Indexable<T> {
    [key: string]: T;
}
export interface IAlgorithmCallbacks {
    enter?: (param: {
        current: INode;
        previous: INode;
    }) => void;
    leave?: (param: {
        current: INode;
        previous?: INode;
    }) => void;
    allowTraversal?: (param: {
        previous?: INode;
        current?: INode;
        next: INode;
    }) => boolean;
}
export {};
