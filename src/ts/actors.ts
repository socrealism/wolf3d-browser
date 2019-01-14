/**
 * @namespace
 * @description Actors
 */
class Actors {
    public static readonly SPDPATROL = 512;
    public static readonly SPDDOG = 1500;

    public static readonly FL_SHOOTABLE = 1;
    public static readonly FL_BONUS = 2;
    public static readonly FL_NEVERMARK = 4;
    public static readonly FL_VISABLE = 8;
    public static readonly FL_ATTACKMODE = 16;
    public static readonly FL_FIRSTATTACK = 32;
    public static readonly FL_AMBUSH = 64;
    public static readonly FL_NONMARK = 128;

    public static readonly MAX_GUARDS = 255;
    public static readonly NUMENEMIES = 31;
    public static readonly NUMSTATES = 34;

    public static readonly MINACTORDIST = 0x10000;

    public static readonly en_guard = 0;
    public static readonly en_officer = 1;
    public static readonly en_ss = 2;
    public static readonly en_dog = 3;
    public static readonly en_boss = 4;
    public static readonly en_schabbs = 5;
    public static readonly en_fake = 6;
    public static readonly en_mecha = 7;
    public static readonly en_hitler = 8;
    public static readonly en_mutant = 9;
    public static readonly en_blinky = 10;
    public static readonly en_clyde = 11;
    public static readonly en_pinky = 12;
    public static readonly en_inky = 13;
    public static readonly en_gretel = 14;
    public static readonly en_gift = 15;
    public static readonly en_fat = 16;
    // --- Projectiles
    public static readonly en_needle = 17;
    public static readonly en_fire = 18;
    public static readonly en_rocket = 19;
    public static readonly en_smoke = 20;
    public static readonly en_bj = 21;
    // --- Spear of destiny!
    public static readonly en_spark = 22;
    public static readonly en_hrocket = 23;
    public static readonly en_hsmoke = 24;

    public static readonly en_spectre = 25;
    public static readonly en_angel = 26;
    public static readonly en_trans = 27;
    public static readonly en_uber = 28;
    public static readonly en_will = 29;
    public static readonly en_death = 30;

    public static readonly st_stand = 0;
    public static readonly st_path1 = 1;
    public static readonly st_path1s = 2;
    public static readonly st_path2 = 3;
    public static readonly st_path3 = 4;
    public static readonly st_path3s = 5;
    public static readonly st_path4 = 6;
    public static readonly st_pain = 7;
    public static readonly st_pain1 = 8;
    public static readonly st_shoot1 = 9;
    public static readonly st_shoot2 = 10;
    public static readonly st_shoot3 = 11;
    public static readonly st_shoot4 = 12;
    public static readonly st_shoot5 = 13;
    public static readonly st_shoot6 = 14;
    public static readonly st_shoot7 = 15;
    public static readonly st_shoot8 = 16;
    public static readonly st_shoot9 = 17;
    public static readonly st_chase1 = 18;
    public static readonly st_chase1s = 19;
    public static readonly st_chase2 = 20;
    public static readonly st_chase3 = 21;
    public static readonly st_chase3s = 22;
    public static readonly st_chase4 = 23;
    public static readonly st_die1 = 24;
    public static readonly st_die2 = 25;
    public static readonly st_die3 = 26;
    public static readonly st_die4 = 27;
    public static readonly st_die5 = 28;
    public static readonly st_die6 = 29;
    public static readonly st_die7 = 30;
    public static readonly st_die8 = 31;
    public static readonly st_die9 = 32;
    public static readonly st_dead = 33;
    public static readonly st_remove = 34;

    public static add8dir = [4, 5, 6, 7, 0, 1, 2, 3, 0];
    public static r_add8dir = [4, 7, 6, 5, 0, 1, 2, 3, 0];

