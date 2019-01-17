/**
 * @description Level management
 */
class Level {
    static readonly WALL_TILE = 1;
    static readonly PUSHWALL_TILE = (1 << 20);
    static readonly DOOR_TILE = 2;
    static readonly SECRET_TILE = 4;
    static readonly DRESS_TILE = 8;
    static readonly BLOCK_TILE = 16;
    static readonly ACTOR_TILE = 32;
    static readonly DEADACTOR_TILE = 64;
    static readonly POWERUP_TILE = 128;
    static readonly AMBUSH_TILE = 256;
    static readonly EXIT_TILE = 512;
    static readonly SECRETLEVEL_TILE = 1024;
    static readonly ELEVATOR_TILE = (1 << 11);

    static readonly MAPHEADER_SIZE = 49;
    static readonly MAP_SIGNATURE = 0x21444921;

    static readonly TILE_IS_E_TURN = (1 << 12);
    static readonly TILE_IS_NE_TURN = (1 << 13);
    static readonly TILE_IS_N_TURN = (1 << 14);
    static readonly TILE_IS_NW_TURN = (1 << 15);
    static readonly TILE_IS_W_TURN = (1 << 16);
    static readonly TILE_IS_SW_TURN = (1 << 17);
    static readonly TILE_IS_S_TURN = (1 << 18);
    static readonly TILE_IS_SE_TURN = (1 << 19);

    static readonly MAX_POWERUPS = 1000;

    static readonly SOLID_TILE = (Level.WALL_TILE | Level.BLOCK_TILE | Level.PUSHWALL_TILE);
    static readonly BLOCKS_MOVE_TILE = (Level.WALL_TILE | Level.BLOCK_TILE | Level.PUSHWALL_TILE | Level.ACTOR_TILE);
    static readonly WAYPOINT_TILE = (
        Level.TILE_IS_E_TURN | Level.TILE_IS_NE_TURN | Level.TILE_IS_N_TURN | Level.TILE_IS_NW_TURN |
        Level.TILE_IS_W_TURN | Level.TILE_IS_SW_TURN | Level.TILE_IS_S_TURN | Level.TILE_IS_SE_TURN
    );

    static statinfo = [
        [false, -1],                    // puddle          spr1v
        [true, -1],                    // Green Barrel    "
        [true, -1],                    // Table/chairs    "
        [true, -1],                    // Floor lamp      "
        [false, -1],                    // Chandelier      "
        [true, -1],                    // Hanged man      "
        [false, Powerups.pow_alpo],            // Bad food        "
        [true, -1],                    // Red pillar      "
        [true, -1],                    // Tree            spr2v
        [false, -1],                    // Skeleton flat   "
        [true, -1],                    // Sink            " (SOD:gibs)
        [true, -1],                    // Potted plant    "
        [true, -1],                    // Urn             "
        [true, -1],                    // Bare table      "
        [false, -1],                    // Ceiling light   "
        [false, -1],                    // Kitchen stuff   "
        [true, -1],                    // suit of armor   spr3v
        [true, -1],                    // Hanging cage    "
        [true, -1],                    // SkeletoninCage  "
        [false, -1],                    // Skeleton relax  "
        [false, Powerups.pow_key1],            // Key 1           "
        [false, Powerups.pow_key2],            // Key 2           "
        [true, -1],                    // stuff                (SOD:gibs)
        [false, -1],                    // stuff
        [false, Powerups.pow_food],            // Good food       spr4v
        [false, Powerups.pow_firstaid],        // First aid       "
        [false, Powerups.pow_clip],            // Clip            "
        [false, Powerups.pow_machinegun],   // Machine gun     "
        [false, Powerups.pow_chaingun],        // Gatling gun     "
        [false, Powerups.pow_cross],        // Cross           "
        [false, Powerups.pow_chalice],        // Chalice         "
        [false, Powerups.pow_bible],        // Bible           "
        [false, Powerups.pow_crown],        // crown           spr5v
        [false, Powerups.pow_fullheal],        // one up          "
        [false, Powerups.pow_gibs],            // gibs            "
        [true, -1],                    // barrel          "
        [true, -1],                    // well            "
        [true, -1],                    // Empty well      "
        [false, Powerups.pow_gibs],            // Gibs 2          "
        [true, -1],                    // flag                "
        [true, -1],                    // Call Apogee        spr7v
        [false, -1],                    // junk            "
        [false, -1],                    // junk            "
        [false, -1],                    // junk            "
        [false, -1],                    // pots            "
        [true, -1],                     // stove           " (SOD:gibs)
        [true, -1],                    // spears          " (SOD:gibs)
        [false, -1]                        // vines           "
    ];

