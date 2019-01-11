"use strict";
class FS {
    static openURL(url, callback) {
        const xhr = new XMLHttpRequest();
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
    static open(filename, files, callback) {
        const b64data = files[filename];
        if (b64data) {
            const data = atob(b64data);
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
    static readUInt8(f) {
        const b = f.data.charCodeAt(f.position) & 0xFF;
        f.position++;
        return b;
    }
    static readInt8(f) {
        const v = FS.readUInt8(f);
        return v > 127 ? v - 256 : v;
    }
    static readUInt16(f) {
        const v = FS.readUInt8(f) + (FS.readUInt8(f) << 8);
        return (v < 0) ? v + 0x10000 : v;
    }
    static readInt16(f) {
        const v = FS.readUInt16(f);
        return (v > 0x7fff) ? v - 0x10000 : v;
    }
    static readUInt32(f) {
        const b0 = FS.readUInt8(f), b1 = FS.readUInt8(f), b2 = FS.readUInt8(f), b3 = FS.readUInt8(f), v = ((((b3 << 8) + b2) << 8) + b1 << 8) + b0;
        return (v < 0) ? v + 0x100000000 : v;
    }
    static readInt32(f) {
        const v = FS.readUInt32(f);
        return (v > 0x7fffffff) ? v - 0x100000000 : v;
    }
    static readString(f, length) {
        const str = f.data.substr(f.position, length);
        f.position += length;
        return str;
    }
    static readBytes(f, num) {
        const b = [];
        for (let i = 0; i < num; i++) {
            b[i] = f.data.charCodeAt(f.position + i) & 0xFF;
        }
        f.position += num;
        return b;
    }
}
