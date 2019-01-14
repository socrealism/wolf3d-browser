class Sound {
    // Sound channels
    // Channel 0 never willingly overrides
    // Other channels (1-7) always override a playing sound on that channel
    public static readonly CHAN_AUTO = 0;
    public static readonly CHAN_WEAPON = 1;
    public static readonly CHAN_VOICE = 2;
    public static readonly CHAN_ITEM = 3;
    public static readonly CHAN_BODY = 4;
    // Modifier flags
    public static readonly CHAN_NO_PHS_ADD = 8; // Send to all clients, not just ones in PHS (ATTN 0 will also do this)
    public static readonly CHAN_RELIABLE = 16; // Send by reliable message, not datagram
    // Sound attenuation values
    public static readonly ATTN_NONE = 0; // Full volume the entire level
    public static readonly ATTN_NORM = 1;
    public static readonly ATTN_IDLE = 2;
    public static readonly ATTN_STATIC = 3; // Diminish very rapidly with distance

    public static readonly MAX_PLAYSOUNDS = 128;
    public static readonly MAX_CHANNELS = 64;

    public static readonly MUSIC_VOLUME = 0.8;
    public static readonly MASTER_VOLUME = 0.6;

    public static sounds = {};
    public static audioElements = [];
    public static currentMusic;
    public static soundEnabled: boolean = true;
    public static musicEnabled: boolean = true;
    public static music;
    public static ext;
    public static exts = ["ogg", "mp3"];

    protected static available: boolean = true;

    public static getFileName(file) {
        if (!Sound.available) return;

        if (!Sound.ext) {
            // look for a probably
            for (var i = 0; i < Sound.exts.length; i++) {
                if (Modernizr.audio[Sound.exts[i]] == "probably") {
                    Sound.ext = Sound.exts[i];
                    break;
                }
            }
            // look for a maybe
            if (!Sound.ext) {
                for (var i = 0; i < Sound.exts.length; i++) {
                    if (Modernizr.audio[Sound.exts[i]] == "maybe") {
                        Sound.ext = Sound.exts[i];
                        break;
                    }
                }
            }
        }
        return file.split(".")[0] + "." + Sound.ext
    }

    public static createAudioElement() {
        if (!Sound.available) return;

        var audio = new Audio();
        Sound.audioElements.push(audio);
        return audio;
    }

    public static startSound(posPlayer, posSound, entNum, entChannel, file, volume, attenuation, timeOfs) {
        if (!Sound.available) return;

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

    public static startMusic(file) {
        if (!Sound.available) return;

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

    public static stopAllSounds() {
        if (!Sound.available) return;

        for (var i = 0; i < Sound.audioElements.length; i++) {
            if (Sound.audioElements[i].currentTime > 0) {
                Sound.audioElements[i].currentTime = 0;
                Sound.audioElements[i].pause();
            }
        }
    }

    public static init() {
        Sound.available = Modernizr.audio;

        if (!Sound.available) {
            Sound.musicEnabled = false;
            Sound.soundEnabled = false;
        }
    }

    public static isMusicEnabled() {
        return Sound.musicEnabled
    }

    public static isSoundEnabled() {
        return Sound.soundEnabled;
    }

    public static toggleMusic(enable) {
        if (!Sound.available) return;

        if (typeof enable != "undefined") {
            Sound.musicEnabled = enable;
        } else {
            Sound.musicEnabled = !Sound.musicEnabled;
        }
        if (Sound.music) {
            Sound.music.volume = Sound.MUSIC_VOLUME * Sound.MASTER_VOLUME * (Sound.musicEnabled ? 1 : 0);
        }
    }

    public static pauseMusic(enable) {
        if (!Sound.available) return;

        if (Sound.music) {
            if (enable) {
                Sound.music.pause();
            } else if (Sound.music.paused) {
                Sound.music.play();
            }
        }
    }

    public static toggleSound(enable) {
        if (!Sound.available) return;

        if (typeof enable != "undefined") {
            Sound.soundEnabled = enable;
        } else {
            Sound.soundEnabled = !Sound.soundEnabled;
        }
    }
}
