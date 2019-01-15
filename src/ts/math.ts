/**
 * @namespace
 * @description Math functions and lookup tables
 */
class Mathematik {

    // ------------------------- * LUTs * -------------------------
    static SinTable = []; // [ ANG_360 + ANG_90 + 1 ],
    static CosTable = []; // SinTable + ANG_90,
    static TanTable = []; //[ ANG_360 + 1 ];

    static XnextTable = []; //[ ANG_360 + 1 ],
    static YnextTable = []; //[ ANG_360 + 1 ],

    static ColumnAngle = []; // [ 640 ]; // ViewAngle=PlayerAngle+ColumnAngle[curcolumn]; /in fines/

    // Angle Direction Types & LUTs (Hard Coded! Please do not mess them)
    static q_first = 0;
    static q_second = 1;
    static q_third = 2;
    static q_fourth = 3; // quadrant;

    static dir4_east = 0;
    static dir4_north = 1;
    static dir4_west = 2;
    static dir4_south = 3;
    static dir4_nodir = 4;   // dir4type;

    static dir8_east = 0;
    static dir8_northeast = 1;
    static dir8_north = 2;
    static dir8_northwest = 3;
    static dir8_west = 4;
    static dir8_southwest = 5;
    static dir8_south = 6;
    static dir8_southeast = 7;
    static dir8_nodir = 8; // dir8type;

