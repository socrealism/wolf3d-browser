"use strict";
Wolf.Areas = (function () {
    function init(level, areanumber) {
        level.state.areaconnect = [];
        level.state.areabyplayer = [];
        for (var i = 0; i < Wolf.NUMAREAS; i++) {
            level.state.areaconnect[i] = [];
            for (var j = 0; j < Wolf.NUMAREAS; j++) {
                level.state.areaconnect[i][j] = 0;
            }
            level.state.areabyplayer[i] = false;
        }
        level.state.areabyplayer[areanumber] = true;
    }
    function recursiveConnect(level, areanumber) {
        for (var i = 0; i < Wolf.NUMAREAS; ++i) {
            if (level.state.areaconnect[areanumber][i] && !level.state.areabyplayer[i]) {
                level.state.areabyplayer[i] = true;
                recursiveConnect(level, i);
            }
        }
    }
    function connect(level, areanumber) {
        var i, c = 0;
        if (areanumber >= Wolf.NUMAREAS) {
            throw new Error("areanumber >= Wolf.NUMAREAS");
        }
        level.state.areabyplayer = [];
        level.state.areabyplayer[areanumber] = true;
        recursiveConnect(level, areanumber);
        for (i = 0; i < Wolf.NUMAREAS; i++) {
            if (level.state.areabyplayer[i]) {
                c++;
            }
        }
    }
    function join(level, area1, area2) {
        if (area1 < 0 || area1 >= Wolf.NUMAREAS) {
            throw new Error("area1 < 0 || area1 >= Wolf.NUMAREAS");
        }
        if (area2 < 0 || area2 >= Wolf.NUMAREAS) {
            throw new Error("area2 < 0 || area2 >= Wolf.NUMAREAS");
        }
        level.state.areaconnect[area1][area2]++;
        level.state.areaconnect[area2][area1]++;
    }
    function disconnect(level, area1, area2) {
        if (area1 < 0 || area1 >= Wolf.NUMAREAS) {
            throw new Error("area1 < 0 || area1 >= Wolf.NUMAREAS");
        }
        if (area2 < 0 || area2 >= Wolf.NUMAREAS) {
            throw new Error("area2 < 0 || area2 >= Wolf.NUMAREAS");
        }
        level.state.areaconnect[area1][area2]--;
        level.state.areaconnect[area2][area1]--;
    }
    return {
        init: init,
        connect: connect,
        join: join,
        disconnect: disconnect
    };
})();
