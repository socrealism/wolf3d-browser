"use strict";
class Mathematik {
    static buildTables() {
        let angle, tanfov2, tanval, value, n;
        for (n = 0; n <= Wolf.ANG_90; ++n) {
            angle = Wolf.FINE2RAD(n);
            value = Math.sin(angle);
            Mathematik.SinTable[n] = Mathematik.SinTable[Wolf.ANG_180 - n] = Mathematik.SinTable[n + Wolf.ANG_360] = value;
            Mathematik.SinTable[Wolf.ANG_180 + n] = Mathematik.SinTable[Wolf.ANG_360 - n] = -value;
        }
        for (n = 0; n <= Mathematik.SinTable.length - Wolf.ANG_90; ++n) {
            Mathematik.CosTable[n] = Mathematik.SinTable[n + Wolf.ANG_90];
        }
        for (n = 0; n <= Wolf.ANG_360; ++n) {
            angle = Wolf.FINE2RAD(n);
            if (n == Wolf.ANG_90 || n == Wolf.ANG_270) {
                Mathematik.TanTable[n] = Math.tan(Wolf.FINE2RAD(n - 0.5));
                Mathematik.YnextTable[n] = (Wolf.FLOATTILE * Math.tan(Wolf.FINE2RAD(n - 0.5))) >> 0;
            }
            else {
                Mathematik.TanTable[n] = Math.tan(angle);
                Mathematik.YnextTable[n] = (Wolf.FLOATTILE * Math.tan(angle)) >> 0;
            }
            if (n == Wolf.ANG_0 || n == Wolf.ANG_360) {
                Mathematik.XnextTable[n] = (Wolf.FLOATTILE / Math.tan(Wolf.FINE2RAD(n + 0.5))) >> 0;
            }
            else if (n == Wolf.ANG_180) {
                Mathematik.XnextTable[n] = (Wolf.FLOATTILE / Math.tan(Wolf.FINE2RAD(n - 0.5))) >> 0;
            }
            else if (n == Wolf.ANG_90 || n == Wolf.ANG_270) {
                Mathematik.XnextTable[n] = 0;
            }
            else {
                Mathematik.XnextTable[n] = (Wolf.FLOATTILE / Math.tan(angle)) >> 0;
            }
        }
        tanfov2 = (Math.tan(Angle.DEG2RAD((Mathematik.calcFov(75, Wolf.XRES, Wolf.YRES) / 2.0)))) * (Wolf.XRES / Wolf.YRES);
        for (n = 0; n < Wolf.XRES; ++n) {
            tanval = tanfov2 * (-1.0 + 2.0 * n / (Wolf.XRES - 1));
            Mathematik.ColumnAngle[n] = Wolf.RAD2FINE(Math.atan(tanval)) >> 0;
        }
        return 1;
    }
    static calcFov(fovX, width, height) {
        if (fovX < 1 || fovX > 179) {
            throw Error("Bad fov: " + fovX);
        }
        return Angle.RAD2DEG(Math.atan(height / (width / Math.tan(fovX / 360 * Math.PI)))) * 2;
    }
    static normalizeAngle(alpha) {
        if (alpha > Wolf.ANG_360) {
            alpha %= Wolf.ANG_360;
        }
        if (alpha < Wolf.ANG_0) {
            alpha = Wolf.ANG_360 - (-alpha) % Wolf.ANG_360;
        }
        return alpha;
    }
    static getQuadrant(angle) {
        angle = Angle.normalize(angle);
        if (angle < Math.PI / 2) {
            return Mathematik.q_first;
        }
        else if (angle < Math.PI) {
            return Mathematik.q_second;
        }
        else if (angle < 3 * Math.PI / 2) {
            return Mathematik.q_third;
        }
        else {
            return Mathematik.q_fourth;
        }
    }
    static get4dir(angle) {
        angle = Angle.normalize(angle + Math.PI / 4);
        if (angle < Math.PI / 2) {
            return Mathematik.dir4_east;
        }
        else if (angle < Math.PI) {
            return Mathematik.dir4_north;
        }
        else if (angle < 3 * Math.PI / 2) {
            return Mathematik.dir4_west;
        }
        else {
            return Mathematik.dir4_south;
        }
    }
    static get8dir(angle) {
        angle = Angle.normalize(angle + Math.PI / 12);
        if (angle <= (Math.PI / 4)) {
            return Mathematik.dir8_east;
        }
        else if (angle < (Math.PI / 2)) {
            return Mathematik.dir8_northeast;
        }
        else if (angle <= (3 * Math.PI / 4)) {
            return Mathematik.dir8_north;
        }
        else if (angle < Math.PI) {
            return Mathematik.dir8_northwest;
        }
        else if (angle <= (5 * Math.PI / 4)) {
            return Mathematik.dir8_west;
        }
        else if (angle < (3 * Math.PI / 2)) {
            return Mathematik.dir8_southwest;
        }
        else if (angle <= (7 * Math.PI / 4)) {
            return Mathematik.dir8_south;
        }
        else {
            return Mathematik.dir8_southeast;
        }
    }
    static point2LineDist(x, y, a) {
        return Math.abs((x * Mathematik.SinTable[a] - y * Mathematik.CosTable[a]) >> 0);
    }
    static lineLen2Point(x, y, a) {
        return (x * Mathematik.CosTable[a] + y * Mathematik.SinTable[a]) >> 0;
    }
    static transformPoint(point1X, point1Y, point2X, point2Y) {
        const angle = Math.atan2(point1Y - point2Y, point1X - point2X);
        return Angle.normalize(angle);
    }
    static init() {
        Mathematik.buildTables();
    }
}
Mathematik.SinTable = [];
Mathematik.CosTable = [];
Mathematik.TanTable = [];
Mathematik.XnextTable = [];
Mathematik.YnextTable = [];
Mathematik.ColumnAngle = [];
Mathematik.q_first = 0;
Mathematik.q_second = 1;
Mathematik.q_third = 2;
Mathematik.q_fourth = 3;
Mathematik.dir4_east = 0;
Mathematik.dir4_north = 1;
Mathematik.dir4_west = 2;
Mathematik.dir4_south = 3;
Mathematik.dir4_nodir = 4;
Mathematik.dir8_east = 0;
Mathematik.dir8_northeast = 1;
Mathematik.dir8_north = 2;
Mathematik.dir8_northwest = 3;
Mathematik.dir8_west = 4;
Mathematik.dir8_southwest = 5;
Mathematik.dir8_south = 6;
Mathematik.dir8_southeast = 7;
Mathematik.dir8_nodir = 8;
Mathematik.dx4dir = [1, 0, -1, 0, 0];
Mathematik.dy4dir = [0, 1, 0, -1, 0];
Mathematik.dx8dir = [1, 1, 0, -1, -1, -1, 0, 1, 0];
Mathematik.dy8dir = [0, 1, 1, 1, 0, -1, -1, -1, 0];
Mathematik.opposite4 = [2, 3, 0, 1, 4];
Mathematik.opposite8 = [4, 5, 6, 7, 0, 1, 2, 3, 8];
Mathematik.dir4to8 = [0, 2, 4, 6, 8];
Mathematik.diagonal = [
    [
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_northeast,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_southeast,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ], [
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ],
    [
        Mathematik.dir8_northeast,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_northwest,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ], [
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ],
    [
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_northwest,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_southwest,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ], [
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ],
    [
        Mathematik.dir8_southeast,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_southwest,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ], [
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ], [
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir,
        Mathematik.dir8_nodir
    ]
];
Mathematik.dir4d = [
    [Mathematik.dir4_nodir, Mathematik.dir4_west, Mathematik.dir4_nodir],
    [Mathematik.dir4_south, Mathematik.dir4_nodir, Mathematik.dir4_north],
    [Mathematik.dir4_nodir, Mathematik.dir4_east, Mathematik.dir4_nodir]
];
Mathematik.dir8angle = [Wolf.ANG_0, Wolf.ANG_45, Wolf.ANG_90, Wolf.ANG_135, Wolf.ANG_180, Wolf.ANG_225, Wolf.ANG_270, Wolf.ANG_315, Wolf.ANG_0];
Mathematik.dir4angle = [Wolf.ANG_0, Wolf.ANG_90, Wolf.ANG_180, Wolf.ANG_270, Wolf.ANG_0];
Mathematik.init();
