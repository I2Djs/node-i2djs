
import path from "./path.js";
import geometry from "./geometry.js";
import colorMap from "./colorMap.js";
const { createCanvas, Image } = require('canvas');
require("canvas-5-polyfill");

import {
    NodePrototype,
    CollectionPrototype,
} from "./coreApi.js";
const t2DGeometry = geometry;
let Id = 0;

function domId() {
    Id += 1;
    return Id;
}

const CanvasCollection = function () {
    CollectionPrototype.apply(this, arguments);
};
CanvasCollection.prototype = new CollectionPrototype();
CanvasCollection.prototype.constructor = CanvasCollection;
CanvasCollection.prototype.createNode = function (ctx, config, vDomIndex) {
    return new CanvasNodeExe(ctx, config, domId(), vDomIndex);
};

function domSetAttribute(attr, value) {
    if (value == null && this.attr[attr] != null) {
        delete this.attr[attr];
    } else {
        this.attr[attr] = value;
    }
}

function domSetStyle(attr, value) {
    if (value == null && this.style[attr] != null) {
        delete this.style[attr];
    } else {
        this.style[attr] = value;
    }
}

function cRender(attr) {
    const self = this;

    if (attr.transform) {
        const { transform } = attr;
        const { scale = [1, 1], skew = [0, 0], translate = [0, 0] } = transform;
        const [hozScale = 1, verScale = hozScale] = scale;
        const [hozSkew = 0, verSkew = hozSkew] = skew;
        const [hozMove = 0, verMove = hozMove] = translate;

        self.ctx.transform(hozScale, hozSkew, verSkew, verScale, hozMove, verMove);

        if (transform.rotate && transform.rotate.length > 0) {
            self.ctx.translate(transform.rotate[1] || 0, transform.rotate[2] || 0);
            self.ctx.rotate(transform.rotate[0] * (Math.PI / 180));
            self.ctx.translate(-transform.rotate[1] || 0, -transform.rotate[2] || 0);
        }
    }

    for (let i = 0; i < self.stack.length; i += 1) {
        self.stack[i].execute();
    }
}

function parseTransform(transform) {
    const output = {
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
    };

    if (transform) {
        if (transform.translate && transform.translate.length > 0) {
            output.translateX = transform.translate[0];
            output.translateY = transform.translate[1];
        }

        if (transform.scale && transform.scale.length > 0) {
            output.scaleX = transform.scale[0];
            output.scaleY = transform.scale[1] || output.scaleX;
        }
    }

    return output;
}

function RPolyupdateBBox() {
    const self = this;
    const { transform, points = [] } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    if (points && points.length > 0) {
        let minX = points[0].x;
        let maxX = points[0].x;
        let minY = points[0].y;
        let maxY = points[0].y;

        for (let i = 1; i < points.length; i += 1) {
            if (minX > points[i].x) minX = points[i].x;
            if (maxX < points[i].x) maxX = points[i].x;
            if (minY > points[i].y) minY = points[i].y;
            if (maxY < points[i].y) maxY = points[i].y;
        }

        self.BBox = {
            x: translateX + minX * scaleX,
            y: translateY + minY * scaleY,
            width: (maxX - minX) * scaleX,
            height: (maxY - minY) * scaleY,
        };
    } else {
        self.BBox = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
}

function CanvasGradients(config, type) {
    this.config = config;
    this.type = type || "linear";
    this.mode = !this.config.mode || this.config.mode === "percent" ? "percent" : "absolute";
}

CanvasGradients.prototype.exe = function GRAexe(ctx, BBox) {
    if (this.type === "linear" && this.mode === "percent") {
        return this.linearGradient(ctx, BBox);
    }

    if (this.type === "linear" && this.mode === "absolute") {
        return this.absoluteLinearGradient(ctx);
    } else if (this.type === "radial" && this.mode === "percent") {
        return this.radialGradient(ctx, BBox);
    } else if (this.type === "radial" && this.mode === "absolute") {
        return this.absoluteRadialGradient(ctx);
    }

    console.error("wrong Gradiant type");
};

CanvasGradients.prototype.linearGradient = function GralinearGradient(ctx, BBox) {
    const lGradient = ctx.createLinearGradient(
        BBox.x + BBox.width * (this.config.x1 / 100),
        BBox.y + BBox.height * (this.config.y1 / 100),
        BBox.x + BBox.width * (this.config.x2 / 100),
        BBox.y + BBox.height * (this.config.y2 / 100)
    );
    this.config.colorStops.forEach((d) => {
        lGradient.addColorStop(d.value / 100, d.color);
    });
    return lGradient;
};

CanvasGradients.prototype.absoluteLinearGradient = function absoluteGralinearGradient(ctx) {
    const lGradient = ctx.createLinearGradient(
        this.config.x1,
        this.config.y1,
        this.config.x2,
        this.config.y2
    );
    this.config.colorStops.forEach((d) => {
        lGradient.addColorStop(d.value, d.color);
    });
    return lGradient;
};

CanvasGradients.prototype.radialGradient = function GRAradialGradient(ctx, BBox) {
    const cGradient = ctx.createRadialGradient(
        BBox.x + BBox.width * (this.config.innerCircle.x / 100),
        BBox.y + BBox.height * (this.config.innerCircle.y / 100),
        BBox.width > BBox.height
            ? (BBox.width * this.config.innerCircle.r) / 100
            : (BBox.height * this.config.innerCircle.r) / 100,
        BBox.x + BBox.width * (this.config.outerCircle.x / 100),
        BBox.y + BBox.height * (this.config.outerCircle.y / 100),
        BBox.width > BBox.height
            ? (BBox.width * this.config.outerCircle.r) / 100
            : (BBox.height * this.config.outerCircle.r) / 100
    );
    this.config.colorStops.forEach((d) => {
        cGradient.addColorStop(d.value / 100, d.color);
    });
    return cGradient;
};

CanvasGradients.prototype.absoluteRadialGradient = function absoluteGraradialGradient(ctx, BBox) {
    const cGradient = ctx.createRadialGradient(
        this.config.innerCircle.x,
        this.config.innerCircle.y,
        this.config.innerCircle.r,
        this.config.outerCircle.x,
        this.config.outerCircle.y,
        this.config.outerCircle.r
    );
    this.config.colorStops.forEach((d) => {
        cGradient.addColorStop(d.value / 100, d.color);
    });
    return cGradient;
};

CanvasGradients.prototype.colorStops = function GRAcolorStops(colorStopValues) {
    if (Object.prototype.toString.call(colorStopValues) !== "[object Array]") {
        return false;
    }

    this.config.colorStops = colorStopValues;
    return this;
};

function createLinearGradient(config) {
    return new CanvasGradients(config, "linear");
}

function createRadialGradient(config) {
    return new CanvasGradients(config, "radial");
}

function PixelObject(data, width, height) {
    this.imageData = data;
    this.width = width;
    this.height = height;
}

PixelObject.prototype.get = function (pos) {
    const pixels = this.imageData ? this.imageData.pixels : [];
    const rIndex = (pos.y - 1) * (this.width * 4) + (pos.x - 1) * 4;
    return (
        "rgba(" +
        pixels[rIndex] +
        ", " +
        pixels[rIndex + 1] +
        ", " +
        pixels[rIndex + 2] +
        ", " +
        pixels[rIndex + 3] +
        ")"
    );
};

PixelObject.prototype.put = function (pos, color) {
    const rIndex = (pos.y - 1) * (this.width * 4) + (pos.x - 1) * 4;
    this.imageData.pixels[rIndex] = color[0];
    this.imageData.pixels[rIndex + 1] = color[1];
    this.imageData.pixels[rIndex + 2] = color[2];
    this.imageData.pixels[rIndex + 3] = color[3];
    return this;
};

// function pixels (pixHndlr) {
// 	const tObj = this.rImageObj ? this.rImageObj : this.imageObj;
// 	const tCxt = tObj.getContext('2d');
// 	const pixelData = tCxt.getImageData(0, 0, this.attr.width, this.attr.height);
// 	return pixHndlr(pixelData);
// }

function CanvasMask(self, config = {}) {
    const maskId = config.id ? config.id : "mask-" + Math.ceil(Math.random() * 1000);
    this.config = config;
    this.mask = new CanvasNodeExe(
        self.dom.ctx,
        {
            el: "g",
            attr: {
                id: maskId,
            },
        },
        domId(),
        self.vDomIndex
    );
}

CanvasMask.prototype.setAttr = function (attr, value) {
    this.config[attr] = value;
};

CanvasMask.prototype.exe = function () {
    this.mask.execute();
    this.mask.dom.ctx.globalCompositeOperation =
        this.config.globalCompositeOperation || "destination-atop";
    return true;
};

function createCanvasMask(maskConfig) {
    return new CanvasMask(this, maskConfig);
}

function CanvasClipping(self, config = {}) {
    const clipId = config.id ? config.id : "clip-" + Math.ceil(Math.random() * 1000);
    this.clip = new CanvasNodeExe(
        self.dom.ctx,
        {
            el: "g",
            attr: {
                id: clipId,
            },
        },
        domId(),
        self.vDomIndex
    );
}

CanvasClipping.prototype.exe = function (ctx, bbox, disableRestore) {
    this.clip.execute(disableRestore);
    this.clip.dom.ctx.clip();
    return true;
};

function createCanvasClip(patternConfig) {
    return new CanvasClipping(this, patternConfig);
}

function CanvasPattern(self, config = {}, width = 0, height = 0) {
    const selfSelf = this;
    const patternId = config.id ? config.id : "pattern-" + Math.ceil(Math.random() * 1000);
    this.repeatInd = config.repeat ? config.repeat : "repeat";
    
    selfSelf.pattern = canvasLayer({}, height, width);

    selfSelf.pattern.setAttr("id", patternId);
    self.prependChild([selfSelf.pattern]);
    selfSelf.pattern.vDomIndex = self.vDomIndex + ":" + patternId;
    selfSelf.pattern.onChange(function () {
        selfSelf.patternObj = self.ctx.createPattern(selfSelf.pattern.domEl, selfSelf.repeatInd);
    });
}

CanvasPattern.prototype.repeat = function (repeat) {
    this.repeatInd = repeat;
};

CanvasPattern.prototype.exe = function () {
    return this.patternObj;
};

function createCanvasPattern(patternConfig, width = 0, height = 0) {
    return new CanvasPattern(this, patternConfig, width, height);
}

function applyStyles() {
    if (this.ctx.fillStyle !== "#000000") {
        this.ctx.fill();
    }

    if (this.ctx.strokeStyle !== "#000000") {
        this.ctx.stroke();
    }
}

function CanvasDom() {
    this.BBox = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
    this.BBoxHit = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };
}