    static cachedGuard = 0;
    static cachedOfficer = 0;
    static cachedSS = 0;
    static cachedDog = 0;
    static cachedMutant = 0;
    static progress_bar = 0;

    static init() {
        for (let i = 0; i < Level.statinfo.length; i++) {
            const info = {
                idx: i,
                block: Level.statinfo[i][0],
                powerup: Level.statinfo[i][1]
            };

            Level.statinfo[i] = info;
        }
    }

    /**
     * @description Create a new level object
     * @private
     * @returns {object} The new level
     */
    static newLevel() {
        return {
            // readonly after level load
            areas: [],
            tileMap: [],
            wallTexX: [],
            wallTexY: [],

            spawn: {
                x: -1,
                y: -1,
                angle: 0
            },

            sprites: [],

            floorNum: 0,
            fParTime: 0,
            sParTime: "",

            levelName: "", // the descriptive name (Outer Base, etc)
            mapName: "",   // the server name (base1, etc)
            nextMap: "",   // go here when fraglimit is hit
            music: "",

            // state variables
            state: {
                framenum: 0,
                time: 0,

                // intermission state
                levelCompleted: 0,                // in case the game was saved at the intermission

                totalSecrets: 0,
                foundSecrets: 0,

                totalTreasure: 0,
                foundTreasure: 0,

                totalMonsters: 0,
                killedMonsters: 0,

                areaconnect: null,
                areabyplayer: null,

                numDoors: 0,
                doors: [],
                doorMap: [],

                powerups: [],
                numPowerups: 0,

                guards: [],
                numGuards: 0,

                startTime: 0,
                elapsedTime: 0
            }
        };
    }

