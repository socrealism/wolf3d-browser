/**
 * @description Audio subsystem
 */
class Sound {
    // Sound channels
    // Channel 0 never willingly overrides
    // Other channels (1-7) always override a playing sound on that channel
    static readonly CHAN_AUTO = 0;
    static readonly CHAN_WEAPON = 1;
    static readonly CHAN_VOICE = 2;
    static readonly CHAN_ITEM = 3;
    static readonly CHAN_BODY = 4;
    // Modifier flags
    static readonly CHAN_NO_PHS_ADD = 8; // Send to all clients, not just ones in PHS (ATTN 0 will also do this)
    static readonly CHAN_RELIABLE = 16; // Send by reliable message, not datagram
    // Sound attenuation values
    static readonly ATTN_NONE = 0; // Full volume the entire level
    static readonly ATTN_NORM = 1;
    static readonly ATTN_IDLE = 2;
    static readonly ATTN_STATIC = 3; // Diminish very rapidly with distance

    static readonly MAX_PLAYSOUNDS = 128;
    static readonly MAX_CHANNELS = 64;

    static readonly MUSIC_VOLUME = 0.8;
    static readonly MASTER_VOLUME = 0.6;

    static sounds = {};
    static audioElements = [];
    static currentMusic;
    static soundEnabled: boolean = true;
    static musicEnabled: boolean = true;
    static music;
    static ext;
    static exts = ["ogg", "mp3"];

    protected static available: boolean = true;

    static getFileName(file) {
        if (!Sound.available) return;

        if (!Sound.ext) {
            // look for a probably
            for (let i = 0; i < Sound.exts.length; i++) {
                if (Modernizr.audio[Sound.exts[i]] == "probably") {
                    Sound.ext = Sound.exts[i];
                    break;
                }
            }
            // look for a maybe
            if (!Sound.ext) {
                for (let i = 0; i < Sound.exts.length; i++) {
                    if (Modernizr.audio[Sound.exts[i]] == "maybe") {
                        Sound.ext = Sound.exts[i];
                        break;
                    }
                }
            }
        }
        return file.split(".")[0] + "." + Sound.ext
    }

    static createAudioElement() {
        if (!Sound.available) return;

        const audio = new Audio();
        Sound.audioElements.push(audio);
        return audio;
    }

    static startSound(posPlayer, posSound, entNum, entChannel, file, volume, attenuation, timeOfs) {
        if (!Sound.available) return;

        let audio, dx, dy, dist;

        if (!Sound.sounds[file]) {
            Sound.sounds[file] = [];
        }
        for (let i = 0; i < Sound.sounds[file].length; i++) {
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
        if (!Sound.available) return;

        if (!Sound.music) {
            Sound.music = Sound.createAudioElement();
            Sound.music.loop = true;
        }

        const filename = Sound.getFileName(file);

        if (Sound.currentMusic != filename) {
            Sound.music.src = Sound.currentMusic = filename;
            Sound.music.volume = Sound.MUSIC_VOLUME * Sound.MASTER_VOLUME * (Sound.musicEnabled ? 1 : 0);
            Sound.music.play();
        }
    }

    static stopAllSounds() {
        if (!Sound.available) return;

        for (let i = 0; i < Sound.audioElements.length; i++) {
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
        return Sound.musicEnabled
    }

    static isSoundEnabled() {
        return Sound.soundEnabled;
    }

    static toggleMusic(enable) {
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

    static pauseMusic(enable) {
        if (!Sound.available) return;

        if (Sound.music) {
            if (enable) {
                Sound.music.pause();
            } else if (Sound.music.paused) {
                Sound.music.play();
            }
        }
    }

    static toggleSound(enable) {
        if (!Sound.available) return;

        if (typeof enable != "undefined") {
            Sound.soundEnabled = enable;
        } else {
            Sound.soundEnabled = !Sound.soundEnabled;
        }
    }
}

Sound.init();
