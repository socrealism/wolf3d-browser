"use strict";
Wolf.Math = (function () {
    var SinTable = [], CosTable = [], TanTable = [], XnextTable = [], YnextTable = [], ColumnAngle = [], q_first = 0, q_second = 1, q_third = 2, q_fourth = 3, dir4_east = 0, dir4_north = 1, dir4_west = 2, dir4_south = 3, dir4_nodir = 4, dir8_east = 0, dir8_northeast = 1, dir8_north = 2, dir8_northwest = 3, dir8_west = 4, dir8_southwest = 5, dir8_south = 6, dir8_southeast = 7, dir8_nodir = 8, dx4dir = [1, 0, -1, 0, 0], dy4dir = [0, 1, 0, -1, 0], dx8dir = [1, 1, 0, -1, -1, -1, 0, 1, 0], dy8dir = [0, 1, 1, 1, 0, -1, -1, -1, 0], opposite4 = [2, 3, 0, 1, 4], opposite8 = [4, 5, 6, 7, 0, 1, 2, 3, 8], dir4to8 = [0, 2, 4, 6, 8], diagonal = [
        [dir8_nodir, dir8_nodir, dir8_northeast, dir8_nodir, dir8_nodir, dir8_nodir, dir8_southeast, dir8_nodir, dir8_nodir],
        [dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir],
        [dir8_northeast, dir8_nodir, dir8_nodir, dir8_nodir, dir8_northwest, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir],
        [dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir],
        [dir8_nodir, dir8_nodir, dir8_northwest, dir8_nodir, dir8_nodir, dir8_nodir, dir8_southwest, dir8_nodir, dir8_nodir],
        [dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir],
        [dir8_southeast, dir8_nodir, dir8_nodir, dir8_nodir, dir8_southwest, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir],
        [dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir],
        [dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir, dir8_nodir]
    ], dir4d = [
        [dir4_nodir, dir4_west, dir4_nodir],
        [dir4_south, dir4_nodir, dir4_north],
        [dir4_nodir, dir4_east, dir4_nodir]
    ], dir8angle = [Wolf.ANG_0, Wolf.ANG_45, Wolf.ANG_90, Wolf.ANG_135, Wolf.ANG_180, Wolf.ANG_225, Wolf.ANG_270, Wolf.ANG_315, Wolf.ANG_0], dir4angle = [Wolf.ANG_0, Wolf.ANG_90, Wolf.ANG_180, Wolf.ANG_270, Wolf.ANG_0];
    function buildTables() {
        var angle, tanfov2, tanval, value, n;
        for (n = 0; n <= Wolf.ANG_90; ++n) {
            angle = Wolf.FINE2RAD(n);
            value = Math.sin(angle);
            SinTable[n] = SinTable[Wolf.ANG_180 - n] = SinTable[n + Wolf.ANG_360] = value;
            SinTable[Wolf.ANG_180 + n] = SinTable[Wolf.ANG_360 - n] = -value;
        }
        for (n = 0; n <= SinTable.length - Wolf.ANG_90; ++n) {
            CosTable[n] = SinTable[n + Wolf.ANG_90];
        }
        for (n = 0; n <= Wolf.ANG_360; ++n) {
            angle = Wolf.FINE2RAD(n);
            if (n == Wolf.ANG_90 || n == Wolf.ANG_270) {
                TanTable[n] = Math.tan(Wolf.FINE2RAD(n - 0.5));
                YnextTable[n] = (Wolf.FLOATTILE * Math.tan(Wolf.FINE2RAD(n - 0.5))) >> 0;
            }
            else {
                TanTable[n] = Math.tan(angle);
                YnextTable[n] = (Wolf.FLOATTILE * Math.tan(angle)) >> 0;
            }
            if (n == Wolf.ANG_0 || n == Wolf.ANG_360) {
                XnextTable[n] = (Wolf.FLOATTILE / Math.tan(Wolf.FINE2RAD(n + 0.5))) >> 0;
            }
            else if (n == Wolf.ANG_180) {
                XnextTable[n] = (Wolf.FLOATTILE / Math.tan(Wolf.FINE2RAD(n - 0.5))) >> 0;
            }
            else if (n == Wolf.ANG_90 || n == Wolf.ANG_270) {
                XnextTable[n] = 0;
            }
            else {
                XnextTable[n] = (Wolf.FLOATTILE / Math.tan(angle)) >> 0;
            }
        }
        tanfov2 = (Math.tan(Wolf.DEG2RAD((calcFov(75, Wolf.XRES, Wolf.YRES) / 2.0)))) * (Wolf.XRES / Wolf.YRES);
        for (n = 0; n < Wolf.XRES; ++n) {
            tanval = tanfov2 * (-1.0 + 2.0 * n / (Wolf.XRES - 1));
            ColumnAngle[n] = Wolf.RAD2FINE(Math.atan(tanval)) >> 0;
        }
        Random.init(true);
        return 1;
    }
    function calcFov(fovX, width, height) {
        if (fovX < 1 || fovX > 179) {
            throw Error("Bad fov: " + fovX);
        }
        return Wolf.RAD2DEG(Math.atan(height / (width / Math.tan(fovX / 360 * Math.PI)))) * 2;
    }
    function normalizeAngle(alpha) {
        if (alpha > Wolf.ANG_360) {
            alpha %= Wolf.ANG_360;
        }
        if (alpha < Wolf.ANG_0) {
            alpha = Wolf.ANG_360 - (-alpha) % Wolf.ANG_360;
        }
        return alpha;
    }
    function getQuadrant(angle) {
        angle = Wolf.Angle.normalize(angle);
        if (angle < Math.PI / 2) {
            return q_first;
        }
        else if (angle < Math.PI) {
            return q_second;
        }
        else if (angle < 3 * Math.PI / 2) {
            return q_third;
        }
        else {
            return q_fourth;
        }
    }
    function get4dir(angle) {
        angle = Wolf.Angle.normalize(angle + Math.PI / 4);
        if (angle < Math.PI / 2) {
            return dir4_east;
        }
        else if (angle < Math.PI) {
            return dir4_north;
        }
        else if (angle < 3 * Math.PI / 2) {
            return dir4_west;
        }
        else {
            return dir4_south;
        }
    }
    function get8dir(angle) {
        angle = Wolf.Angle.normalize(angle + Math.PI / 12);
        if (angle <= (Math.PI / 4)) {
            return dir8_east;
        }
        else if (angle < (Math.PI / 2)) {
            return dir8_northeast;
        }
        else if (angle <= (3 * Math.PI / 4)) {
            return dir8_north;
        }
        else if (angle < Math.PI) {
            return dir8_northwest;
        }
        else if (angle <= (5 * Math.PI / 4)) {
            return dir8_west;
        }
        else if (angle < (3 * Math.PI / 2)) {
            return dir8_southwest;
        }
        else if (angle <= (7 * Math.PI / 4)) {
            return dir8_south;
        }
        else {
            return dir8_southeast;
        }
    }
    function point2LineDist(x, y, a) {
        return Math.abs((x * SinTable[a] - y * CosTable[a]) >> 0);
    }
    function lineLen2Point(x, y, a) {
        return (x * CosTable[a] + y * SinTable[a]) >> 0;
    }
    function transformPoint(point1X, point1Y, point2X, point2Y) {
        var angle = Math.atan2(point1Y - point2Y, point1X - point2X);
        return Wolf.Angle.normalize(angle);
    }
    buildTables();
    return {
        calcFov: calcFov,
        normalizeAngle: normalizeAngle,
        getQuadrant: getQuadrant,
        get4dir: get4dir,
        get8dir: get8dir,
        point2LineDist: point2LineDist,
        lineLen2Point: lineLen2Point,
        transformPoint: transformPoint,
        SinTable: SinTable,
        CosTable: CosTable,
        TanTable: TanTable,
        XnextTable: XnextTable,
        YnextTable: YnextTable,
        ColumnAngle: ColumnAngle,
        dir4_east: dir4_east,
        dir4_north: dir4_north,
        dir4_west: dir4_west,
        dir4_south: dir4_south,
        dir4_nodir: dir4_nodir,
        dir8_east: dir8_east,
        dir8_northeast: dir8_northeast,
        dir8_north: dir8_north,
        dir8_northwest: dir8_northwest,
        dir8_west: dir8_west,
        dir8_southwest: dir8_southwest,
        dir8_south: dir8_south,
        dir8_southeast: dir8_southeast,
        dir8_nodir: dir8_nodir,
        dx4dir: dx4dir,
        dy4dir: dy4dir,
        dx8dir: dx8dir,
        dy8dir: dy8dir,
        dir4angle: dir4angle,
        dir8angle: dir8angle,
        dir4to8: dir4to8,
        opposite4: opposite4,
        opposite8: opposite8,
        diagonal: diagonal
    };
})();
