"use strict";
Wolf.Player = (function () {
    Wolf.setConsts({
        PLAYERSIZE: Wolf.MINDIST,
        STOPSPEED: 0x0D00,
        FRICTION: 0.25,
        MAXMOVE: (Wolf.MINDIST * 2 - 1),
        EXTRAPOINTS: 40000,
        ITEM_KEY_1: 1,
        ITEM_KEY_2: 2,
        ITEM_KEY_3: 4,
        ITEM_KEY_4: 8,
        ITEM_WEAPON_1: 16,
        ITEM_WEAPON_2: 32,
        ITEM_WEAPON_3: 64,
        ITEM_WEAPON_4: 128,
        ITEM_WEAPON_5: 256,
        ITEM_WEAPON_6: 512,
        ITEM_WEAPON_7: 1024,
        ITEM_WEAPON_8: 2048,
        ITEM_BACKPACK: (1 << 12),
        ITEM_AUGMENT: (1 << 13),
        ITEM_UNIFORM: (1 << 14),
        ITEM_AUTOMAP: (1 << 15),
        ITEM_FREE: (1 << 16),
        PL_FLAG_REUSE: 1,
        PL_FLAG_ATTCK: 2,
        FL_GODMODE: (1 << 4),
        FL_NOTARGET: (1 << 6),
        WEAPON_KNIFE: 0,
        WEAPON_PISTOL: 1,
        WEAPON_AUTO: 2,
        WEAPON_CHAIN: 3,
        WEAPON_TYPES: 4,
        KEY_GOLD: 0,
        KEY_SILVER: 1,
        KEY_FREE1: 2,
        KEY_FREE2: 3,
        KEY_TYPES: 4,
        AMMO_BULLETS: 0,
        AMMO_TYPES: 1,
        ex_notingame: 0,
        ex_playing: 1,
        ex_dead: 2,
        ex_secretlevel: 3,
        ex_victory: 4,
        ex_complete: 5,
        BJRUNSPEED: 2048,
        BJJUMPSPEED: 680
    });
    var attackinfo = [
        [{ tics: 6, attack: 0, frame: 1 }, { tics: 6, attack: 2, frame: 2 }, { tics: 6, attack: 0, frame: 3 }, { tics: 6, attack: -1, frame: 0 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{ tics: 6, attack: 0, frame: 1 }, { tics: 6, attack: 1, frame: 2 }, { tics: 6, attack: 0, frame: 3 }, { tics: 6, attack: -1, frame: 0 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{ tics: 6, attack: 0, frame: 1 }, { tics: 6, attack: 1, frame: 2 }, { tics: 6, attack: 3, frame: 3 }, { tics: 6, attack: -1, frame: 0 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{ tics: 6, attack: 0, frame: 1 }, { tics: 6, attack: 1, frame: 2 }, { tics: 6, attack: 4, frame: 3 }, { tics: 6, attack: -1, frame: 0 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    ];
    function spawn(location, level, skill, oldPlayer) {
        var x = location.x, y = location.y, angle = location.angle, tileX = Wolf.POS2TILE(x), tileY = Wolf.POS2TILE(y), areanumber = level.areas[tileX][tileY];
        var player = {
            episode: -1,
            level: -1,
            health: 100,
            frags: 0,
            ammo: [],
            score: 0,
            lives: 0,
            startScore: 0,
            nextExtra: 0,
            items: 0,
            weapon: 0,
            pendingWeapon: -1,
            previousWeapon: -1,
            position: {
                x: x,
                y: y
            },
            angle: angle,
            tile: {
                x: tileX,
                y: tileY
            },
            mov: {
                x: 0,
                y: 0
            },
            speed: 0,
            armor: 0,
            cmd: {
                forwardMove: 0,
                sideMove: 0,
                buttons: 0,
                impulse: 0
            },
            attackFrame: 0,
            attackCount: 0,
            weaponFrame: 0,
            madenoise: false,
            lastAttacker: null,
            faceFrame: 0,
            faceCount: 0,
            faceGotGun: false,
            faceOuch: false,
            flags: 0,
            areanumber: areanumber,
            playstate: 0,
            attackDirection: [0, 0],
            skill: skill
        };
        if (player.areanumber < 0) {
            player.areanumber = 36;
        }
        Wolf.Areas.init(level, player.areanumber);
        Wolf.Areas.connect(level, player.areanumber);
        if (oldPlayer) {
            copyPlayer(player, oldPlayer);
        }
        else {
            newGame(player);
        }
        return player;
    }
    function copyPlayer(player, copyPlayer) {
        player.health = copyPlayer.health;
        player.ammo = copyPlayer.ammo;
        player.score = copyPlayer.score;
        player.startScore = copyPlayer.startScore;
        player.lives = copyPlayer.lives;
        player.previousWeapon = copyPlayer.previousWeapon;
        player.weapon = copyPlayer.weapon;
        player.pendingWeapon = copyPlayer.pendingWeapon;
        player.items = (copyPlayer.items & Wolf.ITEM_WEAPON_1) |
            (copyPlayer.items & Wolf.ITEM_WEAPON_2) |
            (copyPlayer.items & Wolf.ITEM_WEAPON_3) |
            (copyPlayer.items & Wolf.ITEM_WEAPON_4);
        player.nextExtra = copyPlayer.nextExtra;
    }
    function newGame(player) {
        player.health = 100;
        player.ammo[Wolf.AMMO_BULLETS] = 8;
        player.score = 0;
        player.startScore = 0;
        player.lives = 3;
        player.previousWeapon = Wolf.WEAPON_KNIFE;
        player.weapon = player.pendingWeapon = Wolf.WEAPON_PISTOL;
        player.items = Wolf.ITEM_WEAPON_1 | Wolf.ITEM_WEAPON_2;
        player.nextExtra = Wolf.EXTRAPOINTS;
    }
    function tryMove(player, level) {
        var xl, yl, xh, yh, x, y, d, n;
        xl = Wolf.POS2TILE(player.position.x - Wolf.PLAYERSIZE);
        yl = Wolf.POS2TILE(player.position.y - Wolf.PLAYERSIZE);
        xh = Wolf.POS2TILE(player.position.x + Wolf.PLAYERSIZE);
        yh = Wolf.POS2TILE(player.position.y + Wolf.PLAYERSIZE);
        for (y = yl; y <= yh; ++y) {
            for (x = xl; x <= xh; ++x) {
                if (level.tileMap[x][y] & Wolf.SOLID_TILE) {
                    return false;
                }
                if (level.tileMap[x][y] & Wolf.DOOR_TILE && Wolf.Doors.opened(level.state.doorMap[x][y]) != Wolf.DOOR_FULLOPEN) {
                    if (Math.abs(player.position.x - Wolf.TILE2POS(x)) <= 0x9000 && Math.abs(player.position.y - Wolf.TILE2POS(y)) <= 0x9000) {
                        return false;
                    }
                }
            }
        }
        for (n = 0; n < level.state.numGuards; ++n) {
            if (level.state.guards[n].state >= Wolf.st_die1) {
                continue;
            }
            if (!(level.state.guards[n].flags & Wolf.FL_SHOOTABLE)) {
                continue;
            }
            d = player.position.x - level.state.guards[n].x;
            if (d < -Wolf.MINACTORDIST || d > Wolf.MINACTORDIST) {
                continue;
            }
            d = player.position.y - level.state.guards[n].y;
            if (d < -Wolf.MINACTORDIST || d > Wolf.MINACTORDIST) {
                continue;
            }
            return false;
        }
        return true;
    }
    function clipMove(self, xmove, ymove, level) {
        var basex, basey;
        basex = self.position.x;
        basey = self.position.y;
        self.position.x += xmove;
        self.position.y += ymove;
        if (tryMove(self, level)) {
            return;
        }
        if (xmove) {
            self.position.x = basex + xmove;
            self.position.y = basey;
            if (tryMove(self, level)) {
                return;
            }
        }
        if (ymove) {
            self.position.x = basex;
            self.position.y = basey + ymove;
            if (tryMove(self, level)) {
                return;
            }
        }
        self.position.x = basex;
        self.position.y = basey;
    }
    function controlMovement(game, self, level, tics) {
        var angle, speed;
        angle = self.angle;
        self.mov.x = self.mov.y = 0;
        if (self.cmd.forwardMove) {
            speed = tics * self.cmd.forwardMove;
            self.mov.x += (speed * Wolf.Math.CosTable[angle]) >> 0;
            self.mov.y += (speed * Wolf.Math.SinTable[angle]) >> 0;
        }
        if (self.cmd.sideMove) {
            speed = tics * self.cmd.sideMove;
            self.mov.x += (speed * Wolf.Math.SinTable[angle]) >> 0;
            self.mov.y -= (speed * Wolf.Math.CosTable[angle]) >> 0;
        }
        if (!self.mov.x && !self.mov.y) {
            return;
        }
        self.speed = self.mov.x + self.mov.y;
        if (self.mov.x > Wolf.MAXMOVE) {
            self.mov.x = Wolf.MAXMOVE;
        }
        else if (self.mov.x < -Wolf.MAXMOVE) {
            self.mov.x = -Wolf.MAXMOVE;
        }
        if (self.mov.y > Wolf.MAXMOVE) {
            self.mov.y = Wolf.MAXMOVE;
        }
        else if (self.mov.y < -Wolf.MAXMOVE) {
            self.mov.y = -Wolf.MAXMOVE;
        }
        clipMove(self, self.mov.x, self.mov.y, level);
        self.tile.x = Wolf.POS2TILE(self.position.x);
        self.tile.y = Wolf.POS2TILE(self.position.y);
        var x, y, tileX, tileY;
        for (x = -1; x <= 1; x += 2) {
            tileX = Wolf.POS2TILE(self.position.x + x * Wolf.PLAYERSIZE);
            for (y = -1; y <= 1; y += 2) {
                tileY = Wolf.POS2TILE(self.position.y + y * Wolf.PLAYERSIZE);
                Wolf.Powerups.pickUp(level, self, tileX, tileY);
            }
        }
        if (level.areas[self.tile.x][self.tile.y] >= 0 && level.areas[self.tile.x][self.tile.y] != self.areanumber) {
            self.areanumber = level.areas[self.tile.x][self.tile.y];
            Wolf.Areas.connect(level, self.areanumber);
        }
        if (level.tileMap[self.tile.x][self.tile.y] & Wolf.EXIT_TILE) {
            Wolf.Game.victory(game);
        }
    }
    function use(self, game) {
        var x, y, dir, newtex, level = game.level;
        dir = Wolf.Math.get4dir(Wolf.FINE2RAD(self.angle));
        x = self.tile.x + Wolf.Math.dx4dir[dir];
        y = self.tile.y + Wolf.Math.dy4dir[dir];
        if (level.tileMap[x][y] & Wolf.DOOR_TILE) {
            return Wolf.Doors.tryUse(level, self, level.state.doorMap[x][y]);
        }
        if (level.tileMap[x][y] & Wolf.SECRET_TILE) {
            return Wolf.PushWall.push(level, x, y, dir);
        }
        if (level.tileMap[x][y] & Wolf.ELEVATOR_TILE) {
            switch (dir) {
                case Wolf.Math.dir4_east:
                case Wolf.Math.dir4_west:
                    newtex = level.wallTexX[x][y] += 2;
                    break;
                case Wolf.Math.dir4_north:
                case Wolf.Math.dir4_south:
                    return false;
            }
            if (level.tileMap[self.tile.x][self.tile.y] & Wolf.SECRETLEVEL_TILE) {
                self.playstate = Wolf.ex_secretlevel;
            }
            else {
                self.playstate = Wolf.ex_complete;
            }
            Wolf.Sound.startSound(null, null, 0, Wolf.CHAN_BODY, "assets/lsfx/040.wav", 1, Wolf.ATTN_NORM, 0);
            Wolf.Game.startIntermission(game);
            return true;
        }
        return false;
    }
    function attack(game, player, reAttack, tics) {
        var cur, level = game.level;
        player.attackCount -= tics;
        while (player.attackCount <= 0) {
            cur = attackinfo[player.weapon][player.attackFrame];
            switch (cur.attack) {
                case -1:
                    player.flags &= ~Wolf.PL_FLAG_ATTCK;
                    if (!player.ammo[Wolf.AMMO_BULLETS]) {
                        player.weapon = Wolf.WEAPON_KNIFE;
                    }
                    else if (player.weapon != player.pendingWeapon) {
                        player.weapon = player.pendingWeapon;
                    }
                    player.attackFrame = player.weaponFrame = 0;
                    return;
                case 4:
                    if (!player.ammo[Wolf.AMMO_BULLETS]) {
                        break;
                    }
                    if (reAttack) {
                        player.attackFrame -= 2;
                    }
                case 1:
                    if (!player.ammo[Wolf.AMMO_BULLETS]) {
                        player.attackFrame++;
                        break;
                    }
                    Wolf.Weapon.fireLead(game, player);
                    player.ammo[Wolf.AMMO_BULLETS]--;
                    break;
                case 2:
                    Wolf.Weapon.fireHit(game, player);
                    break;
                case 3:
                    if (player.ammo[Wolf.AMMO_BULLETS] && reAttack) {
                        player.attackFrame -= 2;
                    }
                    break;
            }
            player.attackCount += cur.tics;
            player.attackFrame++;
            player.weaponFrame = attackinfo[player.weapon][player.attackFrame].frame;
        }
    }
    function givePoints(player, points) {
        player.score += points;
        while (player.score >= player.nextExtra) {
            player.nextExtra += Wolf.EXTRAPOINTS;
            giveLife(player);
            Wolf.log("Extra life!");
        }
    }
    function giveHealth(player, points, max) {
        if (max == 0) {
            max = (player.items & Wolf.ITEM_AUGMENT) ? 150 : 100;
        }
        if (player.health >= max) {
            return false;
        }
        player.health += points;
        if (player.health > max) {
            player.health = max;
        }
        player.faceGotGun = false;
        return true;
    }
    function giveLife(player) {
        if (player.lives < 9) {
            player.lives++;
        }
    }
    function giveKey(player, key) {
        player.items |= Wolf.ITEM_KEY_1 << key;
    }
    function giveWeapon(player, weapon) {
        var itemflag;
        giveAmmo(player, Wolf.AMMO_BULLETS, 6);
        itemflag = Wolf.ITEM_WEAPON_1 << weapon;
        if (player.items & itemflag) {
            return;
        }
        else {
            player.items |= itemflag;
            if (player.weapon < weapon) {
                player.weapon = player.pendingWeapon = weapon;
            }
        }
    }
    function giveAmmo(player, type, ammo) {
        var maxAmmo = 99;
        if (player.items & Wolf.ITEM_BACKPACK) {
            maxAmmo *= 2;
        }
        if (player.ammo[type] >= maxAmmo) {
            return false;
        }
        if (!player.ammo[type] && !player.attackFrame) {
            player.weapon = player.pendingWeapon;
        }
        player.ammo[type] += ammo;
        if (player.ammo[type] > maxAmmo) {
            player.ammo[type] = maxAmmo;
        }
        return true;
    }
    function damage(player, attacker, points, skill) {
        var dx, dy, angle, playerAngle, deltaAngle;
        if (player.playstate == Wolf.ex_dead || player.playstate == Wolf.ex_complete || self.playstate == Wolf.ex_victory) {
            return;
        }
        player.lastAttacker = attacker;
        if (skill == Wolf.gd_baby) {
            points >>= 2;
        }
        dx = attacker.x - player.position.x;
        dy = attacker.y - player.position.y;
        if (dx != 0 || dy != 0) {
            angle = Math.atan2(dy, dx);
            playerAngle = player.angle * 360.0 / Wolf.ANG_360;
            angle = angle * 180.0 / Math.PI;
            if (angle < 0) {
                angle = 360 + angle;
            }
            deltaAngle = angle - playerAngle;
            if (deltaAngle > 180) {
                deltaAngle = deltaAngle - 360;
            }
            if (deltaAngle < -180) {
                deltaAngle = 360 + deltaAngle;
            }
            if (deltaAngle > 40) {
                player.attackDirection[0] = 1;
            }
            else if (deltaAngle < -40) {
                player.attackDirection[1] = 1;
            }
        }
        if (!(player.flags & Wolf.FL_GODMODE)) {
            player.health -= points;
        }
        if (player.health <= 0) {
            Wolf.Game.notify("You have died");
            player.health = 0;
            player.playstate = Wolf.ex_dead;
            Wolf.Sound.startSound(null, null, 0, Wolf.CHAN_BODY, "assets/lsfx/009.wav", 1, Wolf.ATTN_NORM, 0);
        }
        Wolf.Game.startDamageFlash(points);
        player.faceGotGun = false;
        if (points > 30 && player.health != 0) {
            player.faceOuch = true;
            player.faceCount = 0;
        }
    }
    function victorySpin(game, player, tics) {
        var desty;
        if (player.angle > Wolf.ANG_270) {
            player.angle -= tics * Wolf.ANG_1 * 3;
            if (player.angle < Wolf.ANG_270) {
                player.angle = Wolf.ANG_270;
            }
        }
        else if (player.angle < Wolf.ANG_270) {
            player.angle += tics * Wolf.ANG_1 * 3;
            if (player.angle > Wolf.ANG_270) {
                player.angle = Wolf.ANG_270;
            }
        }
        desty = Wolf.TILE2POS(player.tile.y + 7);
        if (player.position.y < desty) {
            player.position.y += tics * 3072;
            if (player.position.y > desty) {
                player.position.y = desty;
            }
        }
    }
    function process(game, self, tics) {
        var level = game.level, n;
        if (self.playstate == Wolf.ex_victory) {
            victorySpin(game, self, tics);
            return;
        }
        self.attackDirection = [0, 0];
        self.madenoise = false;
        controlMovement(game, self, level, tics);
        if (self.flags & Wolf.PL_FLAG_ATTCK) {
            attack(game, self, self.cmd.buttons & Wolf.BUTTON_ATTACK, tics);
        }
        else {
            if (self.cmd.buttons & Wolf.BUTTON_USE) {
                if (!(self.flags & Wolf.PL_FLAG_REUSE) && use(self, game)) {
                    self.flags |= Wolf.PL_FLAG_REUSE;
                }
            }
            else {
                self.flags &= ~Wolf.PL_FLAG_REUSE;
            }
            if (self.cmd.buttons & Wolf.BUTTON_ATTACK) {
                self.flags |= Wolf.PL_FLAG_ATTCK;
                self.attackFrame = 0;
                self.attackCount = attackinfo[self.weapon][0].tics;
                self.weaponFrame = attackinfo[self.weapon][0].frame;
            }
        }
        switch (self.cmd.impulse) {
            case 0:
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                changeWeapon(self, self.cmd.impulse - 1);
                break;
            case 10:
                self.pendingWeapon = self.weapon;
                for (n = 0; n < 4; ++n) {
                    if (++self.weapon > Wolf.WEAPON_CHAIN) {
                        self.weapon = Wolf.WEAPON_KNIFE;
                    }
                    if (changeWeapon(self, self.weapon)) {
                        break;
                    }
                }
                self.weapon = self.pendingWeapon;
                break;
            default:
                Wolf.log("Unknown Impulse: ", +self.cmd.impulse);
                break;
        }
    }
    return {
        spawn: spawn,
        newGame: newGame,
        controlMovement: controlMovement,
        process: process,
        damage: damage,
        givePoints: givePoints,
        giveHealth: giveHealth,
        giveAmmo: giveAmmo,
        giveWeapon: giveWeapon,
        giveLife: giveLife,
        giveKey: giveKey
    };
})();