    /**
     * @description Parse map file data.
     * @private
     * @param {object} file The file object
     * @returns {object} The new level object
     */
    static parseMapData(file) {
        var level = Level.newLevel(),
            length, offset,
            mapNameLength,
            musicNameLength,
            x, y, y0,
            layer1, layer2, layer3;

        file.position = 0;

        level.file = file;

        if (file.size < Level.MAPHEADER_SIZE) {
            throw new Error("Map file size is smaller than mapheader size");
        }
        if (FS.readUInt32(file) != Level.MAP_SIGNATURE) {
            throw new Error("File signature does not match MAP_SIGNATURE");
        }

        var rle = FS.readUInt16(file);

        level.width = FS.readUInt16(file);
        level.height = FS.readUInt16(file);

        level.ceiling = [FS.readUInt8(file), FS.readUInt8(file), FS.readUInt8(file), FS.readUInt8(file)];
        level.floor = [FS.readUInt8(file), FS.readUInt8(file), FS.readUInt8(file), FS.readUInt8(file)];

        length = [
            FS.readUInt16(file),
            FS.readUInt16(file),
            FS.readUInt16(file)
        ];
        offset = [
            FS.readUInt32(file),
            FS.readUInt32(file),
            FS.readUInt32(file)
        ];

        mapNameLength = FS.readUInt16(file);
        musicNameLength = FS.readUInt16(file);

        file.position += 4; // (single) fpartime;

        level.sParTime = FS.readString(file, 5);

        if (file.size < (Level.MAPHEADER_SIZE + mapNameLength + musicNameLength + length[0] + length[1] + length[2])) {
            throw new Error("filesize is less than MAPHEADER_SIZE + mapNameLength + musicNameLength + etc");
        }

        level.levelName = level.mapName = FS.readString(file, mapNameLength);
        level.music = FS.readString(file, musicNameLength);

        level.plane1 = Level.readPlaneData(file, offset[0], length[0], rle);
        level.plane2 = Level.readPlaneData(file, offset[1], length[1], rle);
        level.plane3 = Level.readPlaneData(file, offset[2], length[2], rle);


        // jseidelin: hack disabled since we only use up to map 30
        // HUGE HACK to take out the pushwall maze that occasionally
        // gets players stuck in level E4M2 without actually touching
        // a map editor...
        /*
        if (file == "maps/w31.map") {
            for (x = 22; x <= 32; x++) {
                for (y0 = 30; y0 <= 32; y0++) {
                    Plane1[y0 * 64 + x] = Plane1[30*64+21];
                    Plane2[y0 * 64 + x] = Plane2[30*64+21];
                    Plane3[y0 * 64 + x] = Plane3[30*64+21];
                }
            }
        }
        */

        Doors.reset(level);

        for (x = 0; x < 64; x++) {
            level.areas[x] = [];
            level.tileMap[x] = [];
            level.wallTexX[x] = [];
            level.wallTexY[x] = [];

            for (y = 0; y < 64; y++) {
                level.areas[x][y] = 0;
                level.tileMap[x][y] = 0;
                level.wallTexX[x][y] = 0;
                level.wallTexY[x][y] = 0;
            }
        }


        for (y0 = 0; y0 < 64; ++y0) {
            for (x = 0; x < 64; ++x) {
                y = 63 - y0;

                layer1 = level.plane1[y0 * 64 + x];
                layer2 = level.plane2[y0 * 64 + x];
                layer3 = level.plane3[y0 * 64 + x];

                // if server, process obj layer!
                if (layer2) {
                    Level.spawnObj(level, layer2, x, y);
                }

                // Map data layer
                if (layer1 == 0) {
                    level.areas[x][y] = -3; // unknown area
                } else if (layer1 < 0x6a) { // solid map object
                    if ((layer1 >= 0x5A && layer1 <= 0x5F) || layer1 == 0x64 || layer1 == 0x65) { // door
                        level.tileMap[x][y] |= Level.DOOR_TILE;
                        Doors.spawn(level, x, y, layer1);
                        level.areas[x][y] = -2; // door area
                    } else {
                        level.tileMap[x][y] |= Level.WALL_TILE;
                        level.wallTexX[x][y] = (layer1 - 1) * 2 + 1;
                        level.wallTexY[x][y] = (layer1 - 1) * 2;
                        level.areas[x][y] = -1; // wall area
                        if (layer1 == 0x15) { // elevator
                            level.tileMap[x][y] |= Level.ELEVATOR_TILE;
                        }
                    }
                } else if (layer1 == 0x6a) { // Ambush floor tile
                    level.tileMap[x][y] |= Level.AMBUSH_TILE;
                    level.areas[x][y] = -3; // unknown area
                } else if (layer1 >= Wolf.FIRSTAREA && layer1 < (Wolf.FIRSTAREA + Wolf.NUMAREAS)) { // area
                    if (layer1 == Wolf.FIRSTAREA) { // secret level
                        level.tileMap[x][y] |= Level.SECRETLEVEL_TILE;
                    }
                    level.areas[x][y] = layer1 - Wolf.FIRSTAREA;// spawn area
                } else {
                    level.areas[x][y] = -3; // unknown area
                }
                // End of the map data layer
            }
        }


        // JDC: try to replace all the unknown areas with an adjacent area, to
        // avoid the silent attack / no damage problem when you get an ambush
        // guard stuck on their original tile
        for (x = 1; x < 63; x++) {
            for (y = 1; y < 63; y++) {
                if (level.areas[x][y] != -3) {
                    continue;
                }
                if (level.areas[x - 1][y] >= 0) {
                    level.areas[x][y] = level.areas[x - 1][y];
                } else if (level.areas[x + 1][y] >= 0) {
                    level.areas[x][y] = level.areas[x + 1][y];
                } else if (level.areas[x][y - 1] >= 0) {
                    level.areas[x][y] = level.areas[x][y - 1];
                } else if (level.areas[x + 1][y + 1] >= 0) {
                    level.areas[x][y] = level.areas[x][y + 1];
                }
            }
        }

        Doors.setAreas(level);

        return level;
    }

    /**
     * @description Read plane data from map data
     * @private
     * @param {object} file The file object
     * @param {number} offset The starting position
     * @param {number} length The length of the plane data
     * @param {number} rle The RLE tag
     * @returns {array} The plane data
     */
    static readPlaneData(file, offset, length, rle) {
        file.position = offset;

        var expandedLength = FS.readUInt16(file),
            carmackData = FS.readBytes(file, length - 2),
            expandedData = Level.carmackExpand(carmackData, expandedLength);

        return Level.rlewExpand(expandedData.slice(1), 64 * 64 * 2, rle);
    }

