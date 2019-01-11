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
}

Wolf.Sound = (function() {

    var sounds = {},
        audioElements = [],
        currentMusic,
        soundEnabled = true,
        musicEnabled = true,
        music,
        ext, 
        exts = ["ogg", "mp3"];
    
    function getFileName(file) {
        if (!ext) {
            // look for a probably
            for (var i=0;i<exts.length;i++) {
                if (Modernizr.audio[exts[i]] == "probably") {
                    ext = exts[i];
                    break;
                }
            }
            // look for a maybe
            if (!ext) {
                for (var i=0;i<exts.length;i++) {
                    if (Modernizr.audio[exts[i]] == "maybe") {
                        ext = exts[i];
                        break;
                    }
                }
            }
        }
        return file.split(".")[0] + "." + ext
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
        for (var i=0;i<sounds[file].length;i++) {
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

        audio.volume = volume * Sound.MASTER_VOLUME * (soundEnabled ? 1 : 0);
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
            music.volume = Sound.MUSIC_VOLUME * Sound.MASTER_VOLUME * (musicEnabled ? 1 : 0);
            music.play();
        }
    }

    function stopAllSounds() {
        for (var i=0;i<audioElements.length;i++) {
            if (audioElements[i].currentTime > 0) {
                audioElements[i].currentTime = 0;
                audioElements[i].pause();
            }
        }
    }
    
    function init() {
    }
    
    
    function isMusicEnabled() {
        return musicEnabled
    }
    
    function isSoundEnabled() {
        return soundEnabled;
    }
   
    function toggleMusic(enable) {
        if (typeof enable != "undefined") {
            musicEnabled = enable;
        } else {
            musicEnabled = !musicEnabled;
        }
        if (music) {
            music.volume = Sound.MUSIC_VOLUME * Sound.MASTER_VOLUME * (musicEnabled ? 1 : 0);
        }
    }
    
    function pauseMusic(enable) {
        if (music) {
            if (enable) {
                music.pause();
            } else if (music.paused) {
                music.play();
            }
        }
    }

    function toggleSound(enable) {
        if (typeof enable != "undefined") {
            soundEnabled = enable;
        } else {
            soundEnabled = !soundEnabled;
        }
    }

    if (Modernizr.audio) {
        return {
            startSound : startSound,
            startMusic : startMusic,
            stopAllSounds : stopAllSounds,
            isMusicEnabled : isMusicEnabled,
            isSoundEnabled : isSoundEnabled,
            toggleMusic : toggleMusic,
            toggleSound : toggleSound,
            pauseMusic : pauseMusic,
            init : init
        }
    } else {
        return {
            startSound : Wolf.noop,
            startMusic : Wolf.noop,
            stopAllSounds : Wolf.noop,
            isMusicEnabled : Wolf.noop,
            isSoundEnabled : Wolf.noop,
            toggleMusic : Wolf.noop,
            toggleSound : Wolf.noop,
            pauseMusic : Wolf.noop,
            init : Wolf.noop
        }
    }
})();