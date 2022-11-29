/*!
      * node-i2djs
      * (c) 2022 Narayana swamy (narayanaswamy14@gmail.com)
      * @license BSD-3-Clause
      */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* eslint-disable no-undef */
var sqrt = Math.sqrt;
var sin = Math.sin;
var cos = Math.cos;
var abs = Math.abs;
var atan2 = Math.atan2;
var tan = Math.tan;
var PI = Math.PI;
var ceil = Math.ceil;
var max = Math.max;

function pw(a, x) {
    var val = 1;
    if (x === 0) { return val; }

    for (var i = 1; i <= x; i += 1) {
        val *= a;
    }

    return val;
}


function bezierLength(p0, p1, p2) {
    var a = {};
    var b = {};
    a.x = p0.x + p2.x - 2 * p1.x;
    a.y = p0.y + p2.y - 2 * p1.y;
    b.x = 2 * p1.x - 2 * p0.x;
    b.y = 2 * p1.y - 2 * p0.y;
    var A = 4 * (a.x * a.x + a.y * a.y);
    var B = 4 * (a.x * b.x + a.y * b.y);
    var C = b.x * b.x + b.y * b.y;
    var Sabc = 2 * sqrt(A + B + C);
    var A_2 = sqrt(A);
    var A_32 = 2 * A * A_2;
    var C_2 = 2 * sqrt(C);
    var BA = B / A_2;
    var logVal = (2 * A_2 + BA + Sabc) / (BA + C_2);
    logVal = isNaN(logVal) || abs(logVal) === Infinity ? 1 : logVal;
    return (
        (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log(logVal)) / (4 * A_32)
    );
}

function cubicBezierLength(p0, co) {
    var interval = 0.001;
    var sum = 0;
    var cubicBezierTransitionInstance = cubicBezierTransition.bind(null, p0, co);
    var p1;
    var p2;

    for (var i = 0; i <= 1; i += interval) {
        p1 = cubicBezierTransitionInstance(i);
        p2 = cubicBezierTransitionInstance(i + interval);
        sum += sqrt(pw((p2.x - p1.x) / interval, 2) + pw((p2.y - p1.y) / interval, 2)) * interval;
    }

    return sum;
}

function getDistance(p1, p2) {
    var cPw = 0;

    for (var p in p1) {
        cPw += pw(p2[p] - p1[p], 2);
    }

    if (isNaN(cPw)) {
        throw new Error("error");
    }

    return sqrt(cPw);
}

function get2DAngle(p1, p2) {
    return atan2(p2.x - p1.x, p2.y - p1.y);
}

function scaleAlongOrigin(co, factor) {
    var co_ = {};

    for (var prop in co) {
        co_[prop] = co[prop] * factor;
    }

    return co_;
}

function scaleAlongPoint(p, r, f) {
    var s = (p.y - r.y) / (p.x - r.x);
    var xX = p.x * f;
    var yY = (s * (xX - r.x) + r.y) * f;
    return {
        x: xX,
        y: yY,
    };
}

function cubicBezierCoefficients(p) {
    var cx = 3 * (p.cntrl1.x - p.p0.x);
    var bx = 3 * (p.cntrl2.x - p.cntrl1.x) - cx;
    var ax = p.p1.x - p.p0.x - cx - bx;
    var cy = 3 * (p.cntrl1.y - p.p0.y);
    var by = 3 * (p.cntrl2.y - p.cntrl1.y) - cy;
    var ay = p.p1.y - p.p0.y - cy - by;
    return {
        cx: cx,
        bx: bx,
        ax: ax,
        cy: cy,
        by: by,
        ay: ay,
    };
}

function toCubicCurves(stack) {
    if (!stack.length) {
        return;
    }

    var _ = stack;
    var mappedArr = [];

    for (var i = 0; i < _.length; i += 1) {
        if (["M", "C", "S", "Q"].indexOf(_[i].type) !== -1) {
            mappedArr.push(_[i]);
        } else if (["V", "H", "L", "Z"].indexOf(_[i].type) !== -1) {
            var ctrl1 = {
                x: (_[i].p0.x + _[i].p1.x) / 2,
                y: (_[i].p0.y + _[i].p1.y) / 2,
            };
            mappedArr.push({
                p0: _[i].p0,
                cntrl1: ctrl1,
                cntrl2: ctrl1,
                p1: _[i].p1,
                type: "C",
                length: _[i].length,
            });
        } else {
            console.log("wrong cmd type");
        }
    }

    return mappedArr;
}

function cubicBezierTransition(p0, co, f) {
    var p3 = pw(f, 3);
    var p2 = pw(f, 2);
    return {
        x: co.ax * p3 + co.bx * p2 + co.cx * f + p0.x,
        y: co.ay * p3 + co.by * p2 + co.cy * f + p0.y,
    };
}

function bezierTransition(p0, p1, p2, f) {
    return {
        x: (p0.x - 2 * p1.x + p2.x) * f * f + (2 * p1.x - 2 * p0.x) * f + p0.x,
        y: (p0.y - 2 * p1.y + p2.y) * f * f + (2 * p1.y - 2 * p0.y) * f + p0.y,
    };
}

function linearTBetweenPoints(p1, p2, f) {
    return {
        x: p1.x + (p2.x - p1.x) * f,
        y: p1.y + (p2.y - p1.y) * f,
    };
}

function intermediateValue(v1, v2, f) {
    return v1 + (v2 - v1) * f;
}

var _slicedToArray = (function () {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;

        var _e;

        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);

                if (i && _arr.length === i) { break; }
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i.return) { _i.return(); }
            } finally {
                if (_d) {
                    console.log("Error -" + _e);
                }
            }
        }

        return _arr;
    }

    return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        }

        throw new TypeError("Invalid attempt to destructure non-iterable instance");
    };
})();

var TAU = PI * 2;

var mapToEllipse = function mapToEllipse(_ref, rx, ry, cosphi, sinphi, centerx, centery) {
    var x = _ref.x;
    var y = _ref.y;
    x *= rx;
    y *= ry;
    var xp = cosphi * x - sinphi * y;
    var yp = sinphi * x + cosphi * y;
    return {
        x: xp + centerx,
        y: yp + centery,
    };
};

var approxUnitArc = function approxUnitArc(ang1, ang2) {
    var a = (4 / 3) * tan(ang2 / 4);
    var x1 = cos(ang1);
    var y1 = sin(ang1);
    var x2 = cos(ang1 + ang2);
    var y2 = sin(ang1 + ang2);
    return [
        {
            x: x1 - y1 * a,
            y: y1 + x1 * a,
        },
        {
            x: x2 + y2 * a,
            y: y2 - x2 * a,
        },
        {
            x: x2,
            y: y2,
        } ];
};

var vectorAngle = function vectorAngle(ux, uy, vx, vy) {
    var sign = ux * vy - uy * vx < 0 ? -1 : 1;
    var umag = sqrt(ux * ux + uy * uy);
    var vmag = sqrt(ux * ux + uy * uy);
    var dot = ux * vx + uy * vy;
    var div = dot / (umag * vmag);

    if (div > 1) {
        div = 1;
    }

    if (div < -1) {
        div = -1;
    }

    return sign * Math.acos(div);
};

var getArcCenter = function getArcCenter(
    px,
    py,
    cx,
    cy,
    rx,
    ry,
    largeArcFlag,
    sweepFlag,
    sinphi,
    cosphi,
    pxp,
    pyp
) {
    var rxsq = pw(rx, 2);
    var rysq = pw(ry, 2);
    var pxpsq = pw(pxp, 2);
    var pypsq = pw(pyp, 2);
    var radicant = rxsq * rysq - rxsq * pypsq - rysq * pxpsq;

    if (radicant < 0) {
        radicant = 0;
    }

    radicant /= rxsq * pypsq + rysq * pxpsq;
    radicant = sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);
    var centerxp = ((radicant * rx) / ry) * pyp;
    var centeryp = ((radicant * -ry) / rx) * pxp;
    var centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
    var centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;
    var vx1 = (pxp - centerxp) / rx;
    var vy1 = (pyp - centeryp) / ry;
    var vx2 = (-pxp - centerxp) / rx;
    var vy2 = (-pyp - centeryp) / ry;
    var ang1 = vectorAngle(1, 0, vx1, vy1);
    var ang2 = vectorAngle(vx1, vy1, vx2, vy2);

    if (sweepFlag === 0 && ang2 > 0) {
        ang2 -= TAU;
    }

    if (sweepFlag === 1 && ang2 < 0) {
        ang2 += TAU;
    }

    return [centerx, centery, ang1, ang2];
};

var arcToBezier = function arcToBezier(_ref2) {
    var px = _ref2.px;
    var py = _ref2.py;
    var cx = _ref2.cx;
    var cy = _ref2.cy;
    var rx = _ref2.rx;
    var ry = _ref2.ry;
    var _ref2$xAxisRotation = _ref2.xAxisRotation;
    var xAxisRotation = _ref2$xAxisRotation === undefined ? 0 : _ref2$xAxisRotation;
    var _ref2$largeArcFlag = _ref2.largeArcFlag;
    var largeArcFlag = _ref2$largeArcFlag === undefined ? 0 : _ref2$largeArcFlag;
    var _ref2$sweepFlag = _ref2.sweepFlag;
    var sweepFlag = _ref2$sweepFlag === undefined ? 0 : _ref2$sweepFlag;
    var curves = [];

    if (rx === 0 || ry === 0) {
        return [];
    }

    var sinphi = sin((xAxisRotation * TAU) / 360);
    var cosphi = cos((xAxisRotation * TAU) / 360);
    var pxp = (cosphi * (px - cx)) / 2 + (sinphi * (py - cy)) / 2;
    var pyp = (-sinphi * (px - cx)) / 2 + (cosphi * (py - cy)) / 2;

    if (pxp === 0 && pyp === 0) {
        return [];
    }

    rx = abs(rx);
    ry = abs(ry);
    var lambda = pw(pxp, 2) / pw(rx, 2) + pw(pyp, 2) / pw(ry, 2);

    if (lambda > 1) {
        rx *= sqrt(lambda);
        ry *= sqrt(lambda);
    }

    var _getArcCenter = getArcCenter(
        px,
        py,
        cx,
        cy,
        rx,
        ry,
        largeArcFlag,
        sweepFlag,
        sinphi,
        cosphi,
        pxp,
        pyp
    );

    var _getArcCenter2 = _slicedToArray(_getArcCenter, 4);

    var centerx = _getArcCenter2[0];
    var centery = _getArcCenter2[1];
    var ang1 = _getArcCenter2[2];
    var ang2 = _getArcCenter2[3];
    var segments = max(ceil(abs(ang2) / (TAU / 4)), 1);
    ang2 /= segments;

    for (var i = 0; i < segments; i++) {
        curves.push(approxUnitArc(ang1, ang2));
        ang1 += ang2;
    }

    return curves.map(function (curve) {
        var _mapToEllipse = mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery);

        var x1 = _mapToEllipse.x;
        var y1 = _mapToEllipse.y;

        var _mapToEllipse2 = mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery);

        var x2 = _mapToEllipse2.x;
        var y2 = _mapToEllipse2.y;

        var _mapToEllipse3 = mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery);

        var x = _mapToEllipse3.x;
        var y = _mapToEllipse3.y;
        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            x: x,
            y: y,
        };
    });
};

