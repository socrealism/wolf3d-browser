"use strict";
Wolf.ActorAI = (function () {
    var dsounds = [
        "assets/sfx/025.wav",
        "assets/sfx/026.wav",
        "assets/sfx/086.wav",
        "assets/sfx/088.wav",
        "assets/sfx/105.wav",
        "assets/sfx/107.wav",
        "assets/sfx/109.wav"
    ];
    function deathScream(self, game) {
        var pos = game.player.position;
        switch (self.type) {
            case Wolf.en_mutant:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/037.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_guard:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, dsounds[Wolf.Random.rnd() % 6], 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_officer:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/074.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_ss:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/046.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_dog:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/035.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_boss:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/019.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_schabbs:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/061.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_fake:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/069.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_mecha:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/084.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_hitler:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/044.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_gretel:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/115.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_gift:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/091.wav", 1, Wolf.ATTN_NORM, 0);
                break;
            case Wolf.en_fat:
                Wolf.Sound.startSound(pos, self, 1, Wolf.CHAN_VOICE, "assets/sfx/119.wav", 1, Wolf.ATTN_NORM, 0);
                break;
        }
    }
    function mechaSound(self, game) {
        if (game.level.state.areabyplayer[self.areanumber]) {
            Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/080.wav", 1, Wolf.ATTN_NORM, 0);
        }
    }
    function slurpie(self, game) {
        Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/lsfx/061.wav", 1, Wolf.ATTN_NORM, 0);
    }
    function hitlerMorph(self, game) {
        var hitpoints = [500, 700, 800, 900], level = game.level, hitler;
        hitler = Wolf.Actors.getNewActor(level);
        if (!hitler) {
            return;
        }
        hitler.x = self.x;
        hitler.y = self.y;
        hitler.distance = self.distance;
        hitler.tile.x = self.tile.x;
        hitler.tile.y = self.tile.y;
        hitler.angle = self.angle;
        hitler.dir = self.dir;
        hitler.health = hitpoints[game.skill];
        hitler.areanumber = self.areanumber;
        hitler.state = Wolf.st_chase1;
        hitler.type = Wolf.en_hitler;
        hitler.speed = Wolf.SPDPATROL * 5;
        hitler.ticcount = 0;
        hitler.flags = self.flags | Wolf.FL_SHOOTABLE;
        hitler.sprite = Wolf.Sprites.getNewSprite(level);
    }
    var angel_temp = 0;
    function breathing(self) {
        Wolf.Sound.startSound(null, null, 1, Wolf.CHAN_VOICE, "assets/lsfx/080.wav", 1, Wolf.ATTN_NORM, 0);
    }
    function startAttack(self) {
        angel_temp = 0;
    }
    function relaunch(self) {
        if (++angel_temp == 3) {
            Wolf.Actors.stateChange(self, Wolf.st_pain);
            return;
        }
        if (Wolf.Random.rnd() & 1) {
            Wolf.Actors.stateChange(self, Wolf.st_chase1);
            return;
        }
    }
    function victory(game) {
        Wolf.Game.startIntermission(game);
    }
    function dormant(self, game) {
        var level = game.level, player = game.player, deltax, deltay, xl, xh, yl, yh, x, y, n, moveok = false;
        deltax = self.x - player.position.x;
        deltay = self.y - player.position.y;
        if (deltax < -Wolf.MINACTORDIST || deltax > Wolf.MINACTORDIST) {
            moveok = true;
        }
        else if (deltay < -Wolf.MINACTORDIST || deltay > Wolf.MINACTORDIST) {
            moveok = true;
        }
        if (!moveok) {
            return;
        }
        xl = (self.x - Wolf.MINDIST) >> Wolf.TILESHIFT;
        xh = (self.x + Wolf.MINDIST) >> Wolf.TILESHIFT;
        yl = (self.y - Wolf.MINDIST) >> Wolf.TILESHIFT;
        yh = (self.y + Wolf.MINDIST) >> Wolf.TILESHIFT;
        for (y = yl; y <= yh; ++y) {
            for (x = xl; x <= xh; ++x) {
                if (level.tileMap[x][y] & Wolf.SOLID_TILE) {
                    return;
                }
                for (n = 0; n < level.state.numGuards; ++n) {
                    if (level.state.guards[n].state >= Wolf.st_die1) {
                        continue;
                    }
                    if (level.state.guards[n].tile.x == x && level.state.guards[n].tile.y == y) {
                        return;
                    }
                }
            }
        }
        self.flags |= Wolf.FL_AMBUSH | Wolf.FL_SHOOTABLE;
        self.flags &= ~Wolf.FL_ATTACKMODE;
        self.dir = Wolf.Math.dir8_nodir;
        Wolf.Actors.stateChange(self, Wolf.st_path1);
    }
    function startDeathCam(game, self) {
        self.playstate = Wolf.ex_complete;
        setTimeout(function () {
            Wolf.Game.startIntermission(game);
        }, 5000);
    }
    function smoke(self, game) {
        var level = game.level, smokeEnt = Wolf.Actors.getNewActor(level);
        if (!smokeEnt) {
            return;
        }
        smokeEnt.x = self.x;
        smokeEnt.y = self.y;
        smokeEnt.tile.x = self.tile.x;
        smokeEnt.tile.y = self.tile.y;
        smokeEnt.state = Wolf.st_die1;
        smokeEnt.type = (self.type == Wolf.en_hrocket) ? Wolf.en_hsmoke : Wolf.en_smoke;
        smokeEnt.ticcount = 6;
        smokeEnt.flags = Wolf.FL_NEVERMARK;
        smokeEnt.sprite = Wolf.Sprites.getNewSprite(level);
    }
    function firstSighting(self, game) {
        switch (self.type) {
            case Wolf.en_guard:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/001.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Wolf.en_officer:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/071.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 5;
                break;
            case Wolf.en_mutant:
                self.speed *= 3;
                break;
            case Wolf.en_ss:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/015.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 4;
                break;
            case Wolf.en_dog:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/002.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 2;
                break;
            case Wolf.en_boss:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/017.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed = Wolf.SPDPATROL * 3;
                break;
            case Wolf.en_gretel:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/112.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Wolf.en_gift:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/096.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Wolf.en_fat:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/102.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Wolf.en_schabbs:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/065.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Wolf.en_fake:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/054.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Wolf.en_mecha:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/040.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Wolf.en_hitler:
                Wolf.Sound.startSound(game.player.position, self, 1, Wolf.CHAN_VOICE, "assets/sfx/040.wav", 1, Wolf.ATTN_NORM, 0);
                self.speed *= 5;
                break;
            case Wolf.en_blinky:
            case Wolf.en_clyde:
            case Wolf.en_pinky:
            case Wolf.en_inky:
                self.speed *= 2;
                break;
            default:
                return;
        }
        Wolf.Actors.stateChange(self, Wolf.st_chase1);
        if (self.waitfordoorx) {
            self.waitfordoorx = self.waitfordoory = 0;
        }
        self.dir = Wolf.Math.dir8_nodir;
        self.flags |= Wolf.FL_ATTACKMODE | Wolf.FL_FIRSTATTACK;
    }
    function damageActor(self, game, player, damage) {
        player.madenoise = 1;
        if (!(self.flags & Wolf.FL_ATTACKMODE)) {
            damage <<= 1;
        }
        self.health -= damage;
        if (self.health <= 0) {
            killActor(self, game, player);
        }
        else {
            if (!(self.flags & Wolf.FL_ATTACKMODE)) {
                firstSighting(self, game);
            }
            switch (self.type) {
                case Wolf.en_guard:
                case Wolf.en_officer:
                case Wolf.en_mutant:
                case Wolf.en_ss:
                    if (self.health & 1) {
                        Wolf.Actors.stateChange(self, Wolf.st_pain);
                    }
                    else {
                        Wolf.Actors.stateChange(self, Wolf.st_pain1);
                    }
                    break;
            }
        }
    }
    function killActor(self, game, player) {
        var level = game.level, tilex = self.tile.x = self.x >> Wolf.TILESHIFT;
        tiley = self.tile.y = self.y >> Wolf.TILESHIFT;
        switch (self.type) {
            case Wolf.en_guard:
                Wolf.Player.givePoints(player, 100);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;
            case Wolf.en_officer:
                Wolf.Player.givePoints(player, 400);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;
            case Wolf.en_mutant:
                Wolf.Player.givePoints(player, 700);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;
            case Wolf.en_ss:
                Wolf.Player.givePoints(player, 500);
                if (player.items & Wolf.ITEM_WEAPON_3) {
                    Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                }
                else {
                    Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_machinegun);
                }
                break;
            case Wolf.en_dog:
                Wolf.Player.givePoints(player, 200);
                break;
            case Wolf.en_boss:
                Wolf.Player.givePoints(player, 5000);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_key1);
                break;
            case Wolf.en_gretel:
                Wolf.Player.givePoints(player, 5000);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_key1);
                break;
            case Wolf.en_gift:
                Wolf.Player.givePoints(player, 5000);
                startDeathCam(game, self);
                break;
            case Wolf.en_fat:
                Wolf.Player.givePoints(player, 5000);
                startDeathCam(game, self);
                break;
            case Wolf.en_schabbs:
                Wolf.Player.givePoints(player, 5000);
                deathScream(self, game);
                startDeathCam(game, self);
                break;
            case Wolf.en_fake:
                Wolf.Player.givePoints(player, 2000);
                break;
            case Wolf.en_mecha:
                Wolf.Player.givePoints(player, 5000);
                break;
            case Wolf.en_hitler:
                Wolf.Player.givePoints(player, 5000);
                deathScream(self, game);
                startDeathCam(game, self);
                break;
        }
        Wolf.Actors.stateChange(self, Wolf.st_die1);
        if (++level.state.killedMonsters == level.state.totalMonsters) {
            Wolf.Game.notify("You killed the last enemy!");
        }
        self.flags &= ~Wolf.FL_SHOOTABLE;
        self.flags |= Wolf.FL_NONMARK;
    }
    return {
        firstSighting: firstSighting,
        damageActor: damageActor,
        killActor: killActor,
        deathScream: deathScream,
        mechaSound: mechaSound,
        slurpie: slurpie,
        hitlerMorph: hitlerMorph,
        breathing: breathing,
        startAttack: startAttack,
        relaunch: relaunch,
        victory: victory,
        dormant: dormant,
        startDeathCam: startDeathCam,
        smoke: smoke
    };
})();
