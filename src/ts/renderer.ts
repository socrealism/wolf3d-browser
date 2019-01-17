/**
 * @description DOM renderer
 */
class Renderer {
    static readonly FOV_RAD = 75 * Math.PI / 180;
    static readonly ISCHROME = /chrome/.test(navigator.userAgent.toLowerCase());
    static readonly ISFIREFOX = /firefox/.test(navigator.userAgent.toLowerCase());
    static readonly ISXP = /windows nt 5\./.test(navigator.userAgent.toLowerCase());
    static readonly ISWEBKIT = /webkit/.test(navigator.userAgent.toLowerCase());

    static readonly VIEW_DIST = (Wolf.XRES / 2) / Math.tan((Renderer.FOV_RAD / 2));
    static readonly TEXTURERESOLUTION = Renderer.ISCHROME ? 128 : 64;

    protected static slices = [];
    protected static useBackgroundImage = Renderer.ISWEBKIT;
    protected static texturePath = "assets/art/walls-shaded/" + Renderer.TEXTURERESOLUTION + "/";
    protected static spritePath = "assets/art/sprites/" + Renderer.TEXTURERESOLUTION + "/";
    protected static sprites = [];
    protected static maxDistZ = 64 * 0x10000;
    protected static hasInit = false;
    protected static visibleSprites = [];

    static init() {
        let image, slice, x;

        if (Renderer.hasInit) {
            return;
        }

        Renderer.hasInit = true;

        $("#renderer")
            .width(Wolf.XRES + "px")
            .height(Wolf.YRES + "px");

        for (x = 0; x < Wolf.XRES; x += Wolf.SLICE_WIDTH) {
            slice = $("<div>");
            slice.css({
                position: "absolute",
                width: Wolf.SLICE_WIDTH + "px",
                height: Wolf.YRES + "px",
                left: x + "px",
                top: 0,
                overflow: "hidden"
            });
            slice.appendTo("#renderer");

            image = Renderer.useBackgroundImage ? $("<div>") : $("<img>");

            image.css({
                position: "absolute",
                display: "block",
                top: 0,
                height: 0,
                width: Wolf.SLICE_WIDTH * Wolf.WALL_TEXTURE_WIDTH + "px",
                backgroundSize: "100% 100%"
            });

            const sliceElement = slice[0];

            sliceElement.texture = image[0];
            sliceElement.appendChild(sliceElement.texture);

            Renderer.slices.push(sliceElement);
        }
    }

    static reset() {
        $("#renderer .sprite").remove();

        Renderer.sprites = [];
        Renderer.visibleSprites = [];
    }

    static processTrace(viewport, tracePoint) {
        var x = tracePoint.x,
            y = tracePoint.y,
            vx = viewport.x,
            vy = viewport.y,

            dx = viewport.x - tracePoint.x,
            dy = viewport.y - tracePoint.y,
            dist = Math.sqrt(dx * dx + dy * dy),
            frac,
            h, w, offset;

        // correct for fisheye
        dist = dist * Math.cos(Wolf.FINE2RAD(tracePoint.angle - viewport.angle));

        w = Wolf.WALL_TEXTURE_WIDTH * Wolf.SLICE_WIDTH;
        h = (Renderer.VIEW_DIST / dist * Wolf.TILEGLOBAL) >> 0;

        if (tracePoint.flags & Raycaster.TRACE_HIT_DOOR) {
            if (tracePoint.flags & Raycaster.TRACE_HIT_VERT) {
                if (x < vx) {
                    frac = tracePoint.frac;
                } else {
                    frac = 1 - tracePoint.frac;
                }
            } else {
                if (y < vy) {
                    frac = 1 - tracePoint.frac;
                } else {
                    frac = tracePoint.frac;
                }
            }
        } else {
            frac = 1 - tracePoint.frac;
        }

        offset = frac * w;
        if (offset > w - Wolf.SLICE_WIDTH) {
            offset = w - Wolf.SLICE_WIDTH;
        }
        offset = Math.round(offset / Wolf.SLICE_WIDTH) * Wolf.SLICE_WIDTH;
        if (offset < 0) {
            offset = 0;
        }

        return {
            w: w,
            h: h,
            dist: dist,
            vert: tracePoint.flags & Raycaster.TRACE_HIT_VERT,
            offset: offset
        };
    }

