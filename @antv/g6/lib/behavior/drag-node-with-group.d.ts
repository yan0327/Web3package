import { IG6GraphEvent, Item, G6Event } from '../types';
declare const _default: {
    getDefaultCfg(): object;
    getEvents(): {
        click?: string;
        mousedown?: string;
        mouseup?: string;
        dblclick?: string;
        contextmenu?: string;
        mouseenter?: string;
        mouseout?: string;
        mouseover?: string;
        mousemove?: string;
        mouseleave?: string;
        dragstart?: string;
        dragend?: string;
        drag?: string;
        dragenter?: string;
        dragleave?: string;
        dragover?: string;
        dragout?: string;
        drop?: string;
        keyup?: string;
        keydown?: string;
        wheel?: string;
        focus?: string;
        "node:click"?: string;
        "node:contextmenu"?: string;
        "node:dblclick"?: string;
        "node:dragstart"?: string;
        "node:drag"?: string;
        "node:dragend"?: string;
        "node:mouseenter"?: string;
        "node:mouseleave"?: string;
        "node:mousemove"?: string;
        "node:drop"?: string;
        "node:dragenter"?: string;
        "node:dragleave"?: string;
        "edge:click"?: string;
        "edge:contextmenu"?: string;
        "edge:dblclick"?: string;
        "edge:mouseenter"?: string;
        "edge:mouseleave"?: string;
        "edge:mousemove"?: string;
        "canvas:mousedown"?: string;
        "canvas:mousemove"?: string;
        "canvas:mouseup"?: string;
        "canvas:click"?: string;
        "canvas:mouseleave"?: string;
        "canvas:dragstart"?: string;
        "canvas:drag"?: string;
        "canvas:dragend"?: string;
        "combo:click"?: string;
        "combo:contextmenu"?: string;
        "combo:dblclick"?: string;
        "combo:dragstart"?: string;
        "combo:drag"?: string;
        "combo:dragend"?: string;
        "combo:mouseenter"?: string;
        "combo:mouseleave"?: string;
        "combo:mousemove"?: string;
        "combo:drop"?: string;
        "combo:dragover"?: string;
        "combo:dragleave"?: string;
        "combo:dragenter"?: string;
    };
    onDragOver(evt: IG6GraphEvent): void;
    /**
     * 拖动节点移除Group时的事件
     * @param {Event} evt 事件句柄
     */
    onDragLeave(evt: IG6GraphEvent): void;
    onDragStart(e: IG6GraphEvent): void;
    onDrag(e: IG6GraphEvent): void;
    onDragEnd(e: IG6GraphEvent): void;
    setCurrentGroupStyle(evt: IG6GraphEvent): void;
    onOutOfRange(e: IG6GraphEvent): void;
    update(item: Item, e: IG6GraphEvent, force: boolean): void;
    /**
     * 更新拖动元素时的delegate
     * @param {Event} e 事件句柄
     * @param {number} x 拖动单个元素时候的x坐标
     * @param {number} y 拖动单个元素时候的y坐标
     */
    updateDelegate(e: IG6GraphEvent, x: number, y: number): void;
};
export default _default;
