"use strict";
class Wolf {
    static log(str) {
        if (typeof console != "undefined") {
            var t = new Date(), e = new Error(), f = "";
            if (typeof str == "object" && typeof e.stack == "string") {
                var s = e.stack.split("\n")[2] + "", m = s.match(/at (.*)$/);
                f = m ? "\t[" + m[1] + "]" : "";
            }
            console.log(t.toLocaleTimeString() + ": " + str + f);
        }
    }
}
Wolf.XRES = 608;
Wolf.YRES = 304;
Wolf.SLICE_WIDTH = 3;
Wolf.WALL_TEXTURE_WIDTH = 64;
Wolf.NUM_WALL_TEXTURES = 55;
Wolf.HUD_FACE_WIDTH = 48;
Wolf.HUD_FACE_HEIGHT = 64;
Wolf.HUD_WEAPON_WIDTH = 256;
Wolf.NUMAREAS = 37;
Wolf.FIRSTAREA = 0x6B;
Wolf.AMBUSHTILE = 0x6A;
Wolf.AMBUSH = -2;
Wolf.TILEGLOBAL = 0x10000;
Wolf.HALFTILE = 0x8000;
Wolf.TILESHIFT = 16;
Wolf.MINDIST = 0x5800;
Wolf.FLOATTILE = 65536.0;
Wolf.TILE2POS = function (a) {
    return (((a) << Wolf.TILESHIFT) + Wolf.HALFTILE);
};
Wolf.POS2TILE = function (a) {
    return ((a) >> Wolf.TILESHIFT);
};
Wolf.POS2TILEf = function (a) {
    return ((a) / Wolf.FLOATTILE);
};
Wolf.ASTEP = 0.0078125;
Wolf.ASTEPRAD = 0.000136354;
Wolf.ANG_1RAD = 7333.8598;
Wolf.ANG_0 = 0;
Wolf.ANG_1 = 128;
Wolf.ANG_6 = 768;
Wolf.ANG_15 = 1920;
Wolf.ANG_22_5 = 2880;
Wolf.ANG_30 = 3840;
Wolf.ANG_45 = 5760;
Wolf.ANG_67_5 = 8640;
Wolf.ANG_90 = 11520;
Wolf.ANG_112_5 = 14400;
Wolf.ANG_135 = 17280;
Wolf.ANG_157_5 = 20160;
Wolf.ANG_180 = 23040;
Wolf.ANG_202_5 = 25920;
Wolf.ANG_225 = 28800;
Wolf.ANG_247_5 = 31680;
Wolf.ANG_270 = 34560;
Wolf.ANG_292_5 = 37440;
Wolf.ANG_315 = 40320;
Wolf.ANG_337_5 = 43200;
Wolf.ANG_360 = 46080;
Wolf.ANGLES = 360;
Wolf.DEATHROTATE = 2;
Wolf.FINE2RAD = function (a) {
    return (a * Math.PI / Wolf.ANG_180);
};
Wolf.RAD2FINE = function (a) {
    return (a * Wolf.ANG_180 / Math.PI);
};
Wolf.FINE2DEG = function (a) {
    return (a / Wolf.ANG_1) >> 0;
};
Wolf.FINE2DEGf = function (a) {
    return (a / Wolf.ANG_1);
};
Wolf.DEG2FINE = function (a) {
    return (a * Wolf.ANG_1);
};