    /**
     * @description Expand RLE data
     * @private
     * @param {array} source The source data
     * @param {number} length The length of the expanded data
     * @param {number} rlewtag The RLE tag
     * @returns {array} The expanded data
     */
    static rlewExpand(source, length, rlewtag) {
        var value,
            count,
            i,
            end, /* W16 */
            inptr = 0,
            outptr = 0,
            dest = [];

        end = outptr + (length >> 1);

        do {
            value = source[inptr++];
            if (value != rlewtag) {
                // uncompressed
                dest[outptr++] = value;
            } else {
                // compressed string
                count = source[inptr++];
                value = source[inptr++];
                for (i = 1; i <= count; ++i) {
                    dest[outptr++] = value;
                }
            }
        } while (outptr < end);

        return dest;
    }

    /**
     * @description Expand Carmackized data
     * @private
     * @param {array} source The source data
     * @param {number} length The length of the expanded data
     * @returns {array} The expanded data
     */
    static carmackExpand(source, length) {
        var NEARTAG = 0xA7,
            FARTAG = 0xA8;

        var chhigh, offset, /* W32 */
            copyptr, outptr, /* W16 */
            inptr, /* W8 */
            ch, count, /* W16 */
            dest;

        length /= 2;

        inptr = 0;
        outptr = 0;
        dest = [];

        function W16(b, i) {
            return b[i] + (b[i + 1] << 8);
        }

        while (length) {
            ch = source[inptr] + (source[inptr + 1] << 8);
            //ch = W16(source, inptr);
            inptr += 2;
            chhigh = ch >> 8;
            if (chhigh == NEARTAG) {
                count = ch & 0xff;
                if (!count) {
                    // have to insert a word containing the tag byte
                    ch |= source[inptr++];
                    dest[outptr++] = ch;
                    length--;
                } else {
                    offset = source[inptr++];
                    copyptr = outptr - offset;
                    length -= count;
                    while (count--) {
                        dest[outptr++] = dest[copyptr++];
                    }
                }
            } else if (chhigh == FARTAG) {
                count = ch & 0xff;
                if (!count) {
                    // have to insert a word containing the tag byte
                    ch |= source[inptr++];
                    dest[outptr++] = ch;
                    length--;
                } else {
                    offset = source[inptr] + (source[inptr + 1] << 8);
                    //offset = W16(source, inptr);
                    inptr += 2;
                    copyptr = offset;
                    length -= count;
                    while (count--) {
                        dest[outptr++] = dest[copyptr++];
                    }
                }
            } else {
                dest[outptr++] = ch;
                length--;
            }
        }
        return dest;
    }

    /**
     * @description Load level data
     * @param {string} filename The name of the level file.
     * @param {function} callback Called with the resulting level object.
     * @returns {object} The level object.
     */
    static load(filename, callback) {
        FS.open(filename, Maps.data, function (error, file) {
            var level;
            if (error) {
                callback(error);
            }
            try {
                level = Level.parseMapData(file);
            } catch (error) {
                callback(error);
                return;
            }
            callback(null, level);
        });
    }

    static reload(level) {
        return Level.parseMapData(level.file);
    }

    /**
     * @description Spawn an object in the level at the specified position.
     * @private
     * @param {object} level The level object.
     * @param {number} type The object type.
     * @param {number} x The x coordinate.
     * @param {number} y The y coordinate.
     */
    static spawnObj(level, type, x, y) {
        if (type >= 23 && type < 23 + Level.statinfo.length) { // static object
            Level.spawnStatic(level, type - 23, x, y);
            return;
        }

        switch (type) {
            case 0x13: // start N
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_90;
                break;
            case 0x14: // start E
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_0;
                break;
            case 0x15: // start S
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_270;
                break;
            case 0x16: // start W
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_180;
                break;
            case 0x5a: // turn E
                level.tileMap[x][y] |= Level.TILE_IS_E_TURN;//FIXME!
                break;
            case 0x5b: // turn NE
                level.tileMap[x][y] |= Level.TILE_IS_NE_TURN;//FIXME!
                break;
            case 0x5c: // turn N
                level.tileMap[x][y] |= Level.TILE_IS_N_TURN;//FIXME!
                break;
            case 0x5d: // turn NW
                level.tileMap[x][y] |= Level.TILE_IS_NW_TURN;//FIXME!
                break;
            case 0x5e: // turn W
                level.tileMap[x][y] |= Level.TILE_IS_W_TURN;//FIXME!
                break;
            case 0x5f: // turn SW
                level.tileMap[x][y] |= Level.TILE_IS_SW_TURN;//FIXME!
                break;
            case 0x60: // turn S
                level.tileMap[x][y] |= Level.TILE_IS_S_TURN;//FIXME!
                break;
            case 0x61: // turn SE
                level.tileMap[x][y] |= Level.TILE_IS_SE_TURN;//FIXME!
                break;
            case 0x62: // pushwall modifier
                level.tileMap[x][y] |= Level.SECRET_TILE;
                level.state.totalSecrets++;
                break;
            case 0x63: // Victory trigger
                level.tileMap[x][y] |= Level.EXIT_TILE;
                break;
            // spawn guards
        } // end of switch( type )

    }