    static clear() {
        var n, sprite;

        for (n = 0; n < Renderer.visibleSprites.length; n++) {
            sprite = Renderer.visibleSprites[n].sprite;
            if (sprite && sprite.div) {
                sprite.div.style.display = "none";
            }
        }
    }

    static draw(viewport, level, tracers, visibleTiles) {
        let tracePoint;

        for (let n = 0, len = tracers.length; n < len; ++n) {
            tracePoint = tracers[n];
            if (!tracePoint.oob) {
                if (tracePoint.flags & Raycaster.TRACE_HIT_DOOR) {
                    Renderer.drawDoor(n, viewport, tracePoint, level);
                } else {
                    Renderer.drawWall(n, viewport, tracePoint, level);
                }
            }
        }

        Renderer.drawSprites(viewport, level, visibleTiles);
    }

    static updateSlice(n, textureSrc, proc) {
        var slice = Renderer.slices[n],
            image = slice.texture,
            sliceStyle = slice.style,
            imgStyle = image.style,
            top = (Wolf.YRES - proc.h) / 2,
            left = -(proc.offset) >> 0,
            height = proc.h,
            z = (Renderer.maxDistZ - proc.dist) >> 0,
            itop;

        if (Renderer.ISXP && Renderer.ISFIREFOX) {
            itop = (proc.texture % 2) ? 0 : -height;
        } else {
            itop = -(proc.texture - 1) * height;
            textureSrc = "assets/art/walls-shaded/64/walls.png";
        }

        if (image._src != textureSrc) {
            image._src = textureSrc;
            if (Renderer.useBackgroundImage) {
                imgStyle.backgroundImage = "url(" + textureSrc + ")";
            } else {
                image.src = textureSrc;
            }
        }

        if (slice._zIndex != z) {
            sliceStyle.zIndex = slice._zIndex = z;
        }
        if (image._height != height) {
            sliceStyle.height = (image._height = height) + "px";
            if (Renderer.ISXP && Renderer.ISFIREFOX) {
                imgStyle.height = (height * 2) + "px";
            } else {
                imgStyle.height = (height * 120) + "px";
            }
        }

        if (image._itop != itop) {
            imgStyle.top = (image._itop = itop) + "px";
        }

        if (image._top != top) {
            sliceStyle.top = (image._top = top) + "px";
        }
        if (image._left != left) {
            imgStyle.left = (image._left = left) + "px";
        }
    }

    static drawWall(n, viewport, tracePoint, level) {
        var x = tracePoint.tileX,
            y = tracePoint.tileY,
            vx = Wolf.POS2TILE(viewport.x),
            vy = Wolf.POS2TILE(viewport.y),
            tileMap = level.tileMap,
            proc = Renderer.processTrace(viewport, tracePoint),
            texture = proc.vert ? level.wallTexX[x][y] : level.wallTexY[x][y],
            textureSrc;


        // door sides
        if (tracePoint.flags & Raycaster.TRACE_HIT_VERT) {
            if (x >= vx && tileMap[x - 1][y] & Level.DOOR_TILE) {
                texture = Doors.TEX_PLATE;
            }
            if (x < vx && tileMap[x + 1][y] & Level.DOOR_TILE) {
                texture = Doors.TEX_PLATE;
            }
        } else {
            if (y >= vy && tileMap[x][y - 1] & Level.DOOR_TILE) {
                texture = Doors.TEX_PLATE;
            }
            if (y < vy && tileMap[x][y + 1] & Level.DOOR_TILE) {
                texture = Doors.TEX_PLATE;
            }
        }

        texture++;

        proc.texture = texture;

        if (texture % 2 == 0) {
            texture--;
        }
        textureSrc = Renderer.texturePath + "w_" + texture + ".png";

        Renderer.updateSlice(n, textureSrc, proc);
    }

