/**
 * @description Player management
 */
class Player {
    static readonly PLAYERSIZE = Wolf.MINDIST; // player radius
    static readonly STOPSPEED = 0x0D00;
    static readonly FRICTION = 0.25;
    static readonly MAXMOVE = (Wolf.MINDIST * 2 - 1);
    static readonly EXTRAPOINTS = 40000; // points for an extra life
    static readonly ITEM_KEY_1 = 1;
    static readonly ITEM_KEY_2 = 2;
    static readonly ITEM_KEY_3 = 4;
    static readonly ITEM_KEY_4 = 8;
    static readonly ITEM_WEAPON_1 = 16;
    static readonly ITEM_WEAPON_2 = 32;
    static readonly ITEM_WEAPON_3 = 64;
    static readonly ITEM_WEAPON_4 = 128;
    static readonly ITEM_WEAPON_5 = 256;
    static readonly ITEM_WEAPON_6 = 512;
    static readonly ITEM_WEAPON_7 = 1024;
    static readonly ITEM_WEAPON_8 = 2048;
    static readonly ITEM_BACKPACK = (1 << 12); // doubles carrying capacity
    static readonly ITEM_AUGMENT = (1 << 13); // adds 50 to maximum health
    static readonly ITEM_UNIFORM = (1 << 14); // allows you to pass guards
    static readonly ITEM_AUTOMAP = (1 << 15); // shows unknown map ares in other color (as in DooM)
    static readonly ITEM_FREE = (1 << 16); // - unused -
    static readonly PL_FLAG_REUSE = 1; // use button pressed
    static readonly PL_FLAG_ATTCK = 2; // attacking
    // debug (cheat codes) flags
    static readonly FL_GODMODE = (1 << 4);
    static readonly FL_NOTARGET = (1 << 6);

    static readonly WEAPON_KNIFE = 0;
    static readonly WEAPON_PISTOL = 1;
    static readonly WEAPON_AUTO = 2;
    static readonly WEAPON_CHAIN = 3;
    static readonly WEAPON_TYPES = 4;

    static readonly KEY_GOLD = 0;
    static readonly KEY_SILVER = 1;
    static readonly KEY_FREE1 = 2;
    static readonly KEY_FREE2 = 3;
    static readonly KEY_TYPES = 4;

    static readonly AMMO_BULLETS: 0;
    static readonly AMMO_TYPES: 1;

    static readonly ex_notingame = 0;
    static readonly ex_playing = 1;
    static readonly ex_dead = 2;
    static readonly ex_secretlevel = 3;
    static readonly ex_victory = 4;
    static readonly ex_complete = 5;

    // victory animation
    static readonly BJRUNSPEED = 2048;
    static readonly BJJUMPSPEED = 680;