    /**
     * @description Spawn a static object at the specified position.
     * @private
     * @param {object} level The level object.
     * @param {number} type The static object type.
     * @param {number} x The x coordinate.
     * @param {number} y The y coordinate.
     */
    static spawnStatic(level, type, x, y) {
        var sprite, pu;

        if (Level.statinfo[type].powerup == -1) {
            if (Level.statinfo[type].block) {    // blocking static
                level.tileMap[x][y] |= Level.BLOCK_TILE;
            } else {                    // dressing static
                level.tileMap[x][y] |= Level.DRESS_TILE;
            }

            sprite = Sprites.getNewSprite(level);
            if (!sprite) {
                return;
            }

            Sprites.setPos(level, sprite, Wolf.TILE2POS(x), Wolf.TILE2POS(y), 0);
            Sprites.setTex(level, sprite, 0, Sprites.SPR_STAT_0 + type);
        } else {
            pu = Level.statinfo[type].powerup;
            Powerups.spawn(level, x, y, pu);

            if (pu == Powerups.pow_cross || pu == Powerups.pow_chalice || pu == Powerups.pow_bible || pu == Powerups.pow_crown || pu == Powerups.pow_fullheal) {
                level.state.totalTreasure++; // FIXME: move this to Powerup_Spawn Function!
            }
        }
    }