    static dx4dir = [1, 0, -1, 0, 0];  // dx & dy based on direction
    static dy4dir = [0, 1, 0, -1, 0];
    static dx8dir = [1, 1, 0, -1, -1, -1, 0, 1, 0];  // dx & dy based on direction
    static dy8dir = [0, 1, 1, 1, 0, -1, -1, -1, 0];
    static opposite4 = [2, 3, 0, 1, 4];
    static opposite8 = [4, 5, 6, 7, 0, 1, 2, 3, 8];
    static dir4to8 = [0, 2, 4, 6, 8];
    static diagonal = [
        /* east */  [
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
        /* north */ [
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
        /* west */  [
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
        /* south */ [
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

    // dir of delta tooks dx{-1|0|1}+1 & dy{-1|0|1}+1 and give direction
    static dir4d = [
        [Mathematik.dir4_nodir, Mathematik.dir4_west, Mathematik.dir4_nodir],
        [Mathematik.dir4_south, Mathematik.dir4_nodir, Mathematik.dir4_north],
        [Mathematik.dir4_nodir, Mathematik.dir4_east, Mathematik.dir4_nodir]
    ];
    static dir8angle = [Wolf.ANG_0, Wolf.ANG_45, Wolf.ANG_90, Wolf.ANG_135, Wolf.ANG_180, Wolf.ANG_225, Wolf.ANG_270, Wolf.ANG_315, Wolf.ANG_0];
    static dir4angle = [Wolf.ANG_0, Wolf.ANG_90, Wolf.ANG_180, Wolf.ANG_270, Wolf.ANG_0];

    /**
     * @private
     * @description Build LUTs, etc.
     */
    static buildTables() {
        var angle, tanfov2, tanval, value,
            n;

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
            angle = Wolf.FINE2RAD(n); //angle is in radians, n is in FINEs

            if (n == Wolf.ANG_90 || n == Wolf.ANG_270) {
                Mathematik.TanTable[n] = Math.tan(Wolf.FINE2RAD(n - 0.5));    // infinity
                Mathematik.YnextTable[n] = (Wolf.FLOATTILE * Math.tan(Wolf.FINE2RAD(n - 0.5))) >> 0; // infinity
            } else {
                Mathematik.TanTable[n] = Math.tan(angle);
                Mathematik.YnextTable[n] = (Wolf.FLOATTILE * Math.tan(angle)) >> 0;
            }

            if (n == Wolf.ANG_0 || n == Wolf.ANG_360) {
                Mathematik.XnextTable[n] = (Wolf.FLOATTILE / Math.tan(Wolf.FINE2RAD(n + 0.5))) >> 0; // infinity
            } else if (n == Wolf.ANG_180) {
                Mathematik.XnextTable[n] = (Wolf.FLOATTILE / Math.tan(Wolf.FINE2RAD(n - 0.5))) >> 0; // -infinity
            } else if (n == Wolf.ANG_90 || n == Wolf.ANG_270) {
                Mathematik.XnextTable[n] = 0;
            } else {
                Mathematik.XnextTable[n] = (Wolf.FLOATTILE / Math.tan(angle)) >> 0;
            }
        }

        tanfov2 = (Math.tan(Angle.DEG2RAD((Mathematik.calcFov(75, Wolf.XRES, Wolf.YRES) / 2.0)))) * (Wolf.XRES / Wolf.YRES);
        for (n = 0; n < Wolf.XRES; ++n) {
            tanval = tanfov2 * (-1.0 + 2.0 * n / (Wolf.XRES - 1));
            Mathematik.ColumnAngle[n] = Wolf.RAD2FINE(Math.atan(tanval)) >> 0;
        }

        Random.init(true); // random number generators

        return 1;
    }

    /**
     * @description Calculate the field of view.
     * @param {number} fovX Must be within 1 and 179 degrees.
     * @param {number} width Width of viewing area.
     * @param {number} height Height of viewing area.
     * @returns {number} The field of view in degrees.
     */

    static calcFov(fovX, width, height) {
        if (fovX < 1 || fovX > 179) {
            throw Error("Bad fov: " + fovX);
        }

        return Angle.RAD2DEG(Math.atan(height / (width / Math.tan(fovX / 360 * Math.PI)))) * 2;
    }

    /**
     * @description Clips angle to [0..360] bounds.
     * @param {number} alpha Angle in degrees.
     * @returns {number} Normalized angle.
     */
    static normalizeAngle(alpha) {
        if (alpha > Wolf.ANG_360) {
            alpha %= Wolf.ANG_360;
        }
        if (alpha < Wolf.ANG_0) {
            alpha = Wolf.ANG_360 - (-alpha) % Wolf.ANG_360;
        }
        return alpha;
    }

    /**
     * @description Get quadrant.
     * @param {number} angle Radian angle.
     * @returns {number}
     */
    static getQuadrant(angle) {
        angle = Angle.normalize(angle);

        if (angle < Math.PI / 2) {
            return Mathematik.q_first;
        } else if (angle < Math.PI) {
            return Mathematik.q_second;
        } else if (angle < 3 * Math.PI / 2) {
            return Mathematik.q_third;
        } else {
            return Mathematik.q_fourth;
        }
    }

    /**
     * @description Get 4 point direction.
     * @param {number} angle Radian angle.
     * @returns {number} Directional point.
     */
    static get4dir(angle) {
        angle = Angle.normalize(angle + Math.PI / 4);

        if (angle < Math.PI / 2) {
            return Mathematik.dir4_east;
        } else if (angle < Math.PI) {
            return Mathematik.dir4_north;
        } else if (angle < 3 * Math.PI / 2) {
            return Mathematik.dir4_west;
        } else {
            return Mathematik.dir4_south;
        }
    }

    /**
     * @description Get 8 point direction.
     * @param {number} angle Radian angle.
     * @returns {number} Directional point.
     */
    static get8dir(angle) {
        angle = Angle.normalize(angle + Math.PI / 12);

        if (angle <= (Math.PI / 4)) {
            return Mathematik.dir8_east;
        } else if (angle < (Math.PI / 2)) {
            return Mathematik.dir8_northeast;
        } else if (angle <= (3 * Math.PI / 4)) {
            return Mathematik.dir8_north;
        } else if (angle < Math.PI) {
            return Mathematik.dir8_northwest;
        } else if (angle <= (5 * Math.PI / 4)) {
            return Mathematik.dir8_west;
        } else if (angle < (3 * Math.PI / 2)) {
            return Mathematik.dir8_southwest;
        } else if (angle <= (7 * Math.PI / 4)) {
            return Mathematik.dir8_south;
        } else {
            return Mathematik.dir8_southeast;
        }
    }

    /**
     * @description calculates distance between a point (x, y) and a line.
     * @param {number} x X coord of point
     * @param {number} y Y coord of point
     * @param {number} a Line angle in degrees
     * @returns {number} Distance
     */
    static point2LineDist(x, y, a) {
        return Math.abs((x * Mathematik.SinTable[a] - y * Mathematik.CosTable[a]) >> 0);
    }

    /**
     * @description Calculates line length to the point nearest to (poin).
     * @param {number} x X coord of point
     * @param {number} y Y coord of point
     * @param {number} a Line angle in degrees
     * @returns {number} Distance
     */
    static lineLen2Point(x, y, a) {
        return (x * Mathematik.CosTable[a] + y * Mathematik.SinTable[a]) >> 0;
    }

    /*
                point2 = {x,y}
                  / |
                /   |
               /     |
            /a______|----------> x
        point1 = {x, y}
    */
    /**
     * @description Returns angle in radians
     * @param {number} x X coord of point
     * @param {number} y Y coord of point
     * @param {number} a Line angle in degrees
     * @returns {number} Distance
     */
    static transformPoint(point1X, point1Y, point2X, point2Y) {
        var angle = Math.atan2(point1Y - point2Y, point1X - point2X);
        return Angle.normalize(angle);
    }

    static init() {
        Mathematik.buildTables();
    }
}
