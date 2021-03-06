/**
 * @fileoverview ellipse
 * @author dengfuping_develop@163.com
 */
import ShapeBase from './base';
declare class Ellipse extends ShapeBase {
    type: string;
    canFill: boolean;
    canStroke: boolean;
    getDefaultAttrs(): {
        x: number;
        y: number;
        rx: number;
        ry: number;
        lineWidth: number;
        lineAppendWidth: number;
        strokeOpacity: number;
        fillOpacity: number;
        matrix: any;
        opacity: number;
    };
    createPath(context: any, targetAttrs: any): void;
}
export default Ellipse;
