/**
 * @namespace
 * @description Door management
 */
class Doors {
    public static readonly CLOSEWALL = Wolf.MINDIST; // Space between wall & player
    public static readonly MAXDOORS = 64;           // max number of sliding doors

    public static readonly MAX_DOORS = 256; // jseidelin: doesn't look like this is used?
    public static readonly DOOR_TIMEOUT = 300;
    public static readonly DOOR_MINOPEN = 50;
    public static readonly DOOR_FULLOPEN = 63;
    public static readonly DOOR_VERT = 255;
    public static readonly DOOR_HORIZ = 254;
    public static readonly DOOR_E_VERT = 253;
    public static readonly DOOR_E_HORIZ = 252;
    public static readonly DOOR_G_VERT = 251;
    public static readonly DOOR_G_HORIZ = 250;
    public static readonly DOOR_S_VERT = 249;
    public static readonly DOOR_S_HORIZ = 248;
    public static readonly FIRST_DOOR = 248;
    public static readonly LAST_LOCK = 251;

    public static readonly TEX_DOOR = 98;

    public static readonly dr_closing = -1;
    public static readonly dr_closed = 0;
    public static readonly dr_opening = 1;
    public static readonly dr_open = 2;

    // texture IDs used by cache routines
    public static readonly TEX_DDOOR = (0 + Doors.TEX_DOOR); // Simple Door
    public static readonly TEX_PLATE = (2 + Doors.TEX_DOOR); // Door Plate
    public static readonly TEX_DELEV = (4 + Doors.TEX_DOOR); // Elevator Door
    public static readonly TEX_DLOCK = (6 + Doors.TEX_DOOR);  // Locked Door

    /**
     * @description Reset doors in the level
     * @param {object} level The level object.
     */
    public static reset(level) {
        level.state.numDoors = 0;

        for (var x = 0; x < 64; x++) {
            level.state.doorMap[x] = [];
            for (var y = 0; y < 64; y++) {
                level.state.doorMap[x][y] = 0;
            }
        }
    }

