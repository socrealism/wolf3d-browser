"use strict";
Wolf.Game = (function () {
    Wolf.setConsts({
        BUTTON_ATTACK: 1,
        BUTTON_USE: 2,
        BUTTON_ANY: 128,
        BASEMOVE: 35,
        RUNMOVE: 70,
        MOVESCALE: 150,
        BACKMOVESCALE: 100,
        MAXMOUSETURN: 10,
        TURNANGLESCALE: 300,
        MOUSEDEADBAND: 0.2,
        gd_baby: 0,
        gd_easy: 1,
        gd_medium: 2,
        gd_hard: 3
    });
    var rendering = false, playing = false, fsInit = false, hndRender = 0, hndCycle = 0, hndFps = 0, lastFPSTime = 0, lastFrame = 0, frameNum = 0, cycleNum = 0, mouseEnabled = false, paused = false, intermissionAnim = 0, currentGame = null, levelMusic, processAI = true, keyInputActive = false, preloadTextures = {}, preloadSprites = {}, controls = {
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
    }, ticsPerSecond = 70, lastTimeCount = 0;
    function updatePlayerControls(player, tics) {
        var moveValue, running = false, strafing = false, leftKey = false, rightKey = false, downKey = false, upKey = false, changeWeapon = -1, mouseMovement, mouseCoords;
        player.cmd.buttons = 0;
        player.cmd.forwardMove = 0;
        player.cmd.sideMove = 0;
        leftKey = Wolf.Input.checkKeys(controls.left);
        rightKey = Wolf.Input.checkKeys(controls.right);
        downKey = Wolf.Input.checkKeys(controls.down);
        upKey = Wolf.Input.checkKeys(controls.up);
        running = Wolf.Input.checkKeys(controls.run);
        strafing = Wolf.Input.checkKeys(controls.strafe);
        moveValue = (running ? Wolf.RUNMOVE : Wolf.BASEMOVE);
        if (Wolf.Input.checkKeys(controls.attack) || (mouseEnabled && Wolf.Input.leftMouseDown())) {
            player.cmd.buttons |= Wolf.BUTTON_ATTACK;
        }
        if (mouseEnabled && Wolf.Input.rightMouseDown()) {
            if (mouseCoords = Wolf.Input.getMouseCoords()) {
                player.cmd.forwardMove += -(mouseCoords.y < 0 ? Wolf.MOVESCALE : Wolf.BACKMOVESCALE) * moveValue * mouseCoords.y;
            }
        }
        else if (!(upKey && downKey)) {
            if (upKey) {
                player.cmd.forwardMove += moveValue * Wolf.MOVESCALE;
            }
            if (downKey) {
                player.cmd.forwardMove += -moveValue * Wolf.BACKMOVESCALE;
            }
        }
        if (mouseEnabled && Wolf.Input.isPointerLocked()) {
            mouseMovement = Wolf.Input.getMouseMovement();
            player.angle -= (mouseMovement.x * Wolf.TURNANGLESCALE * tics) >> 0;
        }
        else {
            if (leftKey) {
                if (strafing) {
                    player.cmd.sideMove += -moveValue * Wolf.MOVESCALE;
                }
                else {
                    player.angle += Wolf.TURNANGLESCALE * tics;
                }
            }
            if (rightKey) {
                if (strafing) {
                    player.cmd.sideMove += moveValue * Wolf.MOVESCALE;
                }
                else {
                    player.angle -= Wolf.TURNANGLESCALE * tics;
                }
            }
            if (mouseEnabled && (mouseCoords = Wolf.Input.getMouseCoords())) {
                if (Math.abs(mouseCoords.x) > Wolf.MOUSEDEADBAND) {
                    player.angle -= (Wolf.TURNANGLESCALE * tics * (mouseCoords.x + (mouseCoords.x < 0 ? 1 : -1) * Wolf.MOUSEDEADBAND)) >> 0;
                }
            }
        }
        if (Wolf.Input.checkKeys(controls.weapon1) && player.items & Wolf.ITEM_WEAPON_1) {
            changeWeapon = Wolf.WEAPON_KNIFE;
        }
        else if (Wolf.Input.checkKeys(controls.weapon2) && player.items & Wolf.ITEM_WEAPON_2 && player.ammo[Wolf.AMMO_BULLETS]) {
            changeWeapon = Wolf.WEAPON_PISTOL;
        }
        else if (Wolf.Input.checkKeys(controls.weapon3) && player.items & Wolf.ITEM_WEAPON_3 && player.ammo[Wolf.AMMO_BULLETS]) {
            changeWeapon = Wolf.WEAPON_AUTO;
        }
        else if (Wolf.Input.checkKeys(controls.weapon4) && player.items & Wolf.ITEM_WEAPON_4 && player.ammo[Wolf.AMMO_BULLETS]) {
            changeWeapon = Wolf.WEAPON_CHAIN;
        }
        if (changeWeapon > -1) {
            player.previousWeapon = Wolf.WEAPON_KNIFE;
            player.weapon = player.pendingWeapon = changeWeapon;
        }
        if (Wolf.Input.checkKeys(controls.use)) {
            player.cmd.buttons |= Wolf.BUTTON_USE;
        }
    }
    function startGameCycle(game) {
        var deathTics = 0, deathTicsMax = ticsPerSecond * 2;
        if (hndCycle) {
            clearTimeout(hndCycle);
            hndCycle = 0;
        }
        function nextCycle() {
            if (!playing) {
                return;
            }
            hndCycle = setTimeout(nextCycle, 1000 / 30);
            cycleNum++;
            if (paused) {
                return;
            }
            var player = game.player, level = game.level, lives, score, tics = calcTics();
            if (player.playstate != Wolf.ex_dead) {
                updatePlayerControls(player, tics);
                player.angle = Wolf.Math.normalizeAngle(player.angle);
                Wolf.Player.process(game, player, tics);
                if (processAI) {
                    Wolf.Actors.process(game, tics);
                }
                Wolf.PushWall.process(level, tics);
                Wolf.Doors.process(level, player, tics);
            }
            else {
                if (died(game, tics)) {
                    deathTics += tics;
                    if (deathTics >= deathTicsMax) {
                        deathTics = 0;
                        $("#game .renderer .death").css("display", "none");
                        if (game.player.lives > 0) {
                            lives = game.player.lives;
                            score = game.player.startScore;
                            game.level = Wolf.Level.reload(level);
                            Wolf.Level.scanInfoPlane(game.level, game.skill);
                            game.player = Wolf.Player.spawn(game.level.spawn, game.level, game.skill);
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
            updateHUD(game, tics);
        }
        lastTimeCount = (new Date).getTime();
        nextCycle();
    }
    function died(game, tics) {
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
    function gameOver(game) {
        playing = false;
        rendering = false;
        $("#game .renderer").hide();
        $("#game .fps").hide();
        $("#game .gameover").show();
        endGame();
        function exit() {
            $(document).off("keydown", progress);
            $("#game").fadeOut(null, function () {
                $("#game .gameover").hide();
                Wolf.Menu.show();
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
    function victory(game) {
        if (game.player.playstate == Wolf.ex_victory) {
            return;
        }
        keyInputActive = false;
        Wolf.log("Victory!");
        $("#game .renderer .player-weapon").hide();
        Wolf.Actors.spawnBJVictory(game.player, game.level, game.skill);
        game.player.playstate = Wolf.ex_victory;
    }
    function endEpisode(game) {
        Wolf.Game.startIntermission(game);
    }
    function calcTics() {
        var now = (new Date).getTime(), delta = (now - lastTimeCount) / 1000, tics = Math.floor(ticsPerSecond * delta);
        lastTimeCount += (tics * 1000 / ticsPerSecond) >> 0;
        return tics;
    }
    function updateStat(name, value) {
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
    function updateHUD(game, tics) {
        var player = game.player, frame = player.weapon * 4 + player.weaponFrame;
        if (player.playstate == Wolf.ex_dead || player.playstate == Wolf.ex_victory) {
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
            display: (player.items & Wolf.ITEM_KEY_1) ? "block" : "none"
        });
        $("#game .hud .key2").css({
            display: (player.items & Wolf.ITEM_KEY_2) ? "block" : "none"
        });
        updateStat("ammo", player.ammo[Wolf.AMMO_BULLETS]);
        updateStat("health", player.health);
        updateStat("lives", player.lives);
        updateStat("score", player.score);
        updateStat("floor", game.levelNum + 1);
        drawFace(player, tics);
    }
    function updateScreen(game) {
        var player = game.player, level = game.level, viewport = {
            x: player.position.x,
            y: player.position.y,
            angle: player.angle
        };
        var res = Wolf.Raycaster.traceRays(viewport, level);
        Wolf.Renderer.clear();
        Wolf.Renderer.draw(viewport, level, res.tracers, res.visibleTiles);
    }
    function drawFace(player, tics) {
        var pic;
        player.faceCount += tics;
        if (player.faceGotGun && player.faceCount > 0) {
            player.faceGotGun = false;
        }
        if (player.faceCount > Wolf.Random.rnd()) {
            player.faceGotGun = player.faceOuch = false;
            player.faceFrame = Wolf.Random.rnd() >> 6;
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
                if ((player.flags & Wolf.FL_GODMODE)) {
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
    function updateFPS() {
        var now = (new Date).getTime(), dt = (now - lastFPSTime) / 1000, frames = frameNum - lastFrame;
        lastFPSTime = now;
        lastFrame = frameNum;
        $("#game .fps").html((frames / dt).toFixed(2));
    }
    function startRenderCycle(game) {
        if (hndRender) {
            cancelAnimationFrame(hndRender);
            hndRender = 0;
        }
        Wolf.Renderer.init();
        $("#game .renderer").show();
        function nextFrame() {
            if (!rendering) {
                return;
            }
            if (!paused) {
                updateScreen(game);
            }
            hndRender = requestAnimationFrame(nextFrame);
            frameNum++;
        }
        rendering = true;
        nextFrame();
    }
    function startLevel(game, episodeNum, levelNum) {
        if (!Wolf.Episodes[episodeNum].enabled) {
            return;
        }
        playing = false;
        rendering = false;
        game.episodeNum = episodeNum;
        game.levelNum = levelNum;
        var episode = Wolf.Episodes[game.episodeNum];
        Wolf.Level.load(episode.levels[game.levelNum].file, function (error, level) {
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
            levelMusic = level.music;
            Wolf.Level.scanInfoPlane(level, game.skill);
            $("#game .loading").show();
            preloadLevelAssets(level, function () {
                Wolf.Sound.startMusic(level.music);
                game.player = Wolf.Player.spawn(level.spawn, level, game.skill, game.player);
                game.player.startScore = game.player.score;
                level.state.startTime = (new Date).getTime();
                level.state.elapsedTime = 0;
                playing = true;
                startGameCycle(game);
                startRenderCycle(game);
                Wolf.Input.reset();
                Wolf.Input.lockPointer();
                $("#game .loading").hide();
                $("#game").focus();
                $("#game .renderer .player-weapon").show();
                keyInputActive = true;
            });
        });
    }
    function preloadLevelAssets(level, callback) {
        var files = [], tx, ty, texture, x, y, f, i, numFiles, texturePath = "art/walls-shaded/" + Wolf.TEXTURERESOLUTION + "/", spritePath = "art/sprites/" + Wolf.TEXTURERESOLUTION + "/";
        function addTexture(texture) {
            if (texture > 0) {
                if (texture % 2 == 0) {
                    texture--;
                }
                f = texturePath + "w_" + texture + ".png";
                if (!preloadTextures[f]) {
                    files.push(f);
                    preloadTextures[f] = true;
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
        if (!preloadSprites[f]) {
            files.push(f);
            preloadSprites[f] = true;
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
    function startGame(skill) {
        if (isPlaying()) {
            endGame();
            levelMusic = null;
            Wolf.Sound.stopAllSounds();
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
        currentGame = game;
        return game;
    }
    function endGame() {
        if (hndCycle) {
            clearTimeout(hndCycle);
            hndCycle = 0;
        }
        if (hndRender) {
            cancelAnimationFrame(hndRender);
            hndRender = 0;
        }
        playing = false;
        rendering = false;
        Wolf.Renderer.reset();
        if (paused) {
            togglePause();
        }
    }
    function startVictoryText(game) {
        endGame();
        $("#game").fadeOut(null, function () {
            var name = "victory" + (game.episodeNum + 1), num = (game.episodeNum == 2) ? 1 : 2;
            Wolf.Menu.showText(name, num, function () {
                Wolf.Menu.show("main");
            });
        });
    }
    function startIntermission(game, delay) {
        var episode = Wolf.Episodes[game.episodeNum], parTime = episode.levels[game.levelNum].partime * 60, bonus = 0, parBonusAmount = 500, ratioBonusAmount = 10000, levelState = game.level.state, killRatio = levelState.totalMonsters ? ((levelState.killedMonsters / levelState.totalMonsters * 100) >> 0) : 0, secretRatio = levelState.totalSecrets ? ((levelState.foundSecrets / levelState.totalSecrets * 100) >> 0) : 0, treasureRatio = levelState.totalTreasure ? ((levelState.foundTreasure / levelState.totalTreasure * 100) >> 0) : 0, time = levelState.elapsedTime + ((new Date).getTime() - levelState.startTime), totalTime, i, avgKill = 0, avgSecret = 0, avgTreasure = 0;
        playing = false;
        Wolf.Sound.startMusic("music/URAHERO.ogg");
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
            setIntermissionNumber("total-time-minutes", (totalTime / 60) >> 0, true);
            setIntermissionNumber("total-time-seconds", ((totalTime / 60) % 1) * 60, true);
            setIntermissionNumber("avg-kill-ratio", avgKill, false);
            setIntermissionNumber("avg-secret-ratio", avgSecret, false);
            setIntermissionNumber("avg-treasure-ratio", avgTreasure, false);
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
            setIntermissionNumber("floor", game.levelNum + 1, false);
            setIntermissionNumber("bonus", bonus, false);
            setIntermissionNumber("time-minutes", time >> 0, true);
            setIntermissionNumber("time-seconds", (time % 1) * 60, true);
            setIntermissionNumber("par-minutes", parTime >> 0, true);
            setIntermissionNumber("par-seconds", (parTime % 1) * 60, true);
            setIntermissionNumber("kill-ratio", killRatio, false);
            setIntermissionNumber("secret-ratio", secretRatio, false);
            setIntermissionNumber("treasure-ratio", treasureRatio, false);
        }
        function anim() {
            var now = (new Date).getTime(), bjFrame = Math.floor(now / 500) % 2;
            $("#game .intermission .bj").css({
                backgroundPosition: -(162 * bjFrame) + "px 0px"
            });
            intermissionAnim = requestAnimationFrame(anim);
        }
        if (game.levelNum != 8) {
            if (!intermissionAnim) {
                anim();
            }
        }
        function exitIntermission() {
            if (intermissionAnim) {
                cancelAnimationFrame(intermissionAnim);
                intermissionAnim = 0;
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
                if (game.player.playstate == Wolf.ex_secretlevel) {
                    nextLevel = 9;
                }
                else {
                    if (game.levelNum == 8) {
                        $("#game").fadeOut(1000, function () {
                            startVictoryText(game);
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
                Wolf.Player.givePoints(game.player, bonus);
                startLevel(game, game.episodeNum, nextLevel);
            }
        }
        $(document).on("keydown", progress);
    }
    function setIntermissionNumber(name, value, zeros) {
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
    function startDamageFlash() {
        $("#game .renderer .damage-flash").show().fadeOut(300);
    }
    function startBonusFlash() {
        $("#game .renderer .bonus-flash").show().fadeOut(300);
    }
    function notify(text) {
        Wolf.log(text);
    }
    function isFullscreen() {
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
    function fullscreenChange(e) {
        if (isFullscreen()) {
            enterFullscreen();
        }
        else {
            exitFullscreen();
        }
    }
    function toggleFullscreen() {
        var main = $("#main")[0], ret = false;
        if (isFullscreen()) {
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
    function enterFullscreen() {
        var ratio = window.innerWidth / 640, sliceZoom = Math.floor(Wolf.SLICE_WIDTH * ratio), zoom = sliceZoom / Wolf.SLICE_WIDTH, transform = "scale(" + zoom + ")";
        $("#main").css({
            "transform": transform,
            "-webkit-transform": transform,
            "-moz-transform": transform,
            "-ms-transform": transform,
            "-o-transform": transform
        }).data("scale", zoom);
    }
    function exitFullscreen() {
        $("#main").css({
            "transform": "",
            "-webkit-transform": "",
            "-moz-transform": "",
            "-ms-transform": "",
            "-o-transform": ""
        }).data("scale", 1);
    }
    function init() {
        $(document)
            .on("mozfullscreenchange", fullscreenChange)
            .on("webkitfullscreenchange", fullscreenChange)
            .on("fullscreenchange", fullscreenChange);
        Wolf.Input.bindKey("F11", function (e) {
            if (!keyInputActive) {
                return;
            }
            if (toggleFullscreen()) {
                e.preventDefault();
            }
            else {
                if (isFullscreen()) {
                    exitFullscreen();
                }
                else {
                    enterFullscreen();
                }
            }
        });
        Wolf.Input.bindKey("P", function (e) {
            if (!keyInputActive) {
                return;
            }
            togglePause();
        });
        Wolf.Input.bindKey("ESC", function (e) {
            if (!keyInputActive) {
                return;
            }
            exitToMenu();
        });
        if (!isFullscreen() && (window.fullScreen || (window.innerWidth == screen.width && window.innerHeight == screen.height))) {
            toggleFullscreen();
        }
    }
    function exitToMenu() {
        if (!paused) {
            togglePause();
        }
        $("#game").hide();
        keyInputActive = false;
        Wolf.Menu.show("main");
    }
    function resume() {
        $("#game").show();
        if (paused) {
            togglePause();
        }
        keyInputActive = true;
        if (levelMusic) {
            Wolf.Sound.startMusic(levelMusic);
        }
    }
    function isPlaying() {
        return playing;
    }
    function togglePause() {
        paused = !paused;
        if (paused) {
            Wolf.Sound.pauseMusic(true);
        }
        else {
            Wolf.Sound.pauseMusic(false);
            lastTimeCount = (new Date).getTime();
        }
        $("#game .renderer div.pause.overlay").toggle(paused);
    }
    function enableMouse(enable) {
        mouseEnabled = enable;
    }
    function isMouseEnabled() {
        return mouseEnabled;
    }
    function getControls() {
        var c = {};
        for (var a in controls) {
            if (controls.hasOwnProperty(a)) {
                c[a] = controls[a];
            }
        }
        return c;
    }
    function bindControl(action, keys) {
        controls[action] = keys;
    }
    return {
        startGame: startGame,
        startLevel: startLevel,
        startIntermission: startIntermission,
        startDamageFlash: startDamageFlash,
        startBonusFlash: startBonusFlash,
        enableMouse: enableMouse,
        isMouseEnabled: isMouseEnabled,
        isPlaying: isPlaying,
        notify: notify,
        isFullscreen: isFullscreen,
        init: init,
        getControls: getControls,
        bindControl: bindControl,
        resume: resume,
        victory: victory,
        endEpisode: endEpisode
    };
})();
