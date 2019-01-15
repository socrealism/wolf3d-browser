"use strict";
Wolf.PushWall = (function () {
    var PWall = {};
    reset();
    function reset() {
        PWall.active = false;
        PWall.tilesMoved = 0;
        PWall.pointsMoved = 0;
        PWall.dir = 0;
        PWall.x = 0;
        PWall.y = 0;
        PWall.dx = 0;
        PWall.dy = 0;
        PWall.texX = 0;
        PWall.texY = 0;
    }
    function push(level, x, y, dir) {
        var dx, dy;
        if (PWall.active) {
            return false;
        }
        dx = Mathematik.dx4dir[dir];
        dy = Mathematik.dy4dir[dir];
        if (level.tileMap[x + dx][y + dy] & (Wolf.SOLID_TILE | Wolf.DOOR_TILE)) {
            return true;
        }
        level.tileMap[x][y] &= (~Wolf.SECRET_TILE);
        level.tileMap[x][y] &= (~Wolf.WALL_TILE);
        level.tileMap[x][y] |= Wolf.PUSHWALL_TILE;
        if (++level.state.foundSecrets == level.state.totalSecrets) {
            Game.notify("You found the last secret!");
        }
        else {
            Game.notify("You found a secret!");
        }
        Sound.startSound(null, null, 1, Sound.CHAN_AUTO, "assets/sfx/034.wav", 1, Sound.ATTN_STATIC, 0);
        level.tileMap[x + dx][y + dy] |= Wolf.PUSHWALL_TILE;
        level.wallTexX[x + dx][y + dy] = level.wallTexX[x][y];
        level.wallTexY[x + dx][y + dy] = level.wallTexY[x][y];
        PWall.active = true;
        PWall.tilesMoved = PWall.pointsMoved = 0;
        PWall.dir = dir;
        PWall.x = x;
        PWall.y = y;
        PWall.dx = dx;
        PWall.dy = dy;
        PWall.texX = level.wallTexX[x][y];
        PWall.texY = level.wallTexY[x][y];
        return true;
    }
    function process(level, tics) {
        if (!PWall.active) {
            return;
        }
        PWall.pointsMoved += tics;
        if (PWall.pointsMoved < 128) {
            return;
        }
        PWall.pointsMoved -= 128;
        PWall.tilesMoved++;
        level.tileMap[PWall.x][PWall.y] &= (~Wolf.PUSHWALL_TILE);
        PWall.x += PWall.dx;
        PWall.y += PWall.dy;
        if (level.tileMap[PWall.x + PWall.dx][PWall.y + PWall.dy] & (Wolf.SOLID_TILE | Wolf.DOOR_TILE | Wolf.ACTOR_TILE | Wolf.POWERUP_TILE) || PWall.tilesMoved == 3) {
            level.tileMap[PWall.x][PWall.y] &= (~Wolf.PUSHWALL_TILE);
            level.tileMap[PWall.x][PWall.y] |= Wolf.WALL_TILE;
            level.wallTexX[PWall.x][PWall.y] = PWall.texX;
            level.wallTexY[PWall.x][PWall.y] = PWall.texY;
            PWall.active = false;
        }
        else {
            level.tileMap[PWall.x + PWall.dx][PWall.y + PWall.dy] |= Wolf.PUSHWALL_TILE;
            level.wallTexX[PWall.x + PWall.dx][PWall.y + PWall.dy] = PWall.texX;
            level.wallTexY[PWall.x + PWall.dx][PWall.y + PWall.dy] = PWall.texY;
        }
    }
    function get() {
        return PWall;
    }
    return {
        reset: reset,
        process: process,
        push: push,
        get: get
    };
})();
