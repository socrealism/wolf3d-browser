"use strict";
class Angle {
    static diff(angle1, angle2) {
        let d;
        if (angle1 > angle2) {
            d = angle1 - angle2;
        }
        else {
            d = angle2 - angle1;
        }
        if (d > Math.PI) {
            return 2 * Math.PI - d;
        }
        else {
            return d;
        }
    }
    static distCW(angle1, angle2) {
        if (angle1 > angle2) {
            return angle1 - angle2;
        }
        else {
            return angle1 + 2 * Math.PI - angle2;
        }
    }
    static normalize(angle) {
        while (angle < 0) {
            angle += (2 * Math.PI);
        }
        while (angle >= (2 * Math.PI)) {
            angle -= (2 * Math.PI);
        }
        return angle;
    }
}
Angle.DEG2RAD = function (a) {
    return a * 0.01745329251994329576;
};
Angle.RAD2DEG = function (a) {
    return a / 0.01745329251994329576;
};
Angle.ANGLE2SHORT = function (x) {
    return ((x * 65536 / 360) >> 0) & 65535;
};
Angle.SHORT2ANGLE = function (x) {
    return x * 360.0 / 65536;
};
