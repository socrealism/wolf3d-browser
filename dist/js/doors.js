"use strict";
Wolf.Doors = (function () {
    Wolf.setConsts({
        CLOSEWALL: Wolf.MINDIST,
        MAXDOORS: 64,
        MAX_DOORS: 256,
        DOOR_TIMEOUT: 300,
        DOOR_MINOPEN: 50,
        DOOR_FULLOPEN: 63,
        DOOR_VERT: 255,
        DOOR_HORIZ: 254,
        DOOR_E_VERT: 253,
        DOOR_E_HORIZ: 252,
        DOOR_G_VERT: 251,
        DOOR_G_HORIZ: 250,
        DOOR_S_VERT: 249,
        DOOR_S_HORIZ: 248,
        FIRST_DOOR: 248,
        LAST_LOCK: 251,
        TEX_DOOR: 98,
        dr_closing: -1,
        dr_closed: 0,
        dr_opening: 1,
        dr_open: 2
    });
    Wolf.setConsts({
        TEX_DDOOR: (0 + Wolf.TEX_DOOR),
        TEX_PLATE: (2 + Wolf.TEX_DOOR),
        TEX_DELEV: (4 + Wolf.TEX_DOOR),
        TEX_DLOCK: (6 + Wolf.TEX_DOOR)
    });
    function reset(level) {
        level.state.numDoors = 0;
        for (var x = 0; x < 64; x++) {
            level.state.doorMap[x] = [];
            for (var y = 0; y < 64; y++) {
                level.state.doorMap[x][y] = 0;
            }
        }
    }
    function spawn(level, x, y, type) {
        if (level.state.numDoors >= Wolf.MAXDOORS) {
            throw new Error("Too many Doors on level!");
        }
        var door = level.state.doorMap[x][y] = {
            type: -1,
            vertical: 0,
            texture: -1,
            ticcount: 0
        };
        switch (type) {
            case 0x5A:
                door.type = Wolf.DOOR_VERT;
                door.vertical = true;
                door.texture = Wolf.TEX_DDOOR + 1;
                break;
            case 0x5B:
                door.type = Wolf.DOOR_HORIZ;
                door.vertical = false;
                door.texture = Wolf.TEX_DDOOR;
                break;
            case 0x5C:
                door.type = Wolf.DOOR_G_VERT;
                door.vertical = true;
                door.texture = Wolf.TEX_DLOCK;
                break;
            case 0x5D:
                door.type = Wolf.DOOR_G_HORIZ;
                door.vertical = false;
                door.texture = Wolf.TEX_DLOCK;
                break;
            case 0x5E:
                door.type = Wolf.DOOR_S_VERT;
                door.vertical = true;
                door.texture = Wolf.TEX_DLOCK + 1;
                break;
            case 0x5F:
                door.type = Wolf.DOOR_S_HORIZ;
                door.vertical = false;
                door.texture = Wolf.TEX_DLOCK + 1;
                break;
            case 0x64:
                door.type = Wolf.DOOR_E_VERT;
                door.vertical = true;
                door.texture = Wolf.TEX_DELEV + 1;
                break;
            case 0x65:
                door.type = Wolf.DOOR_E_HORIZ;
                door.vertical = false;
                door.texture = Wolf.TEX_DELEV;
                break;
            default:
                throw new Error("Unknown door type: " + type);
        }
        door.tile = {
            x: x,
            y: y
        };
        door.action = Wolf.dr_closed;
        level.state.doors[level.state.numDoors] = door;
        level.state.numDoors++;
        return level.state.numDoors - 1;
    }
    function opened(door) {
        return door.action == Wolf.dr_open ? Wolf.DOOR_FULLOPEN : door.ticcount;
    }
    function process(level, player, tics) {
        if (player.playstate == Wolf.ex_victory) {
            return;
        }
        for (var n = 0; n < level.state.numDoors; ++n) {
            var door = level.state.doors[n], doorPos = {
                x: Wolf.TILE2POS(door.tile.x),
                y: Wolf.TILE2POS(door.tile.y)
            };
            switch (door.action) {
                case Wolf.dr_closed:
                    continue;
                case Wolf.dr_opening:
                    if (door.ticcount >= Wolf.DOOR_FULLOPEN) {
                        door.action = Wolf.dr_open;
                        door.ticcount = 0;
                    }
                    else {
                        if (door.ticcount == 0) {
                            Wolf.Areas.join(level, door.area1, door.area2);
                            Wolf.Areas.connect(level, player.areanumber);
                            if (level.state.areabyplayer[door.area1]) {
                                Wolf.Sound.startSound(player.position, doorPos, 1, Wolf.CHAN_AUTO, "assets/sfx/010.wav", 1, Wolf.ATTN_STATIC, 0);
                            }
                        }
                        door.ticcount += tics;
                        if (door.ticcount > Wolf.DOOR_FULLOPEN) {
                            door.ticcount = Wolf.DOOR_FULLOPEN;
                        }
                    }
                    break;
                case Wolf.dr_closing:
                    if (door.ticcount <= 0) {
                        Wolf.Areas.disconnect(level, door.area1, door.area2);
                        Wolf.Areas.connect(level, player.areanumber);
                        door.ticcount = 0;
                        door.action = Wolf.dr_closed;
                    }
                    else {
                        if (door.ticcount == Wolf.DOOR_FULLOPEN) {
                            if (level.state.areabyplayer[door.area1]) {
                                Wolf.Sound.startSound(player.position, doorPos, 1, Wolf.CHAN_AUTO, "assets/sfx/007.wav", 1, Wolf.ATTN_STATIC, 0);
                            }
                        }
                        door.ticcount -= tics;
                        if (door.ticcount < 0) {
                            door.ticcount = 0;
                        }
                    }
                    break;
                case Wolf.dr_open:
                    if (door.ticcount > Wolf.DOOR_MINOPEN) {
                        if (!canCloseDoor(level, player, door.tile.x, door.tile.y, door.vertical)) {
                            door.ticcount = Wolf.DOOR_MINOPEN;
                        }
                    }
                    if (door.ticcount >= Wolf.DOOR_TIMEOUT) {
                        door.action = Wolf.dr_closing;
                        door.ticcount = Wolf.DOOR_FULLOPEN;
                    }
                    else {
                        door.ticcount += tics;
                    }
                    break;
            }
        }
    }
    function setAreas(level) {
        var n, x, y, door;
        for (n = 0; n < level.state.numDoors; ++n) {
            door = level.state.doors[n];
            x = door.tile.x;
            y = door.tile.y;
            if (door.vertical) {
                door.area1 = level.areas[x + 1][y] >= 0 ? level.areas[x + 1][y] : 0;
                door.area2 = level.areas[x - 1][y] >= 0 ? level.areas[x - 1][y] : 0;
            }
            else {
                door.area1 = level.areas[x][y + 1] >= 0 ? level.areas[x][y + 1] : 0;
                door.area2 = level.areas[x][y - 1] >= 0 ? level.areas[x][y - 1] : 0;
            }
        }
    }
    function open(door) {
        if (door.action == Wolf.dr_open) {
            door.ticcount = 0;
        }
        else {
            door.action = Wolf.dr_opening;
        }
    }
    function changeDoorState(level, player, door) {
        if (door.action < Wolf.dr_opening) {
            open(door);
        }
        else if (door.action == Wolf.dr_open && canCloseDoor(level, player, door.tile.x, door.tile.y, door.vertical)) {
        }
    }
    function canCloseDoor(level, player, x, y, vert) {
        var n, tileX = Wolf.POS2TILE(player.position.x), tileY = Wolf.POS2TILE(player.position.y), guard;
        if (tileX == x && tileY == y) {
            return false;
        }
        if (vert) {
            if (tileY == y) {
                if (Wolf.POS2TILE(player.position.x + Wolf.CLOSEWALL) == x) {
                    return false;
                }
                if (Wolf.POS2TILE(player.position.x - Wolf.CLOSEWALL) == x) {
                    return false;
                }
            }
            for (n = 0; n < level.state.numGuards; ++n) {
                guard = level.state.guards[n];
                if (guard.tile.x == x && guard.tile.y == y) {
                    return false;
                }
                if (guard.tile.x == x - 1 && guard.tile.y == y && Wolf.POS2TILE(guard.x + Wolf.CLOSEWALL) == x) {
                    return false;
                }
                if (guard.tile.x == x + 1 && guard.tile.y == y && Wolf.POS2TILE(guard.x - Wolf.CLOSEWALL) == x) {
                    return false;
                }
            }
        }
        else {
            if (tileX == x) {
                if (Wolf.POS2TILE(player.position.y + Wolf.CLOSEWALL) == y) {
                    return false;
                }
                if (Wolf.POS2TILE(player.position.y - Wolf.CLOSEWALL) == y) {
                    return false;
                }
            }
            for (n = 0; n < level.state.numGuards; ++n) {
                var guard = level.state.guards[n];
                if (guard.tile.x == x && guard.tile.y == y) {
                    return false;
                }
                if (guard.tile.x == x && guard.tile.y == y - 1 && Wolf.POS2TILE(guard.y + Wolf.CLOSEWALL) == y) {
                    return false;
                }
                if (guard.tile.x == x && guard.tile.y == y + 1 && Wolf.POS2TILE(guard.y - Wolf.CLOSEWALL) == y) {
                    return false;
                }
            }
        }
        return true;
    }
    function tryUse(level, player, door) {
        switch (door.type) {
            case Wolf.DOOR_VERT:
            case Wolf.DOOR_HORIZ:
            case Wolf.DOOR_E_VERT:
            case Wolf.DOOR_E_HORIZ:
                changeDoorState(level, player, door);
                break;
            case Wolf.DOOR_G_VERT:
            case Wolf.DOOR_G_HORIZ:
                if (player.items & Wolf.ITEM_KEY_1) {
                    changeDoorState(level, player, door);
                }
                else {
                    Wolf.Game.notify("You need a gold key");
                }
                break;
            case Wolf.DOOR_S_VERT:
            case Wolf.DOOR_S_HORIZ:
                if (player.items & Wolf.ITEM_KEY_2) {
                    changeDoorState(level, player, door);
                }
                else {
                    Wolf.Game.notify("You need a silver key");
                }
                break;
        }
        return true;
    }
    return {
        reset: reset,
        spawn: spawn,
        opened: opened,
        open: open,
        tryUse: tryUse,
        process: process,
        setAreas: setAreas
    };
})();
