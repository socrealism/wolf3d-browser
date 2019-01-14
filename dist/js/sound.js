"use strict";
class Sound {
    static getFileName(file) {
        if (!Sound.available)
            return;
        if (!Sound.ext) {
            for (var i = 0; i < Sound.exts.length; i++) {
                if (Modernizr.audio[Sound.exts[i]] == "probably") {
                    Sound.ext = Sound.exts[i];
                    break;
                }
            }
            if (!Sound.ext) {
                for (var i = 0; i < Sound.exts.length; i++) {
                    if (Modernizr.audio[Sound.exts[i]] == "maybe") {
                        Sound.ext = Sound.exts[i];
                        break;
                    }
                }
            }
        }
        return file.split(".")[0] + "." + Sound.ext;
    }
    static createAudioElement() {
        if (!Sound.available)
            return;
        var audio = new Audio();
        Sound.audioElements.push(audio);
        return audio;
    }
    static startSound(posPlayer, posSound, entNum, entChannel, file, volume, attenuation, timeOfs) {
        if (!Sound.available)
            return;
        var audio, dx, dy, dist;
        if (!Sound.sounds[file]) {
            Sound.sounds[file] = [];
        }
        for (var i = 0; i < Sound.sounds[file].length; i++) {
            if (Sound.sounds[file][i].ended || Sound.sounds[file][i].paused) {
                audio = Sound.sounds[file][i];
                break;
            }
        }
        if (!audio) {
            audio = Sound.createAudioElement();
            audio.src = Sound.getFileName(file);
            Sound.sounds[file].push(audio);
        }
        if (posPlayer && posSound) {
            dx = (posPlayer.x - posSound.x) / Wolf.TILEGLOBAL;
            dy = (posPlayer.y - posSound.y) / Wolf.TILEGLOBAL;
            dist = dx * dx + dy * dy;
            volume *= 1 / (1 + dist / 50);
        }
        audio.volume = volume * Sound.MASTER_VOLUME * (Sound.soundEnabled ? 1 : 0);
        audio.play();
    }
    static startMusic(file) {
        if (!Sound.available)
            return;
        if (!Sound.music) {
            Sound.music = Sound.createAudioElement();
            Sound.music.loop = true;
        }
        var filename = Sound.getFileName(file);
        if (Sound.currentMusic != filename) {
            Sound.music.src = Sound.currentMusic = filename;
            Sound.music.volume = Sound.MUSIC_VOLUME * Sound.MASTER_VOLUME * (Sound.musicEnabled ? 1 : 0);
            Sound.music.play();
        }
    }
    static stopAllSounds() {
        if (!Sound.available)
            return;
        for (var i = 0; i < Sound.audioElements.length; i++) {
            if (Sound.audioElements[i].currentTime > 0) {
                Sound.audioElements[i].currentTime = 0;
                Sound.audioElements[i].pause();
            }
        }
    }
    static init() {
        Sound.available = Modernizr.audio;
        if (!Sound.available) {
            Sound.musicEnabled = false;
            Sound.soundEnabled = false;
        }
    }
    static isMusicEnabled() {
        return Sound.musicEnabled;
    }
    static isSoundEnabled() {
        return Sound.soundEnabled;
    }
    static toggleMusic(enable) {
        if (!Sound.available)
            return;
        if (typeof enable != "undefined") {
            Sound.musicEnabled = enable;
        }
        else {
            Sound.musicEnabled = !Sound.musicEnabled;
        }
        if (Sound.music) {
            Sound.music.volume = Sound.MUSIC_VOLUME * Sound.MASTER_VOLUME * (Sound.musicEnabled ? 1 : 0);
        }
    }
    static pauseMusic(enable) {
        if (!Sound.available)
            return;
        if (Sound.music) {
            if (enable) {
                Sound.music.pause();
            }
            else if (Sound.music.paused) {
                Sound.music.play();
            }
        }
    }
    static toggleSound(enable) {
        if (!Sound.available)
            return;
        if (typeof enable != "undefined") {
            Sound.soundEnabled = enable;
        }
        else {
            Sound.soundEnabled = !Sound.soundEnabled;
        }
    }
}
Sound.CHAN_AUTO = 0;
Sound.CHAN_WEAPON = 1;
Sound.CHAN_VOICE = 2;
Sound.CHAN_ITEM = 3;
Sound.CHAN_BODY = 4;
Sound.CHAN_NO_PHS_ADD = 8;
Sound.CHAN_RELIABLE = 16;
Sound.ATTN_NONE = 0;
Sound.ATTN_NORM = 1;
Sound.ATTN_IDLE = 2;
Sound.ATTN_STATIC = 3;
Sound.MAX_PLAYSOUNDS = 128;
Sound.MAX_CHANNELS = 64;
Sound.MUSIC_VOLUME = 0.8;
Sound.MASTER_VOLUME = 0.6;
Sound.sounds = {};
Sound.audioElements = [];
Sound.soundEnabled = true;
Sound.musicEnabled = true;
Sound.exts = ["ogg", "mp3"];
Sound.available = true;