    /*
    struct atkinf
    {
        char tics, attack, frame; // attack is 1 for gun, 2 for knife
    }
    */
    static attackinfo = [ // 4 guns, 14 frames max for every gun!
        [{tics: 6, attack: 0, frame: 1}, {tics: 6, attack: 2, frame: 2}, {tics: 6, attack: 0, frame: 3}, {
            tics: 6,
            attack: -1,
            frame: 0
        }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{tics: 6, attack: 0, frame: 1}, {tics: 6, attack: 1, frame: 2}, {tics: 6, attack: 0, frame: 3}, {
            tics: 6,
            attack: -1,
            frame: 0
        }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{tics: 6, attack: 0, frame: 1}, {tics: 6, attack: 1, frame: 2}, {tics: 6, attack: 3, frame: 3}, {
            tics: 6,
            attack: -1,
            frame: 0
        }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{tics: 6, attack: 0, frame: 1}, {tics: 6, attack: 1, frame: 2}, {tics: 6, attack: 4, frame: 3}, {
            tics: 6,
            attack: -1,
            frame: 0
        }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    ];

    /**
     * @description Spawn the player
     * @param {object} location The location to spawn the player {origin, angle}
     * @param {object} level The level object
     * @param {number} skill The difficulty level
     * @param {object} [oldPlayer] A player object to copy score and weapons from
     * @returns {object} The new player object
     */
    static spawn(location, level, skill, oldPlayer) {

        var x = location.x,
            y = location.y,
            angle = location.angle,
            tileX = Wolf.POS2TILE(x),
            tileY = Wolf.POS2TILE(y),
            areanumber = level.areas[tileX][tileY];

        // Player structure: Holds all info about player
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
            items: 0, // (keys, weapon)
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
            armor: 0, // there are 2 types. The better one is indicated by high bit set
            cmd: { // movement / action command
                forwardMove: 0,
                sideMove: 0,
                buttons: 0,
                impulse: 0
            },
            attackFrame: 0, // attack info
            attackCount: 0,
            weaponFrame: 0,

            madenoise: false,
            lastAttacker: null,

            faceFrame: 0,
            faceCount: 0,    // bj's face in the HUD // FIXME decide something!
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

        Areas.init(level, player.areanumber);
        Areas.connect(level, player.areanumber);

        if (oldPlayer) {
            Player.copyPlayer(player, oldPlayer);
        } else {
            Player.newGame(player);
        }

        return player;
    }

    /**
     * @description Copy player variables from another player object
     * @private
     * @param {object} player The player object
     * @param {object} copyPlayer The player object to copy from
     */
    static copyPlayer(player, copyPlayer) {
        player.health = copyPlayer.health;
        player.ammo = copyPlayer.ammo;
        player.score = copyPlayer.score;
        player.startScore = copyPlayer.startScore;
        player.lives = copyPlayer.lives;
        player.previousWeapon = copyPlayer.previousWeapon;
        player.weapon = copyPlayer.weapon;
        player.pendingWeapon = copyPlayer.pendingWeapon;
        player.items = (copyPlayer.items & Player.ITEM_WEAPON_1) |
            (copyPlayer.items & Player.ITEM_WEAPON_2) |
            (copyPlayer.items & Player.ITEM_WEAPON_3) |
            (copyPlayer.items & Player.ITEM_WEAPON_4);
        player.nextExtra = copyPlayer.nextExtra;
    }

    /**
     * @description Set up player for the new game
     * @param {object} player The player object
     */
    static newGame(player) {
        player.health = 100;
        player.ammo[Player.AMMO_BULLETS] = 8;
        player.score = 0;
        player.startScore = 0;
        player.lives = 3;
        player.previousWeapon = Player.WEAPON_KNIFE; //gsh
        player.weapon = player.pendingWeapon = Player.WEAPON_PISTOL;
        player.items = Player.ITEM_WEAPON_1 | Player.ITEM_WEAPON_2;
        player.nextExtra = Player.EXTRAPOINTS;
    }

    /**
     * @description Try to move player
     * @private
     * @param {object} player The player object.
     * @param {object} level The level object.
     * @returns {boolean} Returns true if move was ok
     */
    static tryMove(player, level) {
        var xl, yl, xh, yh, x, y,
            d, n;

        xl = Wolf.POS2TILE(player.position.x - Player.PLAYERSIZE);
        yl = Wolf.POS2TILE(player.position.y - Player.PLAYERSIZE);
        xh = Wolf.POS2TILE(player.position.x + Player.PLAYERSIZE);
        yh = Wolf.POS2TILE(player.position.y + Player.PLAYERSIZE);

        // Cheching for solid walls:
        for (y = yl; y <= yh; ++y) {
            for (x = xl; x <= xh; ++x) {
                if (level.tileMap[x][y] & Level.SOLID_TILE) {
                    return false;
                }
                if (level.tileMap[x][y] & Level.DOOR_TILE && Doors.opened(level.state.doorMap[x][y]) != Doors.DOOR_FULLOPEN) {
                    // iphone hack to allow player to move halfway into door tiles
                    // if the player bounds doesn't cross the middle of the tile, let the move continue
                    if (Math.abs(player.position.x - Wolf.TILE2POS(x)) <= 0x9000 && Math.abs(player.position.y - Wolf.TILE2POS(y)) <= 0x9000) {
                        return false;
                    }
                }
            }
        }

        // check for actors
        for (n = 0; n < level.state.numGuards; ++n) {
            if (level.state.guards[n].state >= Actors.st_die1) {
                continue;
            }
            if (!(level.state.guards[n].flags & Actors.FL_SHOOTABLE)) {
                continue;
            }

            d = player.position.x - level.state.guards[n].x;
            if (d < -Actors.MINACTORDIST || d > Actors.MINACTORDIST) {
                continue;
            }

            d = player.position.y - level.state.guards[n].y;
            if (d < -Actors.MINACTORDIST || d > Actors.MINACTORDIST) {
                continue;
            }
            return false;
        }

        return true;
    }

    /**
     * @description Clips movement
     * @private
     * @param {object} self The player object.
     * @param {number} xmove Movement in x direction
     * @param {number} ymove Movement in y direction
     * @param {object} level The level object.
     */
    static clipMove(self, xmove, ymove, level) {
        var basex, basey;

        basex = self.position.x;
        basey = self.position.y;

        self.position.x += xmove;
        self.position.y += ymove;
        if (Player.tryMove(self, level)) {
            return; // we moved as we wanted
        }

        if (xmove) {    // don't bother if we don't move x!
            self.position.x = basex + xmove;
            self.position.y = basey;
            if (Player.tryMove(self, level)) {
                return; // May be we'll move only X direction?
            }
        }
        if (ymove) {    // don't bother if we don't move y!
            self.position.x = basex;
            self.position.y = basey + ymove;
            if (Player.tryMove(self, level)) {
                return; // May be we'll move only Y direction?
            }
        }

        // movement blocked; we must stay on one place... :(
        self.position.x = basex;
        self.position.y = basey;
    }

    /**
     * @description Changes player's angle and position
     * @param {object} game The game object.
     * @param {object} self The player object.
     * @param {object} level The level object.
     * @param {object} tics Number of tics.
     */
    static controlMovement(game, self, level, tics) {
        var angle, speed;

        // rotation
        angle = self.angle;

        self.mov.x = self.mov.y = 0; // clear accumulated movement

        if (self.cmd.forwardMove) {
            speed = tics * self.cmd.forwardMove;
            self.mov.x += (speed * Mathematik.CosTable[angle]) >> 0;
            self.mov.y += (speed * Mathematik.SinTable[angle]) >> 0;
        }
        if (self.cmd.sideMove) {
            speed = tics * self.cmd.sideMove;
            self.mov.x += (speed * Mathematik.SinTable[angle]) >> 0;
            self.mov.y -= (speed * Mathematik.CosTable[angle]) >> 0;
        }

        if (!self.mov.x && !self.mov.y) {
            return;
        }

        self.speed = self.mov.x + self.mov.y;

        // bound movement
        if (self.mov.x > Player.MAXMOVE) {
            self.mov.x = Player.MAXMOVE;
        } else if (self.mov.x < -Player.MAXMOVE) {
            self.mov.x = -Player.MAXMOVE;
        }

        if (self.mov.y > Player.MAXMOVE) {
            self.mov.y = Player.MAXMOVE;
        } else if (self.mov.y < -Player.MAXMOVE) {
            self.mov.y = -Player.MAXMOVE;
        }

        // move player and clip movement to walls (check for no-clip mode here)
        Player.clipMove(self, self.mov.x, self.mov.y, level);
        self.tile.x = Wolf.POS2TILE(self.position.x);
        self.tile.y = Wolf.POS2TILE(self.position.y);

        //    Powerup_PickUp( self.tilex, self.tiley );

        // pick up items easier -- any tile you touch, instead of
        // just the midpoint tile
        var x, y, tileX, tileY;
        for (x = -1; x <= 1; x += 2) {
            tileX = Wolf.POS2TILE(self.position.x + x * Player.PLAYERSIZE);
            for (y = -1; y <= 1; y += 2) {
                tileY = Wolf.POS2TILE(self.position.y + y * Player.PLAYERSIZE);
                Powerups.pickUp(level, self, tileX, tileY);
            }
        }

        // Checking for area change, ambush tiles and doors will have negative values
        if (level.areas[self.tile.x][self.tile.y] >= 0 && level.areas[self.tile.x][self.tile.y] != self.areanumber) {
            self.areanumber = level.areas[self.tile.x][self.tile.y];
            // assert( self.areanumber >= 0 && self.areanumber < Wolf.NUMAREAS );
            Areas.connect(level, self.areanumber);
        }

        if (level.tileMap[self.tile.x][self.tile.y] & Level.EXIT_TILE) {
            //Game.startIntermission(0);
            Game.victory(game);
        }
    }

    /**
     * @description Called if player pressed USE button
     * @private
     * @param {object} self The player object.
     * @param {object} level The level object.
     * @returns {boolean} True if the player used something.
     */
    static use(self, game) {
        var x, y, dir, newtex,
            level = game.level;

        dir = Mathematik.get4dir(Wolf.FINE2RAD(self.angle));
        x = self.tile.x + Mathematik.dx4dir[dir];
        y = self.tile.y + Mathematik.dy4dir[dir];

        if (level.tileMap[x][y] & Level.DOOR_TILE) {
            return Doors.tryUse(level, self, level.state.doorMap[x][y]);
        }

        if (level.tileMap[x][y] & Level.SECRET_TILE) {
            return PushWall.push(level, x, y, dir);
        }

        if (level.tileMap[x][y] & Level.ELEVATOR_TILE) {
            switch (dir) {
                case Mathematik.dir4_east:
                case Mathematik.dir4_west:
                    newtex = level.wallTexX[x][y] += 2;
                    break;
                case Mathematik.dir4_north:
                case Mathematik.dir4_south:
                    return false; // don't allow to press elevator rails
            }

            if (level.tileMap[self.tile.x][self.tile.y] & Level.SECRETLEVEL_TILE) {
                self.playstate = Player.ex_secretlevel;
            } else {
                self.playstate = Player.ex_complete;
            }
            Sound.startSound(null, null, 0, Sound.CHAN_BODY, "assets/lsfx/040.wav", 1, Sound.ATTN_NORM, 0);

            Game.startIntermission(game);

            return true;
        }

        return false;
    }

    /**
     * @description Attack
     * @param {object} game The game object.
     * @param {object} player The player object.
     * @param {boolean} reAttack True if re-attack
     * @param {number} tics The number of tics
     */
    static attack(game, player, reAttack, tics) {
        var cur,
            level = game.level;

        player.attackCount -= tics;
        while (player.attackCount <= 0) {
            cur = Player.attackinfo[player.weapon][player.attackFrame];
            switch (cur.attack) {
                case -1:
                    player.flags &= ~Player.PL_FLAG_ATTCK;
                    if (!player.ammo[Player.AMMO_BULLETS]) {
                        player.weapon = Player.WEAPON_KNIFE;
                    } else if (player.weapon != player.pendingWeapon) {
                        player.weapon = player.pendingWeapon;
                    }
                    player.attackFrame = player.weaponFrame = 0;
                    return;
                case 4:
                    if (!player.ammo[Player.AMMO_BULLETS]) {
                        break;
                    }
                    if (reAttack) {
                        player.attackFrame -= 2;
                    }
                case 1:
                    if (!player.ammo[Player.AMMO_BULLETS]) { // can only happen with chain gun
                        player.attackFrame++;
                        break;
                    }
                    Weapon.fireLead(game, player);
                    player.ammo[Player.AMMO_BULLETS]--;
                    break;
                case 2:
                    Weapon.fireHit(game, player);
                    break;
                case 3:
                    if (player.ammo[Player.AMMO_BULLETS] && reAttack) {
                        player.attackFrame -= 2;
                    }
                    break;
            }

            player.attackCount += cur.tics;
            player.attackFrame++;
            player.weaponFrame = Player.attackinfo[player.weapon][player.attackFrame].frame;
        }

    }

    /**
     * @description Award points to the player
     * @param {object} player The player object.
     * @param {number} points The number of points.
     */
    static givePoints(player, points) {
        player.score += points;
        while (player.score >= player.nextExtra) {
            player.nextExtra += Player.EXTRAPOINTS;
            Player.giveLife(player);
            Wolf.log("Extra life!");
        }
    }

    /*
    -----------------------------------------------------------------------------
     Returns: returns true if player needs this health.

     Notes:
        gives player some HP
        max can be:
         0 - natural player's health limit (100 or 150 with augment)
        >0 - indicates the limit
    -----------------------------------------------------------------------------
    */
    static giveHealth(player, points, max) {
        if (max == 0) {
            max = (player.items & Player.ITEM_AUGMENT) ? 150 : 100;
        }

        if (player.health >= max) {
            return false; // doesn't need this health
        }

        player.health += points;

        if (player.health > max) {
            player.health = max;
        }

        player.faceGotGun = false;

        return true; // took it
    }

    static giveLife(player) {
        if (player.lives < 9) {
            player.lives++;
        }
    }

    static giveKey(player, key) {
        player.items |= Player.ITEM_KEY_1 << key;
    }

    static giveWeapon(player, weapon) {
        var itemflag;

        Player.giveAmmo(player, Player.AMMO_BULLETS, 6); // give some ammo with a weapon

        itemflag = Player.ITEM_WEAPON_1 << weapon;
        if (player.items & itemflag) {
            return; // player owns this weapon
        } else {
            player.items |= itemflag;

            // don't switch if already using better weapon
            if (player.weapon < weapon) {
                player.weapon = player.pendingWeapon = weapon;
            }
        }
    }

    static giveAmmo(player, type, ammo) {
        var maxAmmo = 99;

        if (player.items & Player.ITEM_BACKPACK) {
            maxAmmo *= 2;
        }

        if (player.ammo[type] >= maxAmmo) {
            return false; // don't need
        }

        if (!player.ammo[type] && !player.attackFrame) {
            // knife was out
            player.weapon = player.pendingWeapon;
        }

        player.ammo[type] += ammo;
        if (player.ammo[type] > maxAmmo) {
            player.ammo[type] = maxAmmo;
        }

        return true;
    }

    /**
     * @description Award points to the player
     * @param {object} player The player object.
     * @param {object} attacker The attacker actor object.
     * @param {number} points The number of damage points.
     * @param {number} skill The difficulty level.
     */
    static damage(player, attacker, points, skill) {
        var dx, dy,
            angle, playerAngle, deltaAngle;

        if (player.playstate == Player.ex_dead || player.playstate == Player.ex_complete || player.playstate == Player.ex_victory) {
            return;
        }

        player.lastAttacker = attacker;

        if (skill == Game.gd_baby) {
            points >>= 2;
        }

        // note the direction of the last hit for the directional blends
        dx = attacker.x - player.position.x;
        dy = attacker.y - player.position.y;

        // probably won't ever have damage from self, but check anyway
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
            } else if (deltaAngle < -40) {
                player.attackDirection[1] = 1;
            }
        }
        // do everything else but subtract health in god mode, to ease
        // testing of damage feedback
        if (!(player.flags & Player.FL_GODMODE)) {
            player.health -= points;
        }

