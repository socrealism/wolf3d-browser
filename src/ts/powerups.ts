class Powerups {
    static readonly pow_gibs = 0;    //  1% if <=10%; SLURPIESND
    static readonly pow_gibs2 = 1;    //  1% if <=10%; SLURPIESND
    static readonly pow_alpo = 2;    //  4% if <100%; HEALTH1SND
    static readonly pow_firstaid = 3;    // 25% if <100%; HEALTH2SND
    static readonly pow_key1 = 4;    // gold key;		GETKEYSND
    static readonly pow_key2 = 5;    // silver key;	GETKEYSND
    static readonly pow_key3 = 6;    // not used
    static readonly pow_key4 = 7;    // not used
    static readonly pow_cross = 8;    //  100pts; BONUS1SND
    static readonly pow_chalice = 9;    //  500pts; BONUS2SND
    static readonly pow_bible = 10;   // 1000pts; BONUS3SND
    static readonly pow_crown = 11;   // 5000pts; BONUS4SND
    static readonly pow_clip = 12;   // 8bul if <99bul; GETAMMOSND
    static readonly pow_clip2 = 13;   // 4bul if <99bul; GETAMMOSND
    static readonly pow_machinegun = 14;   // machine gun; GETMACHINESND
    static readonly pow_chaingun = 15;   // gatling gun; GETGATLINGSND
    static readonly pow_food = 16;   // 10% if <100%; HEALTH1SND
    static readonly pow_fullheal = 17;   // 99%, 25bul; BONUS1UPSND
    static readonly pow_25clip = 18;   // 25bul if <99bul; GETAMMOBOXSND
    static readonly pow_spear = 19;   // spear of destiny!
    static readonly pow_last = 20;
    // add new types <!only!> here (after last)

    static texture = [
        Wolf.SPR_STAT_34, // pow_gibs
        Wolf.SPR_STAT_38, // pow_gibs2
        Wolf.SPR_STAT_6,  // pow_alpo
        Wolf.SPR_STAT_25, // pow_firstaid
        Wolf.SPR_STAT_20, // pow_key1
        Wolf.SPR_STAT_21, // pow_key2
        // not used
        Wolf.SPR_STAT_20, // pow_key3
        Wolf.SPR_STAT_20, // pow_key4

        Wolf.SPR_STAT_29, // pow_cross
        Wolf.SPR_STAT_30, // pow_chalice
        Wolf.SPR_STAT_31, // pow_bible
        Wolf.SPR_STAT_32, // pow_crown
        Wolf.SPR_STAT_26, // pow_clip
        Wolf.SPR_STAT_26, // pow_clip2
        Wolf.SPR_STAT_27, // pow_machinegun
        Wolf.SPR_STAT_28, // pow_chaingun
        Wolf.SPR_STAT_24, // pow_food
        Wolf.SPR_STAT_33, // pow_fullheal
        // spear
        Wolf.SPR_STAT_49, // pow_25clip
        Wolf.SPR_STAT_51  // pow_spear
    ];

    static remove(level, powerup) {
        powerup.x = -1;
        powerup.y = -1;
    }

    static addNew(level) {
        /*
        for (var i = 0;i < level.state.numPowerups; i++ ) {
            if (level.state.powerups[i].x == -1 ) {
                return level.state.powerups[i];
            }
        }
        */
        /*
        if (level.state.numPowerups == Wolf.MAX_POWERUPS ) {
            return level.state.powerups[0];
        }
        */
        level.state.numPowerups++;

        var newp = {
            x: -1,
            y: -1,
            type: 0,
            sprite: null
        };

        level.state.powerups[level.state.numPowerups - 1] = newp;

        return newp;
    }

    static reset(level) {
        level.state.numPowerups = 0;
        level.state.powerups = [];
    }

    // x,y are in TILES.
    static spawn(level, x, y, type) {
        var newp = Powerups.addNew(level);

        newp.sprite = Wolf.Sprites.getNewSprite(level);
        newp.type = type;

        Wolf.Sprites.setPos(level, newp.sprite, Wolf.TILE2POS(newp.x = x), Wolf.TILE2POS(newp.y = y), 0);

        Wolf.Sprites.setTex(level, newp.sprite, -1, Powerups.texture[type]);

        level.tileMap[x][y] |= Wolf.POWERUP_TILE;
        // good place to update total treasure count!
    }

    static give(level, player, type) {
        var keynames = ["Gold", "Silver", "?", "?"];

        switch (type) {
            // Keys
            case Powerups.pow_key1:
            case Powerups.pow_key2:
            case Powerups.pow_key3:
            case Powerups.pow_key4:
                type -= Powerups.pow_key1;
                Wolf.Player.giveKey(player, type);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/012.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify(keynames[type] + " key");
                break;
            // Treasure
            case Powerups.pow_cross:
                Wolf.Player.givePoints(player, 100);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/035.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;

            case Powerups.pow_chalice:
                Wolf.Player.givePoints(player, 500);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/036.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;

            case Powerups.pow_bible:
                Wolf.Player.givePoints(player, 1000);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/037.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;

            case Powerups.pow_crown:
                Wolf.Player.givePoints(player, 5000);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/045.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;

            // Health
            case Powerups.pow_gibs:
                if (!Wolf.Player.giveHealth(player, 1, 11)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/061.wav", 1, Sound.ATTN_NORM, 0);
                break;

            case Powerups.pow_alpo:
                if (!Wolf.Player.giveHealth(player, 4, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/033.wav", 1, Sound.ATTN_NORM, 0);
                break;

            case Powerups.pow_food:
                if (!Wolf.Player.giveHealth(player, 10, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/033.wav", 1, Sound.ATTN_NORM, 0);
                break;

            case Powerups.pow_firstaid:
                if (!Wolf.Player.giveHealth(player, 25, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/034.wav", 1, Sound.ATTN_NORM, 0);
                break;

            // Weapon & Ammo
            case Powerups.pow_clip:
                if (!Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 8)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;

            case Powerups.pow_clip2:
                if (!Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 4)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;

            case Powerups.pow_25clip:
                if (!Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 25)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;

            case Powerups.pow_machinegun:
                Wolf.Player.giveWeapon(player, Wolf.WEAPON_AUTO);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/030.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify("Machinegun");
                break;

            case Powerups.pow_chaingun:
                Wolf.Player.giveWeapon(player, Wolf.WEAPON_CHAIN);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/038.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify("Chaingun");

                player.faceCount = -100;
                player.faceGotGun = true;
                break;

            // Artifacts
            case Powerups.pow_fullheal:
                // go to 150 health
                Wolf.Player.giveHealth(player, 99, 99);
                Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 25);
                Wolf.Player.giveLife(player);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                } else {
                    Game.notify("Full Heal");
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/034.wav", 1, Sound.ATTN_NORM, 0);
                Wolf.log("Extra life!");
                break;

            default:
                Wolf.log("Warning: Unknown item type: " + type);
                break;
        }

        Game.startBonusFlash();

        return true;
    }

    // x,y are in TILES.
    static pickUp(level, player, x, y) {
        var i, pow,
            p_left = false,
            p_pick = false;

        for (i = 0; i < level.state.numPowerups; i++) {
            pow = level.state.powerups[i];
            if (pow.x == x && pow.y == y) {
                // got a powerup here
                if (Powerups.give(level, player, pow.type)) { //FIXME script
                    // picked up this stuff, remove it!
                    p_pick = true;
                    Wolf.Sprites.remove(level, pow.sprite);
                    Powerups.remove(level, pow);
                } else {
                    // player do not need it, so may be next time!
                    p_left = true;
                }
            }
        }

        if (p_left) {
            level.tileMap[x][y] |= Wolf.POWERUP_TILE;
        } else {
            level.tileMap[x][y] &= ~Wolf.POWERUP_TILE;
        }
    }
}
