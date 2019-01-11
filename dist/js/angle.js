"use strict";
Wolf.Angle = (function () {
    Wolf.setConsts({
        DEG2RAD: function (a) { return a * 0.01745329251994329576; },
        RAD2DEG: function (a) { return a / 0.01745329251994329576; },
        ANGLE2SHORT: function (x) { return ((x * 65536 / 360) >> 0) & 65535; },
        SHORT2ANGLE: function (x) { return x * 360.0 / 65536; }
    });
    function diff(angle1, angle2) {
        var d;
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
    function distCW(angle1, angle2) {
        if (angle1 > angle2) {
            return angle1 - angle2;
        }
        else {
            return angle1 + 2 * Math.PI - angle2;
        }
    }
    function interpolate(from, to, frac) {
        var d = diff(from, to) * frac;
        if (distCW(to, from) >= Math.PI) {
            return from - diff;
        }
        else {
            return from + diff;
        }
    }
    function normalize(angle) {
        while (angle < 0) {
            angle += (2 * Math.PI);
        }
        while (angle >= (2 * Math.PI)) {
            angle -= (2 * Math.PI);
        }
        return angle;
    }
    function lerp(from, to, frac) {
        if (to - from > 180) {
            to -= 360;
        }
        if (to - from < -180) {
            to += 360;
        }
        return from + frac * (to - from);
    }
    return {
        diff: diff,
        distCW: distCW,
        normalize: normalize,
        interpolate: interpolate,
        lerp: lerp
    };
})();
