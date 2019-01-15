/**
 * @description Binary file reading
 */
class FS {
    /**
     * @description Open a file from URL
     * @param {string} url The URL to open
     * @param {function} callback Is called when file has been loaded. Second argument is file obj.
     */
    static openURL(url, callback) {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 0) {
                    callback(null, {
                        data : xhr.responseText,
                        size : xhr.responseText.length,
                        position : 0
                    });
                } else {
                    callback(new Error("Server returned HTTP status: " + xhr.status));
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.send(null);
    }

    /**
     * @description Open a file from base64 filetable
     * @param {string} filename The name of the file to open
     * @param {object} files The filetable
     * @param {function} callback Is called when file has been loaded. Second argument is file obj.
     */
    static open(filename, files, callback) {
        const b64data = files[filename];

        if (b64data) {
            const data = atob(b64data);

            callback(null, {
                data : data,
                size : data.length,
                position : 0
            });
        } else {
            callback(new Error("File not found: " + filename));
        }
    }

    /**
     * @description Read an unsigned 8-bit integer from a file and advance the file position.
     * @param {object} f The file
     * @returns {number}
     */
    static readUInt8(f) {
        const b = f.data.charCodeAt(f.position) & 0xFF;

        f.position++;

        return b;
    }

    /**
     * @description Read a signed 8-bit integer from a file and advance the file position.
     * @param {object} f The file
     * @returns {number}
     */
    static readInt8(f) {
        const v = FS.readUInt8(f);

        return v > 127 ? v - 256 : v;
    }

    /**
     * @description Read an unsigned 16-bit integer from a file and advance the file position.
     * @param {object} f The file
     * @returns {number}
     */
    static readUInt16(f) {
        const v = FS.readUInt8(f) + (FS.readUInt8(f) << 8);

        return (v < 0) ? v + 0x10000 : v;
    }

    /**
     * @description Read a signed 16-bit integer from a file and advance the file position.
     * @param {object} f The file
     * @returns {number}
     */
    static readInt16(f) {
        const v = FS.readUInt16(f);

        return (v > 0x7fff) ? v - 0x10000 : v;
    }

    /**
     * @description Read an unsigned 32-bit integer from a file and advance the file position.
     * @param {object} f The file
     * @returns {number}
     */
    static readUInt32(f) {
        const b0 = FS.readUInt8(f),
            b1 = FS.readUInt8(f),
            b2 = FS.readUInt8(f),
            b3 = FS.readUInt8(f),
            v = ((((b3 << 8) + b2) << 8) + b1 << 8) + b0;

        return (v < 0) ? v + 0x100000000 : v;
    }

    /**
     * @description Read a signed 32-bit int from a file and advance the file position.
     * @param {object} f The file
     * @returns {number}
     */
    static readInt32(f) {
        const v = FS.readUInt32(f);

        return (v > 0x7fffffff) ? v - 0x100000000 : v;
    }

    /**
     * @description Read a string from a file and advance the file position.
     * @param {object} f The file
     * @param {number} length The length of the string
     * @returns {string}
     */
    static readString(f, length) {
        const str = f.data.substr(f.position, length);

        f.position += length;

        return str;
    }

    /**
     * @description Read an array of bytes a file and advance the file position.
     * @param {object} f The file
     * @param {number} num The number of bytes to read
     * @returns {array}
     */
    static readBytes(f, num) {
        const b = [];

        for (let i = 0; i < num; i++) {
            b[i] = f.data.charCodeAt(f.position + i) & 0xFF;
        }

        f.position += num;

        return b;
    }
}