function rotatePoint(point, centre, newAngle, distance) {
    var x = point.x;
    var y = point.y;
    var cx = centre.x;
    var cy = centre.y;

    var radians = (PI / 180) * newAngle;
    var c_ = cos(-radians);
    var s_ = sin(-radians);
    return {
        x: c_ * (x - cx) + s_ * (y - cy) + cx,
        y: c_ * (y - cy) - s_ * (x - cx) + cy,
    };
}

function rotateBBox(BBox, transform) {
    var point1 = {
        x: BBox.x,
        y: BBox.y,
    };
    var point2 = {
        x: BBox.x + BBox.width,
        y: BBox.y,
    };
    var point3 = {
        x: BBox.x,
        y: BBox.y + BBox.height,
    };
    var point4 = {
        x: BBox.x + BBox.width,
        y: BBox.y + BBox.height,
    };
    var translate = transform.translate;
    var rotate = transform.rotate;
    var cen = {
        x: rotate[1] || 0,
        y: rotate[2] || 0,
    };
    var rotateAngle = rotate[0];

    if (translate && translate.length > 0) {
        cen.x += translate[0];
        cen.y += translate[1];
    }

    point1 = rotatePoint(point1, cen, rotateAngle, getDistance(point1, cen));
    point2 = rotatePoint(point2, cen, rotateAngle, getDistance(point2, cen));
    point3 = rotatePoint(point3, cen, rotateAngle, getDistance(point3, cen));
    point4 = rotatePoint(point4, cen, rotateAngle, getDistance(point4, cen));
    var xVec = [point1.x, point2.x, point3.x, point4.x].sort(function (bb, aa) { return bb - aa; });
    var yVec = [point1.y, point2.y, point3.y, point4.y].sort(function (bb, aa) { return bb - aa; });
    return {
        x: xVec[0],
        y: yVec[0],
        width: xVec[3] - xVec[0],
        height: yVec[3] - yVec[0],
    };
}

function Geometry() {}

Geometry.prototype = {
    pow: pw,
    getAngle: get2DAngle,
    getDistance: getDistance,
    scaleAlongOrigin: scaleAlongOrigin,
    scaleAlongPoint: scaleAlongPoint,
    linearTransitionBetweenPoints: linearTBetweenPoints,
    bezierTransition: bezierTransition,
    bezierLength: bezierLength,
    cubicBezierTransition: cubicBezierTransition,
    cubicBezierLength: cubicBezierLength,
    cubicBezierCoefficients: cubicBezierCoefficients,
    arcToBezier: arcToBezier,
    intermediateValue: intermediateValue,
    toCubicCurves: toCubicCurves,
    rotatePoint: rotatePoint,
    rotateBBox: rotateBBox,
};
var geometry = new Geometry();

/* eslint-disable no-undef */
var t2DGeometry$1 = geometry;

function pathCmdIsValid(_) {
    return (
        [
            "m",
            "M",
            "v",
            "V",
            "l",
            "L",
            "h",
            "H",
            "q",
            "Q",
            "c",
            "C",
            "s",
            "S",
            "a",
            "A",
            "z",
            "Z" ].indexOf(_) !== -1
    );
}

function updateBBox(d, pd, minMax, bbox) {
    var minX = minMax.minX;
    var minY = minMax.minY;
    var maxX = minMax.maxX;
    var maxY = minMax.maxY;

    if (["V", "H", "L", "v", "h", "l"].indexOf(d.type) !== -1) {
        [d.p0 ? d.p0 : pd.p1, d.p1].forEach(function (point) {
            if (point.x < minX) {
                minX = point.x;
            }

            if (point.x > maxX) {
                maxX = point.x;
            }

            if (point.y < minY) {
                minY = point.y;
            }

            if (point.y > maxY) {
                maxY = point.y;
            }
        });
    } else if (["Q", "C", "q", "c"].indexOf(d.type) !== -1) {
        var co = t2DGeometry$1.cubicBezierCoefficients(d);
        var exe = t2DGeometry$1.cubicBezierTransition.bind(null, d.p0, co);
        var ii = 0;
        var point;

        while (ii < 1) {
            point = exe(ii);
            ii += 0.05;

            if (point.x < minX) {
                minX = point.x;
            }

            if (point.x > maxX) {
                maxX = point.x;
            }

            if (point.y < minY) {
                minY = point.y;
            }

            if (point.y > maxY) {
                maxY = point.y;
            }
        }
    } else {
        var point$1 = d.p0;

        if (point$1.x < minX) {
            minX = point$1.x;
        }

        if (point$1.x > maxX) {
            maxX = point$1.x;
        }

        if (point$1.y < minY) {
            minY = point$1.y;
        }

        if (point$1.y > maxY) {
            maxY = point$1.y;
        }
    }

    minMax.minX = minX;
    minMax.minY = minY;
    minMax.maxX = maxX;
    minMax.maxY = maxY;

    bbox.x = minX;
    bbox.y = minY;
    bbox.width = maxX - minX;
    bbox.height = maxY - minY;
}

function pathParser(path) {
    var pathStr = path.replace(/e-/g, "$");
    pathStr = pathStr.replace(/ /g, ",");
    pathStr = pathStr.replace(/-/g, ",-");
    pathStr = pathStr
        .split(/([a-zA-Z,])/g)
        .filter(function (d) {
            if (d === "" || d === ",") {
                return false;
            }
            return true;
        })
        .map(function (d) {
            var dd = d.replace(/\$/g, "e-");
            return dd;
        });

    for (var i = 0; i < pathStr.length; i += 1) {
        if (pathStr[i].split(".").length > 2) {
            var splitArr = pathStr[i].split(".");
            var arr = [((splitArr[0]) + "." + (splitArr[1]))];

            for (var j = 2; j < splitArr.length; j += 1) {
                arr.push(("." + (splitArr[j])));
            }

            pathStr.splice(i, 1, arr[0], arr[1]);
        }
    }

    return pathStr;
}

function addVectors(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
    };
}

function subVectors(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
    };
}

function fetchXY() {
    var x = parseFloat(this.pathArr[(this.currPathArr += 1)]);
    var y = parseFloat(this.pathArr[(this.currPathArr += 1)]);
    return {
        x: x,
        y: y,
    };
}

function relative(flag, p1, p2) {
    return flag ? p2 : p1;
}

function m(rel, p0) {
    var temp = relative(
        rel,
        this.pp
            ? this.pp
            : {
                  x: 0,
                  y: 0,
              },
        {
            x: 0,
            y: 0,
        }
    );
    this.cntrl = null;
    this.cp = addVectors(p0, temp);
    this.start = this.cp;
    this.segmentLength = 0;
    this.length = this.segmentLength;

    if (this.currPathArr !== 0 && this.pp) {
        this.stackGroup.push(this.stack);
        this.stack = [];
    } else {
        this.stackGroup.push(this.stack);
    }

    this.stack.push({
        type: "M",
        p0: this.cp,
        length: this.segmentLength,

        pointAt: function pointAt(f) {
            return this.p0;
        },
    });
    this.pp = this.cp;
    updateBBox(
        this.stack[this.stack.length - 1],
        this.stack[this.stack.length - 2],
        this.minMax,
        this.BBox
    );
    return this;
}

function v(rel, p1) {
    var temp = relative(rel, this.pp, {
        x: this.pp.x,
        y: 0,
    });
    this.cntrl = null;
    this.cp = addVectors(p1, temp);
    this.segmentLength = t2DGeometry$1.getDistance(this.pp, this.cp);
    this.stack.push({
        type: "V",
        p0: this.pp,
        p1: this.cp,
        length: this.segmentLength,

        pointAt: function pointAt(f) {
            return t2DGeometry$1.linearTransitionBetweenPoints(this.p0, this.p1, f);
        },
    });
    this.length += this.segmentLength;
    this.pp = this.cp;
    updateBBox(
        this.stack[this.stack.length - 1],
        this.stack[this.stack.length - 2],
        this.minMax,
        this.BBox
    );
    return this;
}

function l(rel, p1) {
    var temp = relative(rel, this.pp, {
        x: 0,
        y: 0,
    });
    this.cntrl = null;
    this.cp = addVectors(p1, temp);
    this.segmentLength = t2DGeometry$1.getDistance(this.pp, this.cp);
    this.stack.push({
        type: rel ? "L" : "l",
        p0: this.pp,
        p1: this.cp,
        relative: {
            p1: p1,
        },
        length: this.segmentLength,

        pointAt: function pointAt(f) {
            return t2DGeometry$1.linearTransitionBetweenPoints(this.p0, this.p1, f);
        },
    });
    this.length += this.segmentLength;
    this.pp = this.cp;
    updateBBox(
        this.stack[this.stack.length - 1],
        this.stack[this.stack.length - 2],
        this.minMax,
        this.BBox
    );
    return this;
}

function h(rel, p1) {
    var temp = relative(rel, this.pp, {
        x: 0,
        y: this.pp.y,
    });
    this.cp = addVectors(p1, temp);
    this.cntrl = null;
    this.segmentLength = t2DGeometry$1.getDistance(this.pp, this.cp);
    this.stack.push({
        type: rel ? "H" : "h",
        p0: this.pp,
        p1: this.cp,
        length: this.segmentLength,
        relative: {
            p1: p1,
        },
        pointAt: function pointAt(f) {
            return t2DGeometry$1.linearTransitionBetweenPoints(this.p0, this.p1, f);
        },
    });
    this.length += this.segmentLength;
    this.pp = this.cp;
    updateBBox(
        this.stack[this.stack.length - 1],
        this.stack[this.stack.length - 2],
        this.minMax,
        this.BBox
    );
    return this;
}

function z() {
    this.cp = this.start;
    this.segmentLength = t2DGeometry$1.getDistance(this.pp, this.cp);
    this.stack.push({
        p0: this.pp,
        p1: this.cp,
        type: "Z",
        length: this.segmentLength,
        pointAt: function pointAt(f) {
            return t2DGeometry$1.linearTransitionBetweenPoints(this.p0, this.p1, f);
        },
    });
    this.length += this.segmentLength;
    this.pp = this.cp;
    updateBBox(
        this.stack[this.stack.length - 1],
        this.stack[this.stack.length - 2],
        this.minMax,
        this.BBox
    );
    return this;
}

