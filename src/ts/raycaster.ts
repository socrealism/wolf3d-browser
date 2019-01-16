/**
 * @namespace
 * @description Raycaster
 */
class Raycaster {
    static readonly UPPERZCOORD = 0.6;
    static readonly LOWERZCOORD = -0.6;

    // marks
    static readonly TRACE_MARK_MAP = 1; // marks traced area in 'AM_AutoMap.vis' array

    // obstacle levels
    static readonly TRACE_SIGHT = 2; // player sight
    static readonly TRACE_SIGHT_AI = 4; // enemy sight
    static readonly TRACE_BULLET = 8; // bullet
    static readonly TRACE_OBJECT = 16; // object

    static readonly TRACE_HIT_VERT = 32; // vertical wall was hit
    static readonly TRACE_HIT_DOOR = 64; // door was hit
    static readonly TRACE_HIT_PWALL = 128; // pushwall was hit

    static x_tile_step = [1, -1, -1, 1];
    static y_tile_step = [1, 1, -1, -1];

    static traceCheck(tileMap, doorMap, visibleTiles, x, y, frac, dfrac, vert, flip, tracePoint) {
        var door;

        if (tileMap[x][y] & Level.WALL_TILE) {
            if (vert) {
                tracePoint.x = (x << Wolf.TILESHIFT) + (flip ? Wolf.TILEGLOBAL : 0);
                tracePoint.y = (y << Wolf.TILESHIFT) + frac;
                tracePoint.flags |= Raycaster.TRACE_HIT_VERT;
            } else {
                tracePoint.x = (x << Wolf.TILESHIFT) + frac;
                tracePoint.y = (y << Wolf.TILESHIFT) + (flip ? Wolf.TILEGLOBAL : 0);
                tracePoint.flags &= ~Raycaster.TRACE_HIT_VERT;
            }
            tracePoint.tileX = x;
            tracePoint.tileY = y;
            tracePoint.frac = frac / Wolf.TILEGLOBAL;

            return true; // wall, stop tracing
        }

        if (visibleTiles) {
            visibleTiles[x][y] = true; // this tile is visible
        }

        if (tileMap[x][y] & Level.DOOR_TILE && doorMap[x][y].action != Doors.dr_open) {
            door = doorMap[x][y];

            frac += dfrac >> 1;

            if (Wolf.POS2TILE(frac)) {
                return false;
            }

            if (vert) {
                if (door.action != Doors.dr_closed && (frac >> 10) > Doors.DOOR_FULLOPEN - Doors.opened(door)) {
                    return false; // opened enough
                }
                tracePoint.x = Wolf.TILE2POS(x);
                tracePoint.y = (y << Wolf.TILESHIFT) + frac;
                tracePoint.flags |= Raycaster.TRACE_HIT_VERT;
                tracePoint.frac = frac / Wolf.TILEGLOBAL;
            } else {
                if (door.action != Doors.dr_closed && (frac >> 10) < Doors.opened(door)) {
                    return false; // opened enough
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
            return true; // closed door, stop tracing
        }


        if (tileMap[x][y] & Level.PUSHWALL_TILE) {

            var pwall = PushWall.get(),
                offset = pwall.pointsMoved / 128;

            frac += dfrac * offset;

            if (Wolf.POS2TILE(frac)) {
                return false;
            }

            if (vert) {
                tracePoint.x = (x << Wolf.TILESHIFT) + (flip ? Wolf.TILEGLOBAL : 0) + offset * Wolf.TILEGLOBAL * (flip ? -1 : 1);
                tracePoint.y = (y << Wolf.TILESHIFT) + frac;
                tracePoint.flags |= Raycaster.TRACE_HIT_VERT;
            } else {
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

        return false; // no intersection, go on!
    }

    static trace(level, visibleTiles, tracePoint) {
        var xtilestep, ytilestep,
            xstep, ystep,
            xtile, ytile,
            xintercept, yintercept,
            YmapPos, XmapPos,
            tileMap = level.tileMap,
            doorMap = level.state.doorMap,
            q;

        // Setup for ray casting
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

        YmapPos = yintercept >> Wolf.TILESHIFT; // toXray
        XmapPos = xintercept >> Wolf.TILESHIFT; // toYray

        if (visibleTiles) {
            // this tile is visible
            visibleTiles[Wolf.POS2TILE(tracePoint.x)][Wolf.POS2TILE(tracePoint.y)] = true;
        }

        var traceCount = 0;

        // Start of ray-casting
        while (1) {

            traceCount++;

            // Vertical loop // an analogue for X-Ray
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

                // prepare for next step
                xtile += xtilestep;
                yintercept += ystep;
                YmapPos = yintercept >> Wolf.TILESHIFT;
            }

            // Horizontal loop // an analogue for Y-Ray
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

                // prepare for next step
                ytile += ytilestep;
                xintercept += xstep;
                XmapPos = xintercept >> Wolf.TILESHIFT;
            }

            if (traceCount > 1000) {
                return;
            }

        } // end of while( 1 )


    }

    static traceRays(viewport, level) {
        var n, i, j,
            tileMap = level.tileMap,
            tracePoint,
            visibleTiles = [],
            numRays = Wolf.XRES / Wolf.SLICE_WIDTH,
            tracers = [];

        for (i = 0; i < 64; i++) {
            visibleTiles[i] = [];
            for (j = 0; j < 64; j++) {
                visibleTiles[i][j] = 0;
            }
        }

        // Ray casting

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

            // Ugly hack to get rid of "blank slice" glitch due to out-of-bounds raycasting.
            // We simply re-use the previous slice if possible.
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
