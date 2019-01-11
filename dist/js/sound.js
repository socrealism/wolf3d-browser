"use strict";
Wolf.Sound = (function () {
    Wolf.setConsts({
        CHAN_AUTO: 0,
        CHAN_WEAPON: 1,
        CHAN_VOICE: 2,
        CHAN_ITEM: 3,
        CHAN_BODY: 4,
        CHAN_NO_PHS_ADD: 8,
        CHAN_RELIABLE: 16,
        ATTN_NONE: 0,
        ATTN_NORM: 1,
        ATTN_IDLE: 2,
        ATTN_STATIC: 3,
        MAX_PLAYSOUNDS: 128,
        MAX_CHANNELS: 64,
        MUSIC_VOLUME: 0.8,
        MASTER_VOLUME: 0.6
    });
    var sounds = {}, audioElements = [], currentMusic, soundEnabled = true, musicEnabled = true, music, ext, exts = ["ogg", "mp3"];
    function getFileName(file) {
        if (!ext) {
            for (var i = 0; i < exts.length; i++) {
                if (Modernizr.audio[exts[i]] == "probably") {
                    ext = exts[i];
                    break;
                }
            }
            if (!ext) {
                for (var i = 0; i < exts.length; i++) {
                    if (Modernizr.audio[exts[i]] == "maybe") {
                        ext = exts[i];
                        break;
                    }
                }
            }
        }
        return file.split(".")[0] + "." + ext;
    }
    function createAudioElement() {
        var audio = new Audio();
        audioElements.push(audio);
        return audio;
    }
    function startSound(posPlayer, posSound, entNum, entChannel, file, volume, attenuation, timeOfs) {
        var audio, dx, dy, dist;
        if (!sounds[file]) {
            sounds[file] = [];
        }
        for (var i = 0; i < sounds[file].length; i++) {
            if (sounds[file][i].ended || sounds[file][i].paused) {
                audio = sounds[file][i];
                break;
            }
        }
        if (!audio) {
            audio = createAudioElement();
            audio.src = getFileName(file);
            sounds[file].push(audio);
        }
        if (posPlayer && posSound) {
            dx = (posPlayer.x - posSound.x) / Wolf.TILEGLOBAL;
            dy = (posPlayer.y - posSound.y) / Wolf.TILEGLOBAL;
            dist = dx * dx + dy * dy;
            volume *= 1 / (1 + dist / 50);
        }
        audio.volume = volume * Wolf.MASTER_VOLUME * (soundEnabled ? 1 : 0);
        audio.play();
    }
    function startMusic(file) {
        if (!music) {
            music = createAudioElement();
            music.loop = true;
        }
        var filename = getFileName(file);
        if (currentMusic != filename) {
            music.src = currentMusic = filename;
            music.volume = Wolf.MUSIC_VOLUME * Wolf.MASTER_VOLUME * (musicEnabled ? 1 : 0);
            music.play();
        }
    }
    function stopAllSounds() {
        for (var i = 0; i < audioElements.length; i++) {
            if (audioElements[i].currentTime > 0) {
                audioElements[i].currentTime = 0;
                audioElements[i].pause();
            }
        }
    }
    function init() {
    }
    function isMusicEnabled() {
        return musicEnabled;
    }
    function isSoundEnabled() {
        return soundEnabled;
    }
    function toggleMusic(enable) {
        if (typeof enable != "undefined") {
            musicEnabled = enable;
        }
        else {
            musicEnabled = !musicEnabled;
        }
        if (music) {
            music.volume = Wolf.MUSIC_VOLUME * Wolf.MASTER_VOLUME * (musicEnabled ? 1 : 0);
        }
    }
    function pauseMusic(enable) {
        if (music) {
            if (enable) {
                music.pause();
            }
            else if (music.paused) {
                music.play();
            }
        }
    }
    function toggleSound(enable) {
        if (typeof enable != "undefined") {
            soundEnabled = enable;
        }
        else {
            soundEnabled = !soundEnabled;
        }
    }
    if (Modernizr.audio) {
        return {
            startSound: startSound,
            startMusic: startMusic,
            stopAllSounds: stopAllSounds,
            isMusicEnabled: isMusicEnabled,
            isSoundEnabled: isSoundEnabled,
            toggleMusic: toggleMusic,
            toggleSound: toggleSound,
            pauseMusic: pauseMusic,
            init: init
        };
    }
    else {
        return {
            startSound: Wolf.noop,
            startMusic: Wolf.noop,
            stopAllSounds: Wolf.noop,
            isMusicEnabled: Wolf.noop,
            isSoundEnabled: Wolf.noop,
            toggleMusic: Wolf.noop,
            toggleSound: Wolf.noop,
            pauseMusic: Wolf.noop,
            init: Wolf.noop
        };
    }
})();