function q(rel, c1, ep) {
    var temp = relative(rel, this.pp, {
        x: 0,
        y: 0,
    });
    var cntrl1 = addVectors(c1, temp);
    var endPoint = addVectors(ep, temp);
    this.cp = endPoint;
    this.segmentLength = t2DGeometry$1.bezierLength(this.pp, cntrl1, this.cp);
    this.cp = endPoint;
    this.stack.push({
        type: rel ? "Q" : "q",
        p0: this.pp,
        cntrl1: cntrl1,
        cntrl2: cntrl1,
        p1: this.cp,
        relative: {
            cntrl1: c1,
            p1: ep,
        },
        length: this.segmentLength,

        pointAt: function pointAt(f) {
            return t2DGeometry$1.bezierTransition(this.p0, this.cntrl1, this.p1, f);
        },
    });
    this.length += this.segmentLength;
    this.pp = this.cp;
    this.cntrl = cntrl1;
    updateBBox(
        this.stack[this.stack.length - 1],
        this.stack[this.stack.length - 2],
        this.minMax,
        this.BBox
    );
    return this;
}

function c(rel, c1, c2, ep) {
    var self = this;
    var temp = relative(rel, this.pp, {
        x: 0,
        y: 0,
    });
    var cntrl1 = addVectors(c1, temp);
    var cntrl2 = addVectors(c2, temp);
    var endPoint = addVectors(ep, temp);
    var co = t2DGeometry$1.cubicBezierCoefficients({
        p0: this.pp,
        cntrl1: cntrl1,
        cntrl2: cntrl2,
        p1: endPoint,
    });
    this.cntrl = cntrl2;
    this.cp = endPoint;
    this.segmentLength = t2DGeometry$1.cubicBezierLength(this.pp, co);
    this.stack.push({
        type: rel ? "C" : "c",
        p0: this.pp,
        cntrl1: cntrl1,
        cntrl2: cntrl2,
        p1: this.cp,
        length: this.segmentLength,
        co: co,
        relative: {
            cntrl1: c1,
            cntrl2: c2,
            p1: ep,
        },

        pointAt: function pointAt(f) {
            return t2DGeometry$1.cubicBezierTransition(this.p0, this.co, f);
        },
    });
    this.length += this.segmentLength;
    this.pp = this.cp;
    updateBBox(
        self.stack[self.stack.length - 1],
        self.stack[self.stack.length - 2],
        self.minMax,
        self.BBox
    );
    return this;
}

function s(rel, c2, ep) {
    var temp = relative(rel, this.pp, {
        x: 0,
        y: 0,
    });
    var cntrl2 = addVectors(c2, temp);
    var cntrl1 = this.cntrl
        ? addVectors(this.pp, subVectors(this.pp, this.cntrl ? this.cntrl : this.pp))
        : cntrl2;

    var endPoint = addVectors(ep, temp);
    this.cp = endPoint;
    var co = t2DGeometry$1.cubicBezierCoefficients({
        p0: this.pp,
        cntrl1: cntrl1,
        cntrl2: cntrl2,
        p1: endPoint,
    });
    this.segmentLength = t2DGeometry$1.cubicBezierLength(this.pp, co);
    this.stack.push({
        type: rel ? "S" : "s",
        p0: this.pp,
        cntrl1: cntrl1,
        cntrl2: cntrl2,
        p1: this.cp,
        co: co,
        length: this.segmentLength,
        relative: {
            cntrl2: c2,
            p1: ep,
        },

        pointAt: function pointAt(f) {
            return t2DGeometry$1.cubicBezierTransition(this.p0, this.co, f);
        },
    }); // this.stack.segmentLength += this.segmentLength
    updateBBox(
        this.stack[this.stack.length - 1],
        this.stack[this.stack.length - 2],
        this.minMax,
        this.BBox
    );
    this.length += this.segmentLength;
    this.pp = this.cp;
    this.cntrl = cntrl2;
    return this;
}

function a(rel, rx, ry, xRotation, arcLargeFlag, sweepFlag, ep) {
    var temp = relative(rel, this.pp, {
        x: 0,
        y: 0,
    });
    var self = this;
    var endPoint = addVectors(ep, temp);
    this.cp = endPoint;
    var arcToQuad = t2DGeometry$1.arcToBezier({
        px: this.pp.x,
        py: this.pp.y,
        cx: endPoint.x,
        cy: endPoint.y,
        rx: rx,
        ry: ry,
        xAxisRotation: xRotation,
        largeArcFlag: arcLargeFlag,
        sweepFlag: sweepFlag,
    });
    arcToQuad.forEach(function (d, i) {
        var pp =
            i === 0
                ? self.pp
                : {
                      x: arcToQuad[0].x,
                      y: arcToQuad[0].y,
                  };
        var cntrl1 = {
            x: d.x1,
            y: d.y1,
        };
        var cntrl2 = {
            x: d.x2,
            y: d.y2,
        };
        var cp = {
            x: d.x,
            y: d.y,
        };
        var segmentLength = t2DGeometry$1.cubicBezierLength(
            pp,
            t2DGeometry$1.cubicBezierCoefficients({
                p0: pp,
                cntrl1: cntrl1,
                cntrl2: cntrl2,
                p1: cp,
            })
        );
        self.stack.push({
            type: "C",
            p0: pp,
            cntrl1: cntrl1,
            cntrl2: cntrl2,
            p1: cp,
            length: segmentLength,

            pointAt: function pointAt(f) {
                return t2DGeometry$1.bezierTransition(this.p0, this.cntrl1, this.cntrl2, this.p1, f);
            },
        });
        self.length += segmentLength;
        updateBBox(
            self.stack[self.stack.length - 1],
            self.stack[self.stack.length - 2],
            self.minMax,
            self.BBox
        );
    });
    this.pp = this.cp;
    this.cntrl = null;

    return this;
}

function Path(path) {
    this.stack = [];
    this.length = 0;
    this.stackGroup = [];

    this.BBox = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    this.minMax = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
    };

    if (path) {
        this.parse(path);
    }
}

Path.prototype = {
    z: z,
    m: m,
    v: v,
    h: h,
    l: l,
    q: q,
    s: s,
    c: c,
    a: a,
    fetchXY: fetchXY,
};

Path.prototype.points = function (points) {
    if (typeof this.f === "undefined") { this.f = 0.3; }
    if (typeof this.t === "undefined") { this.t = 0.6; }
    if (points.length === 0) { return; }

    this.m(true, { x: points[0].x, y: points[0].y });

    var m = 0;
    var dx1 = 0;
    var dy1 = 0;
    var dx2 = 0;
    var dy2 = 0;

    var preP = points[0];

    for (var i = 1; i < points.length; i++) {
        var curP = points[i];
        var nexP = points[i + 1];
        dx2 = 0;
        dy2 = 0;
        if (nexP) {
            m = (nexP.y - preP.y) / (nexP.x - preP.x);
            dx2 = (nexP.x - curP.x) * -this.f;
            dy2 = dx2 * m * this.t;
        }
        this.c(
            true,
            { x: preP.x - dx1, y: preP.y - dy1 },
            { x: curP.x + dx2, y: curP.y + dy2 },
            { x: curP.x, y: curP.y }
        );

        dx1 = dx2;
        dy1 = dy2;
        preP = curP;
    }
};
Path.prototype.curveFfactor = function (f) {
    this.f = f;
};
Path.prototype.curveTfactor = function (t) {
    this.t = t;
};

Path.prototype.parse = function parse(path) {
    this.path = path;
    this.currPathArr = -1;
    this.stack = [];
    this.length = 0;
    this.pathArr = pathParser(this.path);
    this.stackGroup = [];

    while (this.currPathArr < this.pathArr.length - 1) {
        this.case(this.pathArr[(this.currPathArr += 1)]);
    }

    // this.BBox = getBBox(this.stackGroup);

    return this.stack;
};

Path.prototype.fetchPathString = function () {
    var p = "";
    var c;

    for (var i = 0; i < this.stack.length; i++) {
        c = this.stack[i];

        if (c.type === "M" || c.type === "m") {
            p += c.type + " " + c.p0.x + "," + c.p0.y + " ";
        } else if (c.type === "Z" || c.type === "z") {
            p += "z";
        } else if (c.type === "C") {
            p +=
                c.type +
                " " +
                c.cntrl1.x +
                "," +
                c.cntrl1.y +
                " " +
                c.cntrl2.x +
                "," +
                c.cntrl2.y +
                " " +
                c.p1.x +
                "," +
                c.p1.y +
                " ";
        } else if (c.type === "c") {
            p +=
                c.type +
                " " +
                c.relative.cntrl1.x +
                "," +
                c.relative.cntrl1.y +
                " " +
                c.relative.cntrl2.x +
                "," +
                c.relative.cntrl2.y +
                " " +
                c.relative.p1.x +
                "," +
                c.relative.p1.y +
                " ";
        } else if (c.type === "Q") {
            p += c.type + " " + c.cntrl1.x + "," + c.cntrl1.y + " " + c.p1.x + "," + c.p1.y + " ";
        } else if (c.type === "q") {
            p +=
                c.type +
                " " +
                c.relative.cntrl1.x +
                "," +
                c.relative.cntrl1.y +
                " " +
                c.relative.p1.x +
                "," +
                c.relative.p1.y +
                " ";
        } else if (c.type === "S") {
            p += c.type + " " + c.cntrl2.x + "," + c.cntrl2.y + " " + c.p1.x + "," + c.p1.y + " ";
        } else if (c.type === "s") {
            p +=
                c.type +
                " " +
                c.relative.cntrl2.x +
                "," +
                c.relative.cntrl2.y +
                " " +
                c.relative.p1.x +
                "," +
                c.relative.p1.y +
                " ";
        } else if (c.type === "V") {
            p += c.type + " " + c.p1.y + " ";
        } else if (c.type === "v") {
            p += c.type + " " + c.relative.p1.y + " ";
        } else if (c.type === "H") {
            p += c.type + " " + c.p1.x + " ";
        } else if (c.type === "h") {
            p += c.type + " " + c.relative.p1.x + " ";
        } else if (c.type === "L") {
            p += c.type + " " + c.p1.x + "," + c.p1.y + " ";
        } else if (c.type === "l") {
            p += c.type + " " + c.relative.p1.x + "," + c.relative.p1.y + " ";
        }
    }

    return p;
};

Path.prototype.getTotalLength = function getTotalLength() {
    return this.length;
};

