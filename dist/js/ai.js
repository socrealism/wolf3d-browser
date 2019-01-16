"use strict";
class AI {
    static checkSight(self, game) {
        var level = game.level, player = game.player, deltax, deltay;
        if (!(self.flags & Actors.FL_AMBUSH)) {
            if (!level.state.areabyplayer[self.areanumber]) {
                return false;
            }
        }
        deltax = player.position.x - self.x;
        deltay = player.position.y - self.y;
        if (Math.abs(deltax) < AI.MINSIGHT && Math.abs(deltay) < AI.MINSIGHT) {
            return true;
        }
        switch (self.dir) {
            case Mathematik.dir8_north:
                if (deltay < 0) {
                    return false;
                }
                break;
            case Mathematik.dir8_east:
                if (deltax < 0) {
                    return false;
                }
                break;
            case Mathematik.dir8_south:
                if (deltay > 0) {
                    return false;
                }
                break;
            case Mathematik.dir8_west:
                if (deltax > 0) {
                    return false;
                }
                break;
            default:
                break;
        }
        return Level.checkLine(self.x, self.y, player.position.x, player.position.y, level);
    }
    static changeDir(self, new_dir, level) {
        var oldx, oldy, newx, newy, n, moveok = false;
        oldx = Wolf.POS2TILE(self.x);
        oldy = Wolf.POS2TILE(self.y);
        newx = oldx + Mathematik.dx8dir[new_dir];
        newy = oldy + Mathematik.dy8dir[new_dir];
        if (new_dir & 0x01) {
            if (level.tileMap[newx][oldy] & Level.SOLID_TILE ||
                level.tileMap[oldx][newy] & Level.SOLID_TILE ||
                level.tileMap[newx][newy] & Level.SOLID_TILE) {
                return false;
            }
            for (n = 0; n < level.state.numGuards; ++n) {
                if (level.state.guards[n].state >= Actors.st_die1) {
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
            if (level.tileMap[newx][newy] & Level.SOLID_TILE) {
                return false;
            }
            if (level.tileMap[newx][newy] & Level.DOOR_TILE) {
                if (self.type == Actors.en_fake || self.type == Actors.en_dog) {
                    if (level.state.doorMap[newx][newy].action != Doors.dr_open) {
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
                    if (level.state.guards[n].state >= Actors.st_die1) {
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
        level.tileMap[oldx][oldy] &= ~Level.ACTOR_TILE;
        level.tileMap[newx][newy] |= Level.ACTOR_TILE;
        if (level.areas[newx][newy] > 0) {
            self.areanumber = level.areas[newx][newy];
        }
        self.distance = Wolf.TILEGLOBAL;
        self.dir = new_dir;
        return true;
    }
    static path(self, game) {
        var level = game.level;
        if (level.tileMap[self.x >> Wolf.TILESHIFT][self.y >> Wolf.TILESHIFT] & Level.WAYPOINT_TILE) {
            var tileinfo = level.tileMap[self.x >> Wolf.TILESHIFT][self.y >> Wolf.TILESHIFT];
            if (tileinfo & Level.TILE_IS_E_TURN) {
                self.dir = Mathematik.dir8_east;
            }
            else if (tileinfo & Level.TILE_IS_NE_TURN) {
                self.dir = Mathematik.dir8_northeast;
            }
            else if (tileinfo & Level.TILE_IS_N_TURN) {
                self.dir = Mathematik.dir8_north;
            }
            else if (tileinfo & Level.TILE_IS_NW_TURN) {
                self.dir = Mathematik.dir8_northwest;
            }
            else if (tileinfo & Level.TILE_IS_W_TURN) {
                self.dir = Mathematik.dir8_west;
            }
            else if (tileinfo & Level.TILE_IS_SW_TURN) {
                self.dir = Mathematik.dir8_southwest;
            }
            else if (tileinfo & Level.TILE_IS_S_TURN) {
                self.dir = Mathematik.dir8_south;
            }
            else if (tileinfo & Level.TILE_IS_SE_TURN) {
                self.dir = Mathematik.dir8_southeast;
            }
        }
        if (!AI.changeDir(self, self.dir, level)) {
            self.dir = Mathematik.dir8_nodir;
        }
    }
    static findTarget(self, game, tics) {
        var level = game.level, player = game.player;
        if (self.temp2) {
            self.temp2 -= tics;
            if (self.temp2 > 0) {
                return false;
            }
            self.temp2 = 0;
        }
        else {
            if (player.flags & Player.FL_NOTARGET) {
                return false;
            }
            if (!(self.flags & Actors.FL_AMBUSH) && !level.state.areabyplayer[self.areanumber]) {
                return false;
            }
            if (!AI.checkSight(self, game)) {
                if (self.flags & Actors.FL_AMBUSH || !player.madenoise) {
                    return false;
                }
            }
            self.flags &= ~Actors.FL_AMBUSH;
            switch (self.type) {
                case Actors.en_guard:
                    self.temp2 = 1 + Random.get() / 4;
                    break;
                case Actors.en_officer:
                    self.temp2 = 2;
                    break;
                case Actors.en_mutant:
                    self.temp2 = 1 + Random.get() / 6;
                    break;
                case Actors.en_ss:
                    self.temp2 = 1 + Random.get() / 6;
                    break;
                case Actors.en_dog:
                    self.temp2 = 1 + Random.get() / 8;
                    break;
                case Actors.en_boss:
                case Actors.en_schabbs:
                case Actors.en_fake:
                case Actors.en_mecha:
                case Actors.en_hitler:
                case Actors.en_gretel:
                case Actors.en_gift:
                case Actors.en_fat:
                case Actors.en_spectre:
                case Actors.en_angel:
                case Actors.en_trans:
                case Actors.en_uber:
                case Actors.en_will:
                case Actors.en_death:
                    self.temp2 = 1;
                    break;
            }
            return false;
        }
        ActorAI.firstSighting(self, game);
        return true;
    }
    static chase(self, game) {
        var level = game.level, player = game.player, deltax, deltay, d = [], tdir, olddir, turnaround;
        if (game.player.playstate == Player.ex_victory) {
            return;
        }
        olddir = self.dir;
        turnaround = Mathematik.opposite8[olddir];
        d[0] = d[1] = Mathematik.dir8_nodir;
        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);
        if (deltax > 0) {
            d[0] = Mathematik.dir8_east;
        }
        else if (deltax < 0) {
            d[0] = Mathematik.dir8_west;
        }
        if (deltay > 0) {
            d[1] = Mathematik.dir8_north;
        }
        else if (deltay < 0) {
            d[1] = Mathematik.dir8_south;
        }
        if (Math.abs(deltay) > Math.abs(deltax)) {
            tdir = d[0];
            d[0] = d[1];
            d[1] = tdir;
        }
        if (d[0] == turnaround) {
            d[0] = Mathematik.dir8_nodir;
        }
        if (d[1] == turnaround) {
            d[1] = Mathematik.dir8_nodir;
        }
        if (d[0] != Mathematik.dir8_nodir) {
            if (AI.changeDir(self, d[0], level)) {
                return;
            }
        }
        if (d[1] != Mathematik.dir8_nodir) {
            if (AI.changeDir(self, d[1], level)) {
                return;
            }
        }
        if (olddir != Mathematik.dir8_nodir) {
            if (AI.changeDir(self, olddir, level)) {
                return;
            }
        }
        if (Random.get() > 128) {
            for (tdir = Mathematik.dir8_east; tdir <= Mathematik.dir8_south; tdir += 2) {
                if (tdir != turnaround) {
                    if (AI.changeDir(self, tdir, level)) {
                        return;
                    }
                }
            }
        }
        else {
            for (tdir = Mathematik.dir8_south; tdir >= Mathematik.dir8_east; tdir -= 2) {
                if (tdir != turnaround) {
                    if (AI.changeDir(self, tdir, level)) {
                        return;
                    }
                }
            }
        }
        if (turnaround != Mathematik.dir8_nodir) {
            if (AI.changeDir(self, turnaround, level)) {
                return;
            }
        }
        self.dir = Mathematik.dir8_nodir;
    }
    static retreat(self, game) {
        var level = game.level, player = game.player, deltax, deltay, d = [], tdir;
        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);
        d[0] = deltax < 0 ? Mathematik.dir8_east : Mathematik.dir8_west;
        d[1] = deltay < 0 ? Mathematik.dir8_north : Mathematik.dir8_south;
        if (Math.abs(deltay) > Math.abs(deltax)) {
            tdir = d[0];
            d[0] = d[1];
            d[1] = tdir;
        }
        if (AI.changeDir(self, d[0], level)) {
            return;
        }
        if (AI.changeDir(self, d[1], level)) {
            return;
        }
        if (Random.get() > 128) {
            for (tdir = Mathematik.dir8_east; tdir <= Mathematik.dir8_south; tdir += 2) {
                if (AI.changeDir(self, tdir, level)) {
                    return;
                }
            }
        }
        else {
            for (tdir = Mathematik.dir8_south; tdir >= Mathematik.dir8_east; tdir -= 2) {
                if (AI.changeDir(self, tdir, level)) {
                    return;
                }
            }
        }
        self.dir = Mathematik.dir8_nodir;
    }
    static dodge(self, game) {
        var level = game.level, player = game.player, deltax, deltay, i, dirtry = [], turnaround, tdir;
        if (game.player.playstate == Player.ex_victory) {
            return;
        }
        if (self.flags & Actors.FL_FIRSTATTACK) {
            turnaround = Mathematik.dir8_nodir;
            self.flags &= ~Actors.FL_FIRSTATTACK;
        }
        else {
            turnaround = Mathematik.opposite8[self.dir];
        }
        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);
        if (deltax > 0) {
            dirtry[1] = Mathematik.dir8_east;
            dirtry[3] = Mathematik.dir8_west;
        }
        else {
            dirtry[1] = Mathematik.dir8_west;
            dirtry[3] = Mathematik.dir8_east;
        }
        if (deltay > 0) {
            dirtry[2] = Mathematik.dir8_north;
            dirtry[4] = Mathematik.dir8_south;
        }
        else {
            dirtry[2] = Mathematik.dir8_south;
            dirtry[4] = Mathematik.dir8_north;
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
        dirtry[0] = Mathematik.diagonal[dirtry[1]][dirtry[2]];
        for (i = 0; i < 5; ++i) {
            if (dirtry[i] == Mathematik.dir8_nodir || dirtry[i] == turnaround) {
                continue;
            }
            if (AI.changeDir(self, dirtry[i], level)) {
                return;
            }
        }
        if (turnaround != Mathematik.dir8_nodir) {
            if (AI.changeDir(self, turnaround, level)) {
                return;
            }
        }
        self.dir = Mathematik.dir8_nodir;
    }
    static T_Stand(self, game, tics) {
        AI.findTarget(self, game, tics);
    }
    static T_Path(self, game, tics) {
        var level = game.level;
        if (AI.findTarget(self, game, tics)) {
            return;
        }
        if (!self.speed) {
            return;
        }
        if (self.dir == Mathematik.dir8_nodir) {
            AI.path(self, game);
            if (self.dir == Mathematik.dir8_nodir) {
                return;
            }
        }
        AI.T_Advance(self, game, AI.path, tics);
    }
    static T_Shoot(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist, hitchance, damage;
        if (!level.state.areabyplayer[self.areanumber]) {
            return;
        }
        if (!Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            return;
        }
        dx = Math.abs(Wolf.POS2TILE(self.x) - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(Wolf.POS2TILE(self.y) - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);
        if (self.type == Actors.en_ss || self.type == Actors.en_boss) {
            dist = dist * 2 / 3;
        }
        if (player.speed >= AI.RUNSPEED) {
            hitchance = 160;
        }
        else {
            hitchance = 256;
        }
        var trans = Mathematik.transformPoint(self.x, self.y, player.position.x, player.position.y);
        if (Angle.diff(trans, Wolf.FINE2DEG(player.angle)) < (Math.PI / 3)) {
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
            Player.damage(player, self, damage);
        }
        switch (self.type) {
            case Actors.en_ss:
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/sfx/024.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_gift:
            case Actors.en_fat:
            case Actors.en_mecha:
            case Actors.en_hitler:
            case Actors.en_boss:
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/sfx/022.wav", 1, Sound.ATTN_NORM, 0);
                break;
            default:
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/sfx/049.wav", 1, Sound.ATTN_NORM, 0);
                break;
        }
    }
    static T_Chase(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist, chance, shouldDodge = false;
        if (Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
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
                Actors.stateChange(self, Actors.st_shoot1);
                return;
            }
            shouldDodge = true;
        }
        if (self.dir == Mathematik.dir8_nodir) {
            if (shouldDodge) {
                AI.dodge(self, game);
            }
            else {
                AI.chase(self, game);
            }
            if (self.dir == Mathematik.dir8_nodir) {
                return;
            }
            self.angle = Mathematik.dir8angle[self.dir];
        }
        AI.T_Advance(self, game, shouldDodge ? AI.dodge : AI.chase, tics);
    }
    static T_DogChase(self, game, tics) {
        var level = game.level, player = game.player, dx, dy;
        if (self.dir == Mathematik.dir8_nodir) {
            AI.dodge(self, game);
            self.angle = Mathematik.dir8angle[self.dir];
            if (self.dir == Mathematik.dir8_nodir) {
                return;
            }
        }
        dx = Math.abs(player.position.x - self.x) - Wolf.TILEGLOBAL / 2;
        if (dx <= Actors.MINACTORDIST) {
            dy = Math.abs(player.position.y - self.y) - Wolf.TILEGLOBAL / 2;
            if (dy <= Actors.MINACTORDIST) {
                Actors.stateChange(self, Actors.st_shoot1);
                return;
            }
        }
        AI.T_Advance(self, game, AI.dodge, tics);
    }
    static T_BossChase(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist, think, shouldDodge = false;
        dx = Math.abs(self.tile.x - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(self.tile.y - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);
        if (Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            if (Random.get() < tics << 3) {
                Actors.stateChange(self, Actors.st_shoot1);
                return;
            }
            shouldDodge = true;
        }
        if (self.dir == Mathematik.dir8_nodir) {
            if (shouldDodge) {
                AI.dodge(self, game);
            }
            else {
                AI.chase(self, game);
            }
            if (self.dir == Mathematik.dir8_nodir) {
                return;
            }
        }
        think = dist < 4 ? AI.retreat : (shouldDodge ? AI.dodge : AI.chase);
        AI.T_Advance(self, game, think, tics);
    }
    static T_Fake(self, game, tics) {
        var level = game.level, player = game.player;
        if (Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            if (Random.get() < tics << 1) {
                Actors.stateChange(self, Actors.st_shoot1);
                return;
            }
        }
        if (self.dir == Mathematik.dir8_nodir) {
            AI.dodge(self, game);
            if (self.dir == Mathematik.dir8_nodir) {
                return;
            }
        }
        AI.T_Advance(self, game, AI.dodge, tics);
    }
    static T_Advance(self, game, think, tics) {
        var level = game.level, move, door;
        if (!think) {
            Wolf.log("Warning: Advance without <think> proc\n");
            return;
        }
        move = self.speed * tics;
        while (move > 0) {
            if (self.waitfordoorx) {
                door = level.state.doorMap[self.waitfordoorx][self.waitfordoory];
                Doors.open(door);
                if (door.action != Doors.dr_open) {
                    return;
                }
                self.waitfordoorx = self.waitfordoory = 0;
            }
            if (move < self.distance) {
                AI.T_Move(self, game, move);
                break;
            }
            self.x = Wolf.TILE2POS(self.tile.x);
            self.y = Wolf.TILE2POS(self.tile.y);
            move -= self.distance;
            think(self, game, tics);
            self.angle = Mathematik.dir8angle[self.dir];
            if (self.dir == Mathematik.dir8_nodir) {
                return;
            }
        }
    }
    static T_Move(self, game, dist) {
        var level = game.level, player = game.player;
        if (self.dir == Mathematik.dir8_nodir || !dist) {
            return;
        }
        self.x += dist * Mathematik.dx8dir[self.dir];
        self.y += dist * Mathematik.dy8dir[self.dir];
        if (Math.abs(self.x - player.position.x) <= Actors.MINACTORDIST) {
            if (Math.abs(self.y - player.position.y) <= Actors.MINACTORDIST) {
                var t = self.type;
                if (t == Actors.en_blinky || t == Actors.en_clyde || t == Actors.en_pinky || t == Actors.en_inky || t == Actors.en_spectre) {
                    Player.damage(player, self, 2);
                }
                self.x -= dist * Mathematik.dx8dir[self.dir];
                self.y -= dist * Mathematik.dy8dir[self.dir];
                return;
            }
        }
        self.distance -= dist;
        if (self.distance < 0) {
            self.distance = 0;
        }
    }
    static T_Ghosts(self, game, tics) {
        var level = game.level, player = game.player;
        if (self.dir == Mathematik.dir8_nodir) {
            AI.chase(self, game);
            if (self.dir == Mathematik.dir8_nodir) {
                return;
            }
            self.angle = Mathematik.dir8angle[self.dir];
        }
        AI.T_Advance(self, game, AI.chase, tics);
    }
    static T_Bite(self, game, tics) {
        var level = game.level, player = game.player, dx, dy;
        Sound.startSound(player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/002.wav", 1, Sound.ATTN_NORM, 0);
        dx = Math.abs(player.position.x - self.x) - Wolf.TILEGLOBAL;
        if (dx <= Actors.MINACTORDIST) {
            dy = Math.abs(player.position.y - self.y) - Wolf.TILEGLOBAL;
            if (dy <= Actors.MINACTORDIST) {
                if (Random.get() < 180) {
                    Player.damage(player, self, Random.get() >> 4);
                    return;
                }
            }
        }
    }
    static T_UShoot(self, game, tics) {
        var level = game.level, player = game.player, dx, dy, dist;
        AI.T_Shoot(self, game, tics);
        dx = Math.abs(self.tile.x - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(self.tile.y - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);
        if (dist <= 1) {
            Player.damage(player, self, 10);
        }
    }
    static T_Launch(self, game, tics) {
        var level = game.level, player = game.player, proj, iangle;
        iangle = Mathematik.transformPoint(self.x, self.y, player.position.x, player.position.y) + Math.PI;
        if (iangle > 2 * Math.PI) {
            iangle -= 2 * Math.PI;
        }
        if (self.type == Actors.en_death) {
            AI.T_Shoot(self, game, tics);
            if (self.state == Actors.st_shoot2) {
                iangle = Mathematik.normalizeAngle(iangle - Angle.DEG2RAD(4));
            }
            else {
                iangle = Mathematik.normalizeAngle(iangle + Angle.DEG2RAD(4));
            }
        }
        proj = Actors.getNewActor(level);
        if (proj == null) {
            return;
        }
        proj.x = self.x;
        proj.y = self.y;
        proj.tile.x = self.tile.x;
        proj.tile.y = self.tile.y;
        proj.state = Actors.st_stand;
        proj.ticcount = 1;
        proj.dir = Mathematik.dir8_nodir;
        proj.angle = Wolf.RAD2FINE(iangle) >> 0;
        proj.speed = 0x2000;
        proj.flags = Actors.FL_NONMARK;
        proj.sprite = Sprites.getNewSprite(level);
        switch (self.type) {
            case Actors.en_death:
                proj.type = Actors.en_hrocket;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/078.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_angel:
                proj.type = Actors.en_spark;
                proj.state = Actors.st_path1;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/069.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_fake:
                proj.type = Actors.en_fire;
                proj.state = Actors.st_path1;
                proj.flags = Actors.FL_NEVERMARK;
                proj.speed = 0x1200;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/069.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_schabbs:
                proj.type = Actors.en_needle;
                proj.state = Actors.st_path1;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/008.wav", 1, Sound.ATTN_NORM, 0);
                break;
            default:
                proj.type = Actors.en_rocket;
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/085.wav", 1, Sound.ATTN_NORM, 0);
        }
    }
    static projectileTryMove(self, level) {
        var PROJSIZE = 0x2000, xl, yl, xh, yh, x, y;
        xl = (self.x - PROJSIZE) >> Wolf.TILESHIFT;
        yl = (self.y - PROJSIZE) >> Wolf.TILESHIFT;
        xh = (self.x + PROJSIZE) >> Wolf.TILESHIFT;
        yh = (self.y + PROJSIZE) >> Wolf.TILESHIFT;
        for (y = yl; y <= yh; ++y) {
            for (x = xl; x <= xh; ++x) {
                if (level.tileMap[x][y] & (Level.WALL_TILE | Level.BLOCK_TILE)) {
                    return false;
                }
                if (level.tileMap[x][y] & Level.DOOR_TILE) {
                    if (Doors.opened(level.state.doorMap[x][y]) != Doors.DOOR_FULLOPEN) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    static T_Projectile(self, game, tics) {
        var level = game.level, player = game.player, PROJECTILESIZE = 0xC000, deltax, deltay, speed, damage;
        speed = self.speed * tics;
        deltax = (speed * Mathematik.CosTable[self.angle]) >> 0;
        deltay = (speed * Mathematik.SinTable[self.angle]) >> 0;
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
        if (!AI.projectileTryMove(self, level)) {
            if (self.type == Actors.en_rocket || self.type == Actors.en_hrocket) {
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/086.wav", 1, Sound.ATTN_NORM, 0);
                Actors.stateChange(self, Actors.st_die1);
            }
            else {
                Actors.stateChange(self, Actors.st_remove);
            }
            return;
        }
        if (deltax < PROJECTILESIZE && deltay < PROJECTILESIZE) {
            switch (self.type) {
                case Actors.en_needle:
                    damage = (Random.get() >> 3) + 20;
                    break;
                case Actors.en_rocket:
                case Actors.en_hrocket:
                case Actors.en_spark:
                    damage = (Random.get() >> 3) + 30;
                    break;
                case Actors.en_fire:
                    damage = (Random.get() >> 3);
                    break;
                default:
                    damage = 0;
                    break;
            }
            Player.damage(player, self, damage);
            Actors.stateChange(self, Actors.st_remove);
            return;
        }
        self.tile.x = self.x >> Wolf.TILESHIFT;
        self.tile.y = self.y >> Wolf.TILESHIFT;
    }
    static T_BJRun(self, game, tics) {
        var move = Player.BJRUNSPEED * tics;
        AI.T_Move(self, game, move);
        if (!self.distance) {
            self.distance = Wolf.TILEGLOBAL;
            if (!(--self.temp2)) {
                Actors.stateChange(self, Actors.st_shoot1);
                self.speed = Player.BJJUMPSPEED;
                return;
            }
        }
    }
    static T_BJJump(self, game, tics) {
    }
    static T_BJYell(self, game, tics) {
        Sound.startSound(null, null, 0, Sound.CHAN_VOICE, "assets/sfx/082.wav", 1, Sound.ATTN_NORM, 0);
    }
    static T_BJDone(self, game, tics) {
        Player.playstate = Player.ex_victory;
        Game.endEpisode(game);
    }
}
AI.RUNSPEED = 6000;
AI.MINSIGHT = 0x18000;
