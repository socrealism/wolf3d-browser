/**
 * @namespace
 * @description Angle math
 */
class Angle {
    static readonly DEG2RAD = function (a) { // a * M_PI / 180.0f
        return a * 0.01745329251994329576;
    };
    static readonly RAD2DEG = function (a) { // a * 180.0f / M_PI
        return a / 0.01745329251994329576;
    };
    static readonly ANGLE2SHORT = function (x) {
        return ((x * 65536 / 360) >> 0) & 65535;
    };
    static readonly SHORT2ANGLE = function (x) {
        return x * 360.0 / 65536;
    };

    /**
     * @description Finds the difference between two angles.
     * @param {number} angle1 Angle in radians.
     * @param {number} angle2 Angle in radians.
     * @returns {number} The absolute difference between two angles, this will always be between 0 and 180 degrees.
     */
    static diff(angle1, angle2) {
        let d;

        if (angle1 > angle2) {
            d = angle1 - angle2;
        } else {
            d = angle2 - angle1;
        }

        if (d > Math.PI) {
            return 2 * Math.PI - d;
        } else {
            return d;
        }
    }

    /**
     * @description Clockwise distance between two angles.
     * @param {number} angle1 Angle in radians.
     * @param {number} angle2 Angle in radians.
     * @returns {number} The clockwise distance from angle2 to angle1, this may be greater than 180 degrees.
     */
    static distCW(angle1, angle2) {
        if (angle1 > angle2) {
            return angle1 - angle2;
        } else {
            return angle1 + 2 * Math.PI - angle2;
        }
    }

    /**
     * @description Linear interpolate between angle from and to by fraction frac.
     * @param {number} from Angle in radians.
     * @param {number} to Angle in radians.
     * @param {number} frac Fraction.
     * @returns {number}
     */
    static interpolate(from, to, frac) {
        const diff = Angle.diff(from, to) * frac;

        if (Angle.distCW(to, from) >= Math.PI) {
            return from - diff;
        } else {
            return from + diff;
        }
    }

    /**
     * @description Normalize angle.
     * @param {number} angle
     * @returns {number}
     */
    static normalize(angle) {
        while (angle < 0) {
            angle += (2 * Math.PI);
        }

        while (angle >= (2 * Math.PI)) {
            angle -= (2 * Math.PI);
        }

        return angle;
    }

    /**
     * @description Linear interpolate allowing for the Modulo 360 problem.
     * @param {number} from Angle in radians.
     * @param {number} to Angle in radians.
     * @param {number} frac fraction.
     * @returns {number}
     */

    static lerp(from, to, frac) {
        if (to - from > 180) {
            to -= 360;
        }

        if (to - from < -180) {
            to += 360;
        }

        return from + frac * (to - from);
    }
}