        if (player.health <= 0) {
            // dead
            Game.notify("You have died");
            player.health = 0;
            player.playstate = Player.ex_dead;
            Sound.startSound(null, null, 0, Sound.CHAN_BODY, "assets/lsfx/009.wav", 1, Sound.ATTN_NORM, 0);
        }

        // red screen flash
        Game.startDamageFlash(points);

        // stop the happy grin face if shot before it times out
        player.faceGotGun = false;

        // make BJ's eyes bulge on huge hits
        if (points > 30 && player.health != 0) {
            player.faceOuch = true;
            player.faceCount = 0;
        }
    }

    static victorySpin(game, player, tics) {
        var desty;

        if (player.angle > Wolf.ANG_270) {
            player.angle -= tics * Wolf.ANG_1 * 3;
            if (player.angle < Wolf.ANG_270) {
                player.angle = Wolf.ANG_270;
            }
        } else if (player.angle < Wolf.ANG_270) {
            player.angle += tics * Wolf.ANG_1 * 3;
            if (player.angle > Wolf.ANG_270) {
                player.angle = Wolf.ANG_270;
            }
        }

        //desty = ((player.tile.y-5) << Wolf.TILESHIFT) - 0x3000;
        desty = Wolf.TILE2POS(player.tile.y + 7);

        if (player.position.y < desty) {
            player.position.y += tics * 3072;
            if (player.position.y > desty) {
                player.position.y = desty;
            }
        }
    }

    /**
     * @description Process player actions
     * @param {object} self The player object.
     * @param {object} game The game object.
     * @param {number} tics Tics since last processing.
     */
    static process(game, self, tics) {
        let level = game.level,
            n;


        if (self.playstate == Player.ex_victory) {
            Player.victorySpin(game, self, tics);
            return;
        }

        self.attackDirection = [0, 0];
        self.madenoise = false;

        Player.controlMovement(game, self, level, tics);

        if (self.flags & Player.PL_FLAG_ATTCK) {
            Player.attack(game, self, self.cmd.buttons & Game.BUTTON_ATTACK, tics);
        } else {
            if (self.cmd.buttons & Game.BUTTON_USE) {
                if (!(self.flags & Player.PL_FLAG_REUSE) && Player.use(self, game)) {
                    self.flags |= Player.PL_FLAG_REUSE;
                }
            } else {
                self.flags &= ~Player.PL_FLAG_REUSE;
            }
            if (self.cmd.buttons & Game.BUTTON_ATTACK) {
                self.flags |= Player.PL_FLAG_ATTCK;

                self.attackFrame = 0;
                self.attackCount = Player.attackinfo[self.weapon][0].tics;
                self.weaponFrame = Player.attackinfo[self.weapon][0].frame;
            }
        }

        // process impulses
        switch (self.cmd.impulse) {
            case 0:
                break; // no impulse

            case 1:
            case 2:
            case 3:
            case 4:
                changeWeapon(self, self.cmd.impulse - 1);
                break;

            case 10: // next weapon /like in Quake/ FIXME: weapprev, weapnext
                self.pendingWeapon = self.weapon;
                for (n = 0; n < 4; ++n) {
                    if (++self.weapon > Player.WEAPON_CHAIN) {
                        self.weapon = Player.WEAPON_KNIFE;
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
}
