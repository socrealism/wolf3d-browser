"use strict";
class Level {
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
    static newLevel() {
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
    static parseMapData(file) {
        var level = Level.newLevel(), length, offset, mapNameLength, musicNameLength, x, y, y0, layer1, layer2, layer3;
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
        file.position += 4;
        level.sParTime = FS.readString(file, 5);
        if (file.size < (Level.MAPHEADER_SIZE + mapNameLength + musicNameLength + length[0] + length[1] + length[2])) {
            throw new Error("filesize is less than MAPHEADER_SIZE + mapNameLength + musicNameLength + etc");
        }
        level.levelName = level.mapName = FS.readString(file, mapNameLength);
        level.music = FS.readString(file, musicNameLength);
        level.plane1 = Level.readPlaneData(file, offset[0], length[0], rle);
        level.plane2 = Level.readPlaneData(file, offset[1], length[1], rle);
        level.plane3 = Level.readPlaneData(file, offset[2], length[2], rle);
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
                if (layer2) {
                    Level.spawnObj(level, layer2, x, y);
                }
                if (layer1 == 0) {
                    level.areas[x][y] = -3;
                }
                else if (layer1 < 0x6a) {
                    if ((layer1 >= 0x5A && layer1 <= 0x5F) || layer1 == 0x64 || layer1 == 0x65) {
                        level.tileMap[x][y] |= Level.DOOR_TILE;
                        Doors.spawn(level, x, y, layer1);
                        level.areas[x][y] = -2;
                    }
                    else {
                        level.tileMap[x][y] |= Level.WALL_TILE;
                        level.wallTexX[x][y] = (layer1 - 1) * 2 + 1;
                        level.wallTexY[x][y] = (layer1 - 1) * 2;
                        level.areas[x][y] = -1;
                        if (layer1 == 0x15) {
                            level.tileMap[x][y] |= Level.ELEVATOR_TILE;
                        }
                    }
                }
                else if (layer1 == 0x6a) {
                    level.tileMap[x][y] |= Level.AMBUSH_TILE;
                    level.areas[x][y] = -3;
                }
                else if (layer1 >= Wolf.FIRSTAREA && layer1 < (Wolf.FIRSTAREA + Wolf.NUMAREAS)) {
                    if (layer1 == Wolf.FIRSTAREA) {
                        level.tileMap[x][y] |= Level.SECRETLEVEL_TILE;
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
        Doors.setAreas(level);
        return level;
    }
    static readPlaneData(file, offset, length, rle) {
        file.position = offset;
        var expandedLength = FS.readUInt16(file), carmackData = FS.readBytes(file, length - 2), expandedData = Level.carmackExpand(carmackData, expandedLength);
        return Level.rlewExpand(expandedData.slice(1), 64 * 64 * 2, rle);
    }
    static rlewExpand(source, length, rlewtag) {
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
    static carmackExpand(source, length) {
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
    static load(filename, callback) {
        FS.open(filename, Maps.data, function (error, file) {
            var level;
            if (error) {
                callback(error);
            }
            try {
                level = Level.parseMapData(file);
            }
            catch (error) {
                callback(error);
                return;
            }
            callback(null, level);
        });
    }
    static reload(level) {
        return Level.parseMapData(level.file);
    }
    static spawnObj(level, type, x, y) {
        if (type >= 23 && type < 23 + Level.statinfo.length) {
            Level.spawnStatic(level, type - 23, x, y);
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
                level.tileMap[x][y] |= Level.TILE_IS_E_TURN;
                break;
            case 0x5b:
                level.tileMap[x][y] |= Level.TILE_IS_NE_TURN;
                break;
            case 0x5c:
                level.tileMap[x][y] |= Level.TILE_IS_N_TURN;
                break;
            case 0x5d:
                level.tileMap[x][y] |= Level.TILE_IS_NW_TURN;
                break;
            case 0x5e:
                level.tileMap[x][y] |= Level.TILE_IS_W_TURN;
                break;
            case 0x5f:
                level.tileMap[x][y] |= Level.TILE_IS_SW_TURN;
                break;
            case 0x60:
                level.tileMap[x][y] |= Level.TILE_IS_S_TURN;
                break;
            case 0x61:
                level.tileMap[x][y] |= Level.TILE_IS_SE_TURN;
                break;
            case 0x62:
                level.tileMap[x][y] |= Level.SECRET_TILE;
                level.state.totalSecrets++;
                break;
            case 0x63:
                level.tileMap[x][y] |= Level.EXIT_TILE;
                break;
        }
    }
    static spawnStatic(level, type, x, y) {
        var sprite, pu;
        if (Level.statinfo[type].powerup == -1) {
            if (Level.statinfo[type].block) {
                level.tileMap[x][y] |= Level.BLOCK_TILE;
            }
            else {
                level.tileMap[x][y] |= Level.DRESS_TILE;
            }
            sprite = Sprites.getNewSprite(level);
            if (!sprite) {
                return;
            }
            Sprites.setPos(level, sprite, Wolf.TILE2POS(x), Wolf.TILE2POS(y), 0);
            Sprites.setTex(level, sprite, 0, Sprites.SPR_STAT_0 + type);
        }
        else {
            pu = Level.statinfo[type].powerup;
            Powerups.spawn(level, x, y, pu);
            if (pu == Powerups.pow_cross || pu == Powerups.pow_chalice || pu == Powerups.pow_bible || pu == Powerups.pow_crown || pu == Powerups.pow_fullheal) {
                level.state.totalTreasure++;
            }
        }
    }
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
    static checkLine(x1, y1, x2, y2, level) {
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
                if (level.tileMap[x][y] & Level.WALL_TILE) {
                    return false;
                }
                if (level.tileMap[x][y] & Level.DOOR_TILE) {
                    if (level.state.doorMap[x][y].action != Doors.dr_open) {
                        if (level.state.doorMap[x][y].action == Doors.dr_closed) {
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
                if (level.tileMap[x][y] & Level.WALL_TILE) {
                    return false;
                }
                if (level.tileMap[x][y] & Level.DOOR_TILE) {
                    if (level.state.doorMap[x][y].action != Doors.dr_open) {
                        if (level.state.doorMap[x][y].action == Doors.dr_closed) {
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
Level.SOLID_TILE = (Level.WALL_TILE | Level.BLOCK_TILE | Level.PUSHWALL_TILE);
Level.BLOCKS_MOVE_TILE = (Level.WALL_TILE | Level.BLOCK_TILE | Level.PUSHWALL_TILE | Level.ACTOR_TILE);
Level.WAYPOINT_TILE = (Level.TILE_IS_E_TURN | Level.TILE_IS_NE_TURN | Level.TILE_IS_N_TURN | Level.TILE_IS_NW_TURN |
    Level.TILE_IS_W_TURN | Level.TILE_IS_SW_TURN | Level.TILE_IS_S_TURN | Level.TILE_IS_SE_TURN);
Level.statinfo = [
    [false, -1],
    [true, -1],
    [true, -1],
    [true, -1],
    [false, -1],
    [true, -1],
    [false, Powerups.pow_alpo],
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
    [false, Powerups.pow_key1],
    [false, Powerups.pow_key2],
    [true, -1],
    [false, -1],
    [false, Powerups.pow_food],
    [false, Powerups.pow_firstaid],
    [false, Powerups.pow_clip],
    [false, Powerups.pow_machinegun],
    [false, Powerups.pow_chaingun],
    [false, Powerups.pow_cross],
    [false, Powerups.pow_chalice],
    [false, Powerups.pow_bible],
    [false, Powerups.pow_crown],
    [false, Powerups.pow_fullheal],
    [false, Powerups.pow_gibs],
    [true, -1],
    [true, -1],
    [true, -1],
    [false, Powerups.pow_gibs],
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
Level.cachedGuard = 0;
Level.cachedOfficer = 0;
Level.cachedSS = 0;
Level.cachedDog = 0;
Level.cachedMutant = 0;
Level.progress_bar = 0;
