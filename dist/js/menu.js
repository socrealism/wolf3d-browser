"use strict";
class Menu {
    static init() {
        for (let i = 0; i < Menu.keySpriteNames.length; i++) {
            if (Menu.keySpriteNames[i] !== "") {
                Menu.keySprites[Menu.keySpriteNames[i]] = i;
            }
        }
    }
    static playSound(file) {
        Sound.startSound(null, null, 1, Sound.CHAN_AUTO, file, 1, Sound.ATTN_NORM, 0);
    }
    static setActiveItem(item) {
        Menu.playSound("assets/lsfx/005.wav");
        $("#menu div.menu.active li").removeClass("active");
        item.addClass("active");
        if ($("#menu div.menu.active").hasClass("skill")) {
            $("#menu div.menu.active div.face")
                .removeClass()
                .addClass("face " + item.data("skill"));
        }
    }
    static setupEvents() {
        $(document).on("keydown", function (e) {
            if (!$("#menu").is(":visible")) {
                return;
            }
            if (!Menu.menuInputActive) {
                return;
            }
            var oldActive = Menu.activeIndex;
            switch (e.keyCode) {
                case 38:
                    Menu.activeIndex--;
                    Menu.activeMouseItem = null;
                    break;
                case 40:
                    Menu.activeIndex++;
                    Menu.activeMouseItem = null;
                    break;
                case 13:
                    if (Menu.activeMouseItem) {
                        Menu.activeMouseItem.trigger("click");
                    }
                    else {
                        $("#menu div.menu.active li").eq(Menu.activeIndex).trigger("click");
                    }
                    break;
                case 27:
                    var back = $("#menu div.menu.active").data("backmenu");
                    if (back) {
                        Menu.playSound("assets/lsfx/039.wav");
                        Menu.show(back);
                    }
                    return;
            }
            if (oldActive != Menu.activeIndex) {
                var items = $("#menu div.menu.active li:not(.hidden)");
                if (Menu.activeIndex < 0) {
                    Menu.activeIndex += items.length;
                }
                Menu.activeIndex %= items.length;
                Menu.setActiveItem(items.eq(Menu.activeIndex));
            }
        });
        $("#menu li").mouseover(function () {
            if (!Menu.menuInputActive) {
                return;
            }
            Menu.activeMouseItem = $(this);
            Menu.setActiveItem($(this));
        });
        $("#menu li").on("click", function (e) {
            if (!Menu.menuInputActive) {
                return;
            }
            Menu.playSound("assets/lsfx/032.wav");
            var $this = $(this), sub = $this.data("submenu");
            if (sub) {
                Menu.show(sub);
                e.stopPropagation();
            }
            if ($this.hasClass("sfxon")) {
                $("div.light", $this).addClass("on");
                $("#menu li.sfxoff div.light").removeClass("on");
                Sound.toggleSound(true);
            }
            if ($this.hasClass("sfxoff")) {
                $("div.light", $this).addClass("on");
                $("#menu li.sfxon div.light").removeClass("on");
                Sound.toggleSound(false);
            }
            if ($this.hasClass("musicon")) {
                $("div.light", $this).addClass("on");
                $("#menu li.musicoff div.light").removeClass("on");
                Sound.toggleMusic(true);
            }
            if ($this.hasClass("musicoff")) {
                $("div.light", $this).addClass("on");
                $("#menu li.musicon div.light").removeClass("on");
                Sound.toggleMusic(false);
            }
            if ($this.hasClass("mouseenabled")) {
                var mouseOn = Game.isMouseEnabled();
                $("div.light", $this).toggleClass("on", !mouseOn);
                Game.enableMouse(!mouseOn);
            }
            if ($this.hasClass("customizekeys")) {
                Menu.customizeKeys($this);
                e.stopPropagation();
            }
        });
        $("#menu div.menu.episodes li").on("click", function () {
            if (!Menu.menuInputActive) {
                return;
            }
            var episode = $(this).data("episode");
            if (Game.isPlaying()) {
                Menu.showMessage("confirm-newgame", true, function (result) {
                    if (result) {
                        Menu.activeEpisode = episode;
                        Menu.show("skill");
                    }
                    else {
                        Menu.show("main");
                    }
                });
            }
            else {
                Menu.activeEpisode = episode;
                Menu.show("skill");
            }
        });
        $("#menu div.menu.skill li").on("click", function () {
            if (!Menu.menuInputActive) {
                return;
            }
            Menu.activeSkill = $(this).data("skill");
        });
        $("#menu div.menu.main li.resumegame").on("click", () => {
            if (!Menu.menuInputActive) {
                return;
            }
            if (Game.isPlaying()) {
                Menu.hide();
                Game.resume();
            }
        });
        $("#menu div.menu.main li.readthis").on("click", function (e) {
            if (!Menu.menuInputActive) {
                return;
            }
            Menu.menuInputActive = false;
            $("#menu").fadeOut(null, function () {
                Menu.showText("help", 11, function () {
                    $("#menu").fadeIn();
                });
            });
            e.stopPropagation();
        });
        $("#menu div.menu.levels li").on("click", function () {
            if (!Menu.menuInputActive) {
                return;
            }
            const level = $(this).data("level"), gameState = Game.startGame(Game[Menu.activeSkill]);
            Menu.hide();
            Game.startLevel(gameState, Menu.activeEpisode, level);
        });
    }
    static customizeKeys($this) {
        Menu.menuInputActive = false;
        var current = 0, isBinding = false, blinkInterval;
        function selectKey(index) {
            if (index < 0)
                index += 4;
            index = index % 4;
            var currentSprite = $("span.active", $this);
            if (currentSprite[0]) {
                Menu.setCustomizeKey(currentSprite.data("action"), currentSprite.data("keyIndex"), false);
            }
            var sprite = $("span.k" + (index + 1), $this);
            Menu.setCustomizeKey(sprite.data("action"), sprite.data("keyIndex"), true);
            current = index;
        }
        function activateKey(index) {
            isBinding = true;
            var sprite = $("span.k" + (index + 1), $this), blink = false;
            Menu.setCustomizeKey(sprite.data("action"), "QUESTION", true);
            if (blinkInterval) {
                clearInterval(blinkInterval);
            }
            blinkInterval = setInterval(function () {
                Menu.setCustomizeKey(sprite.data("action"), (blink = !blink) ? "BLANK" : "QUESTION", true);
            }, 500);
        }
        function bindKey(index, key) {
            var sprite = $("span.k" + (index + 1), $this);
            Menu.setCustomizeKey(sprite.data("action"), key, true);
            Game.bindControl(sprite.data("action"), [key]);
        }
        function exitCustomize() {
            $(document).off("keydown", keyHandler);
            Menu.initCustomizeMenu();
            Menu.menuInputActive = true;
        }
        function keyHandler(e) {
            var i;
            if (isBinding) {
                for (i = 2; i < Menu.keySpriteNames.length; i++) {
                    if (Input.keysCode[Menu.keySpriteNames[i]] == e.keyCode) {
                        bindKey(current, Menu.keySpriteNames[i]);
                        isBinding = false;
                        clearInterval(blinkInterval);
                        blinkInterval = 0;
                        break;
                    }
                }
                return;
            }
            switch (e.keyCode) {
                case 39:
                    selectKey(current + 1);
                    break;
                case 37:
                    selectKey(current - 1);
                    break;
                case 13:
                    activateKey(current);
                    break;
                case 27:
                case 38:
                case 40:
                    exitCustomize();
                    break;
            }
        }
        $(document).on("keydown", keyHandler);
        selectKey(current);
    }
    static setCustomizeKey(action, keyIndex, active) {
        var menu = $("#menu div.menu.customize"), x = (active ? -256 : 0), y = -Menu.keySprites[keyIndex] * 32;
        $("span." + action, menu)
            .css("backgroundPosition", x + "px " + y + "px")
            .data("keyIndex", keyIndex)
            .toggleClass("active", !!active);
    }
    static initCustomizeMenu() {
        var controls = Game.getControls(), keys = ["run", "use", "attack", "strafe", "left", "right", "up", "down"], i;
        for (i = 0; i < keys.length; i++) {
            Menu.setCustomizeKey(keys[i], controls[keys[i]][0]);
        }
    }
    static showMessage(name, blink, onclose) {
        var box, blinkOn = false;
        Menu.activeMessage = name;
        Menu.menuInputActive = false;
        if (Menu.messageBlink) {
            clearInterval(Menu.messageBlink);
            Menu.messageBlink = 0;
        }
        $("#menu .message." + name).show();
        box = $("#menu .message." + name + " div.box");
        box.removeClass("blink");
        if (blink) {
            setInterval(function () {
                blinkOn = !blinkOn;
                if (blinkOn) {
                    box.addClass("blink");
                }
                else {
                    box.removeClass("blink");
                }
            }, 200);
        }
        function close(value) {
            Menu.playSound("assets/lsfx/039.wav");
            $(document).off("keydown", keyHandler);
            $("#menu .message." + name).hide();
            if (Menu.messageBlink) {
                clearInterval(Menu.messageBlink);
                Menu.messageBlink = 0;
            }
            Menu.menuInputActive = true;
            if (onclose) {
                onclose(value);
            }
        }
        function keyHandler(e) {
            switch (e.keyCode) {
                case 27:
                case 78:
                    close(false);
                    break;
                case 89:
                    close(true);
                    break;
            }
        }
        $(document).on("keydown", keyHandler);
    }
    static show(menuName = 'main') {
        var musicOn, soundOn, mouseOn;
        if (!Menu.setupDone) {
            Menu.setupEvents();
            Menu.setupDone = true;
        }
        Sound.startMusic("assets/music/WONDERIN.ogg");
        menuName = menuName || "main";
        if (menuName == "main") {
            if (Game.isPlaying()) {
                $("#menu div.menu.main li.resumegame")
                    .removeClass("hidden")
                    .show();
            }
            else {
                $("#menu div.menu.main li.resumegame")
                    .addClass("hidden")
                    .hide();
            }
        }
        if (menuName == "customize") {
            Menu.initCustomizeMenu();
        }
        if (menuName == "episodes") {
            $("#menu div.menu.episodes li")
                .removeClass("hidden")
                .show();
            if (!Episodes.data[0].enabled) {
                $("#menu div.menu.episodes li.episode-0")
                    .addClass("hidden")
                    .hide();
            }
            if (!Episodes.data[1].enabled) {
                $("#menu div.menu.episodes li.episode-1")
                    .addClass("hidden")
                    .hide();
            }
            if (!Episodes.data[2].enabled) {
                $("#menu div.menu.episodes li.episode-2")
                    .addClass("hidden")
                    .hide();
            }
        }
        if (menuName == "sound") {
            musicOn = Sound.isMusicEnabled();
            soundOn = Sound.isSoundEnabled();
            $("#menu li.sfxoff div.light").toggleClass("on", !soundOn);
            $("#menu li.sfxon div.light").toggleClass("on", soundOn);
            $("#menu li.musicoff div.light").toggleClass("on", !musicOn);
            $("#menu li.musicon div.light").toggleClass("on", musicOn);
        }
        if (menuName == "control") {
            mouseOn = Game.isMouseEnabled();
            $("#menu li.mouseenabled div.light").toggleClass("on", mouseOn);
        }
        if ($("#menu").data("menu")) {
            $("#menu").removeClass($("#menu").data("menu"));
        }
        $("#menu div.menu").removeClass("active").hide();
        $("#menu li").removeClass("active");
        $("#menu").data("menu", menuName).addClass(menuName).show();
        $("#menu div.menu." + menuName).addClass("active").show();
        $("#menu div.menu." + menuName + " ul li").first().addClass("active");
        $("#menu").focus();
        Menu.activeIndex = 0;
        Menu.activeMouseItem = null;
        Menu.menuInputActive = true;
    }
    static hide() {
        $("#menu").hide();
        Menu.menuInputActive = false;
    }
    static showText(name, num, closeFunction) {
        var screen = $("#text-screen"), current = 0;
        Menu.menuInputActive = false;
        function show(moveIdx) {
            current += moveIdx;
            if (current < 0) {
                current += num;
            }
            current = current % num;
            screen.css({
                "backgroundImage": "url(assets/art/text-screens/" + name + "-" + (current + 1) + ".png)"
            });
            var next = (current + 1) % num, nextImg = new Image();
            nextImg.src = "assets/art/text-screens/" + name + "-" + (next + 1) + ".png";
        }
        function close() {
            $(document).off("keydown", keyHandler);
            screen.fadeOut(null, closeFunction);
            Menu.menuInputActive = true;
        }
        function keyHandler(e) {
            switch (e.keyCode) {
                case 39:
                    show(1);
                    break;
                case 37:
                    show(-1);
                    break;
                case 27:
                    close();
                    break;
            }
        }
        show(0);
        screen.fadeIn(null, function () {
            $(document).on("keydown", keyHandler);
        });
    }
}
Menu.setupDone = false;
Menu.menuInputActive = false;
Menu.activeIndex = 0;
Menu.activeMouseItem = null;
Menu.keySprites = {};
Menu.keySpriteNames = [
    "BLANK",
    "QUESTION",
    "SHIFT",
    "SPACE",
    "CTRL",
    "LEFT",
    "RIGHT",
    "UP",
    "DOWN",
    "ENTER",
    "DEL",
    "PGUP",
    "PGDN",
    "INS",
    "SLASH",
    "HOME",
    "COMMA",
    "PERIOD",
    "PLUS",
    "MINUS",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
];
Menu.init();
