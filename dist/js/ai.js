"use strict";
Wolf.AI = (function () {
    Wolf.setConsts({
        RUNSPEED: 6000,
        MINSIGHT: 0x18000
    });
    function checkSight(self, game) {
        var level = game.level, player = game.player, deltax, deltay;
        if (!(self.flags & Wolf.FL_AMBUSH)) {
            if (!level.state.areabyplayer[self.areanumber]) {
                return false;
            }
        }
        deltax = player.position.x - self.x;
        deltay = player.position.y - self.y;
        if (Math.abs(deltax) < Wolf.MINSIGHT && Math.abs(deltay) < Wolf.MINSIGHT) {
            return true;
        }
        switch (self.dir) {
            case Wolf.Math.dir8_north:
                if (deltay < 0) {
                    return false;
                }
                break;
            case Wolf.Math.dir8_east:
                if (deltax < 0) {
                    return false;
                }
                break;
            case Wolf.Math.dir8_south:
                if (deltay > 0) {
                    return false;
                }
                break;
            case Wolf.Math.dir8_west:
                if (deltax > 0) {
                    return false;
                }
                break;
            default:
                break;
        }
        return Wolf.Level.checkLine(self.x, self.y, player.position.x, player.position.y, level);
    }
    function changeDir(self, new_dir, level) {
        var oldx, oldy, newx, newy, n, moveok = false;
        oldx = Wolf.POS2TILE(self.x);
        oldy = Wolf.POS2TILE(self.y);
        newx = oldx + Wolf.Math.dx8dir[new_dir];
        newy = oldy + Wolf.Math.dy8dir[new_dir];
        if (new_dir & 0x01) {
            if (level.tileMap[newx][oldy] & Wolf.SOLID_TILE ||
                level.tileMap[oldx][newy] & Wolf.SOLID_TILE ||
                level.tileMap[newx][newy] & Wolf.SOLID_TILE) {
                return false;
            }
            for (n = 0; n < level.state.numGuards; ++n) {
                if (level.state.guards[n].state >= Wolf.st_die1) {
                    continue;
                }
                if (level.state.guards[n].tile.x == newx && level.state.guards[n].tile.y == newy) {
                    return false;
                }
                if (level.state.guards[n].tile.x == oldx && level.state.guards[n].tile.y == newy) {
                    return false;
                }
                if (level.state.guards[n].tile.x == newx && level.state.guards[n].tile.y == oldy) {
                    return false;
                }
            }
        }
        else {
            if (level.tileMap[newx][newy] & Wolf.SOLID_TILE) {
                return false;
            }
            if (level.tileMap[newx][newy] & Wolf.DOOR_TILE) {
                if (self.type == Wolf.en_fake || self.type == Wolf.en_dog) {
                    if (level.state.doorMap[newx][newy].action != Wolf.dr_open) {
                        return false;
                    }
                }
                else {
                    self.waitfordoorx = newx;
                    self.waitfordoory = newy;
                    moveok = true;
                }
            }
            if (!moveok) {
                for (n = 0; n < level.state.numGuards; ++n) {
                    if (level.state.guards[n].state >= Wolf.st_die1) {
                        continue;
                    }
                    if (level.state.guards[n].tile.x == newx && level.state.guards[n].tile.y == newy) {
                        return false;
                    }
                }
            }
        }
        self.tile.x = newx;
        self.tile.y = newy;
        level.tileMap[oldx][oldy] &= ~Wolf.ACTOR_TILE;
        level.tileMap[newx][newy] |= Wolf.ACTOR_TILE;
        if (level.areas[newx][newy] > 0) {
            self.areanumber = level.areas[newx][newy];
        }
        self.distance = Wolf.TILEGLOBAL;
        self.dir = new_dir;
        return true;
    }
    function path(self, game) {
        var level = game.level;
        if (level.tileMap[self.x >> Wolf.TILESHIFT][self.y >> Wolf.TILESHIFT] & Wolf.WAYPOINT_TILE) {
            var tileinfo = level.tileMap[self.x >> Wolf.TILESHIFT][self.y >> Wolf.TILESHIFT];
            if (tileinfo & Wolf.TILE_IS_E_TURN) {
                self.dir = Wolf.Math.dir8_east;
            }
            else if (tileinfo & Wolf.TILE_IS_NE_TURN) {
                self.dir = Wolf.Math.dir8_northeast;
            }
            else if (tileinfo & Wolf.TILE_IS_N_TURN) {
                self.dir = Wolf.Math.dir8_north;
            }
            else if (tileinfo & Wolf.TILE_IS_NW_TURN) {
                self.dir = Wolf.Math.dir8_northwest;
            }
            else if (tileinfo & Wolf.TILE_IS_W_TURN) {
                self.dir = Wolf.Math.dir8_west;
            }
            else if (tileinfo & Wolf.TILE_IS_SW_TURN) {
                self.dir = Wolf.Math.dir8_southwest;
            }
            else if (tileinfo & Wolf.TILE_IS_S_TURN) {
                self.dir = Wolf.Math.dir8_south;
            }
            else if (tileinfo & Wolf.TILE_IS_SE_TURN) {
                self.dir = Wolf.Math.dir8_southeast;
            }
        }
        if (!changeDir(self, self.dir, level)) {
            self.dir = Wolf.Math.dir8_nodir;
        }
    }
    function findTarget(self, game, tics) {
        var level = game.level, player = game.player;
        if (self.temp2) {
            self.temp2 -= tics;
            if (self.temp2 > 0) {
                return false;
            }
            self.temp2 = 0;
        }
        else {
            if (player.flags & Wolf.FL_NOTARGET) {
                return false;
            }
            if (!(self.flags & Wolf.FL_AMBUSH) && !level.state.areabyplayer[self.areanumber]) {
                return false;
            }
            if (!checkSight(self, game)) {
                if (self.flags & Wolf.FL_AMBUSH || !player.madenoise) {
                    return false;
                }
            }
            self.flags &= ~Wolf.FL_AMBUSH;
            switch (self.type) {
                case Wolf.en_guard:
                    self.temp2 = 1 + Random.get() / 4;
                    break;
                case Wolf.en_officer:
                    self.temp2 = 2;
                    break;
                case Wolf.en_mutant:
                    self.temp2 = 1 + Random.get() / 6;
                    break;
                case Wolf.en_ss:
                    self.temp2 = 1 + Random.get() / 6;
                    break;
                case Wolf.en_dog:
                    self.temp2 = 1 + Random.get() / 8;
                    break;
                case Wolf.en_boss:
                case Wolf.en_schabbs:
                case Wolf.en_fake:
                case Wolf.en_mecha:
                case Wolf.en_hitler:
                case Wolf.en_gretel:
                case Wolf.en_gift:
                case Wolf.en_fat:
                case Wolf.en_spectre:
                case Wolf.en_angel:
                case Wolf.en_trans:
                case Wolf.en_uber:
                case Wolf.en_will:
                case Wolf.en_death:
                    self.temp2 = 1;
                    break;
            }
            return false;
        }
        ActorAI.firstSighting(self, game);
        return true;
    }
    function chase(self, game) {
        var level = game.level, player = game.player, deltax, deltay, d = [], tdir, olddir, turnaround;
        if (game.player.playstate == Wolf.ex_victory) {
            return;
        }
        olddir = self.dir;
        turnaround = Wolf.Math.opposite8[olddir];
        d[0] = d[1] = Wolf.Math.dir8_nodir;
        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);
        if (deltax > 0) {
            d[0] = Wolf.Math.dir8_east;
        }
        else if (deltax < 0) {
            d[0] = Wolf.Math.dir8_west;
        }
        if (deltay > 0) {
            d[1] = Wolf.Math.dir8_north;
        }
        else if (deltay < 0) {
            d[1] = Wolf.Math.dir8_south;
        }
        if (Math.abs(deltay) > Math.abs(deltax)) {
            tdir = d[0];
            d[0] = d[1];
            d[1] = tdir;
        }
        if (d[0] == turnaround) {
            d[0] = Wolf.Math.dir8_nodir;
        }
        if (d[1] == turnaround) {
            d[1] = Wolf.Math.dir8_nodir;
        }
        if (d[0] != Wolf.Math.dir8_nodir) {
            if (changeDir(self, d[0], level)) {
                return;
            }
        }
        if (d[1] != Wolf.Math.dir8_nodir) {
            if (changeDir(self, d[1], level)) {
                return;
            }
        }
        if (olddir != Wolf.Math.dir8_nodir) {
            if (changeDir(self, olddir, level)) {
                return;
            }
        }
        if (Random.get() > 128) {
            for (tdir = Wolf.Math.dir8_east; tdir <= Wolf.Math.dir8_south; tdir += 2) {
                if (tdir != turnaround) {
                    if (changeDir(self, tdir, level)) {
                        return;
                    }
                }
            }
        }
        else {
            for (tdir = Wolf.Math.dir8_south; tdir >= Wolf.Math.dir8_east; tdir -= 2) {
                if (tdir != turnaround) {
                    if (changeDir(self, tdir, level)) {
                        return;
                    }
                }
            }
        }
        if (turnaround != Wolf.Math.dir8_nodir) {
            if (changeDir(self, turnaround, level)) {
                return;
            }
        }
        self.dir = Wolf.Math.dir8_nodir;
    }
    function retreat(self, game) {
        var level = game.level, player = game.player, deltax, deltay, d = [], tdir;
        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);
        d[0] = deltax < 0 ? Wolf.Math.dir8_east : Wolf.Math.dir8_west;
        d[1] = deltay < 0 ? Wolf.Math.dir8_north : Wolf.Math.dir8_south;
        if (Math.abs(deltay) > Math.abs(deltax)) {
            tdir = d[0];
            d[0] = d[1];
            d[1] = tdir;
        }
        if (changeDir(self, d[0], level)) {
            return;
        }
        if (changeDir(self, d[1], level)) {
            return;
        }
        if (Random.get() > 128) {
            for (tdir = Wolf.Math.dir8_east; tdir <= Wolf.Math.dir8_south; tdir += 2) {
                if (changeDir(self, tdir, level)) {
                    return;
                }
            }
        }
        else {
            for (tdir = Wolf.Math.dir8_south; tdir >= Wolf.Math.dir8_east; tdir -= 2) {
                if (changeDir(self, tdir, level)) {
                    return;
                }
            }
        }
        self.dir = Wolf.Math.dir8_nodir;
    }
    function dodge(self, game) {
        var level = game.level, player = game.player, deltax, deltay, i, dirtry = [], turnaround, tdir;
        if (game.player.playstate == Wolf.ex_victory) {
            return;
        }
        if (self.flags & Wolf.FL_FIRSTATTACK) {
            turnaround = Wolf.Math.dir8_nodir;
            self.flags &= ~Wolf.FL_FIRSTATTACK;
        }
        else {
            turnaround = Wolf.Math.opposite8[self.dir];
        }
        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);
        if (deltax > 0) {
            dirtry[1] = Wolf.Math.dir8_east;
            dirtry[3] = Wolf.Math.dir8_west;
        }
        else {
            dirtry[1] = Wolf.Math.dir8_west;
            dirtry[3] = Wolf.Math.dir8_east;
        }
        if (deltay > 0) {
            dirtry[2] = Wolf.Math.dir8_north;
            dirtry[4] = Wolf.Math.dir8_south;
        }
        else {
            dirtry[2] = Wolf.Math.dir8_south;
            dirtry[4] = Wolf.Math.dir8_north;
        }
        if (Math.abs(deltax) > Math.abs(deltay)) {
            tdir = dirtry[1];
            dirtry[1] = dirtry[2];
            dirtry[2] = tdir;
            tdir = dirtry[3];
            dirtry[3] = dirtry[4];
            dirtry[4] = tdir;
        }
        if (Random.get() < 128) {
            tdir = dirtry[1];
            dirtry[1] = dirtry[2];
            dirtry[2] = tdir;
            tdir = dirtry[3];
            dirtry[3] = dirtry[4];
            dirtry[4] = tdir;
        }
        dirtry[0] = Wolf.Math.diagonal[dirtry[1]][dirtry[2]];
        for (i = 0; i < 5; ++i) {
            if (dirtry[i] == Wolf.Math.dir8_nodir || dirtry[i] == turnaround) {
                continue;
            }
            if (changeDir(self, dirtry[i], level)) {
                return;
            }
        }
        if (turnaround != Wolf.Math.dir8_nodir) {
            if (changeDir(self, turnaround, level)) {
                return;
            }
        }
        self.dir = Wolf.Math.dir8_nodir;
    }
    function T_Stand(self, game, tics) {
        findTarget(self, game, tics);
    }
    function T_Path(self, game, tics) {
        var level = game.level;
        if (findTarget(self, game, tics)) {
            return;
        }
        if (!self.speed) {
            return;
        }
        if (self.dir == Wolf.Math.dir8_nodir) {
            path(self, game);
            if (self.dir == Wolf.Math.dir8_nodir) {
                return;
            }
        }
        T_Advance(self, game, path, tics);
    }
    function T_Shoot(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist, hitchance, damage;
        if (!level.state.areabyplayer[self.areanumber]) {
            return;
        }
        if (!Wolf.Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            return;
        }
        dx = Math.abs(Wolf.POS2TILE(self.x) - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(Wolf.POS2TILE(self.y) - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);
        if (self.type == Wolf.en_ss || self.type == Wolf.en_boss) {
            dist = dist * 2 / 3;
        }
        if (player.speed >= Wolf.RUNSPEED) {
            hitchance = 160;
        }
        else {
            hitchance = 256;
        }
        var trans = Wolf.Math.transformPoint(self.x, self.y, player.position.x, player.position.y);
        if (Wolf.Angle.diff(trans, Wolf.FINE2DEG(player.angle)) < (Math.PI / 3)) {
            hitchance -= dist * 16;
        }
        else {
            hitchance -= dist * 8;
        }
        if (Random.get() < hitchance) {
            if (dist < 2) {
                damage = Random.get() >> 2;
            }
            else if (dist < 4) {
                damage = Random.get() >> 3;
            }
            else {
                damage = Random.get() >> 4;
            }
            Wolf.Player.damage(player, self, damage);
        }
        switch (self.type) {
            case Wolf.en_ss:
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/sfx/024.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.en_gift:
            case Wolf.en_fat:
            case Wolf.en_mecha:
            case Wolf.en_hitler:
            case Wolf.en_boss:
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/sfx/022.wav", 1, Sound.ATTN_NORM, 0);
                break;
            default:
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/sfx/049.wav", 1, Sound.ATTN_NORM, 0);
                break;
        }
    }
    function T_Chase(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist, chance, shouldDodge = false;
        if (Wolf.Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            dx = Math.abs(Wolf.POS2TILE(self.x) - Wolf.POS2TILE(player.position.x));
            dy = Math.abs(Wolf.POS2TILE(self.y) - Wolf.POS2TILE(player.position.y));
            dist = Math.max(dx, dy);
            if (!dist || (dist == 1 && self.distance < 16)) {
                chance = 300;
            }
            else {
                chance = (tics << 4) / dist;
            }
            if (Random.get() < chance) {
                Wolf.Actors.stateChange(self, Wolf.st_shoot1);
                return;
            }
            shouldDodge = true;
        }
        if (self.dir == Wolf.Math.dir8_nodir) {
            if (shouldDodge) {
                dodge(self, game);
            }
            else {
                chase(self, game);
            }
            if (self.dir == Wolf.Math.dir8_nodir) {
                return;
            }
            self.angle = Wolf.Math.dir8angle[self.dir];
        }
        T_Advance(self, game, shouldDodge ? dodge : chase, tics);
    }
    function T_DogChase(self, game, tics) {
        var level = game.level, player = game.player, dx, dy;
        if (self.dir == Wolf.Math.dir8_nodir) {
            dodge(self, game);
            self.angle = Wolf.Math.dir8angle[self.dir];
            if (self.dir == Wolf.Math.dir8_nodir) {
                return;
            }
        }
        dx = Math.abs(player.position.x - self.x) - Wolf.TILEGLOBAL / 2;
        if (dx <= Wolf.MINACTORDIST) {
            dy = Math.abs(player.position.y - self.y) - Wolf.TILEGLOBAL / 2;
            if (dy <= Wolf.MINACTORDIST) {
                Wolf.Actors.stateChange(self, Wolf.st_shoot1);
                return;
            }
        }
        T_Advance(self, game, dodge, tics);
    }
    function T_BossChase(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist, think, shouldDodge = false;
        dx = Math.abs(self.tile.x - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(self.tile.y - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);
        if (Wolf.Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            if (Random.get() < tics << 3) {
                Wolf.Actors.stateChange(self, Wolf.st_shoot1);
                return;
            }
            shouldDodge = true;
        }
        if (self.dir == Wolf.Math.dir8_nodir) {
            if (shouldDodge) {
                dodge(self, game);
            }
            else {
                chase(self, game);
            }
            if (self.dir == Wolf.Math.dir8_nodir) {
                return;
            }
        }
        think = dist < 4 ? retreat : (shouldDodge ? dodge : chase);
        T_Advance(self, game, think, tics);
    }
    function T_Fake(self, game, tics) {
        var level = game.level, player = game.player;
        if (Wolf.Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            if (Random.get() < tics << 1) {
                Wolf.Actors.stateChange(self, Wolf.st_shoot1);
                return;
            }
        }
        if (self.dir == Wolf.Math.dir8_nodir) {
            dodge(self, game);
            if (self.dir == Wolf.Math.dir8_nodir) {
                return;
            }
        }
        T_Advance(self, game, dodge, tics);
    }
    function T_Advance(self, game, think, tics) {
        var level = game.level, move, door;
        if (!think) {
            Wolf.log("Warning: Advance without <think> proc\n");
            return;
        }
        move = self.speed * tics;
        while (move > 0) {
            if (self.waitfordoorx) {
                door = level.state.doorMap[self.waitfordoorx][self.waitfordoory];
                Wolf.Doors.open(door);
                if (door.action != Wolf.dr_open) {
                    return;
                }
                self.waitfordoorx = self.waitfordoory = 0;
            }
            if (move < self.distance) {
                T_Move(self, game, move);
                break;
            }
            self.x = Wolf.TILE2POS(self.tile.x);
            self.y = Wolf.TILE2POS(self.tile.y);
            move -= self.distance;
            think(self, game, tics);
            self.angle = Wolf.Math.dir8angle[self.dir];
            if (self.dir == Wolf.Math.dir8_nodir) {
                return;
            }
        }
    }
    function T_Move(self, game, dist) {
        var level = game.level, player = game.player;
        if (self.dir == Wolf.Math.dir8_nodir || !dist) {
            return;
        }
        self.x += dist * Wolf.Math.dx8dir[self.dir];
        self.y += dist * Wolf.Math.dy8dir[self.dir];
        if (Math.abs(self.x - player.position.x) <= Wolf.MINACTORDIST) {
            if (Math.abs(self.y - player.position.y) <= Wolf.MINACTORDIST) {
                var t = self.type;
                if (t == Wolf.en_blinky || t == Wolf.en_clyde || t == Wolf.en_pinky || t == Wolf.en_inky || t == Wolf.en_spectre) {
                    Wolf.Player.damage(player, self, 2);
                }
                self.x -= dist * Wolf.Math.dx8dir[self.dir];
                self.y -= dist * Wolf.Math.dy8dir[self.dir];
                return;
            }
        }
        self.distance -= dist;
        if (self.distance < 0) {
            self.distance = 0;
        }
    }
    function T_Ghosts(self, game, tics) {
        var level = game.level, player = game.player;
        if (self.dir == Wolf.Math.dir8_nodir) {
            chase(self, game);
            if (self.dir == Wolf.Math.dir8_nodir) {
                return;
            }
            self.angle = Wolf.Math.dir8angle[self.dir];
        }
        T_Advance(self, game, chase, tics);
    }
    function T_Bite(self, game, tics) {
        var level = game.level, player = game.player, dx, dy;
        Sound.startSound(player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/002.wav", 1, Sound.ATTN_NORM, 0);
        dx = Math.abs(player.position.x - self.x) - Wolf.TILEGLOBAL;
        if (dx <= Wolf.MINACTORDIST) {
            dy = Math.abs(player.position.y - self.y) - Wolf.TILEGLOBAL;
            if (dy <= Wolf.MINACTORDIST) {
                if (Random.get() < 180) {
                    Wolf.Player.damage(player, self, Random.get() >> 4);
                    return;
                }
            }
        }
    }
    function T_UShoot(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist;
        T_Shoot(self, game, tics);
        dx = Math.abs(self.tile.x - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(self.tile.y - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);
        if (dist <= 1) {
            Wolf.Player.damage(player, self, 10);
        }
    }
    function T_Launch(self, game, tics) {
        var level = game.level, player = game.player, proj, iangle;
        iangle = Wolf.Math.transformPoint(self.x, self.y, player.position.x, player.position.y) + Math.PI;
        if (iangle > 2 * Math.PI) {
            iangle -= 2 * Math.PI;
        }
        if (self.type == Wolf.en_death) {
            T_Shoot(self, game, tics);
            if (self.state == Wolf.st_shoot2) {
                iangle = Wolf.Math.normalizeAngle(iangle - Wolf.DEG2RAD(4));
            }
            else {
                iangle = Wolf.Math.normalizeAngle(iangle + Wolf.DEG2RAD(4));
            }
        }
        proj = Wolf.Actors.getNewActor(level);
        if (proj == null) {
            return;
        }
        proj.x = self.x;
        proj.y = self.y;
        proj.tile.x = self.tile.x;
        proj.tile.y = self.tile.y;
        proj.state = Wolf.st_stand;
        proj.ticcount = 1;
        proj.dir = Wolf.Math.dir8_nodir;
        proj.angle = Wolf.RAD2FINE(iangle) >> 0;
        proj.speed = 0x2000;
        proj.flags = Wolf.FL_NONMARK;
        proj.sprite = Wolf.Sprites.getNewSprite(level);
        switch (self.type) {
            case Wolf.en_death:
                proj.type = Wolf.en_hrocket;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/078.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.en_angel:
                proj.type = Wolf.en_spark;
                proj.state = Wolf.st_path1;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/069.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.en_fake:
                proj.type = Wolf.en_fire;
                proj.state = Wolf.st_path1;
                proj.flags = Wolf.FL_NEVERMARK;
                proj.speed = 0x1200;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/069.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.en_schabbs:
                proj.type = Wolf.en_needle;
                proj.state = Wolf.st_path1;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/008.wav", 1, Sound.ATTN_NORM, 0);
                break;
            default:
                proj.type = Wolf.en_rocket;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/085.wav", 1, Sound.ATTN_NORM, 0);
        }
    }
    function projectileTryMove(self, level) {
        var PROJSIZE = 0x2000, xl, yl, xh, yh, x, y;
        xl = (self.x - PROJSIZE) >> Wolf.TILESHIFT;
        yl = (self.y - PROJSIZE) >> Wolf.TILESHIFT;
        xh = (self.x + PROJSIZE) >> Wolf.TILESHIFT;
        yh = (self.y + PROJSIZE) >> Wolf.TILESHIFT;
        for (y = yl; y <= yh; ++y) {
            for (x = xl; x <= xh; ++x) {
                if (level.tileMap[x][y] & (Wolf.WALL_TILE | Wolf.BLOCK_TILE)) {
                    return false;
                }
                if (level.tileMap[x][y] & Wolf.DOOR_TILE) {
                    if (Wolf.Doors.opened(level.state.doorMap[x][y]) != Wolf.DOOR_FULLOPEN) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    function T_Projectile(self, game, tics) {
        var level = game.level, player = game.player, PROJECTILESIZE = 0xC000, deltax, deltay, speed, damage;
        speed = self.speed * tics;
        deltax = (speed * Wolf.Math.CosTable[self.angle]) >> 0;
        deltay = (speed * Wolf.Math.SinTable[self.angle]) >> 0;
        if (deltax > Wolf.TILEGLOBAL) {
            deltax = Wolf.TILEGLOBAL;
        }
        if (deltax < -Wolf.TILEGLOBAL) {
            deltax = -Wolf.TILEGLOBAL;
        }
        if (deltay > Wolf.TILEGLOBAL) {
            deltay = Wolf.TILEGLOBAL;
        }
        if (deltay < -Wolf.TILEGLOBAL) {
            deltay = -Wolf.TILEGLOBAL;
        }
        self.x += deltax;
        self.y += deltay;
        deltax = Math.abs(self.x - player.position.x);
        deltay = Math.abs(self.y - player.position.y);
        if (!projectileTryMove(self, level)) {
            if (self.type == Wolf.en_rocket || self.type == Wolf.en_hrocket) {
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/086.wav", 1, Sound.ATTN_NORM, 0);
                Wolf.Actors.stateChange(self, Wolf.st_die1);
            }
            else {
                Wolf.Actors.stateChange(self, Wolf.st_remove);
            }
            return;
        }
        if (deltax < PROJECTILESIZE && deltay < PROJECTILESIZE) {
            switch (self.type) {
                case Wolf.en_needle:
                    damage = (Random.get() >> 3) + 20;
                    break;
                case Wolf.en_rocket:
                case Wolf.en_hrocket:
                case Wolf.en_spark:
                    damage = (Random.get() >> 3) + 30;
                    break;
                case Wolf.en_fire:
                    damage = (Random.get() >> 3);
                    break;
                default:
                    damage = 0;
                    break;
            }
            Wolf.Player.damage(player, self, damage);
            Wolf.Actors.stateChange(self, Wolf.st_remove);
            return;
        }
        self.tile.x = self.x >> Wolf.TILESHIFT;
        self.tile.y = self.y >> Wolf.TILESHIFT;
    }
    function T_BJRun(self, game, tics) {
        var move = Wolf.BJRUNSPEED * tics;
        T_Move(self, game, move);
        if (!self.distance) {
            self.distance = Wolf.TILEGLOBAL;
            if (!(--self.temp2)) {
                Wolf.Actors.stateChange(self, Wolf.st_shoot1);
                self.speed = Wolf.BJJUMPSPEED;
                return;
            }
        }
    }
    function T_BJJump(self, game, tics) {
    }
    function T_BJYell(self, game, tics) {
        Sound.startSound(null, null, 0, Sound.CHAN_VOICE, "assets/sfx/082.wav", 1, Sound.ATTN_NORM, 0);
    }
    function T_BJDone(self, game, tics) {
        Wolf.Player.playstate = Wolf.ex_victory;
        Wolf.Game.endEpisode(game);
    }
    return {
        T_Stand: T_Stand,
        T_Path: T_Path,
        T_Ghosts: T_Ghosts,
        T_Bite: T_Bite,
        T_Shoot: T_Shoot,
        T_UShoot: T_UShoot,
        T_Launch: T_Launch,
        T_Chase: T_Chase,
        T_DogChase: T_DogChase,
        T_BossChase: T_BossChase,
        T_Fake: T_Fake,
        T_Projectile: T_Projectile,
        T_BJRun: T_BJRun,
        T_BJJump: T_BJJump,
        T_BJYell: T_BJYell,
        T_BJDone: T_BJDone
    };
})();
