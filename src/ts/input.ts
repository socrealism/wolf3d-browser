/**
 * @namespace
 * @description Functions for capturing keyboard/mouse input
 */
class Input {
    public static keys;
    public static lmbDown = false;
    public static rmbDown = false;
    public static bindings = [];
    public static hasFocus = false;
    public static mouseX = -1;
    public static mouseY = -1;
    public static mouseMoveX = 0;
    public static mouseMoveY = 0;
    public static keysCode = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        ENTER: 13,
        SPACE: 32,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        ESC: 27,
        HOME: 36,
        END: 35,
        DEL: 46,
        INS: 45,
        PGUP: 33,
        PGDN: 34,
        SLASH: 111,
        MINUS: 109,
        PLUS: 107,
        COMMA: 188,
        PERIOD: 190,
        1: 49,
        2: 50,
        3: 51,
        4: 52,
        5: 53,
        6: 54,
        7: 55,
        8: 56,
        9: 57,
        0: 58,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123
    };

    public static init() {
        const main = $("#main");

        if (!Input.keys) {
            Input.keys = [];

            $(document)
                .on("keydown", function (e) {
                    e.preventDefault();

                    if (!Game.isPlaying()) {
                        return;
                    }

                    Input.keys[e.keyCode] = true;
                    if (Input.bindings[e.keyCode]) {
                        for (var i = 0, n = Input.bindings[e.keyCode].length; i < n; i++) {
                            Input.bindings[e.keyCode][i](e);
                        }
                    }
                })
                .on("keyup", function (e) {
                    e.preventDefault();
                    if (!Game.isPlaying()) {
                        return;
                    }
                    Input.keys[e.keyCode] = false;
                })
                .on("keypress", function (e) {
                    e.preventDefault();
                })
                .on("contextmenu", function (e) {
                    e.preventDefault();
                })
                .on("onrightclick", function (e) {
                    e.preventDefault();
                })
                .on("mousedown", function (e) {
                    window.focus();
                    e.preventDefault();
                })
                .on("mouseup", function (e) {
                    e.preventDefault();
                });

            $("#game")
                .on("mousedown", function (e) {
                    if (Input.hasFocus) {
                        if (e.which == 1) {
                            Input.lmbDown = true;
                        } else if (e.which == 3) {
                            Input.rmbDown = true;
                        }
                    } else {
                        window.focus();
                    }
                    e.preventDefault();
                })
                .on("mouseup", function (e) {
                    if (Input.hasFocus) {
                        if (e.which == 1) {
                            Input.lmbDown = false;
                        } else if (e.which == 3) {
                            Input.rmbDown = false;
                        }
                    }
                    e.preventDefault();
                })
                .on("mousemove", function (e) {
                    if (!Input.hasFocus) {
                        return;
                    }

                    if (Input.isPointerLocked()) {
                        if ("webkitMovementX" in e.originalEvent) {
                            Input.mouseMoveX += e.originalEvent.webkitMovementX;
                            Input.mouseMoveY += e.originalEvent.webkitMovementY;
                        } else if ("mozMovementX" in e.originalEvent) {
                            Input.mouseMoveX += e.originalEvent.mozMovementX;
                            Input.mouseMoveY += e.originalEvent.mozMovementY;
                        } else if ("movementX" in e.originalEvent) {
                            Input.mouseMoveX += e.originalEvent.movementX;
                            Input.mouseMoveY += e.originalEvent.movementY;
                        }
                    } else {
                        if (Game.isFullscreen()) {
                            Input.mouseX = e.pageX / window.innerWidth;
                            Input.mouseY = e.pageY / window.innerHeight;
                        } else {
                            var offset = main.offset();
                            Input.mouseX = (e.pageX - offset.left) / main.width();
                            Input.mouseY = (e.pageY - offset.top) / main.height();
                        }
                    }
                    e.preventDefault();
                });

            // reset keys and mouse if window/tab loses focus
            $(window).on("blur", function (e) {
                Input.hasFocus = false;
                Input.reset();
            });
            $(window).on("focus", function (e) {
                Input.hasFocus = true;
            });
        }
    }

    public static reset() {
        Input.resetMouse();
        Input.keys = [];
    }

    public static resetMouse() {
        Input.lmbDown = false;
        Input.rmbDown = false;
        Input.mouseX = Input.mouseY = 0.5;
    }

    public static bindKey(k, handler) {
        var keyCode = Input.keysCode[k];
        if (!Input.bindings[keyCode]) {
            Input.bindings[keyCode] = [];
        }
        Input.bindings[keyCode].push(handler);
    }

    /**
     * @description Check if one of the specified keys is pressed.
     * @param {array} keys Array of key names.
     * @returns {boolean} True if a key is pressed, otherwise false.
     */
    public static checkKeys(ckeys) {
        for (var i = 0; i < ckeys.length; i++) {
            var k = ckeys[i];
            if (!!Input.keys[Input.keysCode[k]]) {
                return true;
            }
        }
        return false;
    }

    /**
     * @description Clear status for keys.
     * @param {array} keys Array of key names.
     */
    public static clearKeys(ckeys) {
        for (var i = 0; i < ckeys.length; i++) {
            var k = ckeys[i];
            Input.keys[Input.keysCode[k]] = false;
        }
        return false;
    }

    public static leftMouseDown() {
        return Input.lmbDown;
    }

    public static rightMouseDown() {
        return Input.rmbDown;
    }

    public static getMouseCoords() {
        if (Input.mouseX < 0 || Input.mouseX > 1 || Input.mouseY < 0 || Input.mouseY > 1) {
            return null;
        } else {
            return {
                x: (Input.mouseX - 0.5) * 2,
                y: (Input.mouseY - 0.5) * 2
            };
        }
    }

    public static getMouseMovement() {
        var x = Input.mouseMoveX,
            y = Input.mouseMoveY;
        Input.mouseMoveX = 0;
        Input.mouseMoveY = 0;
        return {
            x: x / screen.width,
            y: y / screen.height
        };
    }

    public static getPointer() {
        var pointer = navigator.pointer ||
            navigator.webkitPointer ||
            navigator.mozPointer ||
            navigator.msPointer ||
            navigator.oPointer;
        return pointer;
    }

    public static isPointerLocked() {
        var pointer = Input.getPointer();
        return pointer && pointer.isLocked && pointer.isLocked();
    }

    public static lockPointer() {
        var pointer = Input.getPointer();
        if (!pointer) {
            return;
        }

        if (Game.isFullscreen()) {
            pointer.lock($("#game")[0],
                function (e) {
                    Wolf.log("Pointer locked")
                }, function (e) {
                    Wolf.log("Could not lock pointer: " + e);
                }
            );
        }
    }

    public static unlockPointer() {
        var pointer = Input.getPointer();
        if (!pointer) {
            return;
        }
        pointer.unlock($("#game")[0]);
    }
}