CanvasDom.prototype = {
    render: cRender,
    setAttr: domSetAttribute,
    setStyle: domSetStyle,
    applyStyles,
};

function imageInstance(self) {
    const imageIns = new Image();
    imageIns.crossOrigin = "anonymous";
    imageIns.dataMode = Image.MODE_MIME | Image.MODE_IMAGE
    imageIns.onload = function onload() {
        self.attr.height = self.attr.height ? self.attr.height : imageIns.naturalHeight;
        self.attr.width = self.attr.width ? self.attr.width : imageIns.naturalWidth;
        self.imageObj = imageIns;

        if (self.nodeExe.attr.onload && typeof self.nodeExe.attr.onload === "function") {
            self.nodeExe.attr.onload.call(self.nodeExe, self.image);
        }

        self.nodeExe.BBoxUpdate = true;
    };

    imageIns.onerror = function onerror(error) {
        if (self.nodeExe.attr.onerror && typeof self.nodeExe.attr.onerror === "function") {
            self.nodeExe.attr.onerror.call(self.nodeExe, error);
        }
    };

    return imageIns;
}

function RenderImage(ctx, props, stylesProps, onloadExe, onerrorExe, nodeExe) {
    const self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "Image";
    self.nodeExe = nodeExe;
    nodeExe.dom = this;

    for (const key in props) {
        this.setAttr(key, props[key]);
    }

    self.stack = [self];
}

RenderImage.prototype = new CanvasDom();
RenderImage.prototype.constructor = RenderImage;

RenderImage.prototype.setAttr = function RIsetAttr(attr, value) {
    const self = this;

    if (attr === "src") {
        if (typeof value === "string") {
            self.image = self.image ? self.image : imageInstance(self);
            if (self.image.src !== value) {
                self.image.src = value;
            }
        } else if (value instanceof CanvasNodeExe || value instanceof RenderTexture) {
            self.imageObj = value.domEl;
            // self.postProcess();
            self.attr.height = self.attr.height ? self.attr.height : value.attr.height;
            self.attr.width = self.attr.width ? self.attr.width : value.attr.width;
        }
    }
    this.attr[attr] = value;
};

