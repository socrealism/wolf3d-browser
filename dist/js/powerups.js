"use strict";
class Powerups {
    static remove(level, powerup) {
        powerup.x = -1;
        powerup.y = -1;
    }
    static addNew(level) {
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
    static spawn(level, x, y, type) {
        var newp = Powerups.addNew(level);
        newp.sprite = Sprites.getNewSprite(level);
        newp.type = type;
        Sprites.setPos(level, newp.sprite, Wolf.TILE2POS(newp.x = x), Wolf.TILE2POS(newp.y = y), 0);
        Sprites.setTex(level, newp.sprite, -1, Powerups.texture[type]);
        level.tileMap[x][y] |= Level.POWERUP_TILE;
    }
    static give(level, player, type) {
        var keynames = ["Gold", "Silver", "?", "?"];
        switch (type) {
            case Powerups.pow_key1:
            case Powerups.pow_key2:
            case Powerups.pow_key3:
            case Powerups.pow_key4:
                type -= Powerups.pow_key1;
                Player.giveKey(player, type);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/012.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify(keynames[type] + " key");
                break;
            case Powerups.pow_cross:
                Player.givePoints(player, 100);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/035.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Powerups.pow_chalice:
                Player.givePoints(player, 500);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/036.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Powerups.pow_bible:
                Player.givePoints(player, 1000);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/037.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Powerups.pow_crown:
                Player.givePoints(player, 5000);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/045.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Powerups.pow_gibs:
                if (!Player.giveHealth(player, 1, 11)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/061.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Powerups.pow_alpo:
                if (!Player.giveHealth(player, 4, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/033.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Powerups.pow_food:
                if (!Player.giveHealth(player, 10, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/033.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Powerups.pow_firstaid:
                if (!Player.giveHealth(player, 25, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/034.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Powerups.pow_clip:
                if (!Player.giveAmmo(player, Player.AMMO_BULLETS, 8)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Powerups.pow_clip2:
                if (!Player.giveAmmo(player, Player.AMMO_BULLETS, 4)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Powerups.pow_25clip:
                if (!Player.giveAmmo(player, Player.AMMO_BULLETS, 25)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Powerups.pow_machinegun:
                Player.giveWeapon(player, Player.WEAPON_AUTO);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/030.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify("Machinegun");
                break;
            case Powerups.pow_chaingun:
                Player.giveWeapon(player, Player.WEAPON_CHAIN);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/038.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify("Chaingun");
                player.faceCount = -100;
                player.faceGotGun = true;
                break;
            case Powerups.pow_fullheal:
                Player.giveHealth(player, 99, 99);
                Player.giveAmmo(player, Player.AMMO_BULLETS, 25);
                Player.giveLife(player);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                else {
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
    static pickUp(level, player, x, y) {
        var i, pow, p_left = false, p_pick = false;
        for (i = 0; i < level.state.numPowerups; i++) {
            pow = level.state.powerups[i];
            if (pow.x == x && pow.y == y) {
                if (Powerups.give(level, player, pow.type)) {
                    p_pick = true;
                    Sprites.remove(level, pow.sprite);
                    Powerups.remove(level, pow);
                }
                else {
                    p_left = true;
                }
            }
        }
        if (p_left) {
            level.tileMap[x][y] |= Level.POWERUP_TILE;
        }
        else {
            level.tileMap[x][y] &= ~Level.POWERUP_TILE;
        }
    }
}
Powerups.pow_gibs = 0;
Powerups.pow_gibs2 = 1;
Powerups.pow_alpo = 2;
Powerups.pow_firstaid = 3;
Powerups.pow_key1 = 4;
Powerups.pow_key2 = 5;
Powerups.pow_key3 = 6;
Powerups.pow_key4 = 7;
Powerups.pow_cross = 8;
Powerups.pow_chalice = 9;
Powerups.pow_bible = 10;
Powerups.pow_crown = 11;
Powerups.pow_clip = 12;
Powerups.pow_clip2 = 13;
Powerups.pow_machinegun = 14;
Powerups.pow_chaingun = 15;
Powerups.pow_food = 16;
Powerups.pow_fullheal = 17;
Powerups.pow_25clip = 18;
Powerups.pow_spear = 19;
Powerups.pow_last = 20;
Powerups.texture = [
    Sprites.SPR_STAT_34,
    Sprites.SPR_STAT_38,
    Sprites.SPR_STAT_6,
    Sprites.SPR_STAT_25,
    Sprites.SPR_STAT_20,
    Sprites.SPR_STAT_21,
    Sprites.SPR_STAT_20,
    Sprites.SPR_STAT_20,
    Sprites.SPR_STAT_29,
    Sprites.SPR_STAT_30,
    Sprites.SPR_STAT_31,
    Sprites.SPR_STAT_32,
    Sprites.SPR_STAT_26,
    Sprites.SPR_STAT_26,
    Sprites.SPR_STAT_27,
    Sprites.SPR_STAT_28,
    Sprites.SPR_STAT_24,
    Sprites.SPR_STAT_33,
    Sprites.SPR_STAT_49,
    Sprites.SPR_STAT_51
];
