/**
 * @namespace 
 * @description Push wall management
 */
class PushWall {

    static PWall = {
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
        var dx, dy;

        if (PushWall.PWall.active) {
            return false; // another PWall is moving [only one at a time!]
        }

        dx = Mathematik.dx4dir[dir];
        dy = Mathematik.dy4dir[dir];

        if (level.tileMap[x + dx][y + dy] & (Wolf.SOLID_TILE | Wolf.DOOR_TILE)) {
            // noway (smth is blocking)
            return true;
        }

        // remove secret flag & make everything needed when pushwall used!
        level.tileMap[x][y] &= (~Wolf.SECRET_TILE);
        level.tileMap[x][y] &= (~Wolf.WALL_TILE);
        level.tileMap[x][y] |= Wolf.PUSHWALL_TILE;

        if (++level.state.foundSecrets == level.state.totalSecrets) {
            Game.notify("You found the last secret!");
        } else {
            Game.notify("You found a secret!");
        }

        Sound.startSound(null, null, 1, Sound.CHAN_AUTO, "assets/sfx/034.wav", 1, Sound.ATTN_STATIC, 0);

        // good way to avoid stuckness; [un]comment one more down!
        // it makes a tile behind pushwall unpassable
        level.tileMap[x + dx][y + dy] |= Wolf.PUSHWALL_TILE;
        level.wallTexX[x + dx][y + dy] = level.wallTexX[x][y];
        level.wallTexY[x + dx][y + dy] = level.wallTexY[x][y];

        // write down PWall info
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
            return; // no active PWall to work with
        }

        PushWall.PWall.pointsMoved += tics;

        if (PushWall.PWall.pointsMoved < 128) {
            return;
        }

        PushWall.PWall.pointsMoved -= 128;
        PushWall.PWall.tilesMoved++;
        // Free tile
        level.tileMap[PushWall.PWall.x][PushWall.PWall.y] &= (~Wolf.PUSHWALL_TILE);
        // Occupy new tile
        PushWall.PWall.x += PushWall.PWall.dx;
        PushWall.PWall.y += PushWall.PWall.dy;

        // Shall we move further?
        if (level.tileMap[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] & (Wolf.SOLID_TILE | Wolf.DOOR_TILE | Wolf.ACTOR_TILE | Wolf.POWERUP_TILE) || PushWall.PWall.tilesMoved == 3) {
            level.tileMap[PushWall.PWall.x][PushWall.PWall.y] &= (~Wolf.PUSHWALL_TILE); // wall now
            level.tileMap[PushWall.PWall.x][PushWall.PWall.y] |= Wolf.WALL_TILE; // wall now
            level.wallTexX[PushWall.PWall.x][PushWall.PWall.y] = PushWall.PWall.texX;
            level.wallTexY[PushWall.PWall.x][PushWall.PWall.y] = PushWall.PWall.texY;
            PushWall.PWall.active = false; // Free Push Wall
        } else {
            level.tileMap[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] |= Wolf.PUSHWALL_TILE;

            // Not sure if this is right but it fixed an issue with the pushwall texture changing mid-slide.
            level.wallTexX[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] = PushWall.PWall.texX;
            level.wallTexY[PushWall.PWall.x + PushWall.PWall.dx][PushWall.PWall.y + PushWall.PWall.dy] = PushWall.PWall.texY;
        }
    }

    static get() {
        return PushWall.PWall;
    }
}