Path.prototype.getAngleAtLength = function getAngleAtLength(length, dir) {
    if (length > this.length) {
        return null;
    }

    var point1 = this.getPointAtLength(length);
    var point2 = this.getPointAtLength(
        length + (dir === "src" ? -1 * length * 0.01 : length * 0.01)
    );
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

Path.prototype.getPointAtLength = function getPointAtLength(length) {
    var coOr = {
        x: 0,
        y: 0,
    };
    var tLength = length;
    this.stack.every(function (d, i) {
        tLength -= d.length;

        if (Math.floor(tLength) >= 0) {
            return true;
        }

        coOr = d.pointAt((d.length + tLength) / (d.length === 0 ? 1 : d.length));
        return false;
    });
    return coOr;
};

Path.prototype.execute = function (ctx, clippath) {
    var c;
    if (!clippath) {
        ctx.beginPath();
    }
    for (var i = 0; i < this.stack.length; i++) {
        c = this.stack[i];
        switch (c.type) {
            case "M":
            case "m":
                ctx.moveTo(c.p0.x, c.p0.y);
                break;
            case "Z":
            case "z":
                ctx.lineTo(c.p1.x, c.p1.y);
                break;
            case "L":
            case "l":
            case "V":
            case "v":
            case "H":
            case "h":
                ctx.lineTo(c.p1.x, c.p1.y);
                break;
            case "C":
            case "c":
            case "S":
            case "s":
                ctx.bezierCurveTo(c.cntrl1.x, c.cntrl1.y, c.cntrl2.x, c.cntrl2.y, c.p1.x, c.p1.y);
                break;
            case "Q":
            case "q":
                ctx.quadraticCurveTo(c.cntrl1.x, c.cntrl1.y, c.p1.x, c.p1.y);
                break;
        }
    }
    if (!clippath) {
        ctx.closePath();
    }
};

Path.prototype.getPoints = function (factor) {

    var points = [];
    // let tLength = this.length;
    // let currD = this.stack[0];
    // let cumLength = 0;
    // let iLenFact = 0;
    var d;

    for (var i = 0; i < this.stack.length; i++) {
        d = this.stack[i];
        var f = 0.05;
        var tf = 0;
        switch (d.type) {
            case "M":
            case "m":
                points[points.length] = d.p0.x;
                points[points.length] = d.p0.y;
                break;
            case "Z":
            case "z":
                points[points.length] = d.p1.x;
                points[points.length] = d.p1.y;
                break;
            case "L":
            case "l":
            case "V":
            case "v":
            case "H":
            case "h":
                points[points.length] = d.p1.x;
                points[points.length] = d.p1.y;
                break;
            case "C":
            case "c":
            case "S":
            case "s":
            case "Q":
            case "q":
                while (tf <= 1.0) {
                    var xy = d.pointAt(tf);
                    points[points.length] = xy.x;
                    points[points.length] = xy.y;
                    tf += f;
                }
                break;
        }
    }
    return points;
};

Path.prototype.case = function pCase(currCmd) {
    var currCmdI = currCmd;
    var rx;
    var ry;
    var xRotation;
    var arcLargeFlag;
    var sweepFlag;
    if (pathCmdIsValid(currCmdI)) {
        this.PC = currCmdI;
    } else {
        currCmdI = this.PC;
        this.currPathArr = this.currPathArr - 1;
    }

    switch (currCmdI) {
        case "m":
            this.m(false, this.fetchXY());
            break;

        case "M":
            this.m(true, this.fetchXY());
            break;

        case "v":
            this.v(false, {
                x: 0,
                y: parseFloat(this.pathArr[(this.currPathArr += 1)]),
            });
            break;

        case "V":
            this.v(true, {
                x: 0,
                y: parseFloat(this.pathArr[(this.currPathArr += 1)]),
            });
            break;

        case "l":
            this.l(false, this.fetchXY());
            break;

        case "L":
            this.l(true, this.fetchXY());
            break;

        case "h":
            this.h(false, {
                x: parseFloat(this.pathArr[(this.currPathArr += 1)]),
                y: 0,
            });
            break;

        case "H":
            this.h(true, {
                x: parseFloat(this.pathArr[(this.currPathArr += 1)]),
                y: 0,
            });
            break;

        case "q":
            this.q(false, this.fetchXY(), this.fetchXY());
            break;

        case "Q":
            this.q(true, this.fetchXY(), this.fetchXY());
            break;

        case "c":
            this.c(false, this.fetchXY(), this.fetchXY(), this.fetchXY());
            break;

        case "C":
            this.c(true, this.fetchXY(), this.fetchXY(), this.fetchXY());
            break;

        case "s":
            this.s(false, this.fetchXY(), this.fetchXY());
            break;

        case "S":
            this.s(true, this.fetchXY(), this.fetchXY());
            break;

        case "a":
            rx = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            ry = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            xRotation = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            arcLargeFlag = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            sweepFlag = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            this.a(false, rx, ry, xRotation, arcLargeFlag, sweepFlag, this.fetchXY());
            break;

        case "A":
            rx = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            ry = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            xRotation = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            arcLargeFlag = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            sweepFlag = parseFloat(this.pathArr[(this.currPathArr += 1)]);
            this.a(true, rx, ry, xRotation, arcLargeFlag, sweepFlag, this.fetchXY());
            break;

        case "z":
        case "Z":
            this.z();
            break;
    }
};


function isTypePath(pathInstance) {
    return pathInstance instanceof Path;
}

var path = {
    instance: function (d) {
        return new Path(d);
    },
    isTypePath: isTypePath
};

/* eslint-disable no-undef */
var colorMap = {
    AliceBlue: "f0f8ff",
    AntiqueWhite: "faebd7",
    Aqua: "00ffff",
    Aquamarine: "7fffd4",
    Azure: "f0ffff",
    Beige: "f5f5dc",
    Bisque: "ffe4c4",
    Black: "000000",
    BlanchedAlmond: "ffebcd",
    Blue: "0000ff",
    BlueViolet: "8a2be2",
    Brown: "a52a2a",
    BurlyWood: "deb887",
    CadetBlue: "5f9ea0",
    Chartreuse: "7fff00",
    Chocolate: "d2691e",
    Coral: "ff7f50",
    CornflowerBlue: "6495ed",
    Cornsilk: "fff8dc",
    Crimson: "dc143c",
    Cyan: "00ffff",
    DarkBlue: "00008b",
    DarkCyan: "008b8b",
    DarkGoldenRod: "b8860b",
    DarkGray: "a9a9a9",
    DarkGrey: "a9a9a9",
    DarkGreen: "006400",
    DarkKhaki: "bdb76b",
    DarkMagenta: "8b008b",
    DarkOliveGreen: "556b2f",
    DarkOrange: "ff8c00",
    DarkOrchid: "9932cc",
    DarkRed: "8b0000",
    DarkSalmon: "e9967a",
    DarkSeaGreen: "8fbc8f",
    DarkSlateBlue: "483d8b",
    DarkSlateGray: "2f4f4f",
    DarkSlateGrey: "2f4f4f",
    DarkTurquoise: "00ced1",
    DarkViolet: "9400d3",
    DeepPink: "ff1493",
    DeepSkyBlue: "00bfff",
    DimGray: "696969",
    DimGrey: "696969",
    DodgerBlue: "1e90ff",
    FireBrick: "b22222",
    FloralWhite: "fffaf0",
    ForestGreen: "228b22",
    Fuchsia: "ff00ff",
    Gainsboro: "dcdcdc",
    GhostWhite: "f8f8ff",
    Gold: "ffd700",
    GoldenRod: "daa520",
    Gray: "808080",
    Grey: "808080",
    Green: "008000",
    GreenYellow: "adff2f",
    HoneyDew: "f0fff0",
    HotPink: "ff69b4",
    IndianRed: "cd5c5c",
    Indigo: "4b0082",
    Ivory: "fffff0",
    Khaki: "f0e68c",
    Lavender: "e6e6fa",
    LavenderBlush: "fff0f5",
    LawnGreen: "7cfc00",
    LemonChiffon: "fffacd",
    LightBlue: "add8e6",
    LightCoral: "f08080",
    LightCyan: "e0ffff",
    LightGoldenRodYellow: "fafad2",
    LightGray: "d3d3d3",
    LightGrey: "d3d3d3",
    LightGreen: "90ee90",
    LightPink: "ffb6c1",
    LightSalmon: "ffa07a",
    LightSeaGreen: "20b2aa",
    LightSkyBlue: "87cefa",
    LightSlateGray: "778899",
    LightSlateGrey: "778899",
    LightSteelBlue: "b0c4de",
    LightYellow: "ffffe0",
    Lime: "00ff00",
    LimeGreen: "32cd32",
    Linen: "faf0e6",
    Magenta: "ff00ff",
    Maroon: "800000",
    MediumAquaMarine: "66cdaa",
    MediumBlue: "0000cd",
    MediumOrchid: "ba55d3",
    MediumPurple: "9370db",
    MediumSeaGreen: "3cb371",
    MediumSlateBlue: "7b68ee",
    MediumSpringGreen: "00fa9a",
    MediumTurquoise: "48d1cc",
    MediumVioletRed: "c71585",
    MidnightBlue: "191970",
    MintCream: "f5fffa",
    MistyRose: "ffe4e1",
    Moccasin: "ffe4b5",
    NavajoWhite: "ffdead",
    Navy: "000080",
    OldLace: "fdf5e6",
    Olive: "808000",
    OliveDrab: "6b8e23",
    Orange: "ffa500",
    OrangeRed: "ff4500",
    Orchid: "da70d6",
    PaleGoldenRod: "eee8aa",
    PaleGreen: "98fb98",
    PaleTurquoise: "afeeee",
    PaleVioletRed: "db7093",
    PapayaWhip: "ffefd5",
    PeachPuff: "ffdab9",
    Peru: "cd853f",
    Pink: "ffc0cb",
    Plum: "dda0dd",
    PowderBlue: "b0e0e6",
    Purple: "800080",
    RebeccaPurple: "663399",
    Red: "ff0000",
    RosyBrown: "bc8f8f",
    RoyalBlue: "4169e1",
    SaddleBrown: "8b4513",
    Salmon: "fa8072",
    SandyBrown: "f4a460",
    SeaGreen: "2e8b57",
    SeaShell: "fff5ee",
    Sienna: "a0522d",
    Silver: "c0c0c0",
    SkyBlue: "87ceeb",
    SlateBlue: "6a5acd",
    SlateGray: "708090",
    SlateGrey: "708090",
    Snow: "fffafa",
    SpringGreen: "00ff7f",
    SteelBlue: "4682b4",
    Tan: "d2b48c",
    Teal: "008080",
    Thistle: "d8bfd8",
    Tomato: "ff6347",
    Turquoise: "40e0d0",
    Violet: "ee82ee",
    Wheat: "f5deb3",
    White: "ffffff",
    WhiteSmoke: "f5f5f5",
    Yellow: "ffff00",
    YellowGreen: "9acd32",
};

function RGBA(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a === undefined ? 255 : a;
    this.rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

RGBA.prototype.normalize = function () {
    if (!this.normalFlag) {
        this.r /= 255;
        this.g /= 255;
        this.b /= 255;
        this.a /= 255;
        this.normalFlag = true;
    }
    return this;
};

function nameToHex(name) {
    return colorMap[name] ? ("#" + (colorMap[name])) : "#000";
}

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) { return r + r + g + g + b + b; });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return new RGBA(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255);
}