RenderImage.prototype.updateBBox = function RIupdateBBox() {
    const self = this;
    const { transform, x = 0, y = 0, width = 0, height = 0 } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    self.BBox = {
        x: (translateX + x) * scaleX,
        y: (translateY + y) * scaleY,
        width: width * scaleX,
        height: height * scaleY,
    };

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderImage.prototype.execute = function RIexecute() {
    const { width = 0, height = 0, x = 0, y = 0 } = this.attr;

    if (this.imageObj) {
        this.ctx.drawImage(this.imageObj, x, y, width, height);
    }
};

RenderImage.prototype.applyStyles = function RIapplyStyles() {};

RenderImage.prototype.in = function RIinfun(co) {
    const { width = 0, height = 0, x = 0, y = 0 } = this.attr;
    return co.x >= x && co.x <= x + width && co.y >= y && co.y <= y + height;
};

function RenderText(ctx, props, stylesProps) {
    const self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "text";
    self.stack = [self];
    if (self.attr.width) {
        this.fitWidth();
    }
}

RenderText.prototype = new CanvasDom();
RenderText.prototype.constructor = RenderText;
RenderText.prototype.fitWidth = function () {
        if (this.style.font) {
            this.ctx.font = this.style.font;
        }
        let width = this.attr.width;
        let textListByLine = this.attr.text.split("\n");
        let textSubStrs = [];
        let strLit = "";
        let i = 0;
        let textList = textListByLine.reduce(function (p, c) {
            p = p.concat(c.split(" "));
            p.push("\n");
            return p;
        }, [])
        while(i < textList.length) {
            if (i !== 0) {
                strLit += " "
            }
            if (textList[i] === "\n") {
                textSubStrs.push(strLit);
                strLit = " ";
            } else {
                if (this.ctx.measureText(strLit + textList[i]).width < width) {
                    strLit = strLit + textList[i];
                } else {
                    if (strLit && strLit.length > 0) {
                        textSubStrs.push(strLit);
                    }
                    strLit = textList[i];
                }
            }
            i++;
        }
        textSubStrs.push(strLit);

        this.textList = textSubStrs;
}

RenderText.prototype.text = function RTtext(value) {
    this.attr.text = value;
    if (this.attr.width) {
        this.fitWidth();
    }
};

RenderText.prototype.updateBBox = function RTupdateBBox() {
    const self = this;
    let height = 1;
    let width = 0;
    let { x = 0, y = 0, transform } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    if (this.style.font) {
        this.ctx.font = this.style.font;
        height = parseInt(this.style.font.replace(/[^\d.]/g, ""), 10) || 1;
        self.textHeight = height + 3;
    }
    if (this.attr.width && this.textList && this.textList.length > 0) {
        width = this.attr.width;
        height = height * this.textList.length;
    } else {
        width = this.ctx.measureText(this.attr.text).width;
    }

    if (this.style.textAlign === "center") {
        x -= width / 2;
    } else if (this.style.textAlign === "right") {
        x -= width;
    }

    self.width = width;
    self.height = height;
    self.x = x;
    self.y = y;

    self.BBox = {
        x: (translateX + x) * scaleX,
        y: (translateY + y) * scaleY,
        width: width * scaleX,
        height: height * scaleY,
    };

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderText.prototype.execute = function RTexecute() {
    if (this.attr.text !== undefined && this.attr.text !== null) {
        if (this.textList && this.textList.length > 0) {
            for (var i = 0; i < this.textList.length; i++) {
                if (this.ctx.fillStyle !== "#000000") {
                    this.ctx.fillText(this.textList[i], this.attr.x, this.attr.y + this.textHeight * (i + 1) );
                }

                if (this.ctx.strokeStyle !== "#000000") {
                    this.ctx.strokeText(this.textList[i], this.attr.x, this.attr.y + this.textHeight * (i + 1));
                }
            }
        } else {
            if (this.ctx.fillStyle !== "#000000") {
                this.ctx.fillText(this.attr.text, this.attr.x, this.attr.y + this.height);
            }

            if (this.ctx.strokeStyle !== "#000000") {
                this.ctx.strokeText(this.attr.text, this.attr.x, this.attr.y + this.height);
            }
        }        
    }
};

RenderText.prototype.applyStyles = function RTapplyStyles() {};

RenderText.prototype.in = function RTinfun(co) {
    const { x = 0, y = 0, width = 0, height = 0 } = this;
    return co.x >= x && co.x <= x + width && co.y >= y && co.y <= y + height;
};
/** ***************** Render Circle */

const RenderCircle = function RenderCircle(ctx, props, stylesProps) {
    const self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "circle";
    self.stack = [self];
};

RenderCircle.prototype = new CanvasDom();
RenderCircle.prototype.constructor = RenderCircle;

RenderCircle.prototype.updateBBox = function RCupdateBBox() {
    const self = this;
    const { transform, r = 0, cx = 0, cy = 0 } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    self.BBox = {
        x: translateX + (cx - r) * scaleX,
        y: translateY + (cy - r) * scaleY,
        width: 2 * r * scaleX,
        height: 2 * r * scaleY,
    };

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderCircle.prototype.execute = function RCexecute() {
    const { r = 0, cx = 0, cy = 0 } = this.attr;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
    this.applyStyles();
    this.ctx.closePath();
};

RenderCircle.prototype.in = function RCinfun(co, eventType) {
    const { r = 0, cx = 0, cy = 0 } = this.attr;
    const tr = Math.sqrt((co.x - cx) * (co.x - cx) + (co.y - cy) * (co.y - cy));
    return tr <= r;
};

const RenderLine = function RenderLine(ctx, props, stylesProps) {
    const self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "line";
    self.stack = [self];
};

RenderLine.prototype = new CanvasDom();
RenderLine.prototype.constructor = RenderLine;

RenderLine.prototype.updateBBox = function RLupdateBBox() {
    const self = this;
    const { transform, x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    self.BBox = {
        x: translateX + (x1 < x2 ? x1 : x2) * scaleX,
        y: translateY + (y1 < y2 ? y1 : y2) * scaleY,
        width: Math.abs(x2 - x1) * scaleX,
        height: Math.abs(y2 - y1) * scaleY,
    };

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderLine.prototype.execute = function RLexecute() {
    const { ctx } = this;
    const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = this.attr;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    this.applyStyles();
    ctx.closePath();
};

RenderLine.prototype.in = function RLinfun(co) {
    const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = this.attr;
    return (
        parseFloat(
            t2DGeometry.getDistance(
                {
                    x: x1,
                    y: y1,
                },
                co
            ) +
                t2DGeometry.getDistance(co, {
                    x: x2,
                    y: y2,
                })
        ).toFixed(1) ===
        parseFloat(
            t2DGeometry.getDistance(
                {
                    x: x1,
                    y: y1,
                },
                {
                    x: x2,
                    y: y2,
                }
            )
        ).toFixed(1)
    );
};

function RenderPolyline(ctx, props, stylesProps) {
    const self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "polyline";
    self.stack = [self];
}

RenderPolyline.prototype = new CanvasDom();
RenderPolyline.constructor = RenderPolyline;

RenderPolyline.prototype.execute = function polylineExe() {
    const self = this;
    let d;
    if (!this.attr.points || this.attr.points.length === 0) return;
    this.ctx.beginPath();
    self.ctx.moveTo(this.attr.points[0].x, this.attr.points[0].y);
    for (var i = 1; i < this.attr.points.length; i++) {
        d = this.attr.points[i];
        self.ctx.lineTo(d.x, d.y);
    }
    this.applyStyles();
    this.ctx.closePath();
};

RenderPolyline.prototype.updateBBox = RPolyupdateBBox;

RenderPolyline.prototype.in = function RPolyLinfun(co) {
    let flag = false;

    for (let i = 0, len = this.attr.points.length; i <= len - 2; i++) {
        const p1 = this.attr.points[i];
        const p2 = this.attr.points[i + 1];
        flag =
            flag ||
            parseFloat(
                t2DGeometry.getDistance(
                    {
                        x: p1.x,
                        y: p1.y,
                    },
                    co
                ) +
                    t2DGeometry.getDistance(co, {
                        x: p2.x,
                        y: p2.y,
                    })
            ).toFixed(1) ===
                parseFloat(
                    t2DGeometry.getDistance(
                        {
                            x: p1.x,
                            y: p1.y,
                        },
                        {
                            x: p2.x,
                            y: p2.y,
                        }
                    )
                ).toFixed(1);
    }

    return flag;
};
/** ***************** Render Path */

const RenderPath = function RenderPath(ctx, props, styleProps) {
    const self = this;
    self.ctx = ctx;
    self.angle = 0;
    self.nodeName = "path";
    self.attr = props;
    self.style = styleProps;

    if (self.attr.d) {
        if (path.isTypePath(self.attr.d)) {
            self.path = self.attr.d;
            self.attr.d = self.attr.d.fetchPathString();
        } else {
            self.path = path.instance(self.attr.d);
        }

        self.pathNode = new Path2D(self.attr.d);
    }

    self.stack = [self];
    return self;
};

RenderPath.prototype = new CanvasDom();
RenderPath.prototype.constructor = RenderPath;

RenderPath.prototype.updateBBox = function RPupdateBBox() {
    const self = this;
    const { transform } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    self.BBox = self.path
        ? self.path.BBox
        : {
              x: 0,
              y: 0,
              width: 0,
              height: 0,
          };
    self.BBox.x = translateX + self.BBox.x * scaleX;
    self.BBox.y = translateY + self.BBox.y * scaleY;
    self.BBox.width *= scaleX;
    self.BBox.height *= scaleY;

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderPath.prototype.setAttr = function RPsetAttr(attr, value) {
    this.attr[attr] = value;

    if (attr === "d") {
        if (path.isTypePath(value)) {
            this.path = value;
            this.attr.d = value.fetchPathString();
        } else {
            this.path = path.instance(this.attr.d);
        }

        this.pathNode = new Path2D(this.attr.d);
    }
};

RenderPath.prototype.getPointAtLength = function RPgetPointAtLength(len) {
    return this.path
        ? this.path.getPointAtLength(len)
        : {
              x: 0,
              y: 0,
          };
};

RenderPath.prototype.getAngleAtLength = function RPgetAngleAtLength(len) {
    return this.path ? this.path.getAngleAtLength(len) : 0;
};

RenderPath.prototype.getTotalLength = function RPgetTotalLength() {
    return this.path ? this.path.getTotalLength() : 0;
};

RenderPath.prototype.execute = function RPexecute() {
    if (this.attr.d) {
        if (this.ctx.fillStyle !== "#000000" || this.ctx.strokeStyle !== "#000000") {
            if (this.ctx.fillStyle !== "#000000") {
                this.ctx.fill(this.pathNode);
            }

            if (this.ctx.strokeStyle !== "#000000") {
                this.ctx.stroke(this.pathNode);
            }
        } else {
            this.path.execute(this.ctx);
        }
    }
};

RenderPath.prototype.applyStyles = function RPapplyStyles() {};

RenderPath.prototype.in = function RPinfun(co) {
    let flag = false;

    if (!(this.attr.d && this.pathNode)) {
        return flag;
    }

    this.ctx.save();
    this.ctx.scale(1 / this.ctx.pixelRatio, 1 / this.ctx.pixelRatio);
    flag = this.ctx.isPointInPath(this.pathNode, co.x, co.y);
    this.ctx.restore();

    return flag;
};
/** *****************End Render Path */

/** ***************** Render polygon */

function polygonExe(points) {
    if (Object.prototype.toString.call(points) !== "[object Array]") {
        console.error("Points expected as array [{x: , y:}]");
        return;
    }
    if (points && points.length === 0) {
        return;
    }
    const polygon = new Path2D();
    polygon.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        polygon.lineTo(points[i].x, points[i].y);
    }
    polygon.closePath();

    return {
        path: polygon,
        points: points,
        execute: function (ctx) {
            ctx.beginPath();
            const points = this.points;
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
        },
    };
}

const RenderPolygon = function RenderPolygon(ctx, props, styleProps) {
    const self = this;
    self.ctx = ctx;
    self.nodeName = "polygon";
    self.attr = props;
    self.style = styleProps;
    self.stack = [self];

    if (self.attr.points) {
        self.polygon = polygonExe(self.attr.points);
    }

    return this;
};

RenderPolygon.prototype = new CanvasDom();
RenderPolygon.prototype.constructor = RenderPolygon;

RenderPolygon.prototype.setAttr = function RPolysetAttr(attr, value) {
    this.attr[attr] = value;

    if (attr === "points") {
        this.polygon = polygonExe(this.attr.points);
        if (this.polygon) {
            this.attr.points = this.polygon.points;
        }
    }
};

RenderPolygon.prototype.updateBBox = RPolyupdateBBox;

RenderPolygon.prototype.execute = function RPolyexecute() {
    if (!this.polygon) {
        return;
    }
    if (this.ctx.fillStyle !== "#000000" || this.ctx.strokeStyle !== "#000000") {
        if (this.ctx.fillStyle !== "#000000") {
            this.ctx.fill(this.polygon.path);
        }

        if (this.ctx.strokeStyle !== "#000000") {
            this.ctx.stroke(this.polygon.path);
        }
    } else {
        this.polygon.execute(this.ctx);
    }
};

RenderPolygon.prototype.applyStyles = function RPolyapplyStyles() {};

RenderPolygon.prototype.in = function RPolyinfun(co) {
    let flag = false;

    if (!this.polygon) {
        return false;
    }

    this.ctx.save();
    this.ctx.scale(1 / this.ctx.pixelRatio, 1 / this.ctx.pixelRatio);
    flag = this.style.fillStyle ? this.ctx.isPointInPath(this.polygon.path, co.x, co.y) : flag;
    this.ctx.restore();
    return flag;
};
/** ***************** Render polygon */

/** ***************** Render ellipse */

const RenderEllipse = function RenderEllipse(ctx, props, styleProps) {
    const self = this;
    self.ctx = ctx;
    self.nodeName = "ellipse";
    self.attr = props;
    self.style = styleProps;
    self.stack = [self];
    return this;
};

RenderEllipse.prototype = new CanvasDom();
RenderEllipse.prototype.constructor = RenderEllipse;

RenderEllipse.prototype.updateBBox = function REupdateBBox() {
    const self = this;
    const { transform, cx = 0, cy = 0, rx = 0, ry = 0 } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    self.BBox = {
        x: translateX + (cx - rx) * scaleX,
        y: translateY + (cy - ry) * scaleY,
        width: rx * 2 * scaleX,
        height: ry * 2 * scaleY,
    };

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderEllipse.prototype.execute = function REexecute() {
    const ctx = this.ctx;
    const { cx = 0, cy = 0, rx = 0, ry = 0 } = this.attr;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    this.applyStyles();
    ctx.closePath();
};

RenderEllipse.prototype.in = function REinfun(co) {
    const { cx = 0, cy = 0, rx = 0, ry = 0 } = this.attr;
    return ((co.x - cx) * (co.x - cx)) / (rx * rx) + ((co.y - cy) * (co.y - cy)) / (ry * ry) <= 1;
};
/** ***************** Render ellipse */

/** ***************** Render Rect */

const RenderRect = function RenderRect(ctx, props, styleProps) {
    const self = this;
    self.ctx = ctx;
    self.nodeName = "rect";
    self.attr = props;
    self.style = styleProps;
    self.stack = [self];
    return this;
};

RenderRect.prototype = new CanvasDom();
RenderRect.prototype.constructor = RenderRect;

RenderRect.prototype.updateBBox = function RRupdateBBox() {
    const self = this;
    const { transform, x = 0, y = 0, width = 0, height = 0 } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    self.BBox = {
        x: translateX + x * scaleX,
        y: translateY + y * scaleY,
        width: width * scaleX,
        height: height * scaleY,
    };

    if (transform && transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderRect.prototype.applyStyles = function rStyles() {};

function renderRoundRect(ctx, attr) {
    const { x = 0, y = 0, width = 0, height = 0, rx = 0, ry = 0 } = attr;

    ctx.beginPath();
    ctx.moveTo(x + rx, y);
    ctx.lineTo(x + width - rx, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + ry);
    ctx.lineTo(x + width, y + height - ry);
    ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height);
    ctx.lineTo(x + rx, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - ry);
    ctx.lineTo(x, y + ry);
    ctx.quadraticCurveTo(x, y, x + rx, y);
    ctx.closePath();
}

RenderRect.prototype.execute = function RRexecute() {
    const ctx = this.ctx;
    const { x = 0, y = 0, width = 0, height = 0, rx = 0, ry = 0 } = this.attr;

    if (ctx.fillStyle !== "#000000" || ctx.strokeStyle !== "#000000") {
        if (ctx.fillStyle !== "#000000") {
            if (!rx && !ry) {
                ctx.fillRect(x, y, width, height);
            } else {
                renderRoundRect(ctx, {
                    x,
                    y,
                    width,
                    height,
                    rx,
                    ry,
                });
                ctx.fill();
            }
        }

        if (ctx.strokeStyle !== "#000000") {
            if (!rx && !ry) {
                ctx.strokeRect(x, y, width, height);
            } else {
                renderRoundRect(ctx, {
                    x,
                    y,
                    width,
                    height,
                    rx,
                    ry,
                });
                ctx.stroke();
            }
        }
    } else {
        ctx.rect(x, y, width, height);
    }
};

RenderRect.prototype.in = function RRinfun(co) {
    const { x = 0, y = 0, width = 0, height = 0 } = this.attr;
    return co.x >= x && co.x <= x + width && co.y >= y && co.y <= y + height;
};
/** ***************** Render Rect */

/** ***************** Render Group */

const RenderGroup = function RenderGroup(ctx, props, styleProps) {
    const self = this;
    self.nodeName = "g";
    self.ctx = ctx;
    self.attr = props;
    self.style = styleProps;
    self.stack = new Array(0);
    return this;
};

RenderGroup.prototype = new CanvasDom();
RenderGroup.prototype.constructor = RenderGroup;

RenderGroup.prototype.updateBBox = function RGupdateBBox(children) {
    const self = this;
    let minX;
    let maxX;
    let minY;
    let maxY;
    const { transform } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);
    self.BBox = {};

    if (children && children.length > 0) {
        let d;
        let boxX;
        let boxY;

        for (let i = 0; i < children.length; i += 1) {
            d = children[i];
            boxX = d.dom.BBoxHit.x;
            boxY = d.dom.BBoxHit.y;
            minX = minX === undefined ? boxX : minX > boxX ? boxX : minX;
            minY = minY === undefined ? boxY : minY > boxY ? boxY : minY;
            maxX =
                maxX === undefined
                    ? boxX + d.dom.BBoxHit.width
                    : maxX < boxX + d.dom.BBoxHit.width
                    ? boxX + d.dom.BBoxHit.width
                    : maxX;
            maxY =
                maxY === undefined
                    ? boxY + d.dom.BBoxHit.height
                    : maxY < boxY + d.dom.BBoxHit.height
                    ? boxY + d.dom.BBoxHit.height
                    : maxY;
        }
    }

    minX = minX === undefined ? 0 : minX;
    minY = minY === undefined ? 0 : minY;
    maxX = maxX === undefined ? 0 : maxX;
    maxY = maxY === undefined ? 0 : maxY;
    self.BBox.x = translateX + minX * scaleX;
    self.BBox.y = translateY + minY * scaleY;
    self.BBox.width = Math.abs(maxX - minX) * scaleX;
    self.BBox.height = Math.abs(maxY - minY) * scaleY;

    if (self.attr.transform && self.attr.transform.rotate) {
        self.BBoxHit = t2DGeometry.rotateBBox(this.BBox, this.attr.transform);
    } else {
        self.BBoxHit = this.BBox;
    }
};

RenderGroup.prototype.child = function RGchild(obj) {
    const self = this;
    const objLocal = obj;

    if (objLocal instanceof CanvasNodeExe) {
        objLocal.dom.parent = self;
        self.stack[self.stack.length] = objLocal;
    } else if (objLocal instanceof CanvasCollection) {
        objLocal.stack.forEach((d) => {
            d.dom.parent = self;
            self.stack[self.stack.length] = d;
        });
    } else {
        console.log("wrong Object");
    }
};

RenderGroup.prototype.in = function RGinfun(coOr) {
    const self = this;
    const co = {
        x: coOr.x,
        y: coOr.y,
    };
    const { BBox } = this;
    const { transform } = self.attr;
    const { translateX, translateY, scaleX, scaleY } = parseTransform(transform);

    return (
        co.x >= (BBox.x - translateX) / scaleX &&
        co.x <= (BBox.x - translateX + BBox.width) / scaleX &&
        co.y >= (BBox.y - translateY) / scaleY &&
        co.y <= (BBox.y - translateY + BBox.height) / scaleY
    );
};

/** ***************** End Render Group */

const CanvasNodeExe = function CanvasNodeExe(context, config, id, vDomIndex) {
    this.style = config.style || {};
    this.setStyle(config.style);
    this.attr = config.attr || {};
    this.id = id;
    this.nodeName = config.el;
    this.nodeType = "CANVAS";
    this.children = [];
    this.events = {};
    this.ctx = context;
    this.vDomIndex = vDomIndex;
    this.bbox = config.bbox !== undefined ? config.bbox : true;

    switch (config.el) {
        case "circle":
            this.dom = new RenderCircle(this.ctx, this.attr, this.style);
            break;

        case "rect":
            this.dom = new RenderRect(this.ctx, this.attr, this.style);
            break;

        case "line":
            this.dom = new RenderLine(this.ctx, this.attr, this.style);
            break;

        case "polyline":
            this.dom = new RenderPolyline(this.ctx, this.attr, this.style);
            break;

        case "path":
            this.dom = new RenderPath(this.ctx, this.attr, this.style);
            break;

        case "group":
        case "g":
            this.dom = new RenderGroup(this.ctx, this.attr, this.style);
            break;

        case "text":
            this.dom = new RenderText(this.ctx, this.attr, this.style);
            break;

        case "image":
            this.dom = new RenderImage(
                this.ctx,
                this.attr,
                this.style,
                config.onload,
                config.onerror,
                this
            );
            break;

        // case "sprite":
        //     this.dom = new RenderSprite(
        //         this.ctx,
        //         this.attr,
        //         this.style,
        //         config.onload,
        //         config.onerror,
        //         this
        //     );
        //     break;

        case "polygon":
            this.dom = new RenderPolygon(this.ctx, this.attr, this.style, this);
            break;

        case "ellipse":
            this.dom = new RenderEllipse(this.ctx, this.attr, this.style, this);
            break;

        default:
            this.dom = null;
            break;
    }

    this.dom.nodeExe = this;
    this.BBoxUpdate = true;
};

CanvasNodeExe.prototype = new NodePrototype();

CanvasNodeExe.prototype.node = function Cnode() {
    this.updateBBox();
    return this.dom;
};

CanvasNodeExe.prototype.stylesExe = function CstylesExe() {
    let value;
    let key;
    const style = this.style;

    this.ctx["clip-Path"] = null;
    for (key in style) {
        if (typeof style[key] === "string" || typeof style[key] === "number") {
            value = style[key];
        } else if (typeof style[key] === "object") {
            if (
                style[key] instanceof CanvasGradients ||
                style[key] instanceof CanvasPattern ||
                style[key] instanceof CanvasClipping ||
                style[key] instanceof CanvasMask
            ) {
                value = style[key].exe(this.ctx, this.dom.BBox, true);
            } else {
                value = style[key];
            }
        } else if (typeof style[key] === "function") {
            style[key] = style[key].call(this, this.dataObj);
            value = style[key];
        } else {
            console.log("unkonwn Style");
        }

        if (typeof this.ctx[key] !== "function") {
            this.ctx[key] = value;
        } else if (typeof this.ctx[key] === "function") {
            this.ctx[key](value);
        } else {
            console.log("junk comp");
        }
    }
};

CanvasNodeExe.prototype.remove = function Cremove() {
    const { children } = this.dom.parent;
    const index = children.indexOf(this);

    if (index !== -1) {
        children.splice(index, 1);
    }

    this.dom.parent.BBoxUpdate = true;
};

CanvasNodeExe.prototype.attributesExe = function CattributesExe() {
    this.dom.render(this.attr);
};

CanvasNodeExe.prototype.setStyle = function CsetStyle(attr, value) {
    if (arguments.length === 2) {
        if (value == null && this.style[attr] != null) {
            delete this.style[attr];
        } else {
            this.style[attr] = valueCheck(value);
        }
    } else if (arguments.length === 1 && typeof attr === "object") {
        const styleKeys = Object.keys(attr);

        for (let i = 0, len = styleKeys.length; i < len; i += 1) {
            if (attr[styleKeys[i]] == null && this.style[styleKeys[i]] != null) {
                delete this.style[styleKeys[i]];
            } else {
                this.style[styleKeys[i]] = valueCheck(attr[styleKeys[i]]);
            }
        }
    }

    return this;
};

function valueCheck(value) {
    if (colorMap.RGBAInstanceCheck(value)) {
        value = value.rgba;
    }

    return value === "#000" || value === "#000000" || value === "black" ? "rgb(1, 1, 1)" : value;
}

CanvasNodeExe.prototype.setAttr = function CsetAttr(attr, value) {
    if (arguments.length === 2) {
        if (value == null && this.attr[attr] != null) {
            delete this.attr[attr];
        } else {
            this.attr[attr] = value;
        }
        // console.log(this);
        // console.log(this.dom);
        this.dom.setAttr(attr, value);
    } else if (arguments.length === 1 && typeof attr === "object") {
        const keys = Object.keys(attr);

        for (let i = 0; i < keys.length; i += 1) {
            if (attr[keys[i]] == null && this.attr[keys[i]] != null) {
                delete this.attr[keys[i]];
            } else {
                this.attr[keys[i]] = attr[keys[i]];
            }
            this.dom.setAttr(keys[i], attr[keys[i]]);
        }
    }

    this.BBoxUpdate = true;
    return this;
};

CanvasNodeExe.prototype.rotate = function Crotate(angle, x, y) {
    if (!this.attr.transform) {
        this.attr.transform = {};
    }

    if (Object.prototype.toString.call(angle) === "[object Array]") {
        this.attr.transform.rotate = [angle[0] || 0, angle[1] || 0, angle[2] || 0];
    } else {
        this.attr.transform.rotate = [angle, x || 0, y || 0];
    }

    this.dom.setAttr("transform", this.attr.transform);
    this.BBoxUpdate = true;
    return this;
};

CanvasNodeExe.prototype.scale = function Cscale(XY) {
    if (!this.attr.transform) {
        this.attr.transform = {};
    }

    if (XY.length < 1) {
        return null;
    }

    this.attr.transform.scale = [XY[0], XY[1] ? XY[1] : XY[0]];
    this.dom.setAttr("transform", this.attr.transform);
    this.BBoxUpdate = true;
    return this;
};

CanvasNodeExe.prototype.translate = function Ctranslate(XY) {
    if (!this.attr.transform) {
        this.attr.transform = {};
    }

    this.attr.transform.translate = XY;
    this.dom.setAttr("transform", this.attr.transform);
    this.BBoxUpdate = true;
    return this;
};

CanvasNodeExe.prototype.skewX = function CskewX(x) {
    if (!this.attr.transform) {
        this.attr.transform = {};
    }
    if (!this.attr.transform.skew) {
        this.attr.transform.skew = [];
    }

    this.attr.transform.skew[0] = x;
    this.dom.setAttr("transform", this.attr.transform);
    this.BBoxUpdate = true;
    return this;
};

CanvasNodeExe.prototype.skewY = function CskewY(y) {
    if (!this.attr.transform) {
        this.attr.transform = {};
    }
    if (!this.attr.transform.skew) {
        this.attr.transform.skew = [];
    }

    this.attr.transform.skew[1] = y;
    this.dom.setAttr("transform", this.attr.transform);
    this.BBoxUpdate = true;
    return this;
};

CanvasNodeExe.prototype.execute = function Cexecute(disableRestore) {
    if (this.style.display === "none") {
        return;
    }
    // console.log(disableRestore);
    if (!disableRestore) {
        this.ctx.save();
    }
    this.stylesExe();
    this.attributesExe();
    if (this.dom instanceof RenderGroup) {
        for (let i = 0, len = this.children.length; i < len; i += 1) {
            this.children[i].execute(disableRestore);
        }
    }
    if (!disableRestore) {
        this.ctx.restore();
    }
};

CanvasNodeExe.prototype.prependChild = function child(childrens) {
    const self = this;
    const childrensLocal = childrens;

    if (self.dom instanceof RenderGroup) {
        for (let i = 0; i < childrensLocal.length; i += 1) {
            childrensLocal[i].dom.parent = self;
            self.children.unshift(childrensLocal[i]);
        }
    } else {
        console.error("Trying to insert child to nonGroup Element");
    }

    this.BBoxUpdate = true;
    return self;
};

CanvasNodeExe.prototype.child = function child(childrens) {
    const self = this;
    const childrensLocal = childrens;

    if (self.dom instanceof RenderGroup) {
        for (let i = 0; i < childrensLocal.length; i += 1) {
            childrensLocal[i].dom.parent = self;
            self.children[self.children.length] = childrensLocal[i];
        }
    } else {
        console.error("Trying to insert child to nonGroup Element");
    }

    this.BBoxUpdate = true;
    return self;
};

CanvasNodeExe.prototype.updateBBox = function CupdateBBox() {
    let status;

    if (this.bbox) {
        for (let i = 0, len = this.children.length; i < len; i += 1) {
            if (this.children[i]) {
                status = this.children[i].updateBBox() || status;
            }
        }
        if (this.BBoxUpdate || status) {
            this.dom.updateBBox(this.children);
            this.BBoxUpdate = false;
            return true;
        }
    }

    return false;
};

CanvasNodeExe.prototype.in = function Cinfun(co) {
    return this.dom.in(co);
};

CanvasNodeExe.prototype.vDomIndex = null;

CanvasNodeExe.prototype.createRadialGradient = createRadialGradient;
CanvasNodeExe.prototype.createLinearGradient = createLinearGradient;
// CanvasNodeExe.prototype

CanvasNodeExe.prototype.createEls = function CcreateEls(data, config) {
    const e = new CanvasCollection(
        {
            type: "CANVAS",
            ctx: this.dom.ctx,
        },
        data,
        config,
        this.vDomIndex
    );
    this.child(e.stack);
    return e;
};

CanvasNodeExe.prototype.text = function Ctext(value) {
    if (this.dom instanceof RenderText) {
        this.dom.text(value);
    }

    return this;
};

CanvasNodeExe.prototype.createEl = function CcreateEl(config) {
    const e = new CanvasNodeExe(this.dom.ctx, config, domId(), this.vDomIndex);
    this.child([e]);
    return e;
};

CanvasNodeExe.prototype.removeChild = function CremoveChild(obj) {
    let index = -1;
    this.children.forEach((d, i) => {
        if (d === obj) {
            index = i;
        }
    });

    if (index !== -1) {
        const removedNode = this.children.splice(index, 1)[0];
        this.dom.removeChild(removedNode.dom);
    }

    this.BBoxUpdate = true;
};

CanvasNodeExe.prototype.getBBox = function () {
    return {
        x: this.dom.BBox.x,
        y: this.dom.BBox.y,
        width: this.dom.BBox.width,
        height: this.dom.BBox.height,
    };
};

CanvasNodeExe.prototype.getPixels = function () {
    const imageData = this.ctx.getImageData(
        this.dom.BBox.x,
        this.dom.BBox.y,
        this.dom.BBox.width,
        this.dom.BBox.height
    );
    const pixelInstance = new PixelObject(imageData, this.dom.BBox.width, this.dom.BBox.height);

    return pixelInstance;
    // this.ctx.getImageData(this.dom.BBox.x, this.dom.BBox.y, this.dom.BBox.width, this.dom.BBox.height);
};

CanvasNodeExe.prototype.putPixels = function (pixels) {
    if (!(pixels instanceof PixelObject)) {
        return;
    }
    return this.ctx.putImageData(pixels.imageData, this.dom.BBox.x, this.dom.BBox.y);
};

function GetCanvasImgInstance(width, height) {
    var canvas = createCanvas(width, height);
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
}

GetCanvasImgInstance.prototype.setAttr = function (attr, value) {
    // if (attr === "height") {
    //     this.canvas.setAttribute("height", value);
    // } else if (attr === "width") {
    //     this.canvas.setAttribute("width", value);
    // }
};

function textureImageInstance(self, url) {
    const imageIns = new Image();
    imageIns.crossOrigin = "anonymous";
    imageIns.dataMode = Image.MODE_MIME | Image.MODE_IMAGE;
    imageIns.src = url;
    if (!self) {
        return imageIns;
    }

    self.imageObj = imageIns;

    if (self.attr) {
        self.attr.height = self.attr.height ? self.attr.height : imageIns.naturalHeight;
        self.attr.width = self.attr.width ? self.attr.width : imageIns.naturalWidth;
    }
    if (self instanceof RenderTexture) {
        self.setSize(self.attr.width, self.attr.height);
    }
    self.imageObj = imageIns;

    if (self.attr && self.attr.onload && typeof self.attr.onload === "function") {
        self.attr.onload.call(self, self.image);
    }
    if (self.asyncOnLoad && typeof self.asyncOnLoad === "function") {
        self.asyncOnLoad(self.image);
    }
    
    // imageIns.onload = function onload() {
    //     if (!self) {
    //         return;
    //     }
    //     if (self.attr) {
    //         self.attr.height = self.attr.height ? self.attr.height : imageIns.naturalHeight;
    //         self.attr.width = self.attr.width ? self.attr.width : imageIns.naturalWidth;
    //     }
    //     if (self instanceof RenderTexture) {
    //         self.setSize(self.attr.width, self.attr.height);
    //     }
    //     self.imageObj = imageIns;

    //     if (self.attr && self.attr.onload && typeof self.attr.onload === "function") {
    //         self.attr.onload.call(self, self.image);
    //     }
    //     if (self.asyncOnLoad && typeof self.asyncOnLoad === "function") {
    //         self.asyncOnLoad(self.image);
    //     }

    //     postProcess(self);
    // };

    // imageIns.onerror = function onerror(error) {
    //     console.error(error);
    //     if (self.nodeExe.attr.onerror && typeof self.nodeExe.attr.onerror === "function") {
    //         self.nodeExe.attr.onerror.call(self.nodeExe, error);
    //     }
    //     if (self.asyncOnLoad && typeof self.asyncOnLoad === "function") {
    //         self.asyncOnLoad(self.image);
    //     }
    // };
    return imageIns;
}

function postProcess(self) {
    if (!self.imageObj) {
        return;
    }
    if (self.attr && self.attr.clip) {
        clipExec(self);
    } else {
        self.execute();
    }

    if (self.attr && self.attr.filter) {
        filterExec(self);
    }
}

function clipExec(self) {
    const ctxX = self.ctx;
    const { clip, width = 0, height = 0 } = self.attr;
    const { sx = 0, sy = 0, swidth = width, sheight = height } = clip;

    ctxX.clearRect(0, 0, width, height);
    ctxX.drawImage(self.imageObj, sx, sy, swidth, sheight, 0, 0, width, height);
}

function filterExec(self) {
    const ctxX = self.ctx;
    const { width = 0, height = 0 } = self.attr;

    const pixels = ctxX.getImageData(0, 0, width, height);
    ctxX.putImageData(self.attr.filter(pixels), 0, 0);
}

function RenderTexture(nodeExe, config = {}) {
    const self = this;
    self.attr = Object.assign({}, config.attr) || {};
    self.style = Object.assign({}, config.style) || {};
    const scale = self.attr.scale || 1;
    self.rImageObj = new GetCanvasImgInstance(
        (self.attr.width || 1) * scale,
        (self.attr.height || 1) * scale
    );
    self.ctx = self.rImageObj.context;
    self.domEl = self.rImageObj.canvas;
    self.imageArray = [];
    self.seekIndex = 0;
    // self.attr = props;
    self.nodeName = "Sprite";
    self.nodeExe = nodeExe;

    for (const key in self.attr) {
        if (key !== "height" && key !== "width")
            self.setAttr(key, self.attr[key]);
    }
}
RenderTexture.prototype = new NodePrototype();
RenderTexture.prototype.constructor = RenderTexture;

RenderTexture.prototype.setSize = function (w, h) {
    const scale = this.attr.scale || 1;
    this.rImageObj = createCanvas(w * scale, h * scale)
    postProcess(this);
};

RenderTexture.prototype.setAttr = function RSsetAttr(attr, value) {
    const self = this;

    if (attr === "src") {
        if (Array.isArray(value)) {
            const srcPromises = value.map(function (d) {
                return new Promise((resolve, reject) => {
                    const imageInstance = textureImageInstance(null, d);
                    imageInstance.onload = function () {
                        resolve(this);
                    };
                    imageInstance.onerror = function (error) {
                        reject(error);
                    };
                });
            });
            Promise.all(srcPromises).then(function (images) {
                self.image = images;
                self.imageObj = images[self.seekIndex];
                if (self.attr && self.attr.onload && typeof self.attr.onload === "function") {
                    self.attr.onload.call(self, images);
                }
                if (self.asyncOnLoad && typeof self.asyncOnLoad === "function") {
                    self.asyncOnLoad(images);
                }

                postProcess(self);
            });
        } else if (typeof value === "string") {
            if (!self.image) {
                self.image = textureImageInstance(self, value);
            }
            if (self.image.src !== value) {
                self.image.src = value;
            }
            postProcess(self);
        } else if (value instanceof CanvasNodeExe || value instanceof RenderTexture) {
            self.imageObj = value.domEl;
            self.attr.height = self.attr.height ? self.attr.height : value.attr.height;
            self.attr.width = self.attr.width ? self.attr.width : value.attr.width;
            postProcess(self);
        }
    }
    this.attr[attr] = value;

    if (attr === "height" || attr === "width") {
        this.rImageObj.setAttr(attr, value);
        postProcess(self);
    }

    if (attr === "clip" || attr === "filter") {
        postProcess(self);
    }
};

RenderTexture.prototype.onLoad = function (exec) {
    this.asyncOnLoad = exec;
};

RenderTexture.prototype.clone = function () {
    const attr = Object.assign({}, this.attr);
    const style = Object.assign({}, this.style);
    attr.src = this;
    return new RenderTexture(this.nodeExe, {
        attr: attr,
        style: style,
    });
};

RenderTexture.prototype.execute = function RIexecute() {
    const { width = 0, height = 0 } = this.attr;
    const draw = this.attr.draw || {};
    const scale = this.attr.scale || 1;

    this.ctx.clearRect(0, 0, width * scale, height * scale);
    this.ctx.drawImage(
        this.imageObj,
        draw.x || 0,
        draw.y || 0,
        (draw.width || width) * scale,
        (draw.height || height) * scale
    );
};

RenderTexture.prototype.next = function (index) {
    if (!Array.isArray(this.image)) {
        return;
    }
    if (index < this.image.length && index >= 0) {
        this.seekIndex = index;
    } else if (this.seekIndex < this.image.length - 1) {
        this.seekIndex++;
    }
    this.imageObj = this.image[this.seekIndex];
    postProcess(this);
};

function createPage (ctx) {
        let onChangeExe;
        const root = new CanvasNodeExe(
            ctx,
            {
                el: "g",
                attr: {
                    id: "rootNode",
                },
            },
            domId(),
            999
        );
        root.ENV = "NODE";
        const execute = root.execute.bind(root);
        let onClear = function (ctx, width, height) {
            ctx.clearRect(0, 0, width, height);
        };

        root.setClear = function (exe) {
            onClear = exe;
        };

        root.onChange = function (exec) {
            onChangeExe = exec;
        };

        root.getPixels = function (x, y, width_, height_) {
            return this.ctx.getImageData(x, y, width_, height_);
        };

        root.putPixels = function (imageData, x, y) {
            return this.ctx.putImageData(imageData, x, y);
        };

        root.clear = function () {
            onClear(this.ctx, this.width, this.height);
        };

        root.addPage = function () {
            ctx.addPage();
        };

        root.setContext = function (prop, value) {
            /** Expecting value to be array if multiple aruments */
            if (this.ctx[prop] && typeof this.ctx[prop] === "function") {
                this.ctx[prop].apply(null, value);
            } else if (this.ctx[prop]) {
                this.ctx[prop] = value;
            }
        };

        root.execute = function executeExe() {
            onClear(ctx, this.width, this.height);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.updateBBox();
            execute();
            if (onChangeExe && this.stateModified) {
                onChangeExe();
            }
            this.stateModified = false;
        };

        root.update = function executeUpdate() {
            this.execute();
        };

        root.toDataURL = function (p) {
            return this.domEl.toDataURL(p);
        };

        root.getPixels = function (x, y, width_, height_) {
            const imageData = this.ctx.getImageData(x, y, width_, height_);
            const pixelInstance = new PixelObject(imageData, width_, height_);

            return pixelInstance;
        };

        root.putPixels = function (Pixels, x, y) {
            if (!(Pixels instanceof PixelObject)) {
                return;
            }
            return this.ctx.putImageData(Pixels.imageData, x, y);
        };

        root.clear = function () {
            onClear();
        };

        root.createTexture = function (config) {
            return new RenderTexture(this, config);
        };

        root.setContext = function (prop, value) {
            /** Expecting value to be array if multiple aruments */
            if (this.ctx[prop] && typeof this.ctx[prop] === "function") {
                this.ctx[prop].apply(null, value);
            } else if (this.ctx[prop]) {
                this.ctx[prop] = value;
            }
        };

        root.export = function (metaData = {
            }) {

            return this.domEl.toBuffer(metaData.mimeType || 'image/png', metaData);
        }

        root.createPattern = createCanvasPattern;

        root.createClip = createCanvasClip;

        root.createMask = createCanvasMask;

        return root;
    }

function pdfLayer(config, height = 0, width = 0) {
    const layer = createCanvas(width, height, "pdf");
    let ctx = layer.getContext("2d", config);
    ctx.type_ = "pdf";
    ctx.quality = "best";
    ctx.patternQuality = "best";

    function PDFCreator() {
        this.pages = [];
        this.ctx = ctx;
        this.domEl = layer;
    }
    PDFCreator.prototype.clear = function () {
        this.pages.forEach(function (page) {
            page.clear();
        });
    }
    PDFCreator.prototype.execute = function () {
        let self = this;
        this.pages.forEach(function (page, i) {
            self.ctx.save();
            if (i !== 0) {
                page.addPage();
            }
            page.execute();
            self.ctx.restore();
        })
    }
    PDFCreator.prototype.addPage = function () {
        let newpage = createPage(ctx);
        newpage.domEl = layer;
        newpage.height = height;
        newpage.width = width;
        newpage.type = "CANVAS";
        newpage.EXEType = "pdf";
        newpage.ctx = ctx;

        newpage.setSize = function (width_, height_) {
            this.domEl = createCanvas(width_, height_, "pdf");
            ctx = this.domEl.getContext("2d", config);
            ctx.type_ = "pdf";
            this.width = width_;
            this.height = height_;
            this.ctx = ctx;
            this.execute();
        };

        ctx.textDrawingMode = "glyph";
        this.pages.push(newpage);
        return newpage;
    }
    PDFCreator.prototype.removePage = function (page) {
        let pageIndex = this.pages.indexOf(page);
        if (pageIndex !== -1) {
            this.pages.splice(pageIndex, 1);
        }
    }
    PDFCreator.prototype.exportPdf = function (metaData = {
          title: 'I2DJs Pdf',
          keywords: 'I2Djs pdf generator demo, canvas',
          creationDate: new Date()
        }) {

        return this.domEl.toBuffer('application/pdf', metaData);
    }
    PDFCreator.prototype.exec = function (exe) {
        exe.call(this, this.dataObj);
    }
    PDFCreator.prototype.data = function (data) {
        if (!data) {
            return this.dataObj;
        } else {
            this.dataObj = data;
        }
        return this;
    }

    return new PDFCreator(ctx);
}

function canvasLayer(config, height = 0, width = 0) {
    let onChangeExe;
    const layer = createCanvas(width, height);
    let ctx = layer.getContext("2d", config);
    let root = createPage(ctx);
        root.domEl = layer;
        root.height = height;
        root.width = width;
        root.type = "CANVAS";
        root.ctx = ctx;
        ctx.quality = "best";
        root.setSize = function (width_, height_) {
            this.domEl = createCanvas(width_, height_);
            ctx = this.domEl.getContext("2d", config);
            this.width = width_;
            this.height = height_;
            this.ctx = ctx;
            this.execute();
        };

    return root;
}

export default {
    canvasLayer,
    pdfLayer
};
