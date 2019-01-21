"use strict";
class Input {
    static init() {
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
                    for (let i = 0, n = Input.bindings[e.keyCode].length; i < n; i++) {
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
                    }
                    else if (e.which == 3) {
                        Input.rmbDown = true;
                    }
                }
                else {
                    window.focus();
                }
                e.preventDefault();
            })
                .on("mouseup", function (e) {
                if (Input.hasFocus) {
                    if (e.which == 1) {
                        Input.lmbDown = false;
                    }
                    else if (e.which == 3) {
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
                    }
                    else if ("mozMovementX" in e.originalEvent) {
                        Input.mouseMoveX += e.originalEvent.mozMovementX;
                        Input.mouseMoveY += e.originalEvent.mozMovementY;
                    }
                    else if ("movementX" in e.originalEvent) {
                        Input.mouseMoveX += e.originalEvent.movementX;
                        Input.mouseMoveY += e.originalEvent.movementY;
                    }
                }
                else {
                    if (Game.isFullscreen()) {
                        Input.mouseX = e.pageX / window.innerWidth;
                        Input.mouseY = e.pageY / window.innerHeight;
                    }
                    else {
                        const offset = main.offset();
                        Input.mouseX = (e.pageX - offset.left) / main.width();
                        Input.mouseY = (e.pageY - offset.top) / main.height();
                    }
                }
                e.preventDefault();
            });
            $(window).on("blur", () => {
                Input.hasFocus = false;
                Input.reset();
            });
            $(window).on("focus", () => {
                Input.hasFocus = true;
            });
        }
    }
    static reset() {
        Input.resetMouse();
        Input.keys = [];
    }
    static resetMouse() {
        Input.lmbDown = false;
        Input.rmbDown = false;
        Input.mouseX = Input.mouseY = 0.5;
    }
    static bindKey(k, handler) {
        const keyCode = Input.keysCode[k];
        if (!Input.bindings[keyCode]) {
            Input.bindings[keyCode] = [];
        }
        Input.bindings[keyCode].push(handler);
    }
    static checkKeys(ckeys) {
        for (let i = 0; i < ckeys.length; i++) {
            const k = ckeys[i];
            if (!!Input.keys[Input.keysCode[k]]) {
                return true;
            }
        }
        return false;
    }
    static clearKeys(ckeys) {
        for (let i = 0; i < ckeys.length; i++) {
            const k = ckeys[i];
            Input.keys[Input.keysCode[k]] = false;
        }
        return false;
    }
    static leftMouseDown() {
        return Input.lmbDown;
    }
    static rightMouseDown() {
        return Input.rmbDown;
    }
    static getMouseCoords() {
        if (Input.mouseX < 0 || Input.mouseX > 1 || Input.mouseY < 0 || Input.mouseY > 1) {
            return null;
        }
        else {
            return {
                x: (Input.mouseX - 0.5) * 2,
                y: (Input.mouseY - 0.5) * 2
            };
        }
    }
    static getMouseMovement() {
        const x = Input.mouseMoveX, y = Input.mouseMoveY;
        Input.mouseMoveX = 0;
        Input.mouseMoveY = 0;
        return {
            x: x / screen.width,
            y: y / screen.height
        };
    }
    static getPointer() {
        const pointer = navigator.pointer;
        return pointer;
    }
    static isPointerLocked() {
        const pointer = Input.getPointer();
        return pointer && pointer.isLocked && pointer.isLocked();
    }
    static lockPointer() {
        const pointer = Input.getPointer();
        if (!pointer) {
            return;
        }
        if (Game.isFullscreen()) {
            pointer.lock($("#game")[0], e => {
                Wolf.log("Pointer locked");
            }, e => {
                Wolf.log("Could not lock pointer: " + e);
            });
        }
    }
    static unlockPointer() {
        const pointer = Input.getPointer();
        if (!pointer) {
            return;
        }
        pointer.unlock($("#game")[0]);
    }
}
Input.lmbDown = false;
Input.rmbDown = false;
Input.bindings = [];
Input.hasFocus = false;
Input.mouseX = -1;
Input.mouseY = -1;
Input.mouseMoveX = 0;
Input.mouseMoveY = 0;
Input.keysCode = {
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
Input.init();