function rgbToHex(rgb) {
    var rgbComponents = rgb.substring(rgb.lastIndexOf("(") + 1, rgb.lastIndexOf(")")).split(",");
    var r = parseInt(rgbComponents[0], 10);
    var g = parseInt(rgbComponents[1], 10);
    var b = parseInt(rgbComponents[2], 10);
    return ("#" + (((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)));
}

function rgbParse(rgb) {
    var res = rgb.replace(/[^0-9.,]+/g, "").split(",");
    var obj = {};
    var flags = ["r", "g", "b", "a"];

    for (var i = 0; i < res.length; i += 1) {
        obj[flags[i]] = parseFloat(res[i]);
    }

    return new RGBA(obj.r, obj.g, obj.b, obj.a);
}

function hslParse(hsl) {
    var r;
    var g;
    var b;
    var a;
    var h;
    var s;
    var l;
    var res = hsl
        .replace(/[^0-9.,]+/g, "")
        .split(",")
        .map(function (d) {
            return parseFloat(d);
        });
    h = res[0] / 360;
    s = res[1] / 100;
    l = res[2] / 100;
    a = res[3];

    if (s === 0) {
        r = g = b = l;
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) { t += 1; }
            if (t > 1) { t -= 1; }
            if (t < 1 / 6) { return p + (q - p) * 6 * t; }
            if (t < 1 / 2) { return q; }
            if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3) * 255;
        g = hue2rgb(p, q, h) * 255;
        b = hue2rgb(p, q, h - 1 / 3) * 255;
    }
    return new RGBA(r, g, b, a);
}

function colorToRGB(val) {
    return val instanceof RGBA
        ? val
        : val.startsWith("#")
        ? hexToRgb(val)
        : val.startsWith("rgb")
        ? rgbParse(val)
        : val.startsWith("hsl")
        ? hslParse(val)
        : {
              r: 0,
              g: 0,
              b: 0,
              a: 255,
          };
}

function rgbaInstance(r, g, b, a) {
    return new RGBA(r, g, b, a);
}

function isTypeColor(value) {
    return (
        value instanceof RGBA ||
        value.startsWith("#") ||
        value.startsWith("rgb") ||
        value.startsWith("hsl")
    );
}

var colorMap$1 = {
    nameToHex: nameToHex,
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    hslToRgb: hslParse,
    colorToRGB: colorToRGB,
    rgba: rgbaInstance,
    isTypeColor: isTypeColor,
    RGBAInstanceCheck: function (_) {
        return _ instanceof RGBA;
    },
};

/* eslint-disable no-undef */

function performJoin(data, nodes, cond) {
    var dataIds = data.map(cond);
    var res = {
        new: [],
        update: [],
        old: [],
    };

    for (var i = 0; i < nodes.length; i += 1) {
        var index = dataIds.indexOf(cond(nodes[i].dataObj, i));

        if (index !== -1) {
            nodes[i].dataObj = data[index];
            res.update.push(nodes[i]);
            dataIds[index] = null;
        } else {
            // nodes[i].dataObj = data[index]
            res.old.push(nodes[i]);
        }
    }

    res.new = data.filter(function (d, i) {
        var index = dataIds.indexOf(cond(d, i));

        if (index !== -1) {
            dataIds[index] = null;
            return true;
        }

        return false;
    });
    return res;
}

var CompositeArray = {};
CompositeArray.push = {
    value: function (data) {
        if (Object.prototype.toString.call(data) !== "[object Array]") {
            data = [data];
        }

        for (var i = 0, len = data.length; i < len; i++) {
            this.data.push(data[i]);
        }

        if (this.config.action.enter) {
            var nodes = {};
            this.selector.split(",").forEach(function (d) {
                nodes[d] = data;
            });
            this.config.action.enter.call(this, nodes);
        }
    },
    enumerable: false,
    configurable: false,
    writable: false,
};
CompositeArray.pop = {
    value: function () {
        var self = this;
        var elData = this.data.pop();

        if (this.config.action.exit) {
            var nodes = {};
            this.selector.split(",").forEach(function (d) {
                nodes[d] = self.fetchEls(d, [elData]);
            });
            this.config.action.exit.call(this, nodes);
        }
    },
    enumerable: false,
    configurable: false,
    writable: false,
};
CompositeArray.remove = {
    value: function (data) {
        if (Object.prototype.toString.call(data) !== "[object Array]") {
            data = [data];
        }

        var self = this;

        for (var i = 0, len = data.length; i < len; i++) {
            var index_ = this.data.indexOf(data[i]);
            if (index_ !== -1) {
                this.data.splice(index_, 1);
            }
        }

        if (this.config.action.exit) {
            var nodes = {};
            this.selector.split(",").forEach(function (d) {
                nodes[d] = self.fetchEls(d, data);
            });
            this.config.action.exit.call(this, nodes);
        }
    },
    enumerable: false,
    configurable: true,
    writable: false,
};
CompositeArray.update = {
    value: function () {
        var self = this;

        if (this.config.action.update) {
            var nodes = {};
            this.selector.split(",").forEach(function (d) {
                nodes[d] = self.fetchEls(d, self.data);
            });
            this.config.action.update.call(this, nodes);
        }
    },
    enumerable: false,
    configurable: true,
    writable: false,
};
CompositeArray.join = {
    value: function (data) {
        this.data = data;
        dataJoin.call(this, data, this.selector, this.config);
    },
    enumerable: false,
    configurable: true,
    writable: false,
};

var NodePrototype = function () {};

NodePrototype.prototype.getAttr = function (_) {
    return this.attr[_];
};

NodePrototype.prototype.getStyle = function (_) {
    return this.style[_];
};

NodePrototype.prototype.exec = function Cexe(exe) {
    if (typeof exe !== "function") {
        console.error("Wrong Exe type");
    }

    exe.call(this, this.dataObj);
    return this;
};

NodePrototype.prototype.fetchEls = function (nodeSelector, dataArray) {
    var nodes = [];
    var wrap = new CollectionPrototype();

    if (this.children.length > 0) {
        if (nodeSelector.charAt(0) === ".") {
            var classToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.forEach(function (d) {
                if (!d) {
                    return;
                }
                var check1 =
                    dataArray &&
                    d.dataObj &&
                    dataArray.indexOf(d.dataObj) !== -1 &&
                    d.attr.class === classToken;
                var check2 = !dataArray && d.attr.class === classToken;

                if (check1 || check2) {
                    nodes.push(d);
                }
            });
        } else if (nodeSelector.charAt(0) === "#") {
            var idToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.every(function (d) {
                if (!d) {
                    return;
                }
                var check1 =
                    dataArray &&
                    d.dataObj &&
                    dataArray.indexOf(d.dataObj) !== -1 &&
                    d.attr.id === idToken;
                var check2 = !dataArray && d.attr.id === idToken;

                if (check1 || check2) {
                    nodes.push(d);
                    return false;
                }

                return true;
            });
        } else {
            nodeSelector = nodeSelector === "group" ? "g" : nodeSelector;
            this.children.forEach(function (d) {
                if (!d) {
                    return;
                }
                var check1 =
                    dataArray &&
                    d.dataObj &&
                    dataArray.indexOf(d.dataObj) !== -1 &&
                    d.nodeName === nodeSelector;
                var check2 = !dataArray && d.nodeName === nodeSelector;

                if (check1 || check2) {
                    nodes.push(d);
                }
            });
        }
    }

    return wrap.wrapper(nodes);
};

NodePrototype.prototype.fetchEl = function (nodeSelector, data) {
    var nodes;

    if (this.children.length > 0) {
        if (nodeSelector.charAt(0) === ".") {
            var classToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.every(function (d) {
                if (!d) {
                    return;
                }
                var check1 =
                    data && d.dataObj && data === d.dataObj && d.attr.class === classToken;
                var check2 = !data && d.attr.class === classToken;

                if (check1 || check2) {
                    nodes = d;
                    return false;
                }

                return true;
            });
        } else if (nodeSelector.charAt(0) === "#") {
            var idToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.every(function (d) {
                if (!d) {
                    return;
                }
                var check1 = data && d.dataObj && data === d.dataObj && d.attr.id === idToken;
                var check2 = !data && d.attr.id === idToken;

                if (check1 || check2) {
                    nodes = d;
                    return false;
                }

                return true;
            });
        } else {
            nodeSelector = nodeSelector === "group" ? "g" : nodeSelector;
            this.children.forEach(function (d) {
                if (!d) {
                    return;
                }
                var check1 =
                    data && d.dataObj && data === d.dataObj && d.nodeName === nodeSelector;
                var check2 = !data && d.nodeName === nodeSelector;

                if (check1 || check2) {
                    nodes = d;
                }
            });
        }
    }

    return nodes;
};

function dataJoin(data, selector, config) {
    var self = this;
    var selectors = selector.split(",");
    var joinOn = config.joinOn;
    var joinResult = {
        new: {},
        update: {},
        old: {},
    };

    if (!joinOn) {
        joinOn = function (d, i) {
            return i;
        };
    }

    for (var i = 0, len = selectors.length; i < len; i++) {
        var d = selectors[i];
        var nodes = self.fetchEls(d);
        var join = performJoin(data, nodes.stack, joinOn);
        joinResult.new[d] = join.new;
        joinResult.update[d] = new CollectionPrototype().wrapper(join.update);
        joinResult.old[d] = new CollectionPrototype().wrapper(join.old);
    }

    if (config.action) {
        if (config.action.enter) {
            config.action.enter.call(self, joinResult.new);
        }

        if (config.action.exit) {
            config.action.exit.call(self, joinResult.old);
        }

        if (config.action.update) {
            config.action.update.call(self, joinResult.update);
        }
    }

    CompositeArray.config = {
        value: config,
        enumerable: false,
        configurable: true,
        writable: true,
    };
    CompositeArray.selector = {
        value: selector,
        enumerable: false,
        configurable: true,
        writable: false,
    };
    CompositeArray.data = {
        value: data,
        enumerable: false,
        configurable: true,
        writable: true,
    };
    return Object.create(self, CompositeArray);
}

NodePrototype.prototype.join = dataJoin;

NodePrototype.prototype.data = function (data) {
    if (!data) {
        return this.dataObj;
    } else {
        this.dataObj = data;
    }
    return this;
};

