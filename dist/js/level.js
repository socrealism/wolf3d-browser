"use strict";
class Level {
}
Level.WALL_TILE = 1;
Level.PUSHWALL_TILE = (1 << 20);
Level.DOOR_TILE = 2;
Level.SECRET_TILE = 4;
Level.DRESS_TILE = 8;
Level.BLOCK_TILE = 16;
Level.ACTOR_TILE = 32;
Level.DEADACTOR_TILE = 64;
Level.POWERUP_TILE = 128;
Level.AMBUSH_TILE = 256;
Level.EXIT_TILE = 512;
Level.SECRETLEVEL_TILE = 1024;
Level.ELEVATOR_TILE = (1 << 11);
Level.MAPHEADER_SIZE = 49;
Level.MAP_SIGNATURE = 0x21444921;
Level.TILE_IS_E_TURN = (1 << 12);
Level.TILE_IS_NE_TURN = (1 << 13);
Level.TILE_IS_N_TURN = (1 << 14);
Level.TILE_IS_NW_TURN = (1 << 15);
Level.TILE_IS_W_TURN = (1 << 16);
Level.TILE_IS_SW_TURN = (1 << 17);
Level.TILE_IS_S_TURN = (1 << 18);
Level.TILE_IS_SE_TURN = (1 << 19);
Level.MAX_POWERUPS = 1000;
Wolf.Level = (function () {
    Wolf.setConsts({
        WALL_TILE: 1,
        PUSHWALL_TILE: (1 << 20),
        DOOR_TILE: 2,
        SECRET_TILE: 4,
        DRESS_TILE: 8,
        BLOCK_TILE: 16,
        ACTOR_TILE: 32,
        DEADACTOR_TILE: 64,
        POWERUP_TILE: 128,
        AMBUSH_TILE: 256,
        EXIT_TILE: 512,
        SECRETLEVEL_TILE: 1024,
        ELEVATOR_TILE: (1 << 11),
        MAPHEADER_SIZE: 49,
        MAP_SIGNATURE: 0x21444921,
        TILE_IS_E_TURN: (1 << 12),
        TILE_IS_NE_TURN: (1 << 13),
        TILE_IS_N_TURN: (1 << 14),
        TILE_IS_NW_TURN: (1 << 15),
        TILE_IS_W_TURN: (1 << 16),
        TILE_IS_SW_TURN: (1 << 17),
        TILE_IS_S_TURN: (1 << 18),
        TILE_IS_SE_TURN: (1 << 19),
        MAX_POWERUPS: 1000
    });
    Wolf.setConsts({
        SOLID_TILE: (Wolf.WALL_TILE | Wolf.BLOCK_TILE | Wolf.PUSHWALL_TILE),
        BLOCKS_MOVE_TILE: (Wolf.WALL_TILE | Wolf.BLOCK_TILE | Wolf.PUSHWALL_TILE | Wolf.ACTOR_TILE),
        WAYPOINT_TILE: (Wolf.TILE_IS_E_TURN | Wolf.TILE_IS_NE_TURN | Wolf.TILE_IS_N_TURN | Wolf.TILE_IS_NW_TURN |
            Wolf.TILE_IS_W_TURN | Wolf.TILE_IS_SW_TURN | Wolf.TILE_IS_S_TURN | Wolf.TILE_IS_SE_TURN)
    });
    var statinfo = [
        [false, -1],
        [true, -1],
        [true, -1],
        [true, -1],
        [false, -1],
        [true, -1],
        [false, Wolf.pow_alpo],
        [true, -1],
        [true, -1],
        [false, -1],
        [true, -1],
        [true, -1],
        [true, -1],
        [true, -1],
        [false, -1],
        [false, -1],
        [true, -1],
        [true, -1],
        [true, -1],
        [false, -1],
        [false, Wolf.pow_key1],
        [false, Wolf.pow_key2],
        [true, -1],
        [false, -1],
        [false, Wolf.pow_food],
        [false, Wolf.pow_firstaid],
        [false, Wolf.pow_clip],
        [false, Wolf.pow_machinegun],
        [false, Wolf.pow_chaingun],
        [false, Wolf.pow_cross],
        [false, Wolf.pow_chalice],
        [false, Wolf.pow_bible],
        [false, Wolf.pow_crown],
        [false, Wolf.pow_fullheal],
        [false, Wolf.pow_gibs],
        [true, -1],
        [true, -1],
        [true, -1],
        [false, Wolf.pow_gibs],
        [true, -1],
        [true, -1],
        [false, -1],
        [false, -1],
        [false, -1],
        [false, -1],
        [true, -1],
        [true, -1],
        [false, -1]
    ];
    for (var i = 0; i < statinfo.length; i++) {
        var info = {
            idx: i,
            block: statinfo[i][0],
            powerup: statinfo[i][1]
        };
        statinfo[i] = info;
    }
    function newLevel() {
        return {
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
            levelName: "",
            mapName: "",
            nextMap: "",
            music: "",
            state: {
                framenum: 0,
                time: 0,
                levelCompleted: 0,
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
    function parseMapData(file) {
        var level = newLevel(), length, offset, mapNameLength, musicNameLength, x, y, y0, layer1, layer2, layer3;
        file.position = 0;
        level.file = file;
        if (file.size < Wolf.MAPHEADER_SIZE) {
            throw new Error("Map file size is smaller than mapheader size");
        }
        if (FS.readUInt32(file) != Wolf.MAP_SIGNATURE) {
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
        file.position += 4;
        level.sParTime = FS.readString(file, 5);
        if (file.size < (Wolf.MAPHEADER_SIZE + mapNameLength + musicNameLength + length[0] + length[1] + length[2])) {
            throw new Error("filesize is less than MAPHEADER_SIZE + mapNameLength + musicNameLength + etc");
        }
        level.levelName = level.mapName = FS.readString(file, mapNameLength);
        level.music = FS.readString(file, musicNameLength);
        level.plane1 = readPlaneData(file, offset[0], length[0], rle);
        level.plane2 = readPlaneData(file, offset[1], length[1], rle);
        level.plane3 = readPlaneData(file, offset[2], length[2], rle);
        Wolf.Doors.reset(level);
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
                if (layer2) {
                    spawnObj(level, layer2, x, y);
                }
                if (layer1 == 0) {
                    level.areas[x][y] = -3;
                }
                else if (layer1 < 0x6a) {
                    if ((layer1 >= 0x5A && layer1 <= 0x5F) || layer1 == 0x64 || layer1 == 0x65) {
                        level.tileMap[x][y] |= Wolf.DOOR_TILE;
                        Wolf.Doors.spawn(level, x, y, layer1);
                        level.areas[x][y] = -2;
                    }
                    else {
                        level.tileMap[x][y] |= Wolf.WALL_TILE;
                        level.wallTexX[x][y] = (layer1 - 1) * 2 + 1;
                        level.wallTexY[x][y] = (layer1 - 1) * 2;
                        level.areas[x][y] = -1;
                        if (layer1 == 0x15) {
                            level.tileMap[x][y] |= Wolf.ELEVATOR_TILE;
                        }
                    }
                }
                else if (layer1 == 0x6a) {
                    level.tileMap[x][y] |= Wolf.AMBUSH_TILE;
                    level.areas[x][y] = -3;
                }
                else if (layer1 >= Wolf.FIRSTAREA && layer1 < (Wolf.FIRSTAREA + Wolf.NUMAREAS)) {
                    if (layer1 == Wolf.FIRSTAREA) {
                        level.tileMap[x][y] |= Wolf.SECRETLEVEL_TILE;
                    }
                    level.areas[x][y] = layer1 - Wolf.FIRSTAREA;
                }
                else {
                    level.areas[x][y] = -3;
                }
            }
        }
        for (x = 1; x < 63; x++) {
            for (y = 1; y < 63; y++) {
                if (level.areas[x][y] != -3) {
                    continue;
                }
                if (level.areas[x - 1][y] >= 0) {
                    level.areas[x][y] = level.areas[x - 1][y];
                }
                else if (level.areas[x + 1][y] >= 0) {
                    level.areas[x][y] = level.areas[x + 1][y];
                }
                else if (level.areas[x][y - 1] >= 0) {
                    level.areas[x][y] = level.areas[x][y - 1];
                }
                else if (level.areas[x + 1][y + 1] >= 0) {
                    level.areas[x][y] = level.areas[x][y + 1];
                }
            }
        }
        Wolf.Doors.setAreas(level);
        return level;
    }
    function readPlaneData(file, offset, length, rle) {
        file.position = offset;
        var expandedLength = FS.readUInt16(file), carmackData = FS.readBytes(file, length - 2), expandedData = carmackExpand(carmackData, expandedLength);
        return rlewExpand(expandedData.slice(1), 64 * 64 * 2, rle);
    }
    function rlewExpand(source, length, rlewtag) {
        var value, count, i, end, inptr = 0, outptr = 0, dest = [];
        end = outptr + (length >> 1);
        do {
            value = source[inptr++];
            if (value != rlewtag) {
                dest[outptr++] = value;
            }
            else {
                count = source[inptr++];
                value = source[inptr++];
                for (i = 1; i <= count; ++i) {
                    dest[outptr++] = value;
                }
            }
        } while (outptr < end);
        return dest;
    }
    function carmackExpand(source, length) {
        var NEARTAG = 0xA7, FARTAG = 0xA8;
        var chhigh, offset, copyptr, outptr, inptr, ch, count, dest;
        length /= 2;
        inptr = 0;
        outptr = 0;
        dest = [];
        function W16(b, i) {
            return b[i] + (b[i + 1] << 8);
        }
        while (length) {
            ch = source[inptr] + (source[inptr + 1] << 8);
            inptr += 2;
            chhigh = ch >> 8;
            if (chhigh == NEARTAG) {
                count = ch & 0xff;
                if (!count) {
                    ch |= source[inptr++];
                    dest[outptr++] = ch;
                    length--;
                }
                else {
                    offset = source[inptr++];
                    copyptr = outptr - offset;
                    length -= count;
                    while (count--) {
                        dest[outptr++] = dest[copyptr++];
                    }
                }
            }
            else if (chhigh == FARTAG) {
                count = ch & 0xff;
                if (!count) {
                    ch |= source[inptr++];
                    dest[outptr++] = ch;
                    length--;
                }
                else {
                    offset = source[inptr] + (source[inptr + 1] << 8);
                    inptr += 2;
                    copyptr = offset;
                    length -= count;
                    while (count--) {
                        dest[outptr++] = dest[copyptr++];
                    }
                }
            }
            else {
                dest[outptr++] = ch;
                length--;
            }
        }
        return dest;
    }
    function load(filename, callback) {
        FS.open(filename, Wolf.MapData, function (error, file) {
            var level;
            if (error) {
                callback(error);
            }
            try {
                level = parseMapData(file);
            }
            catch (error) {
                callback(error);
                return;
            }
            callback(null, level);
        });
    }
    function reload(level) {
        return parseMapData(level.file);
    }
    function spawnObj(level, type, x, y) {
        if (type >= 23 && type < 23 + statinfo.length) {
            spawnStatic(level, type - 23, x, y);
            return;
        }
        switch (type) {
            case 0x13:
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_90;
                break;
            case 0x14:
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_0;
                break;
            case 0x15:
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_270;
                break;
            case 0x16:
                level.spawn.x = Wolf.TILE2POS(x);
                level.spawn.y = Wolf.TILE2POS(y);
                level.spawn.angle = Wolf.ANG_180;
                break;
            case 0x5a:
                level.tileMap[x][y] |= Wolf.TILE_IS_E_TURN;
                break;
            case 0x5b:
                level.tileMap[x][y] |= Wolf.TILE_IS_NE_TURN;
                break;
            case 0x5c:
                level.tileMap[x][y] |= Wolf.TILE_IS_N_TURN;
                break;
            case 0x5d:
                level.tileMap[x][y] |= Wolf.TILE_IS_NW_TURN;
                break;
            case 0x5e:
                level.tileMap[x][y] |= Wolf.TILE_IS_W_TURN;
                break;
            case 0x5f:
                level.tileMap[x][y] |= Wolf.TILE_IS_SW_TURN;
                break;
            case 0x60:
                level.tileMap[x][y] |= Wolf.TILE_IS_S_TURN;
                break;
            case 0x61:
                level.tileMap[x][y] |= Wolf.TILE_IS_SE_TURN;
                break;
            case 0x62:
                level.tileMap[x][y] |= Wolf.SECRET_TILE;
                level.state.totalSecrets++;
                break;
            case 0x63:
                level.tileMap[x][y] |= Wolf.EXIT_TILE;
                break;
        }
    }
    function spawnStatic(level, type, x, y) {
        var sprite, pu;
        if (statinfo[type].powerup == -1) {
            if (statinfo[type].block) {
                level.tileMap[x][y] |= Wolf.BLOCK_TILE;
            }
            else {
                level.tileMap[x][y] |= Wolf.DRESS_TILE;
            }
            sprite = Wolf.Sprites.getNewSprite(level);
            if (!sprite) {
                return;
            }
            Wolf.Sprites.setPos(level, sprite, Wolf.TILE2POS(x), Wolf.TILE2POS(y), 0);
            Wolf.Sprites.setTex(level, sprite, 0, Wolf.SPR_STAT_0 + type);
        }
        else {
            pu = statinfo[type].powerup;
            Wolf.Powerups.spawn(level, x, y, pu);
            if (pu == Wolf.pow_cross || pu == Wolf.pow_chalice || pu == Wolf.pow_bible || pu == Wolf.pow_crown || pu == Wolf.pow_fullheal) {
                level.state.totalTreasure++;
            }
        }
    }
    var cachedGuard = 0, cachedOfficer = 0, cachedSS = 0, cachedDog = 0, cachedMutant = 0, progress_bar = 0;
    function scanInfoPlane(level, skill) {
        var x, y, tile;
        cachedGuard = 0;
        cachedOfficer = 0;
        cachedSS = 0;
        cachedDog = 0;
        cachedMutant = 0;
        progress_bar = 0;
        for (y = 0; y < 64; ++y) {
            for (x = 0; x < 64; ++x) {
                tile = level.plane2[(63 - y) * 64 + x];
                if (!tile) {
                    continue;
                }
                switch (tile) {
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
                        if (!cachedGuard) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_GRD_S_1, Wolf.SPR_GRD_SHOOT3);
                            cachedGuard = 1;
                        }
                        Wolf.Actors.spawnStand(level, skill, Wolf.en_guard, x, y, tile - 108);
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
                        if (!cachedGuard) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_GRD_S_1, Wolf.SPR_GRD_SHOOT3);
                            cachedGuard = 1;
                        }
                        Wolf.Actors.spawnPatrol(level, skill, Wolf.en_guard, x, y, tile - 112);
                        break;
                    case 124:
                        Wolf.Actors.spawnDeadGuard(level, skill, Wolf.en_guard, x, y);
                        break;
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
                        if (!cachedOfficer) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_OFC_S_1, Wolf.SPR_OFC_SHOOT3);
                            cachedOfficer = 1;
                        }
                        Wolf.Actors.spawnStand(level, skill, Wolf.en_officer, x, y, tile - 116);
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
                        if (!cachedOfficer) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_OFC_S_1, Wolf.SPR_OFC_SHOOT3);
                            cachedOfficer = 1;
                        }
                        Wolf.Actors.spawnPatrol(level, skill, Wolf.en_officer, x, y, tile - 120);
                        break;
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
                        if (!cachedSS) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_SS_S_1, Wolf.SPR_SS_SHOOT3);
                            cachedSS = 1;
                        }
                        Wolf.Actors.spawnStand(level, skill, Wolf.en_ss, x, y, tile - 126);
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
                        if (!cachedSS) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_SS_S_1, Wolf.SPR_SS_SHOOT3);
                            cachedSS = 1;
                        }
                        Wolf.Actors.spawnPatrol(level, skill, Wolf.en_ss, x, y, tile - 130);
                        break;
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
                        if (!cachedDog) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_DOG_W1_1, Wolf.SPR_DOG_JUMP3);
                            cachedDog = 1;
                        }
                        Wolf.Actors.spawnStand(level, skill, Wolf.en_dog, x, y, tile - 134);
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
                        if (!cachedDog) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_DOG_W1_1, Wolf.SPR_DOG_JUMP3);
                            cachedDog = 1;
                        }
                        Wolf.Actors.spawnPatrol(level, skill, Wolf.en_dog, x, y, tile - 138);
                        break;
                    case 214:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_BOSS_W1, Wolf.SPR_BOSS_DIE3);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_boss, x, y);
                        break;
                    case 197:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_GRETEL_W1, Wolf.SPR_GRETEL_DIE3);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_gretel, x, y);
                        break;
                    case 215:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_GIFT_W1, Wolf.SPR_GIFT_DEAD);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_gift, x, y);
                        break;
                    case 179:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_FAT_W1, Wolf.SPR_FAT_DEAD);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_fat, x, y);
                        break;
                    case 196:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_SCHABB_W1, Wolf.SPR_HYPO4);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_schabbs, x, y);
                        break;
                    case 160:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_FAKE_W1, Wolf.SPR_FAKE_DEAD);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_fake, x, y);
                        break;
                    case 178:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_MECHA_W1, Wolf.SPR_HITLER_DIE7);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_mecha, x, y);
                        break;
                    case 106:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_SPECTRE_W1, Wolf.SPR_SPECTRE_F4);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_spectre, x, y);
                        break;
                    case 107:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_ANGEL_W1, Wolf.SPR_ANGEL_DEAD);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_angel, x, y);
                        break;
                    case 125:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_TRANS_W1, Wolf.SPR_TRANS_DIE3);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_trans, x, y);
                        break;
                    case 142:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_UBER_W1, Wolf.SPR_UBER_DEAD);
                        Wolf.Actors.spawnBoss(level, skill, olf.en_uber, x, y);
                        break;
                    case 143:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_WILL_W1, Wolf.SPR_WILL_DEAD);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_will, x, y);
                        break;
                    case 161:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_DEATH_W1, Wolf.SPR_DEATH_DEAD);
                        Wolf.Actors.spawnBoss(level, skill, Wolf.en_death, x, y);
                        break;
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
                        if (!cachedMutant) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_MUT_S_1, Wolf.SPR_MUT_SHOOT4);
                            cachedMutant = 1;
                        }
                        Wolf.Actors.spawnStand(level, skill, Wolf.en_mutant, x, y, tile - 216);
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
                        if (!cachedMutant) {
                            Wolf.Sprites.cacheTextures(Wolf.SPR_MUT_S_1, Wolf.SPR_MUT_SHOOT4);
                            cachedMutant = 1;
                        }
                        Wolf.Actors.spawnPatrol(level, skill, Wolf.en_mutant, x, y, tile - 220);
                        break;
                    case 224:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_BLINKY_W1, Wolf.SPR_BLINKY_W2);
                        Wolf.Actors.spawnGhosts(level, skill, Wolf.en_blinky, x, y);
                        break;
                    case 225:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_PINKY_W1, Wolf.SPR_PINKY_W2);
                        Wolf.Actors.spawnGhosts(level, skill, Wolf.en_clyde, x, y);
                        break;
                    case 226:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_CLYDE_W1, Wolf.SPR_CLYDE_W2);
                        Wolf.Actors.spawnGhosts(level, skill, Wolf.en_pinky, x, y);
                        break;
                    case 227:
                        Wolf.Sprites.cacheTextures(Wolf.SPR_INKY_W1, Wolf.SPR_INKY_W2);
                        Wolf.Actors.spawnGhosts(level, skill, Wolf.en_inky, x, y);
                        break;
                }
            }
        }
    }
    function checkLine(x1, y1, x2, y2, level) {
        var xt1, yt1, xt2, yt2, x, y, xdist, ydist, xstep, ystep, deltafrac, frac, partial, intercept, FRACBITS = 8;
        xt1 = x1 >> Wolf.TILESHIFT;
        yt1 = y1 >> Wolf.TILESHIFT;
        xt2 = x2 >> Wolf.TILESHIFT;
        yt2 = y2 >> Wolf.TILESHIFT;
        xdist = Math.abs(xt2 - xt1);
        ydist = Math.abs(yt2 - yt1);
        x1 >>= FRACBITS;
        y1 >>= FRACBITS;
        x2 >>= FRACBITS;
        y2 >>= FRACBITS;
        if (xdist) {
            if (xt2 > xt1) {
                partial = 256 - (x1 & 0xff);
                xstep = 1;
            }
            else {
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
                if (level.tileMap[x][y] & Wolf.WALL_TILE) {
                    return false;
                }
                if (level.tileMap[x][y] & Wolf.DOOR_TILE) {
                    if (level.state.doorMap[x][y].action != Wolf.dr_open) {
                        if (level.state.doorMap[x][y].action == Wolf.dr_closed) {
                            return false;
                        }
                        intercept = ((frac - ystep / 2) & 0xFF) >> 4;
                        if (intercept < (63 - level.state.doorMap[x][y].ticcount)) {
                            return false;
                        }
                    }
                }
                x += xstep;
            } while (x != xt2);
        }
        if (ydist) {
            if (yt2 > yt1) {
                partial = 256 - (y1 & 0xff);
                ystep = 1;
            }
            else {
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
                if (level.tileMap[x][y] & Wolf.WALL_TILE) {
                    return false;
                }
                if (level.tileMap[x][y] & Wolf.DOOR_TILE) {
                    if (level.state.doorMap[x][y].action != Wolf.dr_open) {
                        if (level.state.doorMap[x][y].action == Wolf.dr_closed) {
                            return false;
                        }
                        intercept = ((frac - xstep / 2) & 0xFF) >> 4;
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
    return {
        load: load,
        reload: reload,
        scanInfoPlane: scanInfoPlane,
        checkLine: checkLine
    };
})();
