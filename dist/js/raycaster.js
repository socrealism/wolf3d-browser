"use strict";
class Raycaster {
}
Raycaster.UPPERZCOORD = 0.6;
Raycaster.LOWERZCOORD = -0.6;
Raycaster.TRACE_MARK_MAP = 1;
Raycaster.TRACE_SIGHT = 2;
Raycaster.TRACE_SIGHT_AI = 4;
Raycaster.TRACE_BULLET = 8;
Raycaster.TRACE_OBJECT = 16;
Raycaster.TRACE_HIT_VERT = 32;
Raycaster.TRACE_HIT_DOOR = 64;
Raycaster.TRACE_HIT_PWALL = 128;
Wolf.Raycaster = (function () {
    var x_tile_step = [1, -1, -1, 1], y_tile_step = [1, 1, -1, -1];
    var TILESHIFT = Wolf.TILESHIFT, TRACE_HIT_VERT = Raycaster.TRACE_HIT_VERT, TILEGLOBAL = Wolf.TILEGLOBAL, WALL_TILE = Wolf.WALL_TILE, DOOR_TILE = Wolf.DOOR_TILE, TILE2POS = Wolf.TILE2POS, POS2TILE = Wolf.POS2TILE, FINE2RAD = Wolf.FINE2RAD, TRACE_HIT_DOOR = Raycaster.TRACE_HIT_DOOR, PUSHWALL_TILE = Wolf.PUSHWALL_TILE, TRACE_HIT_PWALL = Raycaster.TRACE_HIT_PWALL, DOOR_FULLOPEN = Doors.DOOR_FULLOPEN, XnextTable = Wolf.Math.XnextTable, YnextTable = Wolf.Math.YnextTable, getQuadrant = Wolf.Math.getQuadrant, TanTable = Wolf.Math.TanTable;
    function traceCheck(tileMap, doorMap, visibleTiles, x, y, frac, dfrac, vert, flip, tracePoint) {
        var door;
        if (tileMap[x][y] & WALL_TILE) {
            if (vert) {
                tracePoint.x = (x << TILESHIFT) + (flip ? TILEGLOBAL : 0);
                tracePoint.y = (y << TILESHIFT) + frac;
                tracePoint.flags |= TRACE_HIT_VERT;
            }
            else {
                tracePoint.x = (x << TILESHIFT) + frac;
                tracePoint.y = (y << TILESHIFT) + (flip ? TILEGLOBAL : 0);
                tracePoint.flags &= ~TRACE_HIT_VERT;
            }
            tracePoint.tileX = x;
            tracePoint.tileY = y;
            tracePoint.frac = frac / TILEGLOBAL;
            return true;
        }
        if (visibleTiles) {
            visibleTiles[x][y] = true;
        }
        if (tileMap[x][y] & DOOR_TILE && doorMap[x][y].action != Doors.dr_open) {
            door = doorMap[x][y];
            frac += dfrac >> 1;
            if (POS2TILE(frac)) {
                return false;
            }
            if (vert) {
                if (door.action != Doors.dr_closed && (frac >> 10) > Doors.DOOR_FULLOPEN - Doors.opened(door)) {
                    return false;
                }
                tracePoint.x = TILE2POS(x);
                tracePoint.y = (y << TILESHIFT) + frac;
                tracePoint.flags |= TRACE_HIT_VERT;
                tracePoint.frac = frac / TILEGLOBAL;
            }
            else {
                if (door.action != Doors.dr_closed && (frac >> 10) < Doors.opened(door)) {
                    return false;
                }
                tracePoint.y = TILE2POS(y);
                tracePoint.x = (x << TILESHIFT) + frac;
                tracePoint.flags &= ~TRACE_HIT_VERT;
                tracePoint.frac = 1 - frac / TILEGLOBAL;
            }
            tracePoint.flags |= TRACE_HIT_DOOR;
            tracePoint.tileX = x;
            tracePoint.tileY = y;
            tracePoint.frac += Doors.opened(door) / Doors.DOOR_FULLOPEN;
            return true;
        }
        if (tileMap[x][y] & PUSHWALL_TILE) {
            var pwall = Wolf.PushWall.get(), offset = pwall.pointsMoved / 128;
            frac += dfrac * offset;
            if (POS2TILE(frac)) {
                return false;
            }
            if (vert) {
                tracePoint.x = (x << TILESHIFT) + (flip ? TILEGLOBAL : 0) + offset * TILEGLOBAL * (flip ? -1 : 1);
                tracePoint.y = (y << TILESHIFT) + frac;
                tracePoint.flags |= TRACE_HIT_VERT;
            }
            else {
                tracePoint.x = (x << TILESHIFT) + frac;
                tracePoint.y = (y << TILESHIFT) + (flip ? TILEGLOBAL : 0) + offset * TILEGLOBAL * (flip ? -1 : 1);
                tracePoint.flags &= ~TRACE_HIT_VERT;
            }
            tracePoint.flags |= TRACE_HIT_PWALL;
            tracePoint.tileX = x;
            tracePoint.tileY = y;
            tracePoint.frac = frac / TILEGLOBAL;
            return true;
        }
        return false;
    }
    function trace(level, visibleTiles, tracePoint) {
        var xtilestep, ytilestep, xstep, ystep, xtile, ytile, xintercept, yintercept, YmapPos, XmapPos, tileMap = level.tileMap, doorMap = level.state.doorMap, q;
        q = getQuadrant(FINE2RAD(tracePoint.angle));
        xtilestep = x_tile_step[q];
        ytilestep = y_tile_step[q];
        xtile = POS2TILE(tracePoint.x) + xtilestep;
        ytile = POS2TILE(tracePoint.y) + ytilestep;
        xstep = ytilestep * XnextTable[tracePoint.angle];
        ystep = xtilestep * YnextTable[tracePoint.angle];
        xintercept = (((((ytilestep == -1 ? ytile + 1 : ytile) << TILESHIFT) - tracePoint.y)
            / TanTable[tracePoint.angle]) >> 0) + tracePoint.x;
        yintercept = (((((xtilestep == -1 ? xtile + 1 : xtile) << TILESHIFT) - tracePoint.x)
            * TanTable[tracePoint.angle]) >> 0) + tracePoint.y;
        YmapPos = yintercept >> TILESHIFT;
        XmapPos = xintercept >> TILESHIFT;
        if (visibleTiles) {
            visibleTiles[POS2TILE(tracePoint.x)][POS2TILE(tracePoint.y)] = true;
        }
        var traceCount = 0;
        while (1) {
            traceCount++;
            while (!(ytilestep == -1 && YmapPos <= ytile) && !(ytilestep == 1 && YmapPos >= ytile)) {
                if (xtile < 0 || xtile >= 64 || YmapPos < 0 || YmapPos >= 64) {
                    tracePoint.oob = true;
                    return;
                }
                if (traceCheck(tileMap, doorMap, visibleTiles, xtile, YmapPos, yintercept % TILEGLOBAL, ystep, true, (xtilestep == -1), tracePoint)) {
                    if (xstep < 0) {
                        tracePoint.frac = 1 - tracePoint.frac;
                    }
                    return;
                }
                xtile += xtilestep;
                yintercept += ystep;
                YmapPos = yintercept >> TILESHIFT;
            }
            while (!(xtilestep == -1 && XmapPos <= xtile) && !(xtilestep == 1 && XmapPos >= xtile)) {
                if (ytile < 0 || ytile >= 64 || XmapPos < 0 || XmapPos >= 64) {
                    tracePoint.oob = true;
                    return;
                }
                if (traceCheck(tileMap, doorMap, visibleTiles, XmapPos, ytile, xintercept % TILEGLOBAL, xstep, false, (ytilestep == -1), tracePoint)) {
                    if (ystep > 0) {
                        tracePoint.frac = 1 - tracePoint.frac;
                    }
                    return;
                }
                ytile += ytilestep;
                xintercept += xstep;
                XmapPos = xintercept >> TILESHIFT;
            }
            if (traceCount > 1000) {
                return;
            }
        }
    }
    function traceRays(viewport, level) {
        var n, i, j, tileMap = level.tileMap, tracePoint, visibleTiles = [], numRays = Wolf.XRES / Wolf.SLICE_WIDTH, tracers = [];
        for (i = 0; i < 64; i++) {
            visibleTiles[i] = [];
            for (j = 0; j < 64; j++) {
                visibleTiles[i][j] = 0;
            }
        }
        for (n = 0; n < numRays; ++n) {
            tracePoint = {
                x: viewport.x,
                y: viewport.y,
                angle: Wolf.Math.normalizeAngle(viewport.angle - Wolf.Math.ColumnAngle[n * Wolf.SLICE_WIDTH]),
                flags: Raycaster.TRACE_SIGHT | Raycaster.TRACE_MARK_MAP,
                oob: false
            };
            trace(level, visibleTiles, tracePoint);
            tracers[n] = tracePoint;
            if (tracePoint.oob) {
                if (n > 0 && !tracers[n - 1].oob) {
                    tracers[n] = tracers[n - 1];
                }
            }
        }
        return {
            visibleTiles: visibleTiles,
            tracers: tracers
        };
    }
    return {
        traceRays: traceRays,
        trace: trace
    };
})();
