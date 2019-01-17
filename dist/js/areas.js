"use strict";
class Areas {
    static init(level, areanumber) {
        level.state.areaconnect = [];
        level.state.areabyplayer = [];
        for (let i = 0; i < Wolf.NUMAREAS; i++) {
            level.state.areaconnect[i] = [];
            for (let j = 0; j < Wolf.NUMAREAS; j++) {
                level.state.areaconnect[i][j] = 0;
            }
            level.state.areabyplayer[i] = false;
        }
        level.state.areabyplayer[areanumber] = true;
    }
    static recursiveConnect(level, areanumber) {
        for (let i = 0; i < Wolf.NUMAREAS; ++i) {
            if (level.state.areaconnect[areanumber][i] && !level.state.areabyplayer[i]) {
                level.state.areabyplayer[i] = true;
                Areas.recursiveConnect(level, i);
            }
        }
    }
    static connect(level, areanumber) {
        let i, c = 0;
        if (areanumber >= Wolf.NUMAREAS) {
            throw new Error("areanumber >= Wolf.NUMAREAS");
        }
        level.state.areabyplayer = [];
        level.state.areabyplayer[areanumber] = true;
        Areas.recursiveConnect(level, areanumber);
        for (i = 0; i < Wolf.NUMAREAS; i++) {
            if (level.state.areabyplayer[i]) {
                c++;
            }
        }
    }
    static join(level, area1, area2) {
        if (area1 < 0 || area1 >= Wolf.NUMAREAS) {
            throw new Error("area1 < 0 || area1 >= Wolf.NUMAREAS");
        }
        if (area2 < 0 || area2 >= Wolf.NUMAREAS) {
            throw new Error("area2 < 0 || area2 >= Wolf.NUMAREAS");
        }
        level.state.areaconnect[area1][area2]++;
        level.state.areaconnect[area2][area1]++;
    }
    static disconnect(level, area1, area2) {
        if (area1 < 0 || area1 >= Wolf.NUMAREAS) {
            throw new Error("area1 < 0 || area1 >= Wolf.NUMAREAS");
        }
        if (area2 < 0 || area2 >= Wolf.NUMAREAS) {
            throw new Error("area2 < 0 || area2 >= Wolf.NUMAREAS");
        }
        level.state.areaconnect[area1][area2]--;
        level.state.areaconnect[area2][area1]--;
    }
}
