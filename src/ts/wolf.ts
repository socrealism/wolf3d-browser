/**
 * @description Wolfenstein 3D
 */
class Wolf {
    static readonly XRES = 608;
    static readonly YRES = 304;
    static readonly SLICE_WIDTH = 3;
    static readonly WALL_TEXTURE_WIDTH = 64;
    static readonly NUM_WALL_TEXTURES = 55;
    static readonly HUD_FACE_WIDTH = 48;
    static readonly HUD_FACE_HEIGHT = 64;
    static readonly HUD_WEAPON_WIDTH = 256;

    static readonly NUMAREAS = 37;   // number of areas
    static readonly FIRSTAREA = 0x6B; // first area in map data (it is by the way a way to the secret floor!)
    static readonly AMBUSHTILE = 0x6A; // def guard
    static readonly AMBUSH = -2;

    static readonly TILEGLOBAL = 0x10000;
    static readonly HALFTILE = 0x8000;
    static readonly TILESHIFT = 16;
    static readonly MINDIST = 0x5800;
    static readonly FLOATTILE = 65536.0;

    static readonly TILE2POS = function (a) {
        return (((a) << Wolf.TILESHIFT) + Wolf.HALFTILE);
    };
    static readonly POS2TILE = function (a) {
        return ((a) >> Wolf.TILESHIFT);
    };
    static readonly POS2TILEf = function (a) {
        return ((a) / Wolf.FLOATTILE);
    };

    static readonly ASTEP = 0.0078125;    // 1 FINE=x DEGREES
    static readonly ASTEPRAD = 0.000136354;  // 1 FINE=x RADIANS
    static readonly ANG_1RAD = 7333.8598;    // 1 RADIAN=x FINES
    static readonly ANG_0 = 0;            //(int)((float)0/ASTEP)
    static readonly ANG_1 = 128;          //(int)((float)1/ASTEP)
    static readonly ANG_6 = 768;          //(int)((float)6/ASTEP)
    static readonly ANG_15 = 1920;         //(int)((float)15/ASTEP)
    static readonly ANG_22_5 = 2880;         //(int)((float)22.5/ASTEP)
    static readonly ANG_30 = 3840;         //(int)((float)30/ASTEP)
    static readonly ANG_45 = 5760;         //(int)((float)45/ASTEP)
    static readonly ANG_67_5 = 8640;         //(int)((float)67.5/ASTEP)
    static readonly ANG_90 = 11520;        //(int)((float)90/ASTEP)
    static readonly ANG_112_5 = 14400;        //(int)((float)112.5/ASTEP)
    static readonly ANG_135 = 17280;        //(int)((float)135/ASTEP)
    static readonly ANG_157_5 = 20160;        //(int)((float)157.5/ASTEP)
    static readonly ANG_180 = 23040;        //(int)((float)180/ASTEP)
    static readonly ANG_202_5 = 25920;        //(int)((float)202.5/ASTEP)
    static readonly ANG_225 = 28800;        //(int)((float)225/ASTEP)
    static readonly ANG_247_5 = 31680;        //(int)((float)247.5/ASTEP)
    static readonly ANG_270 = 34560;        //(int)((float)270/ASTEP)
    static readonly ANG_292_5 = 37440;        //(int)((float)292.5/ASTEP)
    static readonly ANG_315 = 40320;        //(int)((float)225/ASTEP)
    static readonly ANG_337_5 = 43200;        //(int)((float)337.5/ASTEP)
    static readonly ANG_360 = 46080;        //(int)((float)360/ASTEP)

    static readonly ANGLES = 360;          // must be divisable by 4
    static readonly DEATHROTATE = 2;

    static readonly FINE2RAD = function (a) {
        return (a * Math.PI / Wolf.ANG_180);
    };
    static readonly RAD2FINE = function (a) {
        return (a * Wolf.ANG_180 / Math.PI);
    };
    static readonly FINE2DEG = function (a) {
        return (a / Wolf.ANG_1) >> 0;
    }; // !@# don't lose precision bits
    static readonly FINE2DEGf = function (a) {
        return (a / Wolf.ANG_1);
    };
    static readonly DEG2FINE = function (a) {
        return (a * Wolf.ANG_1);
    };

    static log(str) {
        if (typeof console != "undefined") {
            var t = new Date(),
                e = new Error(),
                f = "";
            if (typeof str == "object" && typeof e.stack == "string") {
                // ugly hack to get some kind of reference to where the log call originated
                var s = e.stack.split("\n")[2] + "",
                    m = s.match(/at (.*)$/);
                f = m ? "\t[" + m[1] + "]" : "";
            }
            console.log(t.toLocaleTimeString() + ": " + str + f);
        }
    }
}
