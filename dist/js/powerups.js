"use strict";
Wolf.Powerups = (function () {
    Wolf.setConsts({
        pow_gibs: 0,
        pow_gibs2: 1,
        pow_alpo: 2,
        pow_firstaid: 3,
        pow_key1: 4,
        pow_key2: 5,
        pow_key3: 6,
        pow_key4: 7,
        pow_cross: 8,
        pow_chalice: 9,
        pow_bible: 10,
        pow_crown: 11,
        pow_clip: 12,
        pow_clip2: 13,
        pow_machinegun: 14,
        pow_chaingun: 15,
        pow_food: 16,
        pow_fullheal: 17,
        pow_25clip: 18,
        pow_spear: 19,
        pow_last: 20
    });
    var texture = [
        Wolf.SPR_STAT_34,
        Wolf.SPR_STAT_38,
        Wolf.SPR_STAT_6,
        Wolf.SPR_STAT_25,
        Wolf.SPR_STAT_20,
        Wolf.SPR_STAT_21,
        Wolf.SPR_STAT_20,
        Wolf.SPR_STAT_20,
        Wolf.SPR_STAT_29,
        Wolf.SPR_STAT_30,
        Wolf.SPR_STAT_31,
        Wolf.SPR_STAT_32,
        Wolf.SPR_STAT_26,
        Wolf.SPR_STAT_26,
        Wolf.SPR_STAT_27,
        Wolf.SPR_STAT_28,
        Wolf.SPR_STAT_24,
        Wolf.SPR_STAT_33,
        Wolf.SPR_STAT_49,
        Wolf.SPR_STAT_51
    ];
    function remove(level, powerup) {
        powerup.x = -1;
        powerup.y = -1;
    }
    function addNew(level) {
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
    function reset(level) {
        level.state.numPowerups = 0;
        level.state.powerups = [];
    }
    function spawn(level, x, y, type) {
        var newp = addNew(level);
        newp.sprite = Wolf.Sprites.getNewSprite(level);
        newp.type = type;
        Wolf.Sprites.setPos(level, newp.sprite, Wolf.TILE2POS(newp.x = x), Wolf.TILE2POS(newp.y = y), 0);
        Wolf.Sprites.setTex(level, newp.sprite, -1, texture[type]);
        level.tileMap[x][y] |= Wolf.POWERUP_TILE;
    }
    function give(level, player, type) {
        var keynames = ["Gold", "Silver", "?", "?"];
        switch (type) {
            case Wolf.pow_key1:
            case Wolf.pow_key2:
            case Wolf.pow_key3:
            case Wolf.pow_key4:
                type -= Wolf.pow_key1;
                Wolf.Player.giveKey(player, type);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/012.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify(keynames[type] + " key");
                break;
            case Wolf.pow_cross:
                Wolf.Player.givePoints(player, 100);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/035.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Wolf.pow_chalice:
                Wolf.Player.givePoints(player, 500);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/036.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Wolf.pow_bible:
                Wolf.Player.givePoints(player, 1000);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/037.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Wolf.pow_crown:
                Wolf.Player.givePoints(player, 5000);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/045.wav", 1, Sound.ATTN_NORM, 0);
                if (++level.state.foundTreasure == level.state.totalTreasure) {
                    Game.notify("You found the last treasure!");
                }
                break;
            case Wolf.pow_gibs:
                if (!Wolf.Player.giveHealth(player, 1, 11)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/061.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.pow_alpo:
                if (!Wolf.Player.giveHealth(player, 4, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/033.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.pow_food:
                if (!Wolf.Player.giveHealth(player, 10, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/033.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.pow_firstaid:
                if (!Wolf.Player.giveHealth(player, 25, 0)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/034.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.pow_clip:
                if (!Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 8)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.pow_clip2:
                if (!Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 4)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.pow_25clip:
                if (!Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 25)) {
                    return false;
                }
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/031.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.pow_machinegun:
                Wolf.Player.giveWeapon(player, Wolf.WEAPON_AUTO);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/030.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify("Machinegun");
                break;
            case Wolf.pow_chaingun:
                Wolf.Player.giveWeapon(player, Wolf.WEAPON_CHAIN);
                Sound.startSound(null, null, 0, Sound.CHAN_ITEM, "assets/lsfx/038.wav", 1, Sound.ATTN_NORM, 0);
                Game.notify("Chaingun");
                player.faceCount = -100;
                player.faceGotGun = true;
                break;
            case Wolf.pow_fullheal:
                Wolf.Player.giveHealth(player, 99, 99);
                Wolf.Player.giveAmmo(player, Wolf.AMMO_BULLETS, 25);
                Wolf.Player.giveLife(player);
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
    function pickUp(level, player, x, y) {
        var i, pow, p_left = false, p_pick = false;
        for (i = 0; i < level.state.numPowerups; i++) {
            pow = level.state.powerups[i];
            if (pow.x == x && pow.y == y) {
                if (give(level, player, pow.type)) {
                    p_pick = true;
                    Wolf.Sprites.remove(level, pow.sprite);
                    remove(level, pow);
                }
                else {
                    p_left = true;
                }
            }
        }
        if (p_left) {
            level.tileMap[x][y] |= Wolf.POWERUP_TILE;
        }
        else {
            level.tileMap[x][y] &= ~Wolf.POWERUP_TILE;
        }
    }
    return {
        spawn: spawn,
        reset: reset,
        pickUp: pickUp
    };
})();
