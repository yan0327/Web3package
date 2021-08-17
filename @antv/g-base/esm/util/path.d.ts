import { PathCommand } from '../types';
declare const parsePathString: (pathString: string) => PathCommand[];
declare const catmullRomToBezier: (crp: any, z: any) => any[];
declare const pathToAbsolute: (pathArray: any) => any[];
declare const pathToCurve: (path: any, path2?: any) => any[];
declare const parsePathArray: (path: any) => any;
declare const rectPath: (x: any, y: any, w: any, h: any, r?: any) => any[][];
declare const intersection: (path1: any, path2: any) => number | any[];
declare const fillPath: (source: any, target: any) => any;
declare const fillPathByDiff: (source: any, target: any) => any;
declare const formatPath: (fromPath: any, toPath: any) => any;
export { catmullRomToBezier, fillPath, fillPathByDiff, formatPath, intersection, parsePathArray, parsePathString, pathToAbsolute, pathToCurve, rectPath, };