    /**
     * @description Create new actor.
     * @memberOf Wolf.Actors
     * @param {object} level The level object.
     * @returns {object} The new actor object.
     */
    public static getNewActor(level) {

        if (level.state.numGuards > Actors.MAX_GUARDS) {
            return null;
        }

        var actor = {
            x: 0,
            y: 0,
            angle: 0,
            type: 0,
            health: 0,
            max_health: 0,
            speed: 0,
            ticcount: 0,
            temp2: 0,
            distance: 0,
            tile: {
                x: 0,
                y: 0
            },
            areanumber: 0,
            waitfordoorx: 0,
            waitfordoory: 0,   // waiting on this door if non 0
            flags: 0,            //    FL_SHOOTABLE, etc
            state: 0,
            dir: 0,
            sprite: 0
        };
        level.state.guards[level.state.numGuards++] = actor;

        return actor;
    }

    /**
     * @description Process a single actor.
     * @private
     * @param {object} ent The actor object.
     * @param {object} level The level object.
     * @param {object} player The player object.
     * @param {number} tics The number of tics.
     * @returns {boolean} False if actor should be removed, otherwise true.
     */
    public static doGuard(ent, game, tics) { // FIXME: revise!
        var think;

        //assert( ent->tilex >= 0 && ent->tilex < 64 );
        //assert( ent->tiley >= 0 && ent->tiley < 64 );
        //assert( ent->dir >= 0 && ent->dir <= 8 );


        // ticcounts fire discrete actions separate from think functions
        if (ent.ticcount) {
            ent.ticcount -= tics;

            while (ent.ticcount <= 0) {
                //assert( ent->type >= 0 && ent->type < NUMENEMIES );
                //assert( ent->state >= 0 && ent->state < NUMSTATES );

                think = Wolf.objstate[ent.type][ent.state].action; // end of state action
                if (think) {
                    think(ent, game, tics);
                    if (ent.state == Actors.st_remove) {
                        return false;
                    }
                }

                ent.state = Wolf.objstate[ent.type][ent.state].next_state;
                if (ent.state == Actors.st_remove) {
                    return false;
                }

                if (!Wolf.objstate[ent.type][ent.state].timeout) {
                    ent.ticcount = 0;
                    break;
                }

                ent.ticcount += Wolf.objstate[ent.type][ent.state].timeout;
            }
        }
        //
        // think
        //
        //assert( ent->type >= 0 && ent->type < NUMENEMIES );
        //assert( ent->state >= 0 && ent->state < NUMSTATES );
        think = Wolf.objstate[ent.type][ent.state].think;

        if (think) {
            think(ent, game, tics);
            if (ent.state == Actors.st_remove) {
                return false;
            }
        }

        return true;
    }

    /**
     * @description Changes guard's state to that defined in newState.
     * @memberOf Wolf.Actors
     * @param {object} ent The actor object.
     * @param {number} newState The new state.
     */
    public static stateChange(ent, newState) {
        ent.state = newState;
        // assert( ent->type >= 0 && ent->type < NUMENEMIES );
        if (newState == Actors.st_remove) {
            ent.ticcount = 0;
        } else {
            // assert( ent->state >= 0 && ent->state < NUMSTATES );
            ent.ticcount = Wolf.objstate[ent.type][ent.state].timeout; //0;
        }
    }