    /**
     * @description Spawn a door at the specified position.
     * @param {object} level The level object.
     * @param {number} x The x coordinate.
     * @param {number} y The y coordinate.
     * @param {number} type The door type.
     * @returns {number} The index of the new door.
     */
    public static spawn(level, x, y, type) {
        if (level.state.numDoors >= Doors.MAXDOORS) {
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

        door.tile = {
            x: x,
            y: y
        };
        door.action = Doors.dr_closed;

        level.state.doors[level.state.numDoors] = door;
        level.state.numDoors++;

        return level.state.numDoors - 1;
    }

    /**
     * @description Check to see if a door is open. If there are no doors in tile assume a closed door!
     * @param {object} doors The door object.
     * @returns {number} DOOR_FULLOPEN if door is opened,
     0 if door is closed,
     >0 <DOOR_FULLOPEN if partially opened.
     */
    public static opened(door) {
        return door.action == Doors.dr_open ? Doors.DOOR_FULLOPEN : door.ticcount;
    }

    /**
     * @description Process door actions.
     * @param {object} level The level object
     * @param {object} player The player object
     * @param {number} tics Tics since last
     */
    public static process(level, player, tics) {
        if (player.playstate == Wolf.ex_victory) {
            return;
        }

        for (var n = 0; n < level.state.numDoors; ++n) {
            var door = level.state.doors[n],
                doorPos = {
                    x: Wolf.TILE2POS(door.tile.x),
                    y: Wolf.TILE2POS(door.tile.y)
                };
            switch (door.action) {
                case Doors.dr_closed: // this door is closed!
                    continue;

                case Doors.dr_opening:
                    if (door.ticcount >= Doors.DOOR_FULLOPEN) { // door fully opened!
                        door.action = Doors.dr_open;
                        door.ticcount = 0;
                    } else { // opening!
                        if (door.ticcount == 0) {
                            // door is just starting to open, so connect the areas
                            Areas.join(level, door.area1, door.area2);
                            Areas.connect(level, player.areanumber);

                            if (level.state.areabyplayer[door.area1]) { // Door Opening sound!
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
                    if (door.ticcount <= 0) { // door fully closed! disconnect areas!
                        Areas.disconnect(level, door.area1, door.area2);
                        Areas.connect(level, player.areanumber);
                        door.ticcount = 0;
                        door.action = Doors.dr_closed;
                    } else { // closing!
                        if (door.ticcount == Doors.DOOR_FULLOPEN) {
                            if (level.state.areabyplayer[door.area1]) { // Door Closing sound!
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
                        // If player or something is in door do not close it!
                        if (!Doors.canCloseDoor(level, player, door.tile.x, door.tile.y, door.vertical)) {
                            door.ticcount = Doors.DOOR_MINOPEN; // do not close door immediately!
                        }
                    }
                    if (door.ticcount >= Doors.DOOR_TIMEOUT) {
                        // Door timeout, time to close it!
                        door.action = Doors.dr_closing;
                        door.ticcount = Doors.DOOR_FULLOPEN;
                    } else {
                        // Increase timeout!
                        door.ticcount += tics;
                    }
                    break;
            } // End switch lvldoors->Doors[ n ].action
        } // End for n = 0 ; n < lvldoors->numDoors ; ++n
    }

    /**
     * @description Set the areas doors in a level
     * @param {object} level The level object.
     * @param {array} areas The areas map.
     */
    public static setAreas(level) {
        var n, x, y,
            door;
        for (n = 0; n < level.state.numDoors; ++n) {
            door = level.state.doors[n];
            x = door.tile.x;
            y = door.tile.y;

            if (door.vertical) {
                door.area1 = level.areas[x + 1][y] >= 0 ? level.areas[x + 1][y] : 0;
                door.area2 = level.areas[x - 1][y] >= 0 ? level.areas[x - 1][y] : 0;
            } else {
                door.area1 = level.areas[x][y + 1] >= 0 ? level.areas[x][y + 1] : 0;
                door.area2 = level.areas[x][y - 1] >= 0 ? level.areas[x][y - 1] : 0;
            }
        }
    }

    /**
     * @description Open a door
     * @param {object} doors The door object.
     */
    public static open(door) {
        if (door.action == Doors.dr_open) {
            door.ticcount = 0;        // reset opened time
        } else {
            door.action = Doors.dr_opening;    // start opening it
        }
    }

    /**
     * @description Change the state of a door
     * @private
     * @param {object} level The level object.
     * @param {object} player The player object.
     * @param {object} doors The door object.
     */
    public static changeDoorState(level, player, door) {
        if (door.action < Doors.dr_opening) {
            open(door);
        } else if (door.action == Doors.dr_open && Doors.canCloseDoor(level, player, door.tile.x, door.tile.y, door.vertical)) {
            // !@# for the iphone with automatic using, don't allow any door close actions
            // Door->action = dr_closing;
            // Door->ticcount = DOOR_FULLOPEN;
        }
    }

    public static canCloseDoor(level, player, x, y, vert) {
        var n,
            tileX = Wolf.POS2TILE(player.position.x),
            tileY = Wolf.POS2TILE(player.position.y),
            guard;

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
                    return false; // guard in door
                }
                if (guard.tile.x == x - 1 && guard.tile.y == y && Wolf.POS2TILE(guard.x + Doors.CLOSEWALL) == x) {
                    return false; // guard in door
                }
                if (guard.tile.x == x + 1 && guard.tile.y == y && Wolf.POS2TILE(guard.x - Doors.CLOSEWALL) == x) {
                    return false; // guard in door
                }
            }
        } else {
            if (tileX == x) {
                if (Wolf.POS2TILE(player.position.y + Doors.CLOSEWALL) == y) {
                    return false;
                }
                if (Wolf.POS2TILE(player.position.y - Doors.CLOSEWALL) == y) {
                    return false;
                }
            }
            for (n = 0; n < level.state.numGuards; ++n) {
                var guard = level.state.guards[n];
                if (guard.tile.x == x && guard.tile.y == y) {
                    return false; // guard in door
                }
                if (guard.tile.x == x && guard.tile.y == y - 1 && Wolf.POS2TILE(guard.y + Doors.CLOSEWALL) == y) {
                    return false; // guard in door
                }
                if (guard.tile.x == x && guard.tile.y == y + 1 && Wolf.POS2TILE(guard.y - Doors.CLOSEWALL) == y) {
                    return false; // guard in door
                }
            }
        }

        return true;
    }

    /**
     * @description Try to use a door with keys that the player has.
     * @param {object} level The level object
     * @param {object} player The player object
     * @param {object} door The door object
     * @returns {boolean} Always returns true.
     */
    public static tryUse(level, player, door) {
        switch (door.type) {
            case Doors.DOOR_VERT:
            case Doors.DOOR_HORIZ:
            case Doors.DOOR_E_VERT:
            case Doors.DOOR_E_HORIZ:
                Doors.changeDoorState(level, player, door); // does not require key!
                break;

            case Doors.DOOR_G_VERT:
            case Doors.DOOR_G_HORIZ:
                if (player.items & Wolf.ITEM_KEY_1) {
                    Doors.changeDoorState(level, player, door);
                } else {
                    Game.notify("You need a gold key");
                }
                break;

            case Doors.DOOR_S_VERT:
            case Doors.DOOR_S_HORIZ:
                if (player.items & Wolf.ITEM_KEY_2) {
                    Doors.changeDoorState(level, player, door);
                } else {
                    Game.notify("You need a silver key");
                }
                break;
        }
        return true; // FIXME
    }
}