    static drawDoor(n, viewport, tracePoint, level) {
        var proc = Renderer.processTrace(viewport, tracePoint),
            texture, textureSrc;

        //texture = Doors.TEX_DDOOR + 1;
        texture = level.state.doorMap[tracePoint.tileX][tracePoint.tileY].texture + 1;

        proc.texture = texture;

        if (texture % 2 == 0) {
            texture -= 1;
        }

        textureSrc = Renderer.texturePath + "w_" + texture + ".png";

        Renderer.updateSlice(n, textureSrc, proc);
    }

    static drawSprites(viewport, level, visibleTiles) {
        var vis, n,
            dist, dx, dy, angle,
            z, width, size,
            div, image,
            divStyle, imgStyle;

        // build visible sprites list
        Renderer.visibleSprites = Sprites.createVisList(viewport, level, visibleTiles);

        for (n = 0; n < Renderer.visibleSprites.length; ++n) {
            vis = Renderer.visibleSprites[n];
            dist = vis.dist;

            if (dist < Wolf.MINDIST / 2) {
                //continue; // little hack to save speed & z-buffer
            }

            // make sure sprite is loaded
            if (!vis.sprite.div) {
                Renderer.loadSprite(vis.sprite)
            }

            div = vis.sprite.div;
            divStyle = div.style;

            image = div.image;
            imgStyle = image.style;

            dx = vis.sprite.x - viewport.x;
            dy = vis.sprite.y - viewport.y;
            angle = Math.atan2(dy, dx) - Wolf.FINE2RAD(viewport.angle);

            //dist = dist * Math.cos(angle);

            size = (Renderer.VIEW_DIST / dist * Wolf.TILEGLOBAL) >> 0;

            divStyle.display = "block";
            divStyle.width = size + "px";
            divStyle.height = size + "px";

            divStyle.left = (Wolf.XRES / 2 - size / 2 - Math.tan(angle) * Renderer.VIEW_DIST) + "px";

            divStyle.top = (Wolf.YRES / 2 - size / 2) + "px";

            var texture = Sprites.getTexture(vis.sprite.tex[0]);
            var textureSrc = Renderer.spritePath + texture.sheet;

            if (image._src != textureSrc) {
                image._src = textureSrc;
                if (Renderer.useBackgroundImage) {
                    imgStyle.backgroundImage = "url(" + textureSrc + ")";
                } else {
                    image.src = textureSrc;
                }
            }

            z = (Renderer.maxDistZ - dist) >> 0;
            width = texture.num * size;
            var left = -texture.idx * size;

            if (div._zIndex != z) {
                divStyle.zIndex = div._zIndex = z;
            }
            if (image._width != width) {
                imgStyle.width = (image._width = width) + "px";
            }
            if (image._height != size) {
                imgStyle.height = (image._height = size) + "px";
            }
            if (image._left != left) {
                imgStyle.left = (image._left = left) + "px";
            }
        }
    }

    static unloadSprite(sprite) {
        if (sprite.div) {
            $(sprite.div).remove();
            sprite.div = null;
        }
    }

    static loadSprite(sprite) {
        var div = document.createElement("div"),
            image;

        div.style.display = "none";
        div.style.position = "absolute";
        div.style.width = "128px";
        div.style.height = "128px";
        div.style.overflow = "hidden";
        div.className = "sprite";

        image = Renderer.useBackgroundImage ? $("<div>") : $("<img>");

        image.css({
            position: "absolute",
            display: "block",
            top: 0,
            height: "100%",
            width: "100%",
            backgroundSize: "100%",
            backgroundRepeat: "no-repeat"
        });

        div.image = image[0];
        div.appendChild(div.image);

        sprite.div = div;
        $("#renderer").append(div);
    }
}