// NodePrototype.prototype.interrupt = function () {
//     if (this.animList && this.animList.length > 0) {
//         for (var i = this.animList.length - 1; i >= 0; i--) {
//             queueInstance.remove(this.animList[i]);
//         }
//     }
//     this.animList = [];
//     return this;
// };

// NodePrototype.prototype.animateTo = function (targetConfig) {
//     // queueInstance.add(animeId(), animate(this, targetConfig), easing(targetConfig.ease));
//     return this;
// };

// NodePrototype.prototype.animateExe = function (targetConfig) {
//     return animate(this, targetConfig);
// };

function fetchEls(nodeSelector, dataArray) {
    var d;
    var coll = [];

    for (var i = 0; i < this.stack.length; i += 1) {
        d = this.stack[i];
        coll.push(d.fetchEls(nodeSelector, dataArray));
    }

    var collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function join(data, el, arg) {
    var d;
    var coll = [];

    for (var i = 0; i < this.stack.length; i += 1) {
        d = this.stack[i];
        coll.push(d.join(data, el, arg));
    }

    var collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function createEl(config) {
    var d;
    var coll = [];

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        var cRes = {};
        d = this.stack[i];

        if (typeof config === "function") {
            cRes = config.call(d, d.dataObj, i);
        } else {
            var keys = Object.keys(config);

            for (var j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                var key = keys[j];

                if (typeof config[key] !== "object") {
                    cRes[key] = config[key];
                } else {
                    cRes[key] = JSON.parse(JSON.stringify(config[key]));
                }
            }
        }

        coll.push(d.createEl(cRes));
    }

    var collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function createEls(data, config) {
    var d;
    var coll = [];
    var res = data;

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        var cRes = {};
        d = this.stack[i];

        if (typeof data === "function") {
            res = data.call(d, d.dataObj, i);
        }

        if (typeof config === "function") {
            cRes = config.call(d, d.dataObj, i);
        } else {
            var keys = Object.keys(config);

            for (var j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                var key = keys[j];
                cRes[key] = config[key];
            }
        }

        coll.push(d.createEls(res, cRes));
    }

    var collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function forEach(callBck) {
    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        callBck.call(this.stack[i], this.stack[i].dataObj, i);
    }

    return this;
}

function setAttribute(key, value) {
    var arguments$1 = arguments;

    var d;

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];

        if (arguments$1.length > 1) {
            if (typeof value === "function") {
                d.setAttr(key, value.call(d, d.dataObj, i));
            } else {
                d.setAttr(key, value);
            }
        } else if (typeof key === "function") {
            d.setAttr(key.call(d, d.dataObj, i));
        } else {
            var keys = Object.keys(key);

            for (var j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                var keykey = keys[j];

                if (typeof key[keykey] === "function") {
                    d.setAttr(keykey, key[keykey].call(d, d.dataObj, i));
                } else {
                    d.setAttr(keykey, key[keykey]);
                }
            }
        }
    }

    return this;
}

function setStyle(key, value) {
    var arguments$1 = arguments;

    var d;

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];

        if (arguments$1.length > 1) {
            if (typeof value === "function") {
                d.setStyle(key, value.call(d, d.dataObj, i));
            } else {
                d.setStyle(key, value);
            }
        } else {
            if (typeof key === "function") {
                d.setStyle(key.call(d, d.dataObj, i));
            } else {
                var keys = Object.keys(key);

                for (var j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                    var keykey = keys[j];

                    if (typeof key[keykey] === "function") {
                        d.setStyle(keykey, key[keykey].call(d, d.dataObj, i));
                    } else {
                        d.setStyle(keykey, key[keykey]);
                    }
                }
            }

            if (typeof key === "function") {
                d.setStyle(key.call(d, d.dataObj, i));
            } else {
                d.setStyle(key);
            }
        }
    }

    return this;
}

function translate(value) {
    var d;

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];

        if (typeof value === "function") {
            d.translate(value.call(d, d.dataObj, i));
        } else {
            d.translate(value);
        }
    }

    return this;
}

function rotate(value) {
    var d;

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];

        if (typeof value === "function") {
            d.rotate(value.call(d, d.dataObj, i));
        } else {
            d.rotate(value);
        }
    }

    return this;
}

function scale(value) {
    var d;

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];

        if (typeof value === "function") {
            d.scale(value.call(d, d.dataObj, i));
        } else {
            d.scale(value);
        }
    }

    return this;
}

function exec(value) {
    var d;

    if (typeof value !== "function") {
        return;
    }

    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];
        value.call(d, d.dataObj, i);
    }

    return this;
}

// function on(eventType, hndlr) {
//     for (let i = 0, len = this.stack.length; i < len; i += 1) {
//         this.stack[i].on(eventType, hndlr);
//     }

//     return this;
// }

function remove() {
    for (var i = 0, len = this.stack.length; i < len; i += 1) {
        this.stack[i].remove();
    }

    return this;
}

// function interrupt() {
//     for (let i = 0, len = this.stack.length; i < len; i += 1) {
//         this.stack[i].interrupt();
//     }

//     return this;
// }

// function resolveObject(config, node, i) {
//     const obj = {};
//     let key;

//     for (key in config) {
//         if (key !== "end") {
//             if (typeof config[key] === "function") {
//                 obj[key] = config[key].call(node, node.dataObj, i);
//             } else {
//                 obj[key] = config[key];
//             }
//         }
//     }

//     return obj;
// }

var textArray = function textArray(value) {
    var node;

    if (typeof value !== "function") {
        for (var i = 0; i < this.stack.length; i += 1) {
            node = this.stack[i];
            node.text(value);
        }
    } else {
        for (var i$1 = 0; i$1 < this.stack.length; i$1 += 1) {
            node = this.stack[i$1];
            node.text(value.call(node, node.dataObj, i$1));
        }
    }

    return this;
};

// CreateElements as CollectionPrototype

function CollectionPrototype(contextInfo, data, config, vDomIndex) {
    var this$1$1 = this;

    if (!data) {
        data = [];
    }

    var transform;
    var key;
    var attrKeys = config ? (config.attr ? Object.keys(config.attr) : []) : [];
    var styleKeys = config ? (config.style ? Object.keys(config.style) : []) : [];
    var bbox = config ? (config.bbox !== undefined ? config.bbox : true) : true;
    this.stack = data.map(function (d, i) {
        var assign;

        var node = this$1$1.createNode(
            contextInfo.ctx,
            {
                el: config.el,
                bbox: bbox,
            },
            vDomIndex
        );

        for (var j = 0, len = styleKeys.length; j < len; j += 1) {
            key = styleKeys[j];

            if (typeof config.style[key] === "function") {
                var resValue = config.style[key].call(node, d, i);
                node.setStyle(key, resValue);
            } else {
                node.setStyle(key, config.style[key]);
            }
        }

        for (var j$1 = 0, len$1 = attrKeys.length; j$1 < len$1; j$1 += 1) {
            key = attrKeys[j$1];

            if (key !== "transform") {
                if (typeof config.attr[key] === "function") {
                    var resValue$1 = config.attr[key].call(node, d, i);
                    node.setAttr(key, resValue$1);
                } else {
                    node.setAttr(key, config.attr[key]);
                }
            } else {
                if (typeof config.attr.transform === "function") {
                    transform = config.attr[key].call(node, d, i);
                } else {
                    ((assign = config.attr, transform = assign.transform));
                }

                for (var trns in transform) {
                    node[trns](transform[trns]);
                }
            }
        }

        node.dataObj = d;
        return node;
    });
    return this;
}

CollectionPrototype.prototype = {
    createEls: createEls,
    createEl: createEl,
    forEach: forEach,
    setAttr: setAttribute,
    fetchEls: fetchEls,
    setStyle: setStyle,
    translate: translate,
    rotate: rotate,
    scale: scale,
    exec: exec,
    remove: remove,
    text: textArray,
    join: join,
};

CollectionPrototype.prototype.createNode = function () {};

CollectionPrototype.prototype.wrapper = function wrapper(nodes) {
    var self = this;

    if (nodes) {
        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];
            self.stack.push(node);
        }
    }

    return this;
};

var ref = require('canvas');
var createCanvas = ref.createCanvas;
var Image = ref.Image;
require("canvas-5-polyfill");
var t2DGeometry = geometry;
var Id = 0;

function domId() {
    Id += 1;
    return Id;
}

var CanvasCollection = function () {
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
    var self = this;

    if (attr.transform) {
        var transform = attr.transform;
        var scale = transform.scale; if ( scale === void 0 ) scale = [1, 1];
        var skew = transform.skew; if ( skew === void 0 ) skew = [0, 0];
        var translate = transform.translate; if ( translate === void 0 ) translate = [0, 0];
        var hozScale = scale[0]; if ( hozScale === void 0 ) hozScale = 1;
        var verScale = scale[1]; if ( verScale === void 0 ) verScale = hozScale;
        var hozSkew = skew[0]; if ( hozSkew === void 0 ) hozSkew = 0;
        var verSkew = skew[1]; if ( verSkew === void 0 ) verSkew = hozSkew;
        var hozMove = translate[0]; if ( hozMove === void 0 ) hozMove = 0;
        var verMove = translate[1]; if ( verMove === void 0 ) verMove = hozMove;

        self.ctx.transform(hozScale, hozSkew, verSkew, verScale, hozMove, verMove);

        if (transform.rotate && transform.rotate.length > 0) {
            self.ctx.translate(transform.rotate[1] || 0, transform.rotate[2] || 0);
            self.ctx.rotate(transform.rotate[0] * (Math.PI / 180));
            self.ctx.translate(-transform.rotate[1] || 0, -transform.rotate[2] || 0);
        }
    }

    for (var i = 0; i < self.stack.length; i += 1) {
        self.stack[i].execute();
    }
}

