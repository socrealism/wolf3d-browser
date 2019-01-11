"use strict";
Wolf.Actors = (function () {
    Wolf.setConsts({
        SPDPATROL: 512,
        SPDDOG: 1500,
        FL_SHOOTABLE: 1,
        FL_BONUS: 2,
        FL_NEVERMARK: 4,
        FL_VISABLE: 8,
        FL_ATTACKMODE: 16,
        FL_FIRSTATTACK: 32,
        FL_AMBUSH: 64,
        FL_NONMARK: 128,
        MAX_GUARDS: 255,
        NUMENEMIES: 31,
        NUMSTATES: 34,
        MINACTORDIST: 0x10000
    });
    Wolf.setConsts({
        en_guard: 0,
        en_officer: 1,
        en_ss: 2,
        en_dog: 3,
        en_boss: 4,
        en_schabbs: 5,
        en_fake: 6,
        en_mecha: 7,
        en_hitler: 8,
        en_mutant: 9,
        en_blinky: 10,
        en_clyde: 11,
        en_pinky: 12,
        en_inky: 13,
        en_gretel: 14,
        en_gift: 15,
        en_fat: 16,
        en_needle: 17,
        en_fire: 18,
        en_rocket: 19,
        en_smoke: 20,
        en_bj: 21,
        en_spark: 22,
        en_hrocket: 23,
        en_hsmoke: 24,
        en_spectre: 25,
        en_angel: 26,
        en_trans: 27,
        en_uber: 28,
        en_will: 29,
        en_death: 30
    });
    Wolf.setConsts({
        st_stand: 0,
        st_path1: 1,
        st_path1s: 2,
        st_path2: 3,
        st_path3: 4,
        st_path3s: 5,
        st_path4: 6,
        st_pain: 7,
        st_pain1: 8,
        st_shoot1: 9,
        st_shoot2: 10,
        st_shoot3: 11,
        st_shoot4: 12,
        st_shoot5: 13,
        st_shoot6: 14,
        st_shoot7: 15,
        st_shoot8: 16,
        st_shoot9: 17,
        st_chase1: 18,
        st_chase1s: 19,
        st_chase2: 20,
        st_chase3: 21,
        st_chase3s: 22,
        st_chase4: 23,
        st_die1: 24,
        st_die2: 25,
        st_die3: 26,
        st_die4: 27,
        st_die5: 28,
        st_die6: 29,
        st_die7: 30,
        st_die8: 31,
        st_die9: 32,
        st_dead: 33,
        st_remove: 34
    });
    var add8dir = [4, 5, 6, 7, 0, 1, 2, 3, 0], r_add8dir = [4, 7, 6, 5, 0, 1, 2, 3, 0];
    function getNewActor(level) {
        if (level.state.numGuards > Wolf.MAX_GUARDS) {
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
    function doGuard(ent, game, tics) {
        var think;
        if (ent.ticcount) {
            ent.ticcount -= tics;
            while (ent.ticcount <= 0) {
                think = Wolf.objstate[ent.type][ent.state].action;
                if (think) {
                    think(ent, game, tics);
                    if (ent.state == Wolf.st_remove) {
                        return false;
                    }
                }
                ent.state = Wolf.objstate[ent.type][ent.state].next_state;
                if (ent.state == Wolf.st_remove) {
                    return false;
                }
                if (!Wolf.objstate[ent.type][ent.state].timeout) {
                    ent.ticcount = 0;
                    break;
                }
                ent.ticcount += Wolf.objstate[ent.type][ent.state].timeout;
            }
        }
        think = Wolf.objstate[ent.type][ent.state].think;
        if (think) {
            think(ent, game, tics);
            if (ent.state == Wolf.st_remove) {
                return false;
            }
        }
        return true;
    }
    function stateChange(ent, newState) {
        ent.state = newState;
        if (newState == Wolf.st_remove) {
            ent.ticcount = 0;
        }
        else {
            ent.ticcount = Wolf.objstate[ent.type][ent.state].timeout;
        }
    }
    function process(game, tics) {
        var level = game.level, player = game.player, n, tex, guard, liveGuards = [];
        for (n = 0; n < level.state.numGuards; ++n) {
            guard = level.state.guards[n];
            if (!doGuard(guard, game, tics)) {
                Wolf.Sprites.remove(level, guard.sprite);
                level.state.guards[n] = null;
                continue;
            }
            Wolf.Sprites.setPos(level, guard.sprite, guard.x, guard.y, guard.angle);
            tex = Wolf.objstate[guard.type][guard.state].texture;
            if (Wolf.objstate[guard.type][guard.state].rotate) {
                if (guard.type == Wolf.en_rocket || guard.type == Wolf.en_hrocket) {
                    tex += r_add8dir[Wolf.Math.get8dir(Wolf.Angle.distCW(Wolf.FINE2RAD(player.angle), Wolf.FINE2RAD(guard.angle)))];
                }
                else {
                    tex += add8dir[Wolf.Math.get8dir(Wolf.Angle.distCW(Wolf.FINE2RAD(player.angle), Wolf.FINE2RAD(guard.angle)))];
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
    function resetGuards(level) {
        level.state.guards = [];
        level.state.numGuards = 0;
    }
    function spawn(level, skill, which, x, y, dir) {
        var ent = getNewActor(level);
        if (!ent) {
            return null;
        }
        ent.x = Wolf.TILE2POS(x);
        ent.y = Wolf.TILE2POS(y);
        ent.tile.x = x;
        ent.tile.y = y;
        ent.angle = Wolf.Math.dir4angle[dir];
        ent.dir = Wolf.Math.dir4to8[dir];
        ent.areanumber = level.areas[x][y];
        if (ent.areanumber < 0) {
            ent.areanumber = 0;
        }
        ent.type = which;
        ent.health = Wolf.starthitpoints[skill][which];
        ent.sprite = Wolf.Sprites.getNewSprite(level);
        return ent;
    }
    function spawnDeadGuard(level, skill, which, x, y) {
        var self = spawn(level, skill, which, x, y, Wolf.Math.dir4_nodir);
        if (!self) {
            return;
        }
        self.state = Wolf.st_dead;
        self.speed = 0;
        self.health = 0;
        self.ticcount = Wolf.objstate[which][Wolf.st_dead].timeout ? Random.get() % Wolf.objstate[which][Wolf.st_dead].timeout + 1 : 0;
    }
    function spawnPatrol(level, skill, which, x, y, dir) {
        var self = spawn(level, skill, which, x, y, dir);
        if (!self) {
            return;
        }
        self.state = Wolf.st_path1;
        self.speed = (which == Wolf.en_dog) ? Wolf.SPDDOG : Wolf.SPDPATROL;
        self.distance = Wolf.TILEGLOBAL;
        self.ticcount = Wolf.objstate[which][Wolf.st_path1].timeout ? Random.get() % Wolf.objstate[which][Wolf.st_path1].timeout + 1 : 0;
        self.flags |= Wolf.FL_SHOOTABLE;
        level.state.totalMonsters++;
    }
    function spawnStand(level, skill, which, x, y, dir) {
        var self = spawn(level, skill, which, x, y, dir);
        if (!self) {
            return;
        }
        self.state = Wolf.st_stand;
        self.speed = Wolf.SPDPATROL;
        self.ticcount = Wolf.objstate[which][Wolf.st_stand].timeout ? Random.get() % Wolf.objstate[which][Wolf.st_stand].timeout + 1 : 0;
        self.flags |= Wolf.FL_SHOOTABLE;
        if (level.tileMap[x][y] & Wolf.AMBUSH_TILE) {
            self.flags |= Wolf.FL_AMBUSH;
        }
        level.state.totalMonsters++;
    }
    function spawnBoss(level, skill, which, x, y) {
        var self, face;
        switch (which) {
            case Wolf.en_boss:
            case Wolf.en_schabbs:
            case Wolf.en_fat:
            case Wolf.en_hitler:
                face = Wolf.Math.dir4_south;
                break;
            case Wolf.en_fake:
            case Wolf.en_gretel:
            case Wolf.en_gift:
                face = Wolf.Math.dir4_north;
                break;
            case Wolf.en_trans:
            case Wolf.en_uber:
            case Wolf.en_will:
            case Wolf.en_death:
            case Wolf.en_angel:
            case Wolf.en_spectre:
                face = Wolf.Math.dir4_nodir;
                break;
            default:
                face = Wolf.Math.dir4_nodir;
                break;
        }
        self = spawn(level, skill, which, x, y, face);
        if (!self) {
            return;
        }
        self.state = which == Wolf.en_spectre ? Wolf.st_path1 : Wolf.st_stand;
        self.speed = Wolf.SPDPATROL;
        self.health = Wolf.starthitpoints[skill][which];
        self.ticcount = Wolf.objstate[which][Wolf.st_stand].timeout ? Random.get() % Wolf.objstate[which][Wolf.st_stand].timeout + 1 : 0;
        self.flags |= Wolf.FL_SHOOTABLE | Wolf.FL_AMBUSH;
        level.state.totalMonsters++;
    }
    function spawnGhosts(level, skill, which, x, y) {
        var self = spawn(level, skill, which, x, y, Wolf.Math.dir4_nodir);
        if (!self) {
            return;
        }
        self.state = Wolf.st_chase1;
        self.speed = Wolf.SPDPATROL * 3;
        self.health = Wolf.starthitpoints[skill][which];
        self.ticcount = Wolf.objstate[which][Wolf.st_chase1].timeout ? Random.get() % Wolf.objstate[which][Wolf.st_chase1].timeout + 1 : 0;
        self.flags |= Wolf.FL_AMBUSH;
        level.state.totalMonsters++;
    }
    function spawnBJVictory(player, level, skill) {
        var x = Wolf.POS2TILE(player.position.x), y = Wolf.POS2TILE(player.position.y), bj = spawn(level, skill, Wolf.en_bj, x, y + 1, Wolf.Math.dir4_north);
        if (!bj) {
            return;
        }
        bj.x = player.position.x;
        bj.y = player.position.y;
        bj.state = Wolf.st_path1;
        bj.speed = Wolf.BJRUNSPEED;
        bj.flags = Wolf.FL_NONMARK;
        bj.temp2 = 6;
        bj.ticcount = 1;
    }
    return {
        process: process,
        resetGuards: resetGuards,
        getNewActor: getNewActor,
        spawn: spawn,
        spawnDeadGuard: spawnDeadGuard,
        spawnPatrol: spawnPatrol,
        spawnStand: spawnStand,
        spawnBoss: spawnBoss,
        spawnGhosts: spawnGhosts,
        spawnBJVictory: spawnBJVictory,
        stateChange: stateChange
    };
})();
