"use strict";
class PushWall {
    static reset() {
        PushWall.PWall.active = false;
        PushWall.PWall.tilesMoved = 0;
        PushWall.PWall.pointsMoved = 0;
        PushWall.PWall.dir = 0;
        PushWall.PWall.x = 0;
        PushWall.PWall.y = 0;
        PushWall.PWall.dx = 0;
        PushWall.PWall.dy = 0;
        PushWall.PWall.texX = 0;
        PushWall.PWall.texY = 0;
    }
    static push(level, x, y, dir) {
        let dx, dy;
        if (PushWall.PWall.active) {
            return false;
        }
        dx = Mathematik.dx4dir[dir];
        dy = Mathematik.dy4dir[dir];
        if (level.tileMap[x + dx][y + dy] & (Level.SOLID_TILE | Level.DOOR_TILE)) {
            return true;
        }
        level.tileMap[x][y] &= (~Level.SECRET_TILE);
        level.tileMap[x][y] &= (~Level.WALL_TILE);
        level.tileMap[x][y] |= Level.PUSHWALL_TILE;
        if (++level.state.foundSecrets == level.state.totalSecrets) {
            Game.notify("You found the last secret!");
        }
        else {
            Game.notify("You found a secret!");
        }
        Sound.startSound(null, null, 1, Sound.CHAN_AUTO, "assets/sfx/034.wav", 1, Sound.ATTN_STATIC, 0);
        level.tileMap[x + dx][y + dy] |= Level.PUSHWALL_TILE;
        level.wallTexX[x + dx][y + dy] = level.wallTexX[x][y];
        level.wallTexY[x + dx][y + dy] = level.wallTexY[x][y];
        PushWall.PWall.active = true;
        PushWall.PWall.tilesMoved = PushWall.PWall.pointsMoved = 0;
        PushWall.PWall.dir = dir;
        PushWall.PWall.x = x;
        PushWall.PWall.y = y;
        PushWall.PWall.dx = dx;
        PushWall.PWall.dy = dy;
        PushWall.PWall.texX = level.wallTexX[x][y];
        PushWall.PWall.texY = level.wallTexY[x][y];
        return true;
    }
    static process(level, tics) {
        if (!PushWall.PWall.active) {
            return;
        }
        PushWall.PWall.pointsMoved += tics;
        if (PushWall.PWall.pointsMoved < 128) {
            return;
        }
        PushWall.PWall.pointsMoved -= 128;
        PushWall.PWall.tilesMoved++;
        level.tileMap[PushWall.PWall.x][PushWall.PWall.y] &= (~Level.PUSHWALL_TILE);
        PushWall.PWall.x += PushWall.PWall.dx;
        PushWall.PWall.y += PushWall.PWall.dy;
        if (level.tileMap[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] & (Level.SOLID_TILE | Level.DOOR_TILE | Level.ACTOR_TILE | Level.POWERUP_TILE) || PushWall.PWall.tilesMoved == 3) {
            level.tileMap[PushWall.PWall.x][PushWall.PWall.y] &= (~Level.PUSHWALL_TILE);
            level.tileMap[PushWall.PWall.x][PushWall.PWall.y] |= Level.WALL_TILE;
            level.wallTexX[PushWall.PWall.x][PushWall.PWall.y] = PushWall.PWall.texX;
            level.wallTexY[PushWall.PWall.x][PushWall.PWall.y] = PushWall.PWall.texY;
            PushWall.PWall.active = false;
        }
        else {
            level.tileMap[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] |= Level.PUSHWALL_TILE;
            level.wallTexX[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] = PushWall.PWall.texX;
            level.wallTexY[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] = PushWall.PWall.texY;
        }
    }
    static get() {
        return PushWall.PWall;
    }
}
PushWall.PWall = {
    active: false,
    tilesMoved: 0,
    pointsMoved: 0,
    dir: 0,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    texX: 0,
    texY: 0,
};
