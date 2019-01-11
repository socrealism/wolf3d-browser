"use strict";
var Wolf = {
    XRES: 608,
    YRES: 304,
    SLICE_WIDTH: 3,
    WALL_TEXTURE_WIDTH: 64,
    NUM_WALL_TEXTURES: 55,
    HUD_FACE_WIDTH: 48,
    HUD_FACE_HEIGHT: 64,
    HUD_WEAPON_WIDTH: 256,
    NUMAREAS: 37,
    FIRSTAREA: 0x6B,
    AMBUSHTILE: 0x6A,
    AMBUSH: -2,
    TILEGLOBAL: 0x10000,
    HALFTILE: 0x8000,
    TILESHIFT: 16,
    MINDIST: 0x5800,
    FLOATTILE: 65536.0,
    TILE2POS: function (a) { return (((a) << Wolf.TILESHIFT) + Wolf.HALFTILE); },
    POS2TILE: function (a) { return ((a) >> Wolf.TILESHIFT); },
    POS2TILEf: function (a) { return ((a) / Wolf.FLOATTILE); },
    ASTEP: 0.0078125,
    ASTEPRAD: 0.000136354,
    ANG_1RAD: 7333.8598,
    ANG_0: 0,
    ANG_1: 128,
    ANG_6: 768,
    ANG_15: 1920,
    ANG_22_5: 2880,
    ANG_30: 3840,
    ANG_45: 5760,
    ANG_67_5: 8640,
    ANG_90: 11520,
    ANG_112_5: 14400,
    ANG_135: 17280,
    ANG_157_5: 20160,
    ANG_180: 23040,
    ANG_202_5: 25920,
    ANG_225: 28800,
    ANG_247_5: 31680,
    ANG_270: 34560,
    ANG_292_5: 37440,
    ANG_315: 40320,
    ANG_337_5: 43200,
    ANG_360: 46080,
    ANGLES: 360,
    DEATHROTATE: 2,
    FINE2RAD: function (a) { return (a * Math.PI / Wolf.ANG_180); },
    RAD2FINE: function (a) { return (a * Wolf.ANG_180 / Math.PI); },
    FINE2DEG: function (a) { return (a / Wolf.ANG_1) >> 0; },
    FINE2DEGf: function (a) { return (a / Wolf.ANG_1); },
    DEG2FINE: function (a) { return (a * Wolf.ANG_1); }
};
Wolf.setConsts = function (C) {
    for (var a in C) {
        if (C.hasOwnProperty(a) && !(a in Wolf)) {
            Wolf[a] = C[a];
        }
    }
};
Wolf.noop = function () { };
Wolf.log = function (str) {
    if (typeof console != "undefined") {
        var t = new Date(), e = new Error(), f = "";
        if (typeof str == "object" && typeof e.stack == "string") {
            var s = e.stack.split("\n")[2] + "", m = s.match(/at (.*)$/);
            f = m ? "\t[" + m[1] + "]" : "";
        }
        console.log(t.toLocaleTimeString() + ": " + str + f);
    }
};
