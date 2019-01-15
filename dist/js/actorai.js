"use strict";
class ActorAI {
    static deathScream(self, game) {
        var pos = game.player.position;
        switch (self.type) {
            case Actors.en_mutant:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/037.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_guard:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, ActorAI.dsounds[Random.get() % 6], 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_officer:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/074.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_ss:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/046.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_dog:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/035.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_boss:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/019.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_schabbs:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/061.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_fake:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/069.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_mecha:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/084.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_hitler:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/044.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_gretel:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/115.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_gift:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/091.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Actors.en_fat:
                Sound.startSound(pos, self, 1, Sound.CHAN_VOICE, "assets/sfx/119.wav", 1, Sound.ATTN_NORM, 0);
                break;
        }
    }
    static mechaSound(self, game) {
        if (game.level.state.areabyplayer[self.areanumber]) {
            Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/080.wav", 1, Sound.ATTN_NORM, 0);
        }
    }
    static slurpie(self, game) {
        Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/lsfx/061.wav", 1, Sound.ATTN_NORM, 0);
    }
    static hitlerMorph(self, game) {
        var hitpoints = [500, 700, 800, 900], level = game.level, hitler;
        hitler = Actors.getNewActor(level);
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
        hitler.state = Actors.st_chase1;
        hitler.type = Actors.en_hitler;
        hitler.speed = Actors.SPDPATROL * 5;
        hitler.ticcount = 0;
        hitler.flags = self.flags | Actors.FL_SHOOTABLE;
        hitler.sprite = Wolf.Sprites.getNewSprite(level);
    }
    static breathing(self) {
        Sound.startSound(null, null, 1, Sound.CHAN_VOICE, "assets/lsfx/080.wav", 1, Sound.ATTN_NORM, 0);
    }
    static startAttack(self) {
        ActorAI.angel_temp = 0;
    }
    static relaunch(self) {
        if (++ActorAI.angel_temp == 3) {
            Actors.stateChange(self, Actors.st_pain);
            return;
        }
        if (Random.get() & 1) {
            Actors.stateChange(self, Actors.st_chase1);
            return;
        }
    }
    static victory(game) {
        Game.startIntermission(game);
    }
    static dormant(self, game) {
        var level = game.level, player = game.player, deltax, deltay, xl, xh, yl, yh, x, y, n, moveok = false;
        deltax = self.x - player.position.x;
        deltay = self.y - player.position.y;
        if (deltax < -Actors.MINACTORDIST || deltax > Actors.MINACTORDIST) {
            moveok = true;
        }
        else if (deltay < -Actors.MINACTORDIST || deltay > Actors.MINACTORDIST) {
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
                    if (level.state.guards[n].state >= Actors.st_die1) {
                        continue;
                    }
                    if (level.state.guards[n].tile.x == x && level.state.guards[n].tile.y == y) {
                        return;
                    }
                }
            }
        }
        self.flags |= Actors.FL_AMBUSH | Actors.FL_SHOOTABLE;
        self.flags &= ~Actors.FL_ATTACKMODE;
        self.dir = Mathematik.dir8_nodir;
        Actors.stateChange(self, Actors.st_path1);
    }
    static startDeathCam(game, self) {
        self.playstate = Wolf.ex_complete;
        setTimeout(function () {
            Game.startIntermission(game);
        }, 5000);
    }
    static smoke(self, game) {
        var level = game.level, smokeEnt = Actors.getNewActor(level);
        if (!smokeEnt) {
            return;
        }
        smokeEnt.x = self.x;
        smokeEnt.y = self.y;
        smokeEnt.tile.x = self.tile.x;
        smokeEnt.tile.y = self.tile.y;
        smokeEnt.state = Actors.st_die1;
        smokeEnt.type = (self.type == Actors.en_hrocket) ? Actors.en_hsmoke : Actors.en_smoke;
        smokeEnt.ticcount = 6;
        smokeEnt.flags = Actors.FL_NEVERMARK;
        smokeEnt.sprite = Wolf.Sprites.getNewSprite(level);
    }
    static firstSighting(self, game) {
        switch (self.type) {
            case Actors.en_guard:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/001.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Actors.en_officer:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/071.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 5;
                break;
            case Actors.en_mutant:
                self.speed *= 3;
                break;
            case Actors.en_ss:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/015.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 4;
                break;
            case Actors.en_dog:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/002.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 2;
                break;
            case Actors.en_boss:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/017.wav", 1, Sound.ATTN_NORM, 0);
                self.speed = Actors.SPDPATROL * 3;
                break;
            case Actors.en_gretel:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/112.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Actors.en_gift:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/096.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Actors.en_fat:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/102.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Actors.en_schabbs:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/065.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Actors.en_fake:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/054.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Actors.en_mecha:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/040.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 3;
                break;
            case Actors.en_hitler:
                Sound.startSound(game.player.position, self, 1, Sound.CHAN_VOICE, "assets/sfx/040.wav", 1, Sound.ATTN_NORM, 0);
                self.speed *= 5;
                break;
            case Actors.en_blinky:
            case Actors.en_clyde:
            case Actors.en_pinky:
            case Actors.en_inky:
                self.speed *= 2;
                break;
            default:
                return;
        }
        Actors.stateChange(self, Actors.st_chase1);
        if (self.waitfordoorx) {
            self.waitfordoorx = self.waitfordoory = 0;
        }
        self.dir = Mathematik.dir8_nodir;
        self.flags |= Actors.FL_ATTACKMODE | Actors.FL_FIRSTATTACK;
    }
    static damageActor(self, game, player, damage) {
        player.madenoise = 1;
        if (!(self.flags & Actors.FL_ATTACKMODE)) {
            damage <<= 1;
        }
        self.health -= damage;
        if (self.health <= 0) {
            ActorAI.killActor(self, game, player);
        }
        else {
            if (!(self.flags & Actors.FL_ATTACKMODE)) {
                ActorAI.firstSighting(self, game);
            }
            switch (self.type) {
                case Actors.en_guard:
                case Actors.en_officer:
                case Actors.en_mutant:
                case Actors.en_ss:
                    if (self.health & 1) {
                        Actors.stateChange(self, Actors.st_pain);
                    }
                    else {
                        Actors.stateChange(self, Actors.st_pain1);
                    }
                    break;
            }
        }
    }
    static killActor(self, game, player) {
        var level = game.level, tilex = self.tile.x = self.x >> Wolf.TILESHIFT, tiley = self.tile.y = self.y >> Wolf.TILESHIFT;
        switch (self.type) {
            case Actors.en_guard:
                Wolf.Player.givePoints(player, 100);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;
            case Actors.en_officer:
                Wolf.Player.givePoints(player, 400);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;
            case Actors.en_mutant:
                Wolf.Player.givePoints(player, 700);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                break;
            case Actors.en_ss:
                Wolf.Player.givePoints(player, 500);
                if (player.items & Wolf.ITEM_WEAPON_3) {
                    Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_clip2);
                }
                else {
                    Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_machinegun);
                }
                break;
            case Actors.en_dog:
                Wolf.Player.givePoints(player, 200);
                break;
            case Actors.en_boss:
                Wolf.Player.givePoints(player, 5000);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_key1);
                break;
            case Actors.en_gretel:
                Wolf.Player.givePoints(player, 5000);
                Wolf.Powerups.spawn(level, tilex, tiley, Wolf.pow_key1);
                break;
            case Actors.en_gift:
                Wolf.Player.givePoints(player, 5000);
                ActorAI.startDeathCam(game, self);
                break;
            case Actors.en_fat:
                Wolf.Player.givePoints(player, 5000);
                ActorAI.startDeathCam(game, self);
                break;
            case Actors.en_schabbs:
                Wolf.Player.givePoints(player, 5000);
                ActorAI.deathScream(self, game);
                ActorAI.startDeathCam(game, self);
                break;
            case Actors.en_fake:
                Wolf.Player.givePoints(player, 2000);
                break;
            case Actors.en_mecha:
                Wolf.Player.givePoints(player, 5000);
                break;
            case Actors.en_hitler:
                Wolf.Player.givePoints(player, 5000);
                ActorAI.deathScream(self, game);
                ActorAI.startDeathCam(game, self);
                break;
        }
        Actors.stateChange(self, Actors.st_die1);
        if (++level.state.killedMonsters == level.state.totalMonsters) {
            Game.notify("You killed the last enemy!");
        }
        self.flags &= ~Actors.FL_SHOOTABLE;
        self.flags |= Actors.FL_NONMARK;
    }
}
ActorAI.angel_temp = 0;
ActorAI.dsounds = [
    "assets/sfx/025.wav",
    "assets/sfx/026.wav",
    "assets/sfx/086.wav",
    "assets/sfx/088.wav",
    "assets/sfx/105.wav",
    "assets/sfx/107.wav",
    "assets/sfx/109.wav"
];
