"use strict";
Wolf.File = (function () {
    function openURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 0) {
                    callback(null, {
                        data: xhr.responseText,
                        size: xhr.responseText.length,
                        position: 0
                    });
                }
                else {
                    callback(new Error("Server returned HTTP status: " + xhr.status));
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.send(null);
    }
    function open(filename, files, callback) {
        var b64data = files[filename];
        if (b64data) {
            var data = atob(b64data);
            callback(null, {
                data: data,
                size: data.length,
                position: 0
            });
        }
        else {
            callback(new Error("File not found: " + filename));
        }
    }
    function readUInt8(f) {
        var b = f.data.charCodeAt(f.position) & 0xFF;
        f.position++;
        return b;
    }
    function readInt8(f) {
        var v = readUInt8(f);
        return v > 127 ? v - 256 : v;
    }
    function readUInt16(f) {
        var v = readUInt8(f) + (readUInt8(f) << 8);
        return (v < 0) ? v + 0x10000 : v;
    }
    function readInt16(f) {
        var v = readUInt16(f);
        return (v > 0x7fff) ? v - 0x10000 : v;
    }
    function readUInt32(f) {
        var b0 = readUInt8(f), b1 = readUInt8(f), b2 = readUInt8(f), b3 = readUInt8(f), v = ((((b3 << 8) + b2) << 8) + b1 << 8) + b0;
        return (v < 0) ? v + 0x100000000 : v;
    }
    function readInt32(f) {
        var v = readUInt32(f);
        return (v > 0x7fffffff) ? v - 0x100000000 : v;
    }
    function readString(f, length) {
        var str = f.data.substr(f.position, length);
        f.position += length;
        return str;
    }
    function readBytes(f, num) {
        var b = [];
        for (var i = 0; i < num; i++) {
            b[i] = f.data.charCodeAt(f.position + i) & 0xFF;
        }
        f.position += num;
        return b;
    }
    return {
        open: open,
        readInt8: readInt8,
        readUInt8: readUInt8,
        readInt16: readInt16,
        readUInt16: readUInt16,
        readInt32: readInt32,
        readUInt32: readUInt32,
        readBytes: readBytes,
        readString: readString
    };
})();