    /**
     * @description Process all the enemy actors.
     * @memberOf Wolf.Actors
     * @param {object} level The level object.
     * @param {object} player The player object.
     * @param {number} tics The number of tics.
     */
    public static process(game, tics) {
        var level = game.level,
            player = game.player,
            n, tex, guard,
            liveGuards = [];

        for (n = 0; n < level.state.numGuards; ++n) {
            guard = level.state.guards[n];

            if (!Actors.doGuard(guard, game, tics)) {
                // remove guard from the game forever!
                // remove(game, guards[n--]);
                Wolf.Sprites.remove(level, guard.sprite);
                level.state.guards[n] = null;
                continue;
            }

            Wolf.Sprites.setPos(level, guard.sprite, guard.x, guard.y, guard.angle);

            tex = Wolf.objstate[guard.type][guard.state].texture;

            if (Wolf.objstate[guard.type][guard.state].rotate) {
                if (guard.type == Actors.en_rocket || guard.type == Actors.en_hrocket) {
                    tex += Actors.r_add8dir[Wolf.Math.get8dir(Wolf.Angle.distCW(Wolf.FINE2RAD(player.angle), Wolf.FINE2RAD(guard.angle)))];
                } else {
                    tex += Actors.add8dir[Wolf.Math.get8dir(Wolf.Angle.distCW(Wolf.FINE2RAD(player.angle), Wolf.FINE2RAD(guard.angle)))];
                }
            }
            Wolf.Sprites.setTex(level, guard.sprite, 0, tex);
        }

        for (n = 0; n < level.state.numGuards; ++n) {
            if (level.state.guards[n]) {
                liveGuards.push(level.state.guards[n]);
            }
        }
        level.state.guards = liveGuards;
        level.state.numGuards = liveGuards.length;
    }

    /**
     * @description Reset and clear the enemy actors in the level.
     * @memberOf Wolf.Actors
     * @param {object} level The level object.
     */
    public static resetGuards(level) {
        level.state.guards = [];
        level.state.numGuards = 0;
        //New = NULL;
    }

    /**
     * @description Spawn a new enemy actor at the given position.
     * @memberOf Wolf.Actors
     * @param {object} level The level object.
     * @param {number} skill The difficulty level.
     * @param {number} which The actor type.
     * @param {number} x The x position.
     * @param {number} y The y position.
     * @param {number} dir The direction.
     * @returns {object} The new actor object or null if actor creation failed.
     */
    public static spawn(level, skill, which, x, y, dir) {
        var ent = Actors.getNewActor(level);

        if (!ent) {
            return null;
        }

        ent.x = Wolf.TILE2POS(x);
        ent.y = Wolf.TILE2POS(y);

        ent.tile.x = x;
        ent.tile.y = y;

        // assert( dir >= 0 && dir <= 4 );
        ent.angle = Wolf.Math.dir4angle[dir];
        ent.dir = Wolf.Math.dir4to8[dir];

        ent.areanumber = level.areas[x][y];

        if (ent.areanumber < 0) {
            // ambush marker tiles are listed as -3 area
            ent.areanumber = 0;
        }

        // assert( ent->areanumber >= 0 && ent->areanumber < NUMAREAS );
        ent.type = which;
        ent.health = Wolf.starthitpoints[skill][which];
        ent.sprite = Wolf.Sprites.getNewSprite(level);

        return ent;
    }

    /**
     * @description Spawn a dead guard.
     * @memberOf Wolf.Actors
     * @param {object} level The level object.
     * @param {number} skill The difficulty level.
     * @param {number} which The actor type.
     * @param {number} x The x position.
     * @param {number} y The y position.
     */
    public static spawnDeadGuard(level, skill, which, x, y) {
        var self = Actors.spawn(level, skill, which, x, y, Wolf.Math.dir4_nodir);
        if (!self) {
            return;
        }
        self.state = Actors.st_dead;
        self.speed = 0;
        self.health = 0;
        self.ticcount = Wolf.objstate[which][Actors.st_dead].timeout ? Random.get() % Wolf.objstate[which][Actors.st_dead].timeout + 1 : 0;
    }

    /**
     * @description Spawn a patrolling guard.
     * @memberOf Wolf.Actors
     * @param {object} level The level object.
     * @param {number} skill The difficulty level.
     * @param {number} which The actor type.
     * @param {number} x The x position.
     * @param {number} y The y position.
     */
    public static spawnPatrol(level, skill, which, x, y, dir) {
        var self = Actors.spawn(level, skill, which, x, y, dir);
        if (!self) {
            return;
        }

        self.state = Actors.st_path1;
        self.speed = (which == Actors.en_dog) ? Actors.SPDDOG : Actors.SPDPATROL;
        self.distance = Wolf.TILEGLOBAL;
        self.ticcount = Wolf.objstate[which][Actors.st_path1].timeout ? Random.get() % Wolf.objstate[which][Actors.st_path1].timeout + 1 : 0;
        self.flags |= Actors.FL_SHOOTABLE;

        level.state.totalMonsters++;
    }

