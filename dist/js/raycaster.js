"use strict";
class Raycaster {
    static traceCheck(tileMap, doorMap, visibleTiles, x, y, frac, dfrac, vert, flip, tracePoint) {
        let door;
        if (tileMap[x][y] & Level.WALL_TILE) {
            if (vert) {
                tracePoint.x = (x << Wolf.TILESHIFT) + (flip ? Wolf.TILEGLOBAL : 0);
                tracePoint.y = (y << Wolf.TILESHIFT) + frac;
                tracePoint.flags |= Raycaster.TRACE_HIT_VERT;
            }
            else {
                tracePoint.x = (x << Wolf.TILESHIFT) + frac;
                tracePoint.y = (y << Wolf.TILESHIFT) + (flip ? Wolf.TILEGLOBAL : 0);
                tracePoint.flags &= ~Raycaster.TRACE_HIT_VERT;
            }
            tracePoint.tileX = x;
            tracePoint.tileY = y;
            tracePoint.frac = frac / Wolf.TILEGLOBAL;
            return true;
        }
        if (visibleTiles) {
            visibleTiles[x][y] = true;
        }
        if (tileMap[x][y] & Level.DOOR_TILE && doorMap[x][y].action != Doors.dr_open) {
            door = doorMap[x][y];
            frac += dfrac >> 1;
            if (Wolf.POS2TILE(frac)) {
                return false;
            }
            if (vert) {
                if (door.action != Doors.dr_closed && (frac >> 10) > Doors.DOOR_FULLOPEN - Doors.opened(door)) {
                    return false;
                }
                tracePoint.x = Wolf.TILE2POS(x);
                tracePoint.y = (y << Wolf.TILESHIFT) + frac;
                tracePoint.flags |= Raycaster.TRACE_HIT_VERT;
                tracePoint.frac = frac / Wolf.TILEGLOBAL;
            }
            else {
                if (door.action != Doors.dr_closed && (frac >> 10) < Doors.opened(door)) {
                    return false;
                }
                tracePoint.y = Wolf.TILE2POS(y);
                tracePoint.x = (x << Wolf.TILESHIFT) + frac;
                tracePoint.flags &= ~Raycaster.TRACE_HIT_VERT;
                tracePoint.frac = 1 - frac / Wolf.TILEGLOBAL;
            }
            tracePoint.flags |= Raycaster.TRACE_HIT_DOOR;
            tracePoint.tileX = x;
            tracePoint.tileY = y;
            tracePoint.frac += Doors.opened(door) / Doors.DOOR_FULLOPEN;
            return true;
        }
        if (tileMap[x][y] & Level.PUSHWALL_TILE) {
            let pwall = PushWall.get(), offset = pwall.pointsMoved / 128;
            frac += dfrac * offset;
            if (Wolf.POS2TILE(frac)) {
                return false;
            }
            if (vert) {
                tracePoint.x = (x << Wolf.TILESHIFT) + (flip ? Wolf.TILEGLOBAL : 0) + offset * Wolf.TILEGLOBAL * (flip ? -1 : 1);
                tracePoint.y = (y << Wolf.TILESHIFT) + frac;
                tracePoint.flags |= Raycaster.TRACE_HIT_VERT;
            }
            else {
                tracePoint.x = (x << Wolf.TILESHIFT) + frac;
                tracePoint.y = (y << Wolf.TILESHIFT) + (flip ? Wolf.TILEGLOBAL : 0) + offset * Wolf.TILEGLOBAL * (flip ? -1 : 1);
                tracePoint.flags &= ~Raycaster.TRACE_HIT_VERT;
            }
            tracePoint.flags |= Raycaster.TRACE_HIT_PWALL;
            tracePoint.tileX = x;
            tracePoint.tileY = y;
            tracePoint.frac = frac / Wolf.TILEGLOBAL;
            return true;
        }
        return false;
    }
    static trace(level, visibleTiles, tracePoint) {
        let xtilestep, ytilestep, xstep, ystep, xtile, ytile, xintercept, yintercept, YmapPos, XmapPos, tileMap = level.tileMap, doorMap = level.state.doorMap, q;
        q = Mathematik.getQuadrant(Wolf.FINE2RAD(tracePoint.angle));
        xtilestep = Raycaster.x_tile_step[q];
        ytilestep = Raycaster.y_tile_step[q];
        xtile = Wolf.POS2TILE(tracePoint.x) + xtilestep;
        ytile = Wolf.POS2TILE(tracePoint.y) + ytilestep;
        xstep = ytilestep * Mathematik.XnextTable[tracePoint.angle];
        ystep = xtilestep * Mathematik.YnextTable[tracePoint.angle];
        xintercept = (((((ytilestep == -1 ? ytile + 1 : ytile) << Wolf.TILESHIFT) - tracePoint.y)
            / Mathematik.TanTable[tracePoint.angle]) >> 0) + tracePoint.x;
        yintercept = (((((xtilestep == -1 ? xtile + 1 : xtile) << Wolf.TILESHIFT) - tracePoint.x)
            * Mathematik.TanTable[tracePoint.angle]) >> 0) + tracePoint.y;
        YmapPos = yintercept >> Wolf.TILESHIFT;
        XmapPos = xintercept >> Wolf.TILESHIFT;
        if (visibleTiles) {
            visibleTiles[Wolf.POS2TILE(tracePoint.x)][Wolf.POS2TILE(tracePoint.y)] = true;
        }
        let traceCount = 0;
        while (1) {
            traceCount++;
            while (!(ytilestep == -1 && YmapPos <= ytile) && !(ytilestep == 1 && YmapPos >= ytile)) {
                if (xtile < 0 || xtile >= 64 || YmapPos < 0 || YmapPos >= 64) {
                    tracePoint.oob = true;
                    return;
                }
                if (Raycaster.traceCheck(tileMap, doorMap, visibleTiles, xtile, YmapPos, yintercept % Wolf.TILEGLOBAL, ystep, true, (xtilestep == -1), tracePoint)) {
                    if (xstep < 0) {
                        tracePoint.frac = 1 - tracePoint.frac;
                    }
                    return;
                }
                xtile += xtilestep;
                yintercept += ystep;
                YmapPos = yintercept >> Wolf.TILESHIFT;
            }
            while (!(xtilestep == -1 && XmapPos <= xtile) && !(xtilestep == 1 && XmapPos >= xtile)) {
                if (ytile < 0 || ytile >= 64 || XmapPos < 0 || XmapPos >= 64) {
                    tracePoint.oob = true;
                    return;
                }
                if (Raycaster.traceCheck(tileMap, doorMap, visibleTiles, XmapPos, ytile, xintercept % Wolf.TILEGLOBAL, xstep, false, (ytilestep == -1), tracePoint)) {
                    if (ystep > 0) {
                        tracePoint.frac = 1 - tracePoint.frac;
                    }
                    return;
                }
                ytile += ytilestep;
                xintercept += xstep;
                XmapPos = xintercept >> Wolf.TILESHIFT;
            }
            if (traceCount > 1000) {
                return;
            }
        }
    }
    static traceRays(viewport, level) {
        let n, i, j, tileMap = level.tileMap, tracePoint, visibleTiles = [], numRays = Wolf.XRES / Wolf.SLICE_WIDTH, tracers = [];
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
                angle: Mathematik.normalizeAngle(viewport.angle - Mathematik.ColumnAngle[n * Wolf.SLICE_WIDTH]),
                flags: Raycaster.TRACE_SIGHT | Raycaster.TRACE_MARK_MAP,
                oob: false
            };
            Raycaster.trace(level, visibleTiles, tracePoint);
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
Raycaster.x_tile_step = [1, -1, -1, 1];
Raycaster.y_tile_step = [1, 1, -1, -1];