    /**
     * @description Spawn all actors and mark down special places.
     * @param {object} level The level object.
     * @param {number} skill The difficulty level.
     */
    static scanInfoPlane(level, skill) {
        var x, y, tile;

        Level.cachedGuard = 0;
        Level.cachedOfficer = 0;
        Level.cachedSS = 0;
        Level.cachedDog = 0;
        Level.cachedMutant = 0;
        Level.progress_bar = 0;

        for (y = 0; y < 64; ++y) {
            for (x = 0; x < 64; ++x) {
                tile = level.plane2[(63 - y) * 64 + x];
                if (!tile) {
                    continue;
                }

                switch (tile) {
                    // guard
                    case 180:
                    case 181:
                    case 182:
                    case 183:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 144:
                    case 145:
                    case 146:
                    case 147:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 108:
                    case 109:
                    case 110:
                    case 111:
                        if (!Level.cachedGuard) {
                            Sprites.cacheTextures(Sprites.SPR_GRD_S_1, Sprites.SPR_GRD_SHOOT3);
                            Level.cachedGuard = 1;
                        }
                        Actors.spawnStand(level, skill, Actors.en_guard, x, y, tile - 108);
                        break;
                    case 184:
                    case 185:
                    case 186:
                    case 187:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 148:
                    case 149:
                    case 150:
                    case 151:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 112:
                    case 113:
                    case 114:
                    case 115:
                        if (!Level.cachedGuard) {
                            Sprites.cacheTextures(Sprites.SPR_GRD_S_1, Sprites.SPR_GRD_SHOOT3);
                            Level.cachedGuard = 1;
                        }
                        Actors.spawnPatrol(level, skill, Actors.en_guard, x, y, tile - 112);
                        break;
                    case 124:
                        Actors.spawnDeadGuard(level, skill, Actors.en_guard, x, y);
                        break;
                    // officer
                    case 188:
                    case 189:
                    case 190:
                    case 191:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 152:
                    case 153:
                    case 154:
                    case 155:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 116:
                    case 117:
                    case 118:
                    case 119:
                        if (!Level.cachedOfficer) {
                            Sprites.cacheTextures(Sprites.SPR_OFC_S_1, Sprites.SPR_OFC_SHOOT3);
                            Level.cachedOfficer = 1;
                        }
                        Actors.spawnStand(level, skill, Actors.en_officer, x, y, tile - 116);
                        break;
                    case 192:
                    case 193:
                    case 194:
                    case 195:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 156:
                    case 157:
                    case 158:
                    case 159:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 120:
                    case 121:
                    case 122:
                    case 123:
                        if (!Level.cachedOfficer) {
                            Sprites.cacheTextures(Sprites.SPR_OFC_S_1, Sprites.SPR_OFC_SHOOT3);
                            Level.cachedOfficer = 1;
                        }
                        Actors.spawnPatrol(level, skill, Actors.en_officer, x, y, tile - 120);
                        break;
                    // SS
                    case 198:
                    case 199:
                    case 200:
                    case 201:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 162:
                    case 163:
                    case 164:
                    case 165:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 126:
                    case 127:
                    case 128:
                    case 129:
                        if (!Level.cachedSS) {
                            Sprites.cacheTextures(Sprites.SPR_SS_S_1, Sprites.SPR_SS_SHOOT3);
                            Level.cachedSS = 1;
                        }
                        Actors.spawnStand(level, skill, Actors.en_ss, x, y, tile - 126);
                        break;
                    case 202:
                    case 203:
                    case 204:
                    case 205:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 166:
                    case 167:
                    case 168:
                    case 169:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 130:
                    case 131:
                    case 132:
                    case 133:
                        if (!Level.cachedSS) {
                            Sprites.cacheTextures(Sprites.SPR_SS_S_1, Sprites.SPR_SS_SHOOT3);
                            Level.cachedSS = 1;
                        }
                        Actors.spawnPatrol(level, skill, Actors.en_ss, x, y, tile - 130);
                        break;
                    // dogs
                    case 206:
                    case 207:
                    case 208:
                    case 209:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 170:
                    case 171:
                    case 172:
                    case 173:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 134:
                    case 135:
                    case 136:
                    case 137:
                        if (!Level.cachedDog) {
                            Sprites.cacheTextures(Sprites.SPR_DOG_W1_1, Sprites.SPR_DOG_JUMP3);
                            Level.cachedDog = 1;
                        }
                        Actors.spawnStand(level, skill, Actors.en_dog, x, y, tile - 134);
                        break;
                    case 210:
                    case 211:
                    case 212:
                    case 213:
                        if (skill < Game.gd_hard) {
                            break;
                        }
                        tile -= 36;
                    case 174:
                    case 175:
                    case 176:
                    case 177:
                        if (skill < Game.gd_medium) {
                            break;
                        }
                        tile -= 36;
                    case 138:
                    case 139:
                    case 140:
                    case 141:
                        if (!Level.cachedDog) {
                            Sprites.cacheTextures(Sprites.SPR_DOG_W1_1, Sprites.SPR_DOG_JUMP3);
                            Level.cachedDog = 1;
                        }
                        Actors.spawnPatrol(level, skill, Actors.en_dog, x, y, tile - 138);
                        break;
                    // bosses
                    case 214:
                        Sprites.cacheTextures(Sprites.SPR_BOSS_W1, Sprites.SPR_BOSS_DIE3);
                        Actors.spawnBoss(level, skill, Actors.en_boss, x, y);
                        break;
                    case 197:
                        Sprites.cacheTextures(Sprites.SPR_GRETEL_W1, Sprites.SPR_GRETEL_DIE3);
                        Actors.spawnBoss(level, skill, Actors.en_gretel, x, y);
                        break;
                    case 215:
                        Sprites.cacheTextures(Sprites.SPR_GIFT_W1, Sprites.SPR_GIFT_DEAD);
                        Actors.spawnBoss(level, skill, Actors.en_gift, x, y);
                        break;
                    case 179:
                        Sprites.cacheTextures(Sprites.SPR_FAT_W1, Sprites.SPR_FAT_DEAD);
                        Actors.spawnBoss(level, skill, Actors.en_fat, x, y);
                        break;
                    case 196:
                        Sprites.cacheTextures(Sprites.SPR_SCHABB_W1, Sprites.SPR_HYPO4);
                        Actors.spawnBoss(level, skill, Actors.en_schabbs, x, y);
                        break;
                    case 160:
                        Sprites.cacheTextures(Sprites.SPR_FAKE_W1, Sprites.SPR_FAKE_DEAD);
                        Actors.spawnBoss(level, skill, Actors.en_fake, x, y);
                        break;
                    case 178:
                        Sprites.cacheTextures(Sprites.SPR_MECHA_W1, Sprites.SPR_HITLER_DIE7);
                        Actors.spawnBoss(level, skill, Actors.en_mecha, x, y);
                        break;
                    // Spear
                    case 106:
                        Sprites.cacheTextures(Sprites.SPR_SPECTRE_W1, Sprites.SPR_SPECTRE_F4);
                        Actors.spawnBoss(level, skill, Actors.en_spectre, x, y);
                        break;
                    case 107:
                        Sprites.cacheTextures(Sprites.SPR_ANGEL_W1, Sprites.SPR_ANGEL_DEAD);
                        Actors.spawnBoss(level, skill, Actors.en_angel, x, y);
                        break;
                    case 125:
                        Sprites.cacheTextures(Sprites.SPR_TRANS_W1, Sprites.SPR_TRANS_DIE3);
                        Actors.spawnBoss(level, skill, Actors.en_trans, x, y);
                        break;
                    case 142:
                        Sprites.cacheTextures(Sprites.SPR_UBER_W1, Sprites.SPR_UBER_DEAD);
                        Actors.spawnBoss(level, skill, olf.en_uber, x, y);
                        break;
                    case 143:
                        Sprites.cacheTextures(Sprites.SPR_WILL_W1, Sprites.SPR_WILL_DEAD);
                        Actors.spawnBoss(level, skill, Actors.en_will, x, y);
                        break;
                    case 161:
                        Sprites.cacheTextures(Sprites.SPR_DEATH_W1, Sprites.SPR_DEATH_DEAD);
                        Actors.spawnBoss(level, skill, Actors.en_death, x, y);
                        break;
                    // mutants
                    case 252:
                    case 253:
                    case 254:
                    case 255:
                        if (skill < Game.gd_hard)
                            break;
                        tile -= 18;
                    case 234:
                    case 235:
                    case 236:
                    case 237:
                        if (skill < Game.gd_medium)
                            break;
                        tile -= 18;
                    case 216:
                    case 217:
                    case 218:
                    case 219:
                        if (!Level.cachedMutant) {
                            Sprites.cacheTextures(Sprites.SPR_MUT_S_1, Sprites.SPR_MUT_SHOOT4);
                            Level.cachedMutant = 1;
                        }
                        Actors.spawnStand(level, skill, Actors.en_mutant, x, y, tile - 216);
                        break;
                    case 256:
                    case 257:
                    case 258:
                    case 259:
                        if (skill < Game.gd_hard)
                            break;
                        tile -= 18;
                    case 238:
                    case 239:
                    case 240:
                    case 241:
                        if (skill < Game.gd_medium)
                            break;
                        tile -= 18;
                    case 220:
                    case 221:
                    case 222:
                    case 223:
                        if (!Level.cachedMutant) {
                            Sprites.cacheTextures(Sprites.SPR_MUT_S_1, Sprites.SPR_MUT_SHOOT4);
                            Level.cachedMutant = 1;
                        }
                        Actors.spawnPatrol(level, skill, Actors.en_mutant, x, y, tile - 220);
                        break;
                    // ghosts
                    case 224:
                        Sprites.cacheTextures(Sprites.SPR_BLINKY_W1, Sprites.SPR_BLINKY_W2);
                        Actors.spawnGhosts(level, skill, Actors.en_blinky, x, y);
                        break;
                    case 225:
                        Sprites.cacheTextures(Sprites.SPR_PINKY_W1, Sprites.SPR_PINKY_W2);
                        Actors.spawnGhosts(level, skill, Actors.en_clyde, x, y);
                        break;
                    case 226:
                        Sprites.cacheTextures(Sprites.SPR_CLYDE_W1, Sprites.SPR_CLYDE_W2);
                        Actors.spawnGhosts(level, skill, Actors.en_pinky, x, y);
                        break;
                    case 227:
                        Sprites.cacheTextures(Sprites.SPR_INKY_W1, Sprites.SPR_INKY_W2);
                        Actors.spawnGhosts(level, skill, Actors.en_inky, x, y);
                        break;
                }
            }
        }
    }

