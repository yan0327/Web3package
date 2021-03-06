import { PointTuple, BBox } from './types';
declare const _default: {
    /**
     * 计算多折线的包围盒
     * @param {array} points 点的集合 [x,y] 的形式
     * @return {object} 包围盒
     */
    box(points: PointTuple[]): BBox;
    /**
     * 计算多折线的长度
     * @param {array} points 点的集合 [x,y] 的形式
     * @return {object} 多条边的长度
     */
    length(points: PointTuple[]): number;
    /**
     * 根据比例获取多折线的点
     * @param {array} points 点的集合 [x,y] 的形式
     * @param {number} t 在多折线的长度上的比例
     * @return {object} 根据比例值计算出来的点
     */
    pointAt(points: PointTuple[], t: number): import("./types").Point;
    /**
     * 指定点到多折线的距离
     * @param {array} points 点的集合 [x,y] 的形式
     * @param {number} x 指定点的 x
     * @param {number} y 指定点的 y
     * @return {number} 点到多折线的距离
     */
    pointDistance(points: PointTuple[], x: number, y: number): number;
    /**
     * 根据比例获取多折线的切线角度
     * @param {array} points 点的集合 [x,y] 的形式
     * @param {number} t 在多折线的长度上的比例
     * @return {object} 根据比例值计算出来的角度
     */
    tangentAngle(points: PointTuple[], t: number): number;
};
export default _default;
