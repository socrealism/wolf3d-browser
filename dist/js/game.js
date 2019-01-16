"use strict";
class Game {
    static updatePlayerControls(player, tics) {
        var moveValue, running = false, strafing = false, leftKey = false, rightKey = false, downKey = false, upKey = false, changeWeapon = -1, mouseMovement, mouseCoords;
        player.cmd.buttons = 0;
        player.cmd.forwardMove = 0;
        player.cmd.sideMove = 0;
        leftKey = Input.checkKeys(Game.controls.left);
        rightKey = Input.checkKeys(Game.controls.right);
        downKey = Input.checkKeys(Game.controls.down);
        upKey = Input.checkKeys(Game.controls.up);
        running = Input.checkKeys(Game.controls.run);
        strafing = Input.checkKeys(Game.controls.strafe);
        moveValue = (running ? Game.RUNMOVE : Game.BASEMOVE);
        if (Input.checkKeys(Game.controls.attack) || (Game.mouseEnabled && Input.leftMouseDown())) {
            player.cmd.buttons |= Game.BUTTON_ATTACK;
        }
        if (Game.mouseEnabled && Input.rightMouseDown()) {
            if (mouseCoords = Input.getMouseCoords()) {
                player.cmd.forwardMove += -(mouseCoords.y < 0 ? Game.MOVESCALE : Game.BACKMOVESCALE) * moveValue * mouseCoords.y;
            }
        }
        else if (!(upKey && downKey)) {
            if (upKey) {
                player.cmd.forwardMove += moveValue * Game.MOVESCALE;
            }
            if (downKey) {
                player.cmd.forwardMove += -moveValue * Game.BACKMOVESCALE;
            }
        }
        if (Game.mouseEnabled && Input.isPointerLocked()) {
            mouseMovement = Input.getMouseMovement();
            player.angle -= (mouseMovement.x * Game.TURNANGLESCALE * tics) >> 0;
        }
        else {
            if (leftKey) {
                if (strafing) {
                    player.cmd.sideMove += -moveValue * Game.MOVESCALE;
                }
                else {
                    player.angle += Game.TURNANGLESCALE * tics;
                }
            }
            if (rightKey) {
                if (strafing) {
                    player.cmd.sideMove += moveValue * Game.MOVESCALE;
                }
                else {
                    player.angle -= Game.TURNANGLESCALE * tics;
                }
            }
            if (Game.mouseEnabled && (mouseCoords = Input.getMouseCoords())) {
                if (Math.abs(mouseCoords.x) > Game.MOUSEDEADBAND) {
                    player.angle -= (Game.TURNANGLESCALE * tics * (mouseCoords.x + (mouseCoords.x < 0 ? 1 : -1) * Game.MOUSEDEADBAND)) >> 0;
                }
            }
        }
        if (Input.checkKeys(Game.controls.weapon1) && player.items & Player.ITEM_WEAPON_1) {
            changeWeapon = Player.WEAPON_KNIFE;
        }
        else if (Input.checkKeys(Game.controls.weapon2) && player.items & Player.ITEM_WEAPON_2 && player.ammo[Player.AMMO_BULLETS]) {
            changeWeapon = Player.WEAPON_PISTOL;
        }
        else if (Input.checkKeys(Game.controls.weapon3) && player.items & Player.ITEM_WEAPON_3 && player.ammo[Player.AMMO_BULLETS]) {
            changeWeapon = Player.WEAPON_AUTO;
        }
        else if (Input.checkKeys(Game.controls.weapon4) && player.items & Player.ITEM_WEAPON_4 && player.ammo[Player.AMMO_BULLETS]) {
            changeWeapon = Player.WEAPON_CHAIN;
        }
        if (changeWeapon > -1) {
            player.previousWeapon = Player.WEAPON_KNIFE;
            player.weapon = player.pendingWeapon = changeWeapon;
        }
        if (Input.checkKeys(Game.controls.use)) {
            player.cmd.buttons |= Game.BUTTON_USE;
        }
    }
    static startGameCycle(game) {
        var deathTics = 0, deathTicsMax = Game.ticsPerSecond * 2;
        if (Game.hndCycle) {
            clearTimeout(Game.hndCycle);
            Game.hndCycle = 0;
        }
        function nextCycle() {
            if (!Game.playing) {
                return;
            }
            Game.hndCycle = setTimeout(nextCycle, 1000 / 30);
            Game.cycleNum++;
            if (Game.paused) {
                return;
            }
            var player = game.player, level = game.level, lives, score, tics = Game.calcTics();
            if (player.playstate != Player.ex_dead) {
                Game.updatePlayerControls(player, tics);
                player.angle = Mathematik.normalizeAngle(player.angle);
                Player.process(game, player, tics);
                if (Game.processAI) {
                    Actors.process(game, tics);
                }
                PushWall.process(level, tics);
                Doors.process(level, player, tics);
            }
            else {
                if (Game.died(game, tics)) {
                    deathTics += tics;
                    if (deathTics >= deathTicsMax) {
                        deathTics = 0;
                        $("#game .renderer .death").css("display", "none");
                        if (game.player.lives > 0) {
                            lives = game.player.lives;
                            score = game.player.startScore;
                            game.level = Level.reload(level);
                            Level.scanInfoPlane(game.level, game.skill);
                            game.player = Player.spawn(game.level.spawn, game.level, game.skill);
                            game.player.lives = lives - 1;
                            game.player.score = score;
                            game.player.startScore = score;
                            game.level.state.startTime = (new Date).getTime();
                            game.level.state.elapsedTime = 0;
                        }
                        else {
                            gameOver(game);
                            return;
                        }
                    }
                    else {
                        $("#game .renderer .death").css({
                            display: "block",
                            backgroundColor: "rgba(255,0,0," + (deathTics / deathTicsMax) + ")"
                        });
                    }
                }
            }
            Wolf.Sprites.clean(level);
            Game.updateHUD(game, tics);
        }
        Game.lastTimeCount = (new Date).getTime();
        nextCycle();
    }
    static died(game, tics) {
        var fangle, dx, dy, iangle, curangle, clockwise, counter, change, player = game.player, killer = player.lastAttacker;
        dx = killer.x - player.position.x;
        dy = player.position.y - killer.y;
        fangle = -Math.atan2(dy, dx);
        if (fangle < 0) {
            fangle = Math.PI * 2 + fangle;
        }
        iangle = Math.round(fangle / (Math.PI * 2) * Wolf.ANGLES);
        curangle = Wolf.FINE2DEG(player.angle);
        if (curangle > iangle) {
            counter = curangle - iangle;
            clockwise = Wolf.ANGLES - curangle + iangle;
        }
        else {
            clockwise = iangle - curangle;
            counter = curangle + Wolf.ANGLES - iangle;
        }
        if (clockwise < counter) {
            if (curangle > iangle) {
                curangle -= Wolf.ANGLES;
            }
            if (curangle == iangle) {
                return true;
            }
            else {
                change = tics * Wolf.DEATHROTATE;
                if (curangle + change > iangle) {
                    change = iangle - curangle;
                }
                curangle += change;
                if (curangle >= Wolf.ANGLES) {
                    curangle -= Wolf.ANGLES;
                }
                player.angle = Wolf.DEG2FINE(curangle);
            }
        }
        else {
            if (curangle < iangle) {
                curangle += Wolf.ANGLES;
            }
            if (curangle == iangle) {
                return true;
            }
            else {
                change = -tics * Wolf.DEATHROTATE;
                if (curangle + change < iangle) {
                    change = iangle - curangle;
                }
                curangle += change;
                if (curangle < 0) {
                    curangle += Wolf.ANGLES;
                }
                player.angle = Wolf.DEG2FINE(curangle);
            }
        }
        return false;
    }
    static gameOver(game) {
        Game.playing = false;
        Game.rendering = false;
        $("#game .renderer").hide();
        $("#game .fps").hide();
        $("#game .gameover").show();
        Game.endGame();
        function exit() {
            $(document).off("keydown", progress);
            $("#game").fadeOut(null, function () {
                $("#game .gameover").hide();
                Menu.show();
            });
        }
        function progress(e) {
            if (!$("#game .gameover").is(":visible")) {
                exit();
                return;
            }
            if (e.keyCode == 13 || e.keyCode == 32) {
                exit();
            }
        }
        $(document).on("keydown", progress);
    }
    static victory(game) {
        if (game.player.playstate == Player.ex_victory) {
            return;
        }
        Game.keyInputActive = false;
        Wolf.log("Victory!");
        $("#game .renderer .player-weapon").hide();
        Actors.spawnBJVictory(game.player, game.level, game.skill);
        game.player.playstate = Player.ex_victory;
    }
    static endEpisode(game) {
        Game.startIntermission(game);
    }
    static calcTics() {
        var now = (new Date).getTime(), delta = (now - Game.lastTimeCount) / 1000, tics = Math.floor(Game.ticsPerSecond * delta);
        Game.lastTimeCount += (tics * 1000 / Game.ticsPerSecond) >> 0;
        return tics;
    }
    static updateStat(name, value) {
        var numdivs = $("#game .hud ." + name + " .number");
        for (var i = numdivs.length - 1; i >= 0; i--) {
            if (value == 0 && i < numdivs.length - 1) {
                numdivs[i].style.backgroundPosition = 16 + "px 0";
            }
            else {
                numdivs[i].style.backgroundPosition = -(16 * (value % 10)) + "px 0";
                value = (value / 10) >> 0;
            }
        }
    }
    static updateHUD(game, tics) {
        var player = game.player, frame = player.weapon * 4 + player.weaponFrame;
        if (player.playstate == Player.ex_dead || player.playstate == Player.ex_victory) {
            $("#game .renderer .player-weapon").css("display", "none");
        }
        else {
            $("#game .renderer .player-weapon").css({
                display: "block",
                backgroundPosition: -(frame * Wolf.HUD_WEAPON_WIDTH) + "px 0"
            });
        }
        $("#game .hud .weapon").css({
            backgroundPosition: -(player.weapon * 96) + "px 0"
        });
        $("#game .hud .key1").css({
            display: (player.items & Player.ITEM_KEY_1) ? "block" : "none"
        });
        $("#game .hud .key2").css({
            display: (player.items & Player.ITEM_KEY_2) ? "block" : "none"
        });
        Game.updateStat("ammo", player.ammo[Player.AMMO_BULLETS]);
        Game.updateStat("health", player.health);
        Game.updateStat("lives", player.lives);
        Game.updateStat("score", player.score);
        Game.updateStat("floor", game.levelNum + 1);
        Game.drawFace(player, tics);
    }
    static updateScreen(game) {
        var player = game.player, level = game.level, viewport = {
            x: player.position.x,
            y: player.position.y,
            angle: player.angle
        };
        var res = Raycaster.traceRays(viewport, level);
        Renderer.clear();
        Renderer.draw(viewport, level, res.tracers, res.visibleTiles);
    }
    static drawFace(player, tics) {
        var pic;
        player.faceCount += tics;
        if (player.faceGotGun && player.faceCount > 0) {
            player.faceGotGun = false;
        }
        if (player.faceCount > Random.get()) {
            player.faceGotGun = player.faceOuch = false;
            player.faceFrame = Random.get() >> 6;
            if (player.faceFrame == 3) {
                player.faceFrame = 0;
            }
            player.faceCount = 0;
        }
        if (player.health) {
            if (player.faceGotGun) {
                pic = 22;
            }
            else {
                var h = player.health;
                if (h > 100) {
                    h = 100;
                }
                if (h < 0) {
                    h = 0;
                }
                pic = (3 * ((100 - h) / 16) >> 0) + player.faceFrame;
                if ((player.flags & Player.FL_GODMODE)) {
                    pic = 23 + player.faceFrame;
                }
            }
        }
        else {
            pic = 21;
        }
        $("#game .hud .bj").css({
            backgroundPosition: -(pic * Wolf.HUD_FACE_WIDTH) + "px 0"
        });
    }
    static updateFPS() {
        var now = (new Date).getTime(), dt = (now - Game.lastFPSTime) / 1000, frames = Game.frameNum - Game.lastFrame;
        Game.lastFPSTime = now;
        Game.lastFrame = Game.frameNum;
        $("#game .fps").html((frames / dt).toFixed(2));
    }
    static startRenderCycle(game) {
        if (Game.hndRender) {
            cancelAnimationFrame(Game.hndRender);
            Game.hndRender = 0;
        }
        if (!Game.hndFps) {
            Game.hndFps = setInterval(Game.updateFPS, 1000);
        }
        $("#game .fps").show();
        Renderer.init();
        $("#game .renderer").show();
        function nextFrame() {
            if (!Game.rendering) {
                return;
            }
            if (!Game.paused) {
                Game.updateScreen(game);
            }
            Game.hndRender = requestAnimationFrame(nextFrame);
            Game.frameNum++;
        }
        Game.rendering = true;
        nextFrame();
    }
    static startLevel(game, episodeNum, levelNum) {
        if (!Episodes.data[episodeNum].enabled) {
            return;
        }
        Game.playing = false;
        Game.rendering = false;
        game.episodeNum = episodeNum;
        game.levelNum = levelNum;
        var episode = Episodes.data[game.episodeNum];
        Level.load(episode.levels[game.levelNum].file, function (error, level) {
            if (error) {
                throw error;
            }
            $("#game .renderer .floor").css({
                "background-color": "rgb("
                    + level.floor[0] + ","
                    + level.floor[1] + ","
                    + level.floor[2] + ")"
            });
            $("#game .renderer .ceiling").css({
                "background-color": "rgb("
                    + level.ceiling[0] + ","
                    + level.ceiling[1] + ","
                    + level.ceiling[2] + ")"
            });
            game.level = level;
            Game.levelMusic = level.music;
            Level.scanInfoPlane(level, game.skill);
            $("#game .loading").show();
            Game.preloadLevelAssets(level, function () {
                Sound.startMusic('assets/' + level.music);
                game.player = Player.spawn(level.spawn, level, game.skill, game.player);
                game.player.startScore = game.player.score;
                level.state.startTime = (new Date).getTime();
                level.state.elapsedTime = 0;
                Game.playing = true;
                Game.startGameCycle(game);
                Game.startRenderCycle(game);
                Input.reset();
                Input.lockPointer();
                $("#game .loading").hide();
                $("#game").focus();
                $("#game .renderer .player-weapon").show();
                Game.keyInputActive = true;
            });
        });
    }
    static preloadLevelAssets(level, callback) {
        var files = [], tx, ty, texture, x, y, f, i, numFiles, texturePath = "assets/art/walls-shaded/" + Renderer.TEXTURERESOLUTION + "/", spritePath = "assets/art/sprites/" + Renderer.TEXTURERESOLUTION + "/";
        function addTexture(texture) {
            if (texture > 0) {
                if (texture % 2 == 0) {
                    texture--;
                }
                f = texturePath + "w_" + texture + ".png";
                if (!Game.preloadTextures[f]) {
                    files.push(f);
                    Game.preloadTextures[f] = true;
                }
            }
        }
        for (x = 0; x < 64; ++x) {
            for (y = 0; y < 64; ++y) {
                addTexture(level.wallTexX[x][y]);
                addTexture(level.wallTexY[x][y]);
            }
        }
        f = spritePath + "002_053.png";
        if (!Game.preloadSprites[f]) {
            files.push(f);
            Game.preloadSprites[f] = true;
        }
        for (i = 0; i < files.length; ++i) {
            files[i] = "preload!timeout=5!" + files[i];
        }
        if (files.length) {
            Modernizr.load({
                load: files,
                complete: callback
            });
        }
        else {
            callback();
        }
    }
    static startGame(skill) {
        if (Game.isPlaying()) {
            Game.endGame();
            Game.levelMusic = null;
            Sound.stopAllSounds();
        }
        $("#game .renderer .death").hide();
        $("#game .renderer .damage-flash").hide();
        $("#game .renderer .bonus-flash").hide();
        $("#game").show();
        var game = {
            episode: -1,
            level: -1,
            skill: skill,
            killRatios: [],
            secretRatios: [],
            treasureRatios: [],
            totalTime: 0
        };
        Game.currentGame = game;
        return game;
    }
    static endGame() {
        if (Game.hndCycle) {
            clearTimeout(Game.hndCycle);
            Game.hndCycle = 0;
        }
        if (Game.hndRender) {
            cancelAnimationFrame(Game.hndRender);
            Game.hndRender = 0;
        }
        Game.playing = false;
        Game.rendering = false;
        Renderer.reset();
        if (Game.paused) {
            Game.togglePause();
        }
    }
    static startVictoryText(game) {
        Game.endGame();
        $("#game").fadeOut(null, function () {
            var name = "victory" + (game.episodeNum + 1), num = (game.episodeNum == 2) ? 1 : 2;
            Menu.showText(name, num, function () {
                Menu.show("main");
            });
        });
    }
    static startIntermission(game, delay) {
        var episode = Episodes.data[game.episodeNum], parTime = episode.levels[game.levelNum].partime * 60, bonus = 0, parBonusAmount = 500, ratioBonusAmount = 10000, levelState = game.level.state, killRatio = levelState.totalMonsters ? ((levelState.killedMonsters / levelState.totalMonsters * 100) >> 0) : 0, secretRatio = levelState.totalSecrets ? ((levelState.foundSecrets / levelState.totalSecrets * 100) >> 0) : 0, treasureRatio = levelState.totalTreasure ? ((levelState.foundTreasure / levelState.totalTreasure * 100) >> 0) : 0, time = levelState.elapsedTime + ((new Date).getTime() - levelState.startTime), totalTime, i, avgKill = 0, avgSecret = 0, avgTreasure = 0;
        Game.playing = false;
        Sound.startMusic("assets/music/URAHERO.ogg");
        $("#game .renderer").hide();
        $("#game .fps").hide();
        $("#game .intermission .digit").hide();
        $("#game .intermission").show();
        $("#game .intermission .background").hide();
        $("#game .intermission .background-secret").hide();
        $("#game .intermission .background-victory").hide();
        $("#game .intermission .stat").hide();
        $("#game .intermission .victory-stat").hide();
        $("#game .intermission .bj").hide();
        time = Math.min(99 * 60, Math.round(time / 1000));
        killRatio = Math.min(killRatio, 100);
        secretRatio = Math.min(secretRatio, 100);
        treasureRatio = Math.min(treasureRatio, 100);
        game.killRatios.push(killRatio);
        game.secretRatios.push(secretRatio);
        game.treasureRatios.push(treasureRatio);
        game.totalTime += time;
        if (game.levelNum == 9) {
            $("#game .intermission .background-secret").show();
            $("#game .intermission .bj").show();
            bonus = 15000;
        }
        else if (game.levelNum == 8) {
            $("#game .intermission .background-victory").show();
            $("#game .intermission .victory-stat").show();
            totalTime = Math.min(99 * 60, game.totalTime);
            for (i = 0; i < game.killRatios.length; i++) {
                avgKill += game.killRatios[i];
            }
            for (i = 0; i < game.secretRatios.length; i++) {
                avgSecret += game.secretRatios[i];
            }
            for (i = 0; i < game.treasureRatios.length; i++) {
                avgTreasure += game.treasureRatios[i];
            }
            avgKill = Math.round(avgKill / game.killRatios.length);
            avgSecret = Math.round(avgSecret / game.secretRatios.length);
            avgTreasure = Math.round(avgTreasure / game.treasureRatios.length);
            Game.setIntermissionNumber("total-time-minutes", (totalTime / 60) >> 0, true);
            Game.setIntermissionNumber("total-time-seconds", ((totalTime / 60) % 1) * 60, true);
            Game.setIntermissionNumber("avg-kill-ratio", avgKill, false);
            Game.setIntermissionNumber("avg-secret-ratio", avgSecret, false);
            Game.setIntermissionNumber("avg-treasure-ratio", avgTreasure, false);
        }
        else {
            $("#game .intermission .background").show();
            $("#game .intermission .bj").show();
            $("#game .intermission .stat").show();
            if (parTime && parTime > time) {
                bonus += (parTime - time) * parBonusAmount;
            }
            if (killRatio == 100) {
                bonus += ratioBonusAmount;
            }
            if (secretRatio == 100) {
                bonus += ratioBonusAmount;
            }
            if (treasureRatio == 100) {
                bonus += ratioBonusAmount;
            }
            time = time / 60;
            parTime = parTime / 60;
            Game.setIntermissionNumber("floor", game.levelNum + 1, false);
            Game.setIntermissionNumber("bonus", bonus, false);
            Game.setIntermissionNumber("time-minutes", time >> 0, true);
            Game.setIntermissionNumber("time-seconds", (time % 1) * 60, true);
            Game.setIntermissionNumber("par-minutes", parTime >> 0, true);
            Game.setIntermissionNumber("par-seconds", (parTime % 1) * 60, true);
            Game.setIntermissionNumber("kill-ratio", killRatio, false);
            Game.setIntermissionNumber("secret-ratio", secretRatio, false);
            Game.setIntermissionNumber("treasure-ratio", treasureRatio, false);
        }
        function anim() {
            var now = (new Date).getTime(), bjFrame = Math.floor(now / 500) % 2;
            $("#game .intermission .bj").css({
                backgroundPosition: -(162 * bjFrame) + "px 0px"
            });
            Game.intermissionAnim = requestAnimationFrame(anim);
        }
        if (game.levelNum != 8) {
            if (!Game.intermissionAnim) {
                anim();
            }
        }
        function exitIntermission() {
            if (Game.intermissionAnim) {
                cancelAnimationFrame(Game.intermissionAnim);
                Game.intermissionAnim = 0;
            }
            $(document).off("keydown", progress);
            $("#game .intermission").hide();
        }
        function progress(e) {
            var nextLevel;
            if (!$("#game .intermission").is(":visible")) {
                exitIntermission();
                return;
            }
            if (e.keyCode == 13 || e.keyCode == 32) {
                exitIntermission();
                if (game.player.playstate == Player.ex_secretlevel) {
                    nextLevel = 9;
                }
                else {
                    if (game.levelNum == 8) {
                        $("#game").fadeOut(1000, function () {
                            Game.startVictoryText(game);
                        });
                        return;
                    }
                    else if (game.levelNum == 9) {
                        switch (game.episodeNum) {
                            case 0:
                                nextLevel = 1;
                                break;
                            case 1:
                                nextLevel = 1;
                                break;
                            case 2:
                                nextLevel = 7;
                                break;
                            case 3:
                                nextLevel = 3;
                                break;
                            case 4:
                                nextLevel = 4;
                                break;
                            case 5:
                                nextLevel = 3;
                                break;
                            default:
                                nextLevel = game.levelNum + 1;
                                break;
                        }
                    }
                    else {
                        nextLevel = game.levelNum + 1;
                    }
                }
                Player.givePoints(game.player, bonus);
                Game.startLevel(game, game.episodeNum, nextLevel);
            }
        }
        $(document).on("keydown", progress);
    }
    static setIntermissionNumber(name, value, zeros) {
        var digits = $("#game .intermission ." + name + " .digit"), i, digit, v;
        for (i = 0; i < 10; i++) {
            digits.removeClass("num-" + i);
        }
        value = value >> 0;
        v = value;
        for (i = 0; i < digits.length; i++) {
            digit = v % 10;
            if (v > 0 || zeros || (value == 0 && i == 0)) {
                digits.eq(digits.length - 1 - i).addClass("num-" + digit);
            }
            v = (v / 10) >> 0;
        }
        digits.show();
    }
    static startDamageFlash() {
        $("#game .renderer .damage-flash").show().fadeOut(300);
    }
    static startBonusFlash() {
        $("#game .renderer .bonus-flash").show().fadeOut(300);
    }
    static notify(text) {
        Wolf.log(text);
    }
    static isFullscreen() {
        if ("webkitIsFullScreen" in document) {
            return document.webkitIsFullScreen;
        }
        else if ("mozFullScreen" in document) {
            return document.mozFullScreen;
        }
        else if ($("#main").data("scale") > 1) {
            return true;
        }
        return false;
    }
    static fullscreenChange(e) {
        if (Game.isFullscreen()) {
            Game.enterFullscreen();
        }
        else {
            Game.exitFullscreen();
        }
    }
    static toggleFullscreen() {
        var main = $("#main")[0], ret = false;
        if (Game.isFullscreen()) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                return true;
            }
            else if (document.webkitCancelFullscreen) {
                document.webkitCancelFullscreen();
                return true;
            }
            else if (document.mozCancelFullscreen) {
                document.mozCancelFullscreen();
                return true;
            }
        }
        else {
            if (main.requestFullScreenWithKeys) {
                main.requestFullScreenWithKeys();
                return true;
            }
            else if (main.requestFullScreen) {
                main.requestFullScreen(true);
                return true;
            }
            else if (main.webkitRequestFullScreen) {
                main.webkitRequestFullScreen(true);
                return true;
            }
            else if (document.body.mozRequestFullScreenWithKeys) {
                document.body.mozRequestFullScreenWithKeys();
                return true;
            }
            else if (document.body.mozRequestFullScreen) {
                document.body.mozRequestFullScreen();
                return true;
            }
        }
        return false;
    }
    static enterFullscreen() {
        var ratio = window.innerWidth / 640, sliceZoom = Math.floor(Wolf.SLICE_WIDTH * ratio), zoom = sliceZoom / Wolf.SLICE_WIDTH, transform = "scale(" + zoom + ")";
        $("#main").css({
            "transform": transform,
            "-webkit-transform": transform,
            "-moz-transform": transform,
            "-ms-transform": transform,
            "-o-transform": transform
        }).data("scale", zoom);
    }
    static exitFullscreen() {
        $("#main").css({
            "transform": "",
            "-webkit-transform": "",
            "-moz-transform": "",
            "-ms-transform": "",
            "-o-transform": ""
        }).data("scale", 1);
    }
    static init() {
        $(document)
            .on("mozfullscreenchange", Game.fullscreenChange)
            .on("webkitfullscreenchange", Game.fullscreenChange)
            .on("fullscreenchange", Game.fullscreenChange);
        Input.bindKey("F11", function (e) {
            if (!Game.keyInputActive) {
                return;
            }
            if (Game.toggleFullscreen()) {
                e.preventDefault();
            }
            else {
                if (Game.isFullscreen()) {
                    Game.exitFullscreen();
                }
                else {
                    Game.enterFullscreen();
                }
            }
        });
        Input.bindKey("P", function (e) {
            if (!Game.keyInputActive) {
                return;
            }
            Game.togglePause();
        });
        Input.bindKey("ESC", function (e) {
            if (!Game.keyInputActive) {
                return;
            }
            Game.exitToMenu();
        });
        if (!Game.isFullscreen() && (window.fullScreen || (window.innerWidth == screen.width && window.innerHeight == screen.height))) {
            Game.toggleFullscreen();
        }
    }
    static exitToMenu() {
        if (!Game.paused) {
            Game.togglePause();
        }
        $("#game").hide();
        Game.keyInputActive = false;
        Menu.show("main");
    }
    static resume() {
        $("#game").show();
        if (Game.paused) {
            Game.togglePause();
        }
        Game.keyInputActive = true;
        if (Game.levelMusic) {
            Sound.startMusic('assets/' + Game.levelMusic);
        }
    }
    static isPlaying() {
        return Game.playing;
    }
    static togglePause() {
        Game.paused = !Game.paused;
        if (Game.paused) {
            Sound.pauseMusic(true);
        }
        else {
            Sound.pauseMusic(false);
            Game.lastTimeCount = (new Date).getTime();
        }
        $("#game .renderer div.pause.overlay").toggle(Game.paused);
    }
    static enableMouse(enable) {
        Game.mouseEnabled = enable;
    }
    static isMouseEnabled() {
        return Game.mouseEnabled;
    }
    static getControls() {
        var c = {};
        for (var a in Game.controls) {
            if (Game.controls.hasOwnProperty(a)) {
                c[a] = Game.controls[a];
            }
        }
        return c;
    }
    static bindControl(action, keys) {
        Game.controls[action] = keys;
    }
    static dump() {
        console.log(Game.currentGame);
        window.open("data:text/plain," + JSON.stringify(Game.currentGame), "dump");
    }
    static debugGodMode(enable) {
        if (Game.currentGame && Game.currentGame.player) {
            if (enable) {
                Game.currentGame.player.flags |= Player.FL_GODMODE;
            }
            else {
                Game.currentGame.player.flags &= ~Player.FL_GODMODE;
            }
            Wolf.log("God mode " + (enable ? "enabled" : "disabled"));
        }
    }
    static debugNoTarget(enable) {
        if (Game.currentGame && Game.currentGame.player) {
            if (enable) {
                Game.currentGame.player.flags |= Player.FL_NOTARGET;
            }
            else {
                Game.currentGame.player.flags &= ~Player.FL_NOTARGET;
            }
            Wolf.log("No target " + (enable ? "enabled" : "disabled"));
        }
    }
    static debugVictory() {
        if (Game.currentGame && Game.currentGame.player) {
            Wolf.log("Winning!");
            Game.startIntermission(Game.currentGame);
        }
    }
    static debugEndEpisode() {
        if (Game.currentGame && Game.currentGame.player) {
            Game.victory(Game.currentGame);
        }
    }
    static debugToggleAI(enable) {
        Game.processAI = !!enable;
    }
    static debugGiveAll() {
        if (Game.currentGame && Game.currentGame.player) {
            Player.givePoints(Game.currentGame.player, 10000);
            Player.giveHealth(Game.currentGame.player, 100, 100);
            Player.giveKey(Game.currentGame.player, 0);
            Player.giveKey(Game.currentGame.player, 1);
            Player.giveWeapon(Game.currentGame.player, 2);
            Player.giveWeapon(Game.currentGame.player, 3);
            Player.giveAmmo(Game.currentGame.player, Player.AMMO_BULLETS, 99);
            Wolf.log("Giving keys, weapons, ammo, health and 10000 points");
        }
    }
}
Game.BUTTON_ATTACK = 1;
Game.BUTTON_USE = 2;
Game.BUTTON_ANY = 128;
Game.BASEMOVE = 35;
Game.RUNMOVE = 70;
Game.MOVESCALE = 150;
Game.BACKMOVESCALE = 100;
Game.MAXMOUSETURN = 10;
Game.TURNANGLESCALE = 300;
Game.MOUSEDEADBAND = 0.2;
Game.gd_baby = 0;
Game.gd_easy = 1;
Game.gd_medium = 2;
Game.gd_hard = 3;
Game.rendering = false;
Game.playing = false;
Game.fsInit = false;
Game.hndRender = 0;
Game.hndCycle = 0;
Game.hndFps = 0;
Game.lastFPSTime = 0;
Game.lastFrame = 0;
Game.frameNum = 0;
Game.cycleNum = 0;
Game.mouseEnabled = false;
Game.paused = false;
Game.intermissionAnim = 0;
Game.currentGame = null;
Game.processAI = true;
Game.keyInputActive = false;
Game.preloadTextures = {};
Game.preloadSprites = {};
Game.controls = {
    up: ["UP"],
    left: ["LEFT"],
    down: ["DOWN"],
    right: ["RIGHT"],
    run: ["SHIFT"],
    attack: ["X"],
    use: ["SPACE"],
    strafe: ["Z"],
    weapon1: ["1"],
    weapon2: ["2"],
    weapon3: ["3"],
    weapon4: ["4"]
};
Game.ticsPerSecond = 70;
Game.lastTimeCount = 0;
