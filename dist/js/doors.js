"use strict";
class Doors {
    static reset(level) {
        level.state.numDoors = 0;
        for (let x = 0; x < 64; x++) {
            level.state.doorMap[x] = [];
            for (let y = 0; y < 64; y++) {
                level.state.doorMap[x][y] = 0;
            }
        }
    }
    static spawn(level, x, y, type) {
        if (level.state.numDoors >= Doors.MAXDOORS) {
            throw new Error('Too many Doors on level!');
        }
        const door = level.state.doorMap[x][y] = {
            type: -1,
            vertical: false,
            texture: -1,
            ticcount: 0,
            tile: {
                x,
                y,
            },
            action: Doors.dr_closed,
        };
        switch (type) {
            case 0x5A:
                door.type = Doors.DOOR_VERT;
                door.vertical = true;
                door.texture = Doors.TEX_DDOOR + 1;
                break;
            case 0x5B:
                door.type = Doors.DOOR_HORIZ;
                door.vertical = false;
                door.texture = Doors.TEX_DDOOR;
                break;
            case 0x5C:
                door.type = Doors.DOOR_G_VERT;
                door.vertical = true;
                door.texture = Doors.TEX_DLOCK;
                break;
            case 0x5D:
                door.type = Doors.DOOR_G_HORIZ;
                door.vertical = false;
                door.texture = Doors.TEX_DLOCK;
                break;
            case 0x5E:
                door.type = Doors.DOOR_S_VERT;
                door.vertical = true;
                door.texture = Doors.TEX_DLOCK + 1;
                break;
            case 0x5F:
                door.type = Doors.DOOR_S_HORIZ;
                door.vertical = false;
                door.texture = Doors.TEX_DLOCK + 1;
                break;
            case 0x64:
                door.type = Doors.DOOR_E_VERT;
                door.vertical = true;
                door.texture = Doors.TEX_DELEV + 1;
                break;
            case 0x65:
                door.type = Doors.DOOR_E_HORIZ;
                door.vertical = false;
                door.texture = Doors.TEX_DELEV;
                break;
            default:
                throw new Error("Unknown door type: " + type);
        }
        level.state.doors[level.state.numDoors] = door;
        level.state.numDoors++;
        return level.state.numDoors - 1;
    }
    static opened(door) {
        return door.action == Doors.dr_open ? Doors.DOOR_FULLOPEN : door.ticcount;
    }
    static process(level, player, tics) {
        if (player.playstate == Player.ex_victory) {
            return;
        }
        for (let n = 0; n < level.state.numDoors; ++n) {
            const door = level.state.doors[n], doorPos = {
                x: Wolf.TILE2POS(door.tile.x),
                y: Wolf.TILE2POS(door.tile.y)
            };
            switch (door.action) {
                case Doors.dr_closed:
                    continue;
                case Doors.dr_opening:
                    if (door.ticcount >= Doors.DOOR_FULLOPEN) {
                        door.action = Doors.dr_open;
                        door.ticcount = 0;
                    }
                    else {
                        if (door.ticcount == 0) {
                            Areas.join(level, door.area1, door.area2);
                            Areas.connect(level, player.areanumber);
                            if (level.state.areabyplayer[door.area1]) {
                                Sound.startSound(player.position, doorPos, 1, Sound.CHAN_AUTO, "assets/sfx/010.wav", 1, Sound.ATTN_STATIC, 0);
                            }
                        }
                        door.ticcount += tics;
                        if (door.ticcount > Doors.DOOR_FULLOPEN) {
                            door.ticcount = Doors.DOOR_FULLOPEN;
                        }
                    }
                    break;
                case Doors.dr_closing:
                    if (door.ticcount <= 0) {
                        Areas.disconnect(level, door.area1, door.area2);
                        Areas.connect(level, player.areanumber);
                        door.ticcount = 0;
                        door.action = Doors.dr_closed;
                    }
                    else {
                        if (door.ticcount == Doors.DOOR_FULLOPEN) {
                            if (level.state.areabyplayer[door.area1]) {
                                Sound.startSound(player.position, doorPos, 1, Sound.CHAN_AUTO, "assets/sfx/007.wav", 1, Sound.ATTN_STATIC, 0);
                            }
                        }
                        door.ticcount -= tics;
                        if (door.ticcount < 0) {
                            door.ticcount = 0;
                        }
                    }
                    break;
                case Doors.dr_open:
                    if (door.ticcount > Doors.DOOR_MINOPEN) {
                        if (!Doors.canCloseDoor(level, player, door.tile.x, door.tile.y, door.vertical)) {
                            door.ticcount = Doors.DOOR_MINOPEN;
                        }
                    }
                    if (door.ticcount >= Doors.DOOR_TIMEOUT) {
                        door.action = Doors.dr_closing;
                        door.ticcount = Doors.DOOR_FULLOPEN;
                    }
                    else {
                        door.ticcount += tics;
                    }
                    break;
            }
        }
    }
    static setAreas(level) {
        let n, x, y, door;
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
    static open(door) {
        if (door.action == Doors.dr_open) {
            door.ticcount = 0;
        }
        else {
            door.action = Doors.dr_opening;
        }
    }
    static changeDoorState(level, player, door) {
        if (door.action < Doors.dr_opening) {
            Doors.open(door);
        }
        else if (door.action == Doors.dr_open && Doors.canCloseDoor(level, player, door.tile.x, door.tile.y, door.vertical)) {
        }
    }
    static canCloseDoor(level, player, x, y, vert) {
        let n, tileX = Wolf.POS2TILE(player.position.x), tileY = Wolf.POS2TILE(player.position.y), guard;
        if (tileX == x && tileY == y) {
            return false;
        }
        if (vert) {
            if (tileY == y) {
                if (Wolf.POS2TILE(player.position.x + Doors.CLOSEWALL) == x) {
                    return false;
                }
                if (Wolf.POS2TILE(player.position.x - Doors.CLOSEWALL) == x) {
                    return false;
                }
            }
            for (n = 0; n < level.state.numGuards; ++n) {
                guard = level.state.guards[n];
                if (guard.tile.x == x && guard.tile.y == y) {
                    return false;
                }
                if (guard.tile.x == x - 1 && guard.tile.y == y && Wolf.POS2TILE(guard.x + Doors.CLOSEWALL) == x) {
                    return false;
                }
                if (guard.tile.x == x + 1 && guard.tile.y == y && Wolf.POS2TILE(guard.x - Doors.CLOSEWALL) == x) {
                    return false;
                }
            }
        }
        else {
            if (tileX == x) {
                if (Wolf.POS2TILE(player.position.y + Doors.CLOSEWALL) == y) {
                    return false;
                }
                if (Wolf.POS2TILE(player.position.y - Doors.CLOSEWALL) == y) {
                    return false;
                }
            }
            for (n = 0; n < level.state.numGuards; ++n) {
                guard = level.state.guards[n];
                if (guard.tile.x == x && guard.tile.y == y) {
                    return false;
                }
                if (guard.tile.x == x && guard.tile.y == y - 1 && Wolf.POS2TILE(guard.y + Doors.CLOSEWALL) == y) {
                    return false;
                }
                if (guard.tile.x == x && guard.tile.y == y + 1 && Wolf.POS2TILE(guard.y - Doors.CLOSEWALL) == y) {
                    return false;
                }
            }
        }
        return true;
    }
    static tryUse(level, player, door) {
        switch (door.type) {
            case Doors.DOOR_VERT:
            case Doors.DOOR_HORIZ:
            case Doors.DOOR_E_VERT:
            case Doors.DOOR_E_HORIZ:
                Doors.changeDoorState(level, player, door);
                break;
            case Doors.DOOR_G_VERT:
            case Doors.DOOR_G_HORIZ:
                if (player.items & Player.ITEM_KEY_1) {
                    Doors.changeDoorState(level, player, door);
                }
                else {
                    Game.notify('You need a gold key');
                }
                break;
            case Doors.DOOR_S_VERT:
            case Doors.DOOR_S_HORIZ:
                if (player.items & Player.ITEM_KEY_2) {
                    Doors.changeDoorState(level, player, door);
                }
                else {
                    Game.notify('You need a silver key');
                }
                break;
        }
        return true;
    }
}
Doors.CLOSEWALL = Wolf.MINDIST;
Doors.MAXDOORS = 64;
Doors.MAX_DOORS = 256;
Doors.DOOR_TIMEOUT = 300;
Doors.DOOR_MINOPEN = 50;
Doors.DOOR_FULLOPEN = 63;
Doors.DOOR_VERT = 255;
Doors.DOOR_HORIZ = 254;
Doors.DOOR_E_VERT = 253;
Doors.DOOR_E_HORIZ = 252;
Doors.DOOR_G_VERT = 251;
Doors.DOOR_G_HORIZ = 250;
Doors.DOOR_S_VERT = 249;
Doors.DOOR_S_HORIZ = 248;
Doors.FIRST_DOOR = 248;
Doors.LAST_LOCK = 251;
Doors.TEX_DOOR = 98;
Doors.dr_closing = -1;
Doors.dr_closed = 0;
Doors.dr_opening = 1;
Doors.dr_open = 2;
Doors.TEX_DDOOR = (0 + Doors.TEX_DOOR);
Doors.TEX_PLATE = (2 + Doors.TEX_DOOR);
Doors.TEX_DELEV = (4 + Doors.TEX_DOOR);
Doors.TEX_DLOCK = (6 + Doors.TEX_DOOR);