    /**
     * @description Spawn a standing guard.
     * @memberOf Wolf.Actors
     * @param {object} level The level object.
     * @param {number} skill The difficulty level.
     * @param {number} which The actor type.
     * @param {number} x The x position.
     * @param {number} y The y position.
     */
    public static spawnStand(level, skill, which, x, y, dir) {
        var self = Actors.spawn(level, skill, which, x, y, dir);
        if (!self) {
            return;
        }

        self.state = Actors.st_stand;
        self.speed = Actors.SPDPATROL;
        self.ticcount = Wolf.objstate[which][Actors.st_stand].timeout ? Random.get() % Wolf.objstate[which][Actors.st_stand].timeout + 1 : 0;
        self.flags |= Actors.FL_SHOOTABLE;

        if (level.tileMap[x][y] & Wolf.AMBUSH_TILE) {
            self.flags |= Actors.FL_AMBUSH;
        }

        level.state.totalMonsters++;
    }

    public static spawnBoss(level, skill, which, x, y) {
        var self,
            face;

        switch (which) {
            case Actors.en_boss:
            case Actors.en_schabbs:
            case Actors.en_fat:
            case Actors.en_hitler:
                face = Wolf.Math.dir4_south;
                break;

            case Actors.en_fake:
            case Actors.en_gretel:
            case Actors.en_gift:
                face = Wolf.Math.dir4_north;
                break;

            case Actors.en_trans:
            case Actors.en_uber:
            case Actors.en_will:
            case Actors.en_death:
            case Actors.en_angel:
            case Actors.en_spectre:
                face = Wolf.Math.dir4_nodir;
                break;

            default:
                face = Wolf.Math.dir4_nodir;
                break;
        }

        self = Actors.spawn(level, skill, which, x, y, face);
        if (!self) {
            return;
        }

        self.state = which == Actors.en_spectre ? Actors.st_path1 : Actors.st_stand;
        self.speed = Actors.SPDPATROL;
        self.health = Wolf.starthitpoints[skill][which];
        self.ticcount = Wolf.objstate[which][Actors.st_stand].timeout ? Random.get() % Wolf.objstate[which][Actors.st_stand].timeout + 1 : 0;
        self.flags |= Actors.FL_SHOOTABLE | Actors.FL_AMBUSH;

        level.state.totalMonsters++;
    }

    public static spawnGhosts(level, skill, which, x, y) {
        var self = Actors.spawn(level, skill, which, x, y, Wolf.Math.dir4_nodir);
        if (!self) {
            return;
        }

        self.state = Actors.st_chase1;
        self.speed = Actors.SPDPATROL * 3;
        self.health = Wolf.starthitpoints[skill][which];
        self.ticcount = Wolf.objstate[which][Actors.st_chase1].timeout ? Random.get() % Wolf.objstate[which][Actors.st_chase1].timeout + 1 : 0;
        self.flags |= Actors.FL_AMBUSH;

        level.state.totalMonsters++;
    }

    public static spawnBJVictory(player, level, skill) {
        var x = Wolf.POS2TILE(player.position.x),
            y = Wolf.POS2TILE(player.position.y),
            bj = Actors.spawn(level, skill, Actors.en_bj, x, y + 1, Wolf.Math.dir4_north);

        if (!bj) {
            return;
        }

        bj.x = player.position.x;
        bj.y = player.position.y;
        bj.state = Actors.st_path1;
        bj.speed = Wolf.BJRUNSPEED;
        bj.flags = Actors.FL_NONMARK; // FL_NEVERMARK;
        bj.temp2 = 6;
        bj.ticcount = 1;
    }
}