function parseTransform(transform) {
    var output = {
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
    var self = this;
    var ref = self.attr;
    var transform = ref.transform;
    var points = ref.points; if ( points === void 0 ) points = [];
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

    if (points && points.length > 0) {
        var minX = points[0].x;
        var maxX = points[0].x;
        var minY = points[0].y;
        var maxY = points[0].y;

        for (var i = 1; i < points.length; i += 1) {
            if (minX > points[i].x) { minX = points[i].x; }
            if (maxX < points[i].x) { maxX = points[i].x; }
            if (minY > points[i].y) { minY = points[i].y; }
            if (maxY < points[i].y) { maxY = points[i].y; }
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
    var lGradient = ctx.createLinearGradient(
        BBox.x + BBox.width * (this.config.x1 / 100),
        BBox.y + BBox.height * (this.config.y1 / 100),
        BBox.x + BBox.width * (this.config.x2 / 100),
        BBox.y + BBox.height * (this.config.y2 / 100)
    );
    this.config.colorStops.forEach(function (d) {
        lGradient.addColorStop(d.value / 100, d.color);
    });
    return lGradient;
};

CanvasGradients.prototype.absoluteLinearGradient = function absoluteGralinearGradient(ctx) {
    var lGradient = ctx.createLinearGradient(
        this.config.x1,
        this.config.y1,
        this.config.x2,
        this.config.y2
    );
    this.config.colorStops.forEach(function (d) {
        lGradient.addColorStop(d.value, d.color);
    });
    return lGradient;
};

CanvasGradients.prototype.radialGradient = function GRAradialGradient(ctx, BBox) {
    var cGradient = ctx.createRadialGradient(
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
    this.config.colorStops.forEach(function (d) {
        cGradient.addColorStop(d.value / 100, d.color);
    });
    return cGradient;
};

CanvasGradients.prototype.absoluteRadialGradient = function absoluteGraradialGradient(ctx, BBox) {
    var cGradient = ctx.createRadialGradient(
        this.config.innerCircle.x,
        this.config.innerCircle.y,
        this.config.innerCircle.r,
        this.config.outerCircle.x,
        this.config.outerCircle.y,
        this.config.outerCircle.r
    );
    this.config.colorStops.forEach(function (d) {
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
    var pixels = this.imageData ? this.imageData.pixels : [];
    var rIndex = (pos.y - 1) * (this.width * 4) + (pos.x - 1) * 4;
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
    var rIndex = (pos.y - 1) * (this.width * 4) + (pos.x - 1) * 4;
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

function CanvasMask(self, config) {
    if ( config === void 0 ) config = {};

    var maskId = config.id ? config.id : "mask-" + Math.ceil(Math.random() * 1000);
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

function CanvasClipping(self, config) {
    if ( config === void 0 ) config = {};

    var clipId = config.id ? config.id : "clip-" + Math.ceil(Math.random() * 1000);
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

function CanvasPattern(self, config, width, height) {
    if ( config === void 0 ) config = {};
    if ( width === void 0 ) width = 0;
    if ( height === void 0 ) height = 0;

    var selfSelf = this;
    var patternId = config.id ? config.id : "pattern-" + Math.ceil(Math.random() * 1000);
    this.repeatInd = config.repeat ? config.repeat : "repeat";
    
    selfSelf.pattern = canvasLayer$1({}, height, width);

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

function createCanvasPattern(patternConfig, width, height) {
    if ( width === void 0 ) width = 0;
    if ( height === void 0 ) height = 0;

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
    applyStyles: applyStyles,
};

function imageInstance(self) {
    var imageIns = new Image();
    imageIns.crossOrigin = "anonymous";
    imageIns.dataMode = Image.MODE_MIME | Image.MODE_IMAGE;
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
    var self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "Image";
    self.nodeExe = nodeExe;
    nodeExe.dom = this;

    for (var key in props) {
        this.setAttr(key, props[key]);
    }

    self.stack = [self];
}

RenderImage.prototype = new CanvasDom();
RenderImage.prototype.constructor = RenderImage;

RenderImage.prototype.setAttr = function RIsetAttr(attr, value) {
    var self = this;

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
    var self = this;
    var ref = self.attr;
    var transform = ref.transform;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

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
    var ref = this.attr;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;

    if (this.imageObj) {
        this.ctx.drawImage(this.imageObj, x, y, width, height);
    }
};

RenderImage.prototype.applyStyles = function RIapplyStyles() {};

RenderImage.prototype.in = function RIinfun(co) {
    var ref = this.attr;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;
    return co.x >= x && co.x <= x + width && co.y >= y && co.y <= y + height;
};

function RenderText(ctx, props, stylesProps) {
    var self = this;
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
        var width = this.attr.width;
        var textListByLine = this.attr.text.split("\n");
        var textSubStrs = [];
        var strLit = "";
        var i = 0;
        var textList = textListByLine.reduce(function (p, c) {
            p = p.concat(c.split(" "));
            p.push("\n");
            return p;
        }, []);
        while(i < textList.length) {
            if (i !== 0) {
                strLit += " ";
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
};

RenderText.prototype.text = function RTtext(value) {
    this.attr.text = value;
    if (this.attr.width) {
        this.fitWidth();
    }
};

RenderText.prototype.updateBBox = function RTupdateBBox() {
    var self = this;
    var height = 1;
    var width = 0;
    var ref = self.attr;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;
    var transform = ref.transform;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

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
    var ref = this;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    return co.x >= x && co.x <= x + width && co.y >= y && co.y <= y + height;
};
/** ***************** Render Circle */

var RenderCircle = function RenderCircle(ctx, props, stylesProps) {
    var self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "circle";
    self.stack = [self];
};

RenderCircle.prototype = new CanvasDom();
RenderCircle.prototype.constructor = RenderCircle;

RenderCircle.prototype.updateBBox = function RCupdateBBox() {
    var self = this;
    var ref = self.attr;
    var transform = ref.transform;
    var r = ref.r; if ( r === void 0 ) r = 0;
    var cx = ref.cx; if ( cx === void 0 ) cx = 0;
    var cy = ref.cy; if ( cy === void 0 ) cy = 0;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

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
    var ref = this.attr;
    var r = ref.r; if ( r === void 0 ) r = 0;
    var cx = ref.cx; if ( cx === void 0 ) cx = 0;
    var cy = ref.cy; if ( cy === void 0 ) cy = 0;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
    this.applyStyles();
    this.ctx.closePath();
};

RenderCircle.prototype.in = function RCinfun(co, eventType) {
    var ref = this.attr;
    var r = ref.r; if ( r === void 0 ) r = 0;
    var cx = ref.cx; if ( cx === void 0 ) cx = 0;
    var cy = ref.cy; if ( cy === void 0 ) cy = 0;
    var tr = Math.sqrt((co.x - cx) * (co.x - cx) + (co.y - cy) * (co.y - cy));
    return tr <= r;
};

var RenderLine = function RenderLine(ctx, props, stylesProps) {
    var self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "line";
    self.stack = [self];
};

RenderLine.prototype = new CanvasDom();
RenderLine.prototype.constructor = RenderLine;

RenderLine.prototype.updateBBox = function RLupdateBBox() {
    var self = this;
    var ref = self.attr;
    var transform = ref.transform;
    var x1 = ref.x1; if ( x1 === void 0 ) x1 = 0;
    var y1 = ref.y1; if ( y1 === void 0 ) y1 = 0;
    var x2 = ref.x2; if ( x2 === void 0 ) x2 = 0;
    var y2 = ref.y2; if ( y2 === void 0 ) y2 = 0;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

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
    var ref = this;
    var ctx = ref.ctx;
    var ref$1 = this.attr;
    var x1 = ref$1.x1; if ( x1 === void 0 ) x1 = 0;
    var y1 = ref$1.y1; if ( y1 === void 0 ) y1 = 0;
    var x2 = ref$1.x2; if ( x2 === void 0 ) x2 = 0;
    var y2 = ref$1.y2; if ( y2 === void 0 ) y2 = 0;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    this.applyStyles();
    ctx.closePath();
};

RenderLine.prototype.in = function RLinfun(co) {
    var ref = this.attr;
    var x1 = ref.x1; if ( x1 === void 0 ) x1 = 0;
    var y1 = ref.y1; if ( y1 === void 0 ) y1 = 0;
    var x2 = ref.x2; if ( x2 === void 0 ) x2 = 0;
    var y2 = ref.y2; if ( y2 === void 0 ) y2 = 0;
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
    var self = this;
    self.ctx = ctx;
    self.attr = props;
    self.style = stylesProps;
    self.nodeName = "polyline";
    self.stack = [self];
}

RenderPolyline.prototype = new CanvasDom();
RenderPolyline.constructor = RenderPolyline;

RenderPolyline.prototype.execute = function polylineExe() {
    var self = this;
    var d;
    if (!this.attr.points || this.attr.points.length === 0) { return; }
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
    var flag = false;

    for (var i = 0, len = this.attr.points.length; i <= len - 2; i++) {
        var p1 = this.attr.points[i];
        var p2 = this.attr.points[i + 1];
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

var RenderPath = function RenderPath(ctx, props, styleProps) {
    var self = this;
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
    var self = this;
    var ref = self.attr;
    var transform = ref.transform;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

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
    var flag = false;

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
    var polygon = new Path2D();
    polygon.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        polygon.lineTo(points[i].x, points[i].y);
    }
    polygon.closePath();

    return {
        path: polygon,
        points: points,
        execute: function (ctx) {
            ctx.beginPath();
            var points = this.points;
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
        },
    };
}

var RenderPolygon = function RenderPolygon(ctx, props, styleProps) {
    var self = this;
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
    var flag = false;

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

var RenderEllipse = function RenderEllipse(ctx, props, styleProps) {
    var self = this;
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
    var self = this;
    var ref = self.attr;
    var transform = ref.transform;
    var cx = ref.cx; if ( cx === void 0 ) cx = 0;
    var cy = ref.cy; if ( cy === void 0 ) cy = 0;
    var rx = ref.rx; if ( rx === void 0 ) rx = 0;
    var ry = ref.ry; if ( ry === void 0 ) ry = 0;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

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
    var ctx = this.ctx;
    var ref = this.attr;
    var cx = ref.cx; if ( cx === void 0 ) cx = 0;
    var cy = ref.cy; if ( cy === void 0 ) cy = 0;
    var rx = ref.rx; if ( rx === void 0 ) rx = 0;
    var ry = ref.ry; if ( ry === void 0 ) ry = 0;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    this.applyStyles();
    ctx.closePath();
};

RenderEllipse.prototype.in = function REinfun(co) {
    var ref = this.attr;
    var cx = ref.cx; if ( cx === void 0 ) cx = 0;
    var cy = ref.cy; if ( cy === void 0 ) cy = 0;
    var rx = ref.rx; if ( rx === void 0 ) rx = 0;
    var ry = ref.ry; if ( ry === void 0 ) ry = 0;
    return ((co.x - cx) * (co.x - cx)) / (rx * rx) + ((co.y - cy) * (co.y - cy)) / (ry * ry) <= 1;
};
/** ***************** Render ellipse */

/** ***************** Render Rect */

var RenderRect = function RenderRect(ctx, props, styleProps) {
    var self = this;
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
    var self = this;
    var ref = self.attr;
    var transform = ref.transform;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;

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
    var x = attr.x; if ( x === void 0 ) x = 0;
    var y = attr.y; if ( y === void 0 ) y = 0;
    var width = attr.width; if ( width === void 0 ) width = 0;
    var height = attr.height; if ( height === void 0 ) height = 0;
    var rx = attr.rx; if ( rx === void 0 ) rx = 0;
    var ry = attr.ry; if ( ry === void 0 ) ry = 0;

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
    var ctx = this.ctx;
    var ref = this.attr;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    var rx = ref.rx; if ( rx === void 0 ) rx = 0;
    var ry = ref.ry; if ( ry === void 0 ) ry = 0;

    if (ctx.fillStyle !== "#000000" || ctx.strokeStyle !== "#000000") {
        if (ctx.fillStyle !== "#000000") {
            if (!rx && !ry) {
                ctx.fillRect(x, y, width, height);
            } else {
                renderRoundRect(ctx, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    rx: rx,
                    ry: ry,
                });
                ctx.fill();
            }
        }

        if (ctx.strokeStyle !== "#000000") {
            if (!rx && !ry) {
                ctx.strokeRect(x, y, width, height);
            } else {
                renderRoundRect(ctx, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    rx: rx,
                    ry: ry,
                });
                ctx.stroke();
            }
        }
    } else {
        ctx.rect(x, y, width, height);
    }
};

RenderRect.prototype.in = function RRinfun(co) {
    var ref = this.attr;
    var x = ref.x; if ( x === void 0 ) x = 0;
    var y = ref.y; if ( y === void 0 ) y = 0;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    return co.x >= x && co.x <= x + width && co.y >= y && co.y <= y + height;
};
/** ***************** Render Rect */

/** ***************** Render Group */

var RenderGroup = function RenderGroup(ctx, props, styleProps) {
    var self = this;
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
    var self = this;
    var minX;
    var maxX;
    var minY;
    var maxY;
    var ref = self.attr;
    var transform = ref.transform;
    var ref$1 = parseTransform(transform);
    var translateX = ref$1.translateX;
    var translateY = ref$1.translateY;
    var scaleX = ref$1.scaleX;
    var scaleY = ref$1.scaleY;
    self.BBox = {};

    if (children && children.length > 0) {
        var d;
        var boxX;
        var boxY;

        for (var i = 0; i < children.length; i += 1) {
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
    var self = this;
    var objLocal = obj;

    if (objLocal instanceof CanvasNodeExe) {
        objLocal.dom.parent = self;
        self.stack[self.stack.length] = objLocal;
    } else if (objLocal instanceof CanvasCollection) {
        objLocal.stack.forEach(function (d) {
            d.dom.parent = self;
            self.stack[self.stack.length] = d;
        });
    } else {
        console.log("wrong Object");
    }
};

RenderGroup.prototype.in = function RGinfun(coOr) {
    var self = this;
    var co = {
        x: coOr.x,
        y: coOr.y,
    };
    var ref = this;
    var BBox = ref.BBox;
    var ref$1 = self.attr;
    var transform = ref$1.transform;
    var ref$2 = parseTransform(transform);
    var translateX = ref$2.translateX;
    var translateY = ref$2.translateY;
    var scaleX = ref$2.scaleX;
    var scaleY = ref$2.scaleY;

    return (
        co.x >= (BBox.x - translateX) / scaleX &&
        co.x <= (BBox.x - translateX + BBox.width) / scaleX &&
        co.y >= (BBox.y - translateY) / scaleY &&
        co.y <= (BBox.y - translateY + BBox.height) / scaleY
    );
};

/** ***************** End Render Group */

var CanvasNodeExe = function CanvasNodeExe(context, config, id, vDomIndex) {
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
    var value;
    var key;
    var style = this.style;

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
    var ref = this.dom.parent;
    var children = ref.children;
    var index = children.indexOf(this);

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
        var styleKeys = Object.keys(attr);

        for (var i = 0, len = styleKeys.length; i < len; i += 1) {
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
    if (colorMap$1.RGBAInstanceCheck(value)) {
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
        var keys = Object.keys(attr);

        for (var i = 0; i < keys.length; i += 1) {
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
        for (var i = 0, len = this.children.length; i < len; i += 1) {
            this.children[i].execute(disableRestore);
        }
    }
    if (!disableRestore) {
        this.ctx.restore();
    }
};

CanvasNodeExe.prototype.prependChild = function child(childrens) {
    var self = this;
    var childrensLocal = childrens;

    if (self.dom instanceof RenderGroup) {
        for (var i = 0; i < childrensLocal.length; i += 1) {
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
    var self = this;
    var childrensLocal = childrens;

    if (self.dom instanceof RenderGroup) {
        for (var i = 0; i < childrensLocal.length; i += 1) {
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
    var status;

    if (this.bbox) {
        for (var i = 0, len = this.children.length; i < len; i += 1) {
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
    var e = new CanvasCollection(
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
    var e = new CanvasNodeExe(this.dom.ctx, config, domId(), this.vDomIndex);
    this.child([e]);
    return e;
};

CanvasNodeExe.prototype.removeChild = function CremoveChild(obj) {
    var index = -1;
    this.children.forEach(function (d, i) {
        if (d === obj) {
            index = i;
        }
    });

    if (index !== -1) {
        var removedNode = this.children.splice(index, 1)[0];
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
    var imageData = this.ctx.getImageData(
        this.dom.BBox.x,
        this.dom.BBox.y,
        this.dom.BBox.width,
        this.dom.BBox.height
    );
    var pixelInstance = new PixelObject(imageData, this.dom.BBox.width, this.dom.BBox.height);

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
    var imageIns = new Image();
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
    var ctxX = self.ctx;
    var ref = self.attr;
    var clip = ref.clip;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    var sx = clip.sx; if ( sx === void 0 ) sx = 0;
    var sy = clip.sy; if ( sy === void 0 ) sy = 0;
    var swidth = clip.swidth; if ( swidth === void 0 ) swidth = width;
    var sheight = clip.sheight; if ( sheight === void 0 ) sheight = height;

    ctxX.clearRect(0, 0, width, height);
    ctxX.drawImage(self.imageObj, sx, sy, swidth, sheight, 0, 0, width, height);
}

function filterExec(self) {
    var ctxX = self.ctx;
    var ref = self.attr;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;

    var pixels = ctxX.getImageData(0, 0, width, height);
    ctxX.putImageData(self.attr.filter(pixels), 0, 0);
}

function RenderTexture(nodeExe, config) {
    if ( config === void 0 ) config = {};

    var self = this;
    self.attr = Object.assign({}, config.attr) || {};
    self.style = Object.assign({}, config.style) || {};
    var scale = self.attr.scale || 1;
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

    for (var key in self.attr) {
        if (key !== "height" && key !== "width")
            { self.setAttr(key, self.attr[key]); }
    }
}
RenderTexture.prototype = new NodePrototype();
RenderTexture.prototype.constructor = RenderTexture;

RenderTexture.prototype.setSize = function (w, h) {
    var scale = this.attr.scale || 1;
    this.rImageObj = createCanvas(w * scale, h * scale);
    postProcess(this);
};

RenderTexture.prototype.setAttr = function RSsetAttr(attr, value) {
    var self = this;

    if (attr === "src") {
        if (Array.isArray(value)) {
            var srcPromises = value.map(function (d) {
                return new Promise(function (resolve, reject) {
                    var imageInstance = textureImageInstance(null, d);
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
    var attr = Object.assign({}, this.attr);
    var style = Object.assign({}, this.style);
    attr.src = this;
    return new RenderTexture(this.nodeExe, {
        attr: attr,
        style: style,
    });
};

RenderTexture.prototype.execute = function RIexecute() {
    var ref = this.attr;
    var width = ref.width; if ( width === void 0 ) width = 0;
    var height = ref.height; if ( height === void 0 ) height = 0;
    var draw = this.attr.draw || {};
    var scale = this.attr.scale || 1;

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
        var onChangeExe;
        var root = new CanvasNodeExe(
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
        var execute = root.execute.bind(root);
        var onClear = function (ctx, width, height) {
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

        root.setSize = function (width_, height_) {
            this.domEl = createCanvas(width_, height_, "pdf");
            ctx = this.domEl.getContext("2d", config);
            ctx.type_ = "pdf";
            this.width = width_;
            this.height = height_;
            this.ctx = ctx;
            this.execute();
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
            var imageData = this.ctx.getImageData(x, y, width_, height_);
            var pixelInstance = new PixelObject(imageData, width_, height_);

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

        root.export = function (metaData) {
            if ( metaData === void 0 ) metaData = {
            };


            return this.domEl.toBuffer(metaData.mimeType || 'image/png', metaData);
        };

        root.createPattern = createCanvasPattern;

        root.createClip = createCanvasClip;

        root.createMask = createCanvasMask;

        return root;
    }

function pdfLayer(config, height, width) {
    if ( height === void 0 ) height = 0;
    if ( width === void 0 ) width = 0;

    var layer = createCanvas(width, height, "pdf");
    var ctx = layer.getContext("2d", config);
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
    };
    PDFCreator.prototype.execute = function () {
        var self = this;
        this.pages.forEach(function (page, i) {
            self.ctx.save();
            if (i !== 0) {
                page.addPage();
            }
            page.execute();
            self.ctx.restore();
        });
    };
    PDFCreator.prototype.addPage = function () {
        var newpage = createPage(ctx);
        newpage.domEl = layer;
        newpage.height = height;
        newpage.width = width;
        newpage.type = "CANVAS";
        newpage.EXEType = "pdf";
        newpage.ctx = ctx;

        ctx.textDrawingMode = "glyph";
        this.pages.push(newpage);
        return newpage;
    };
    PDFCreator.prototype.removePage = function (page) {
        var pageIndex = this.pages.indexOf(page);
        if (pageIndex !== -1) {
            this.pages.splice(pageIndex, 1);
        }
    };
    PDFCreator.prototype.exportPdf = function (metaData) {
        if ( metaData === void 0 ) metaData = {
          title: 'I2DJs Pdf',
          keywords: 'I2Djs pdf generator demo, canvas',
          creationDate: new Date()
        };


        return this.domEl.toBuffer('application/pdf', metaData);
    };
    PDFCreator.prototype.exec = function (exe) {
        exe.call(this, this.dataObj);
    };
    PDFCreator.prototype.data = function (data) {
        if (!data) {
            return this.dataObj;
        } else {
            this.dataObj = data;
        }
        return this;
    };

    return new PDFCreator(ctx);
}

function canvasLayer$1(config, height, width) {
    if ( height === void 0 ) height = 0;
    if ( width === void 0 ) width = 0;
    var layer = createCanvas(width, height);
    var ctx = layer.getContext("2d", config);
    var root = createPage(ctx);
        root.domEl = layer;
        root.height = height;
        root.width = width;
        root.type = "CANVAS";
        root.ctx = ctx;
        ctx.quality = "best";

    return root;
}

var canvasAPI = {
    canvasLayer: canvasLayer$1,
    pdfLayer: pdfLayer
};

var pathIns = path.instance;
var canvasLayer = canvasAPI.canvasLayer;
var canvasPdfLayer = canvasAPI.pdfLayer;

exports.Path = pathIns;
exports.canvasLayer = canvasLayer;
exports.canvasPdfLayer = canvasPdfLayer;
exports.color = colorMap$1;
exports.geometry = geometry;
