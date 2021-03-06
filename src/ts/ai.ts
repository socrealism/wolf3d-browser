/**
 * @description Enemy AI
 */
class AI {
    static readonly RUNSPEED = 6000;
    static readonly MINSIGHT = 0x18000;

    static checkSight(self, game) {
        var level = game.level,
            player = game.player,
            deltax, deltay;


        // don't bother tracing a line if the area isn't connected to the player's
        if (!(self.flags & Actors.FL_AMBUSH)) {
            if (!level.state.areabyplayer[self.areanumber]) {
                return false;
            }
        }

        // if the player is real close, sight is automatic
        deltax = player.position.x - self.x;
        deltay = player.position.y - self.y;

        if (Math.abs(deltax) < AI.MINSIGHT && Math.abs(deltay) < AI.MINSIGHT) {
            return true;
        }

        // see if they are looking in the right direction
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

        // trace a line to check for blocking tiles (corners)
        return Level.checkLine(self.x, self.y, player.position.x, player.position.y, level);
    }

    /**
     * @description Entity is going to move in a new direction.
     *              Called, when actor finished previous moving & located in
     *              the 'center' of the tile. Entity will try walking in direction.
     * @private
     * @returns {boolean} true if direction is OK, otherwise false.
     */
    static changeDir(self, new_dir, level) {
        var oldx,
            oldy,
            newx,
            newy, // all it tiles
            n,
            moveok = false;

        oldx = Wolf.POS2TILE(self.x);
        oldy = Wolf.POS2TILE(self.y);
        //assert( new_dir >= 0 && new_dir <= 8 );
        newx = oldx + Mathematik.dx8dir[new_dir];
        newy = oldy + Mathematik.dy8dir[new_dir];

        if (new_dir & 0x01) { // same as %2 (diagonal dir)
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
                    return false; // another guard in path
                }
                if (level.state.guards[n].tile.x == oldx && level.state.guards[n].tile.y == newy) {
                    return false; // another guard in path
                }
                if (level.state.guards[n].tile.x == newx && level.state.guards[n].tile.y == oldy) {
                    return false; // another guard in path
                }
            }
        } else { // linear dir (E, N, W, S)
            if (level.tileMap[newx][newy] & Level.SOLID_TILE) {
                return false;
            }
            if (level.tileMap[newx][newy] & Level.DOOR_TILE) {
                if (self.type == Actors.en_fake || self.type == Actors.en_dog) { // they can't open doors
                    if (level.state.doorMap[newx][newy].action != Doors.dr_open) { // path is blocked by a closed opened door
                        return false;
                    }
                } else {
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
                        return false; // another guard in path
                    }
                }
            }
        }

        //moveok:
        self.tile.x = newx;
        self.tile.y = newy;

        level.tileMap[oldx][oldy] &= ~Level.ACTOR_TILE; // update map status
        level.tileMap[newx][newy] |= Level.ACTOR_TILE;

        if (level.areas[newx][newy] > 0) {
            // ambush tiles don't have valid area numbers (-3), so don't change the area if walking over them
            self.areanumber = level.areas[newx][newy];
            // assert( self.areanumber >= 0 && self.areanumber < NUMAREAS );
        }

        self.distance = Wolf.TILEGLOBAL;
        self.dir = new_dir;

        return true;
    }

    /**
     * @description Entity is going to turn on a way point.
     * @private
     */
    static path(self, game) {
        var level = game.level;
        if (level.tileMap[self.x >> Wolf.TILESHIFT][self.y >> Wolf.TILESHIFT] & Level.WAYPOINT_TILE) {

            var tileinfo = level.tileMap[self.x >> Wolf.TILESHIFT][self.y >> Wolf.TILESHIFT];

            if (tileinfo & Level.TILE_IS_E_TURN) {
                self.dir = Mathematik.dir8_east;
            } else if (tileinfo & Level.TILE_IS_NE_TURN) {
                self.dir = Mathematik.dir8_northeast;
            } else if (tileinfo & Level.TILE_IS_N_TURN) {
                self.dir = Mathematik.dir8_north;
            } else if (tileinfo & Level.TILE_IS_NW_TURN) {
                self.dir = Mathematik.dir8_northwest;
            } else if (tileinfo & Level.TILE_IS_W_TURN) {
                self.dir = Mathematik.dir8_west;
            } else if (tileinfo & Level.TILE_IS_SW_TURN) {
                self.dir = Mathematik.dir8_southwest;
            } else if (tileinfo & Level.TILE_IS_S_TURN) {
                self.dir = Mathematik.dir8_south;
            } else if (tileinfo & Level.TILE_IS_SE_TURN) {
                self.dir = Mathematik.dir8_southeast;
            }
        }

        if (!AI.changeDir(self, self.dir, level)) {
            self.dir = Mathematik.dir8_nodir;
        }
    }

    /**
     * @description Called by entities that ARE NOT chasing the player.
     * @private
     */
    static findTarget(self, game, tics) {
        var level = game.level,
            player = game.player;

        if (self.temp2) { // count down reaction time
            self.temp2 -= tics;
            if (self.temp2 > 0) {
                return false;
            }
            self.temp2 = 0; // time to react
        } else {

            // check if we can/want to see/hear player
            if (player.flags & Player.FL_NOTARGET) {
                return false; // notarget cheat
            }

            // assert( self.areanumber >= 0 && self.areanumber <    NUMAREAS );
            if (!(self.flags & Actors.FL_AMBUSH) && !level.state.areabyplayer[self.areanumber]) {
                return false;
            }

            if (!AI.checkSight(self, game)) { // Player is visible - normal behavior
                if (self.flags & Actors.FL_AMBUSH || !player.madenoise) {
                    return false;
                }
            }
            self.flags &= ~Actors.FL_AMBUSH;


            // if we are here we see/hear player!!!
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

            return false;  // we are amazed & waiting to understand what to do!
        }

        ActorAI.firstSighting(self, game);

        return true;
    }

    /**
     * @description As dodge(), but doesn't try to dodge.
     * @private
     */
    static chase(self, game) {
        var level = game.level,
            player = game.player,
            deltax,
            deltay,
            d = [],
            tdir, olddir, turnaround;

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
        } else if (deltax < 0) {
            d[0] = Mathematik.dir8_west;
        }

        if (deltay > 0) {
            d[1] = Mathematik.dir8_north;
        } else if (deltay < 0) {
            d[1] = Mathematik.dir8_south;
        }

        if (Math.abs(deltay) > Math.abs(deltax)) {
            tdir = d[0];
            d[0] = d[1];
            d[1] = tdir;
        } // swap d[0] & d[1]

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

        // there is no direct path to the player, so pick another direction
        if (olddir != Mathematik.dir8_nodir) {
            if (AI.changeDir(self, olddir, level)) {
                return;
            }
        }

        if (Random.get() > 128) { // randomly determine direction of search
            for (tdir = Mathematik.dir8_east; tdir <= Mathematik.dir8_south; tdir += 2) { // * Revision
                if (tdir != turnaround) {
                    if (AI.changeDir(self, tdir, level)) {
                        return;
                    }
                }
            }
        } else {
            for (tdir = Mathematik.dir8_south; tdir >= Mathematik.dir8_east; tdir -= 2) { // * Revision (JDC fix for unsigned enums)
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

        self.dir = Mathematik.dir8_nodir; // can't move
    }

    /**
     * @description Run Away from player.
     * @private
     */
    static retreat(self, game) {
        var level = game.level,
            player = game.player,
            deltax,
            deltay,
            d = [],
            tdir;

        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);

        d[0] = deltax < 0 ? Mathematik.dir8_east : Mathematik.dir8_west;
        d[1] = deltay < 0 ? Mathematik.dir8_north : Mathematik.dir8_south;

        if (Math.abs(deltay) > Math.abs(deltax)) {
            tdir = d[0];
            d[0] = d[1];
            d[1] = tdir;
        } // swap d[0] & d[1]

        if (AI.changeDir(self, d[0], level)) {
            return;
        }
        if (AI.changeDir(self, d[1], level)) {
            return;
        }

        // there is no direct path to the player, so pick another direction
        if (Random.get() > 128) { // randomly determine direction of search
            for (tdir = Mathematik.dir8_east; tdir <= Mathematik.dir8_south; tdir += 2) { // * Revision
                if (AI.changeDir(self, tdir, level)) {
                    return;
                }
            }
        } else {
            for (tdir = Mathematik.dir8_south; tdir >= Mathematik.dir8_east; tdir -= 2) { // * Revision (JDC fix for unsigned enums)
                if (AI.changeDir(self, tdir, level)) {
                    return;
                }
            }
        }

        self.dir = Mathematik.dir8_nodir;        // can't move
    }

    /**
     * @description Attempts to choose and initiate a movement for entity
     *              that sends it towards the player while dodging.
     * @private
     */
    static dodge(self, game) {
        var level = game.level,
            player = game.player,
            deltax,
            deltay,
            i,

            dirtry = [],
            turnaround,
            tdir;

        if (game.player.playstate == Player.ex_victory) {
            return;
        }

        if (self.flags & Actors.FL_FIRSTATTACK) {
            // turning around is only ok the very first time after noticing the player
            turnaround = Mathematik.dir8_nodir;
            self.flags &= ~Actors.FL_FIRSTATTACK;
        } else {
            turnaround = Mathematik.opposite8[self.dir];
        }


        deltax = Wolf.POS2TILE(player.position.x) - Wolf.POS2TILE(self.x);
        deltay = Wolf.POS2TILE(player.position.y) - Wolf.POS2TILE(self.y);

        //
        // arange 5 direction choices in order of preference
        // the four cardinal directions plus the diagonal straight towards
        // the player
        //

        if (deltax > 0) {
            dirtry[1] = Mathematik.dir8_east;
            dirtry[3] = Mathematik.dir8_west;
        } else {
            dirtry[1] = Mathematik.dir8_west;
            dirtry[3] = Mathematik.dir8_east;
        }

        if (deltay > 0) {
            dirtry[2] = Mathematik.dir8_north;
            dirtry[4] = Mathematik.dir8_south;
        } else {
            dirtry[2] = Mathematik.dir8_south;
            dirtry[4] = Mathematik.dir8_north;
        }

        // randomize a bit for dodging
        if (Math.abs(deltax) > Math.abs(deltay)) {
            tdir = dirtry[1];
            dirtry[1] = dirtry[2];
            dirtry[2] = tdir; // => swap dirtry[1] & dirtry[2]
            tdir = dirtry[3];
            dirtry[3] = dirtry[4];
            dirtry[4] = tdir; // => swap dirtry[3] & dirtry[4]
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

        // try the directions util one works
        for (i = 0; i < 5; ++i) {
            if (dirtry[i] == Mathematik.dir8_nodir || dirtry[i] == turnaround) {
                continue;
            }
            if (AI.changeDir(self, dirtry[i], level)) {
                return;
            }
        }

        // turn around only as a last resort
        if (turnaround != Mathematik.dir8_nodir) {
            if (AI.changeDir(self, turnaround, level)) {
                return;
            }
        }


        self.dir = Mathematik.dir8_nodir;
    }

    /**
     */
    static T_Stand(self, game, tics) {
        AI.findTarget(self, game, tics);
    }

    /**
     */
    static T_Path(self, game, tics) {
        var level = game.level;
        if (AI.findTarget(self, game, tics)) {
            return;
        }

        if (!self.speed) {
            return; // if patroling with a speed of 0
        }

        if (self.dir == Mathematik.dir8_nodir) {
            AI.path(self, game);

            if (self.dir == Mathematik.dir8_nodir) {
                return; // all movement is blocked
            }
        }
        AI.T_Advance(self, game, AI.path, tics);
    }

    /**
     * @description Try to damage the player.
     */
    static T_Shoot(self, game, tics) {
        var level = game.level,
            player = game.player,
            dx, dy, dist,
            hitchance,
            damage;

        if (!level.state.areabyplayer[self.areanumber]) {
            return;
        }

        if (!Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            return; // player is behind a wall
        }

        dx = Math.abs(Wolf.POS2TILE(self.x) - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(Wolf.POS2TILE(self.y) - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);

        if (self.type == Actors.en_ss || self.type == Actors.en_boss) {
            dist = dist * 2 / 3;                    // ss are better shots
        }

        if (player.speed >= AI.RUNSPEED) {
            hitchance = 160;
        } else {
            hitchance = 256;
        }

        // if guard is visible by player
        // player can see to dodge
        // (if CheckLine both player & enemy see each other)
        // So left only check if guard is in player's fov: FIXME: not fixed fov!
        var trans = Mathematik.transformPoint(self.x, self.y, player.position.x, player.position.y);
        if (Angle.diff(trans, Wolf.FINE2DEG(player.angle)) < (Math.PI / 3)) {
            hitchance -= dist * 16;
        } else {
            hitchance -= dist * 8;
        }

        // see if the shot was a hit
        if (Random.get() < hitchance) {
            if (dist < 2) {
                damage = Random.get() >> 2;
            } else if (dist < 4) {
                damage = Random.get() >> 3;
            } else {
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

    /**
     * @description
     */
    static T_Chase(self, game, tics) {
        var level = game.level,
            player = game.player,
            dx, dy,
            dist,
            chance,
            shouldDodge = false;

        // if (gamestate.victoryflag) return;
        if (Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) { // got a shot at player?
            dx = Math.abs(Wolf.POS2TILE(self.x) - Wolf.POS2TILE(player.position.x));
            dy = Math.abs(Wolf.POS2TILE(self.y) - Wolf.POS2TILE(player.position.y));
            dist = Math.max(dx, dy);
            if (!dist || (dist == 1 && self.distance < 16)) {
                chance = 300;
            } else {
                chance = (tics << 4) / dist; // 100/dist;
            }

            if (Random.get() < chance) {
                // go into attack frame
                Actors.stateChange(self, Actors.st_shoot1);
                return;
            }
            shouldDodge = true;
        }


        if (self.dir == Mathematik.dir8_nodir) {
            if (shouldDodge) {
                AI.dodge(self, game);
            } else {
                AI.chase(self, game);
            }

            if (self.dir == Mathematik.dir8_nodir) {
                return; // object is blocked in
            }
            self.angle = Mathematik.dir8angle[self.dir];
        }

        AI.T_Advance(self, game, shouldDodge ? AI.dodge : AI.chase, tics);

    }

    /**
     * @description
     */
    static T_DogChase(self, game, tics) {
        var level = game.level,
            player = game.player,
            dx, dy;

        if (self.dir == Mathematik.dir8_nodir) {
            AI.dodge(self, game);
            self.angle = Mathematik.dir8angle[self.dir];
            if (self.dir == Mathematik.dir8_nodir) {
                return; // object is blocked in
            }
        }

        //
        // check for bite range
        //
        dx = Math.abs(player.position.x - self.x) - Wolf.TILEGLOBAL / 2;
        if (dx <= Actors.MINACTORDIST) {
            dy = Math.abs(player.position.y - self.y) - Wolf.TILEGLOBAL / 2;
            if (dy <= Actors.MINACTORDIST) {
                Actors.stateChange(self, Actors.st_shoot1);
                return; // bite player!
            }
        }

        AI.T_Advance(self, game, AI.dodge, tics);
    }

    /**
     * @description Try to damage the player.
     */
    static T_BossChase(self, game, tics) {
        var level = game.level,
            player = game.player,
            dx, dy, dist,
            think,
            shouldDodge = false;

        dx = Math.abs(self.tile.x - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(self.tile.y - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);

        if (Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            // got a shot at player?
            if (Random.get() < tics << 3) {
                // go into attack frame
                Actors.stateChange(self, Actors.st_shoot1);
                return;
            }
            shouldDodge = true;
        }

        if (self.dir == Mathematik.dir8_nodir) {
            if (shouldDodge) {
                AI.dodge(self, game);
            } else {
                AI.chase(self, game);
            }

            if (self.dir == Mathematik.dir8_nodir) {
                // object is blocked in
                return;
            }
        }

        think = dist < 4 ? AI.retreat : (shouldDodge ? AI.dodge : AI.chase);
        AI.T_Advance(self, game, think, tics);
    }

    /**
     * @description
     */
    static T_Fake(self, game, tics) {
        var level = game.level,
            player = game.player;

        if (Level.checkLine(self.x, self.y, player.position.x, player.position.y, level)) {
            if (Random.get() < tics << 1) {
                // go into attack frame
                Actors.stateChange(self, Actors.st_shoot1);
                return;
            }
        }

        if (self.dir == Mathematik.dir8_nodir) {
            AI.dodge(self, game);
            if (self.dir == Mathematik.dir8_nodir) {
                // object is blocked in
                return;
            }
        }

        AI.T_Advance(self, game, AI.dodge, tics);
    }

    /**
     * @description
     * @private
     */
    static T_Advance(self, game, think, tics) {
        var level = game.level,
            move, door;

        if (!think) {
            Wolf.log("Warning: Advance without <think> proc\n");
            return;
        }

        move = self.speed * tics;
        while (move > 0) {
            // waiting for a door to open
            if (self.waitfordoorx) {
                door = level.state.doorMap[self.waitfordoorx][self.waitfordoory];

                Doors.open(door);
                if (door.action != Doors.dr_open) {
                    return; // not opened yet...
                }
                self.waitfordoorx = self.waitfordoory = 0;    // go ahead, the door is now open
            }

            if (move < self.distance) {
                AI.T_Move(self, game, move);
                break;
            }

            // fix position to account for round off during moving
            self.x = Wolf.TILE2POS(self.tile.x);
            self.y = Wolf.TILE2POS(self.tile.y);

            move -= self.distance;

            // think: Where to go now?
            think(self, game, tics);

            self.angle = Mathematik.dir8angle[self.dir];
            if (self.dir == Mathematik.dir8_nodir) {
                return; // all movement is blocked
            }
        }
    }

    /**
     * @description Moves object for distance in global units, in self.dir direction.
     */
    static T_Move(self, game, dist) {
        var level = game.level,
            player = game.player;

        if (self.dir == Mathematik.dir8_nodir || !dist) {
            return;
        }
        self.x += dist * Mathematik.dx8dir[self.dir];
        self.y += dist * Mathematik.dy8dir[self.dir];

        // check to make sure it's not on top of player
        if (Math.abs(self.x - player.position.x) <= Actors.MINACTORDIST) {
            if (Math.abs(self.y - player.position.y) <= Actors.MINACTORDIST) {
                var t = self.type;
                if (t == Actors.en_blinky || t == Actors.en_clyde || t == Actors.en_pinky || t == Actors.en_inky || t == Actors.en_spectre) {
                    Player.damage(player, self, 2); // ghosts hurt player!
                }
                //
                // back up
                //
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

    /**
     * @description
     */
    static T_Ghosts(self, game, tics) {
        var level = game.level,
            player = game.player;

        if (self.dir == Mathematik.dir8_nodir) {
            AI.chase(self, game);
            if (self.dir == Mathematik.dir8_nodir) {
                return;    // object is blocked in
            }
            self.angle = Mathematik.dir8angle[self.dir];
        }
        AI.T_Advance(self, game, AI.chase, tics);
    }

    /**
     * @description
     */
    static T_Bite(self, game, tics) {
        var level = game.level,
            player = game.player,
            dx, dy;

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

    /**
     * @description
     */
    static T_UShoot(self, game, tics) {
        var level = game.level,
            player = game.player,
            dx, dy,
            dist;

        AI.T_Shoot(self, game, tics);

        dx = Math.abs(self.tile.x - Wolf.POS2TILE(player.position.x));
        dy = Math.abs(self.tile.y - Wolf.POS2TILE(player.position.y));
        dist = Math.max(dx, dy);

        if (dist <= 1) {
            Player.damage(player, self, 10);
        }
    }

    /**
     * @description
     */
    static T_Launch(self, game, tics) {
        var level = game.level,
            player = game.player,
            proj, iangle;

        iangle = Mathematik.transformPoint(self.x, self.y, player.position.x, player.position.y) + Math.PI;
        if (iangle > 2 * Math.PI) {
            iangle -= 2 * Math.PI;
        }

        if (self.type == Actors.en_death) {
            // death knight launches 2 rockets with 4 degree shift each.
            AI.T_Shoot(self, game, tics);
            if (self.state == Actors.st_shoot2) {
                iangle = Mathematik.normalizeAngle(iangle - Angle.DEG2RAD(4));
            } else {
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
        proj.flags = Actors.FL_NONMARK; // FL_NEVERMARK;
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

    /**
     * @description Called when projectile is airborne.
     * @private
     * @param {object} self The projectile actor object.
     * @param {object} level The level object.
     * @returns {boolean} True if move ok, otherwise false.
     */
    static projectileTryMove(self, level) {
        var PROJSIZE = 0x2000,
            xl, yl, xh, yh, x, y;

        xl = (self.x - PROJSIZE) >> Wolf.TILESHIFT;
        yl = (self.y - PROJSIZE) >> Wolf.TILESHIFT;

        xh = (self.x + PROJSIZE) >> Wolf.TILESHIFT;
        yh = (self.y + PROJSIZE) >> Wolf.TILESHIFT;

        // Checking for solid walls:
        for (y = yl; y <= yh; ++y) {
            for (x = xl; x <= xh; ++x) {
                // FIXME: decide what to do with statics & Doors!
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
        // FIXME: Projectile will fly through objects (even guards & columns) - must fix to create rocket launcher!
        return true;
    }

    /**
     * @description Called when projectile is airborne.
     * @param {object} self The enemy actor object.
     * @param {object} level The level object.
     * @param {object} player The player object.
     * @param {number} tics The number of tics.
     * @returns {boolean} True if move ok, otherwise false.
     */
    static T_Projectile(self, game, tics) {
        var level = game.level,
            player = game.player,
            PROJECTILESIZE = 0xC000,
            deltax, deltay,
            speed, damage;

        speed = self.speed * tics;

        deltax = (speed * Mathematik.CosTable[self.angle]) >> 0;
        deltay = (speed * Mathematik.SinTable[self.angle]) >> 0;

        if (deltax > Wolf.TILEGLOBAL) {
            deltax = Wolf.TILEGLOBAL;
        }
        if (deltax < -Wolf.TILEGLOBAL) {
            deltax = -Wolf.TILEGLOBAL; // my
        }
        if (deltay > Wolf.TILEGLOBAL) {
            deltay = Wolf.TILEGLOBAL;
        }
        if (deltay < -Wolf.TILEGLOBAL) {
            deltay = -Wolf.TILEGLOBAL; // my
        }

        self.x += deltax;
        self.y += deltay;

        deltax = Math.abs(self.x - player.position.x);
        deltay = Math.abs(self.y - player.position.y);

        if (!AI.projectileTryMove(self, level)) {
            if (self.type == Actors.en_rocket || self.type == Actors.en_hrocket) {
                // rocket ran into obstacle, draw explosion!
                Sound.startSound(player.position, self, 1, Sound.CHAN_WEAPON, "assets/lsfx/086.wav", 1, Sound.ATTN_NORM, 0);
                Actors.stateChange(self, Actors.st_die1);
            } else {
                Actors.stateChange(self, Actors.st_remove); // mark for removal
            }
            return;
        }

        if (deltax < PROJECTILESIZE && deltay < PROJECTILESIZE) {
            // hit the player
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
            Actors.stateChange(self, Actors.st_remove); // mark for removal
            return;
        }

        self.tile.x = self.x >> Wolf.TILESHIFT;
        self.tile.y = self.y >> Wolf.TILESHIFT;
    }

    /**
     * @description
     */
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

    /**
     * @description
     */
    static T_BJJump(self, game, tics) {
        //var move = Player.BJRUNSPEED * tics;
        //AI.T_Move(self, game, move);
    }

    /**
     * @description
     */
    static T_BJYell(self, game, tics) {
        Sound.startSound(null, null, 0, Sound.CHAN_VOICE, "assets/sfx/082.wav", 1, Sound.ATTN_NORM, 0);
    }

    /**
     * @description
     */
    static T_BJDone(self, game, tics) {
        Player.playstate = Player.ex_victory; // exit castle tile
        //Player.playstate = Player.ex_complete;
        Game.endEpisode(game);
    }
}