    /**
     * @description Check if there is a clear line of sight between 2 points.
     * @param {number} x1 The x coordinate of point 1.
     * @param {number} y1 The y coordinate of point 1.
     * @param {number} x2 The x coordinate of point 2.
     * @param {number} y2 The y coordinate of point 2.
     * @param {object} level The level object.
     * @returns {boolean} True if a straight line between 2 points is unobstructed, otherwise false.
     */
    static checkLine(x1, y1, x2, y2, level) {
        var xt1, yt1, xt2, yt2, /* tile positions */
            x, y,               /* current point in !tiles! */
            xdist, ydist,
            xstep, ystep,       /* Step value for each whole xy */

            deltafrac,          /* current point in !1/256 of tile! */

            frac,               /* Fractional xy stepper */

            partial,            /* how much to move in our direction to border */
            intercept,          /* Temp for door code */

            FRACBITS = 8;       /* Number of bits of fraction */

        // get start & end tiles
        xt1 = x1 >> Wolf.TILESHIFT;
        yt1 = y1 >> Wolf.TILESHIFT;

        xt2 = x2 >> Wolf.TILESHIFT;
        yt2 = y2 >> Wolf.TILESHIFT;

        xdist = Math.abs(xt2 - xt1); // X distance in tiles
        ydist = Math.abs(yt2 - yt1); // Y distance in tiles

        // 1/256 tile precision (TILESHIFT is 16)
        x1 >>= FRACBITS;
        y1 >>= FRACBITS;
        x2 >>= FRACBITS;
        y2 >>= FRACBITS;

        if (xdist) { // always positive check only for 0
            if (xt2 > xt1) {
                partial = 256 - (x1 & 0xff);
                xstep = 1;
            } else {
                partial = x1 & 0xff;
                xstep = -1;
            }

            deltafrac = Math.abs(x2 - x1);
            ystep = ((y2 - y1) << FRACBITS) / deltafrac;
            frac = y1 + ((ystep * partial) >> FRACBITS);

            x = xt1 + xstep;
            xt2 += xstep;
            do {
                y = frac >> FRACBITS;
                frac += ystep;

                // assert( x >= 0 && x < 64 && y >= 0 && y < 64 );
                if (level.tileMap[x][y] & Level.WALL_TILE) {
                    return false; // Wall is in path quitting!
                }

                if (level.tileMap[x][y] & Level.DOOR_TILE) {
                    // door, see if the door is open enough
                    if (level.state.doorMap[x][y].action != Doors.dr_open) {
                        if (level.state.doorMap[x][y].action == Doors.dr_closed) {
                            return false;
                        }
                        // checking vertical doors in action: ->_I_
                        intercept = ((frac - ystep / 2) & 0xFF) >> 4; // 1/64 of tile
                        if (intercept < (63 - level.state.doorMap[x][y].ticcount)) {
                            return false;
                        }
                    }
                }
                x += xstep;
            } while (x != xt2);
        }

        if (ydist) { // always positive check only for 0
            if (yt2 > yt1) {
                partial = 256 - (y1 & 0xff);
                ystep = 1;
            } else {
                partial = y1 & 0xff;
                ystep = -1;
            }

            deltafrac = Math.abs(y2 - y1);
            xstep = ((x2 - x1) << FRACBITS) / deltafrac;
            frac = x1 + ((xstep * partial) >> FRACBITS);

            y = yt1 + ystep;
            yt2 += ystep;
            do {
                x = frac >> FRACBITS;
                frac += xstep;

                //assert( x >= 0 && x < 64 && y >= 0 && y < 64 );
                if (level.tileMap[x][y] & Level.WALL_TILE) {
                    return false; // Wall is in path quitting!
                }

                if (level.tileMap[x][y] & Level.DOOR_TILE) {
                    // door, see if the door is open enough
                    if (level.state.doorMap[x][y].action != Doors.dr_open) {
                        if (level.state.doorMap[x][y].action == Doors.dr_closed) {
                            return false;
                        }
                        // checking vertical doors in action: ->_I_
                        intercept = ((frac - xstep / 2) & 0xFF) >> 4; // 1/64 of tile
                        if (intercept < level.state.doorMap[x][y].ticcount) {
                            return false;
                        }
                    }
                }
                y += ystep;
            } while (y != yt2);
        }
        return true;
    }
}

Level.init();
