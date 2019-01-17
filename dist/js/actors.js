"use strict";
class Actors {
    static getNewActor(level) {
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
            waitfordoory: 0,
            flags: 0,
            state: 0,
            dir: 0,
            sprite: 0
        };
        level.state.guards[level.state.numGuards++] = actor;
        return actor;
    }
    static doGuard(ent, game, tics) {
        var think;
        if (ent.ticcount) {
            ent.ticcount -= tics;
            while (ent.ticcount <= 0) {
                think = Actstat.objstate[ent.type][ent.state].action;
                if (think) {
                    think(ent, game, tics);
                    if (ent.state == Actors.st_remove) {
                        return false;
                    }
                }
                ent.state = Actstat.objstate[ent.type][ent.state].next_state;
                if (ent.state == Actors.st_remove) {
                    return false;
                }
                if (!Actstat.objstate[ent.type][ent.state].timeout) {
                    ent.ticcount = 0;
                    break;
                }
                ent.ticcount += Actstat.objstate[ent.type][ent.state].timeout;
            }
        }
        think = Actstat.objstate[ent.type][ent.state].think;
        if (think) {
            think(ent, game, tics);
            if (ent.state == Actors.st_remove) {
                return false;
            }
        }
        return true;
    }
    static stateChange(ent, newState) {
        ent.state = newState;
        if (newState == Actors.st_remove) {
            ent.ticcount = 0;
        }
        else {
            ent.ticcount = Actstat.objstate[ent.type][ent.state].timeout;
        }
    }
    static process(game, tics) {
        var level = game.level, player = game.player, n, tex, guard, liveGuards = [];
        for (n = 0; n < level.state.numGuards; ++n) {
            guard = level.state.guards[n];
            if (!Actors.doGuard(guard, game, tics)) {
                Sprites.remove(level, guard.sprite);
                level.state.guards[n] = null;
                continue;
            }
            Sprites.setPos(level, guard.sprite, guard.x, guard.y, guard.angle);
            tex = Actstat.objstate[guard.type][guard.state].texture;
            if (Actstat.objstate[guard.type][guard.state].rotate) {
                if (guard.type == Actors.en_rocket || guard.type == Actors.en_hrocket) {
                    tex += Actors.r_add8dir[Mathematik.get8dir(Angle.distCW(Wolf.FINE2RAD(player.angle), Wolf.FINE2RAD(guard.angle)))];
                }
                else {
                    tex += Actors.add8dir[Mathematik.get8dir(Angle.distCW(Wolf.FINE2RAD(player.angle), Wolf.FINE2RAD(guard.angle)))];
                }
            }
            Sprites.setTex(level, guard.sprite, 0, tex);
        }
        for (n = 0; n < level.state.numGuards; ++n) {
            if (level.state.guards[n]) {
                liveGuards.push(level.state.guards[n]);
            }
        }
        level.state.guards = liveGuards;
        level.state.numGuards = liveGuards.length;
    }
    static resetGuards(level) {
        level.state.guards = [];
        level.state.numGuards = 0;
    }
    static spawn(level, skill, which, x, y, dir) {
        var ent = Actors.getNewActor(level);
        if (!ent) {
            return null;
        }
        ent.x = Wolf.TILE2POS(x);
        ent.y = Wolf.TILE2POS(y);
        ent.tile.x = x;
        ent.tile.y = y;
        ent.angle = Mathematik.dir4angle[dir];
        ent.dir = Mathematik.dir4to8[dir];
        ent.areanumber = level.areas[x][y];
        if (ent.areanumber < 0) {
            ent.areanumber = 0;
        }
        ent.type = which;
        ent.health = Actstat.starthitpoints[skill][which];
        ent.sprite = Sprites.getNewSprite(level);
        return ent;
    }
    static spawnDeadGuard(level, skill, which, x, y) {
        var self = Actors.spawn(level, skill, which, x, y, Mathematik.dir4_nodir);
        if (!self) {
            return;
        }
        self.state = Actors.st_dead;
        self.speed = 0;
        self.health = 0;
        self.ticcount = Actstat.objstate[which][Actors.st_dead].timeout ? Random.get() % Actstat.objstate[which][Actors.st_dead].timeout + 1 : 0;
    }
    static spawnPatrol(level, skill, which, x, y, dir) {
        var self = Actors.spawn(level, skill, which, x, y, dir);
        if (!self) {
            return;
        }
        self.state = Actors.st_path1;
        self.speed = (which == Actors.en_dog) ? Actors.SPDDOG : Actors.SPDPATROL;
        self.distance = Wolf.TILEGLOBAL;
        self.ticcount = Actstat.objstate[which][Actors.st_path1].timeout ? Random.get() % Actstat.objstate[which][Actors.st_path1].timeout + 1 : 0;
        self.flags |= Actors.FL_SHOOTABLE;
        level.state.totalMonsters++;
    }
    static spawnStand(level, skill, which, x, y, dir) {
        var self = Actors.spawn(level, skill, which, x, y, dir);
        if (!self) {
            return;
        }
        self.state = Actors.st_stand;
        self.speed = Actors.SPDPATROL;
        self.ticcount = Actstat.objstate[which][Actors.st_stand].timeout ? Random.get() % Actstat.objstate[which][Actors.st_stand].timeout + 1 : 0;
        self.flags |= Actors.FL_SHOOTABLE;
        if (level.tileMap[x][y] & Level.AMBUSH_TILE) {
            self.flags |= Actors.FL_AMBUSH;
        }
        level.state.totalMonsters++;
    }
    static spawnBoss(level, skill, which, x, y) {
        var self, face;
        switch (which) {
            case Actors.en_boss:
            case Actors.en_schabbs:
            case Actors.en_fat:
            case Actors.en_hitler:
                face = Mathematik.dir4_south;
                break;
            case Actors.en_fake:
            case Actors.en_gretel:
            case Actors.en_gift:
                face = Mathematik.dir4_north;
                break;
            case Actors.en_trans:
            case Actors.en_uber:
            case Actors.en_will:
            case Actors.en_death:
            case Actors.en_angel:
            case Actors.en_spectre:
                face = Mathematik.dir4_nodir;
                break;
            default:
                face = Mathematik.dir4_nodir;
                break;
        }
        self = Actors.spawn(level, skill, which, x, y, face);
        if (!self) {
            return;
        }
        self.state = which == Actors.en_spectre ? Actors.st_path1 : Actors.st_stand;
        self.speed = Actors.SPDPATROL;
        self.health = Actstat.starthitpoints[skill][which];
        self.ticcount = Actstat.objstate[which][Actors.st_stand].timeout ? Random.get() % Actstat.objstate[which][Actors.st_stand].timeout + 1 : 0;
        self.flags |= Actors.FL_SHOOTABLE | Actors.FL_AMBUSH;
        level.state.totalMonsters++;
    }
    static spawnGhosts(level, skill, which, x, y) {
        var self = Actors.spawn(level, skill, which, x, y, Mathematik.dir4_nodir);
        if (!self) {
            return;
        }
        self.state = Actors.st_chase1;
        self.speed = Actors.SPDPATROL * 3;
        self.health = Actstat.starthitpoints[skill][which];
        self.ticcount = Actstat.objstate[which][Actors.st_chase1].timeout ? Random.get() % Actstat.objstate[which][Actors.st_chase1].timeout + 1 : 0;
        self.flags |= Actors.FL_AMBUSH;
        level.state.totalMonsters++;
    }
    static spawnBJVictory(player, level, skill) {
        const x = Wolf.POS2TILE(player.position.x), y = Wolf.POS2TILE(player.position.y), bj = Actors.spawn(level, skill, Actors.en_bj, x, y + 1, Mathematik.dir4_north);
        if (!bj) {
            return;
        }
        bj.x = player.position.x;
        bj.y = player.position.y;
        bj.state = Actors.st_path1;
        bj.speed = Player.BJRUNSPEED;
        bj.flags = Actors.FL_NONMARK;
        bj.temp2 = 6;
        bj.ticcount = 1;
    }
}
Actors.SPDPATROL = 512;
Actors.SPDDOG = 1500;
Actors.FL_SHOOTABLE = 1;
Actors.FL_BONUS = 2;
Actors.FL_NEVERMARK = 4;
Actors.FL_VISABLE = 8;
Actors.FL_ATTACKMODE = 16;
Actors.FL_FIRSTATTACK = 32;
Actors.FL_AMBUSH = 64;
Actors.FL_NONMARK = 128;
Actors.MAX_GUARDS = 255;
Actors.NUMENEMIES = 31;
Actors.NUMSTATES = 34;
Actors.MINACTORDIST = 0x10000;
Actors.en_guard = 0;
Actors.en_officer = 1;
Actors.en_ss = 2;
Actors.en_dog = 3;
Actors.en_boss = 4;
Actors.en_schabbs = 5;
Actors.en_fake = 6;
Actors.en_mecha = 7;
Actors.en_hitler = 8;
Actors.en_mutant = 9;
Actors.en_blinky = 10;
Actors.en_clyde = 11;
Actors.en_pinky = 12;
Actors.en_inky = 13;
Actors.en_gretel = 14;
Actors.en_gift = 15;
Actors.en_fat = 16;
Actors.en_needle = 17;
Actors.en_fire = 18;
Actors.en_rocket = 19;
Actors.en_smoke = 20;
Actors.en_bj = 21;
Actors.en_spark = 22;
Actors.en_hrocket = 23;
Actors.en_hsmoke = 24;
Actors.en_spectre = 25;
Actors.en_angel = 26;
Actors.en_trans = 27;
Actors.en_uber = 28;
Actors.en_will = 29;
Actors.en_death = 30;
Actors.st_stand = 0;
Actors.st_path1 = 1;
Actors.st_path1s = 2;
Actors.st_path2 = 3;
Actors.st_path3 = 4;
Actors.st_path3s = 5;
Actors.st_path4 = 6;
Actors.st_pain = 7;
Actors.st_pain1 = 8;
Actors.st_shoot1 = 9;
Actors.st_shoot2 = 10;
Actors.st_shoot3 = 11;
Actors.st_shoot4 = 12;
Actors.st_shoot5 = 13;
Actors.st_shoot6 = 14;
Actors.st_shoot7 = 15;
Actors.st_shoot8 = 16;
Actors.st_shoot9 = 17;
Actors.st_chase1 = 18;
Actors.st_chase1s = 19;
Actors.st_chase2 = 20;
Actors.st_chase3 = 21;
Actors.st_chase3s = 22;
Actors.st_chase4 = 23;
Actors.st_die1 = 24;
Actors.st_die2 = 25;
Actors.st_die3 = 26;
Actors.st_die4 = 27;
Actors.st_die5 = 28;
Actors.st_die6 = 29;
Actors.st_die7 = 30;
Actors.st_die8 = 31;
Actors.st_die9 = 32;
Actors.st_dead = 33;
Actors.st_remove = 34;
Actors.add8dir = [4, 5, 6, 7, 0, 1, 2, 3, 0];
Actors.r_add8dir = [4, 7, 6, 5, 0, 1, 2, 3, 0];
