/* eslint-disable no-undef */
import geometry from "./geometry.js";
import colorMap from "./colorMap.js";

let animeIdentifier = 0;
const t2DGeometry = geometry;
function animeId() {
    animeIdentifier += 1;
    return animeIdentifier;
}

const transitionSetAttr = function transitionSetAttr(self, key, value) {
    return function inner(f) {
        self.setAttr(key, value.call(self, f));
    };
};

const transformTransition = function transformTransition(self, subkey, value) {
    const exe = [];
    const trans = self.attr.transform;

    if (typeof value === "function") {
        return function inner(f) {
            self[subkey](value.call(self, f));
        };
    }

    value.forEach((tV, i) => {
        let val;

        if (trans[subkey]) {
            if (trans[subkey][i] !== undefined) {
                val = trans[subkey][i];
            } else {
                val = subkey === "scale" ? 1 : 0;
            }
        } else {
            val = subkey === "scale" ? 1 : 0;
        }

        exe.push(t2DGeometry.intermediateValue.bind(null, val, tV));
    });
    return function inner(f) {
        self[subkey](exe.map((d) => d(f)));
    };
};

const attrTransition = function attrTransition(self, key, value) {
    const srcVal = self.attr[key];

    return function setAttr_(f) {
        self.setAttr(key, t2DGeometry.intermediateValue(srcVal, value, f));
    };
};

const styleTransition = function styleTransition(self, key, value) {
    let srcValue;
    let destUnit;
    let destValue;

    if (typeof value === "function") {
        return function inner(f) {
            self.setStyle(key, value.call(self, self.dataObj, f));
        };
    } else {
        srcValue = self.style[key];

        if (isNaN(value)) {
            if (colorMap.isTypeColor(value)) {
                const colorExe = colorMap.transition(srcValue, value);
                return function inner(f) {
                    self.setStyle(key, colorExe(f));
                };
            }

            srcValue = srcValue.match(/(\d+)/g);
            destValue = value.match(/(\d+)/g);
            destUnit = value.match(/\D+$/);
            srcValue = parseInt(srcValue.length > 0 ? srcValue[0] : 0, 10);
            destValue = parseInt(destValue.length > 0 ? destValue[0] : 0, 10);
            destUnit = destUnit.length > 0 ? destUnit[0] : "px";
        } else {
            srcValue = self.style[key] !== undefined ? self.style[key] : 1;
            destValue = value;
            destUnit = 0;
        }

        return function inner(f) {
            self.setStyle(key, t2DGeometry.intermediateValue(srcValue, destValue, f) + destUnit);
        };
    }
};

function performJoin(data, nodes, cond) {
    const dataIds = data.map(cond);
    const res = {
        new: [],
        update: [],
        old: [],
    };

    for (let i = 0; i < nodes.length; i += 1) {
        const index = dataIds.indexOf(cond(nodes[i].dataObj, i));

        if (index !== -1) {
            nodes[i].dataObj = data[index];
            res.update.push(nodes[i]);
            dataIds[index] = null;
        } else {
            // nodes[i].dataObj = data[index]
            res.old.push(nodes[i]);
        }
    }

    res.new = data.filter((d, i) => {
        const index = dataIds.indexOf(cond(d, i));

        if (index !== -1) {
            dataIds[index] = null;
            return true;
        }

        return false;
    });
    return res;
}

const CompositeArray = {};
CompositeArray.push = {
    value: function (data) {
        if (Object.prototype.toString.call(data) !== "[object Array]") {
            data = [data];
        }

        for (let i = 0, len = data.length; i < len; i++) {
            this.data.push(data[i]);
        }

        if (this.config.action.enter) {
            const nodes = {};
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
        const self = this;
        const elData = this.data.pop();

        if (this.config.action.exit) {
            const nodes = {};
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

        const self = this;

        for (let i = 0, len = data.length; i < len; i++) {
            if (this.data.indexOf(data[i]) !== -1) {
                this.data.splice(this.data.indexOf(data[i]), 1);
            }
        }

        if (this.config.action.exit) {
            const nodes = {};
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
        const self = this;

        if (this.config.action.update) {
            const nodes = {};
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
    const nodes = [];
    const wrap = new CollectionPrototype();

    if (this.children.length > 0) {
        if (nodeSelector.charAt(0) === ".") {
            const classToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.forEach((d) => {
                if (!d) {
                    return;
                }
                const check1 =
                    dataArray &&
                    d.dataObj &&
                    dataArray.indexOf(d.dataObj) !== -1 &&
                    d.attr.class === classToken;
                const check2 = !dataArray && d.attr.class === classToken;

                if (check1 || check2) {
                    nodes.push(d);
                }
            });
        } else if (nodeSelector.charAt(0) === "#") {
            const idToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.every((d) => {
                if (!d) {
                    return;
                }
                const check1 =
                    dataArray &&
                    d.dataObj &&
                    dataArray.indexOf(d.dataObj) !== -1 &&
                    d.attr.id === idToken;
                const check2 = !dataArray && d.attr.id === idToken;

                if (check1 || check2) {
                    nodes.push(d);
                    return false;
                }

                return true;
            });
        } else {
            nodeSelector = nodeSelector === "group" ? "g" : nodeSelector;
            this.children.forEach((d) => {
                if (!d) {
                    return;
                }
                const check1 =
                    dataArray &&
                    d.dataObj &&
                    dataArray.indexOf(d.dataObj) !== -1 &&
                    d.nodeName === nodeSelector;
                const check2 = !dataArray && d.nodeName === nodeSelector;

                if (check1 || check2) {
                    nodes.push(d);
                }
            });
        }
    }

    return wrap.wrapper(nodes);
};

NodePrototype.prototype.fetchEl = function (nodeSelector, data) {
    let nodes;

    if (this.children.length > 0) {
        if (nodeSelector.charAt(0) === ".") {
            const classToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.every((d) => {
                if (!d) {
                    return;
                }
                const check1 =
                    data && d.dataObj && data === d.dataObj && d.attr.class === classToken;
                const check2 = !data && d.attr.class === classToken;

                if (check1 || check2) {
                    nodes = d;
                    return false;
                }

                return true;
            });
        } else if (nodeSelector.charAt(0) === "#") {
            const idToken = nodeSelector.substring(1, nodeSelector.length);
            this.children.every((d) => {
                if (!d) {
                    return;
                }
                const check1 = data && d.dataObj && data === d.dataObj && d.attr.id === idToken;
                const check2 = !data && d.attr.id === idToken;

                if (check1 || check2) {
                    nodes = d;
                    return false;
                }

                return true;
            });
        } else {
            nodeSelector = nodeSelector === "group" ? "g" : nodeSelector;
            this.children.forEach((d) => {
                if (!d) {
                    return;
                }
                const check1 =
                    data && d.dataObj && data === d.dataObj && d.nodeName === nodeSelector;
                const check2 = !data && d.nodeName === nodeSelector;

                if (check1 || check2) {
                    nodes = d;
                }
            });
        }
    }

    return nodes;
};

function dataJoin(data, selector, config) {
    const self = this;
    const selectors = selector.split(",");
    let { joinOn } = config;
    const joinResult = {
        new: {},
        update: {},
        old: {},
    };

    if (!joinOn) {
        joinOn = function (d, i) {
            return i;
        };
    }

    for (let i = 0, len = selectors.length; i < len; i++) {
        const d = selectors[i];
        const nodes = self.fetchEls(d);
        const join = performJoin(data, nodes.stack, joinOn);
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
    let d;
    const coll = [];

    for (let i = 0; i < this.stack.length; i += 1) {
        d = this.stack[i];
        coll.push(d.fetchEls(nodeSelector, dataArray));
    }

    const collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function join(data, el, arg) {
    let d;
    const coll = [];

    for (let i = 0; i < this.stack.length; i += 1) {
        d = this.stack[i];
        coll.push(d.join(data, el, arg));
    }

    const collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function createEl(config) {
    let d;
    const coll = [];

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        let cRes = {};
        d = this.stack[i];

        if (typeof config === "function") {
            cRes = config.call(d, d.dataObj, i);
        } else {
            const keys = Object.keys(config);

            for (let j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                const key = keys[j];

                if (typeof config[key] !== "object") {
                    cRes[key] = config[key];
                } else {
                    cRes[key] = JSON.parse(JSON.stringify(config[key]));
                }
            }
        }

        coll.push(d.createEl(cRes));
    }

    const collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function createEls(data, config) {
    let d;
    const coll = [];
    let res = data;

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        let cRes = {};
        d = this.stack[i];

        if (typeof data === "function") {
            res = data.call(d, d.dataObj, i);
        }

        if (typeof config === "function") {
            cRes = config.call(d, d.dataObj, i);
        } else {
            const keys = Object.keys(config);

            for (let j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                const key = keys[j];
                cRes[key] = config[key];
            }
        }

        coll.push(d.createEls(res, cRes));
    }

    const collection = new CollectionPrototype();
    collection.wrapper(coll);
    return collection;
}

function forEach(callBck) {
    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        callBck.call(this.stack[i], this.stack[i].dataObj, i);
    }

    return this;
}

function setAttribute(key, value) {
    let d;

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];

        if (arguments.length > 1) {
            if (typeof value === "function") {
                d.setAttr(key, value.call(d, d.dataObj, i));
            } else {
                d.setAttr(key, value);
            }
        } else if (typeof key === "function") {
            d.setAttr(key.call(d, d.dataObj, i));
        } else {
            const keys = Object.keys(key);

            for (let j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                const keykey = keys[j];

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
    let d;

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];

        if (arguments.length > 1) {
            if (typeof value === "function") {
                d.setStyle(key, value.call(d, d.dataObj, i));
            } else {
                d.setStyle(key, value);
            }
        } else {
            if (typeof key === "function") {
                d.setStyle(key.call(d, d.dataObj, i));
            } else {
                const keys = Object.keys(key);

                for (let j = 0, lenJ = keys.length; j < lenJ; j += 1) {
                    const keykey = keys[j];

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
    let d;

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
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
    let d;

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
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
    let d;

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
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
    let d;

    if (typeof value !== "function") {
        return;
    }

    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        d = this.stack[i];
        value.call(d, d.dataObj, i);
    }

    return this;
}

function on(eventType, hndlr) {
    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        this.stack[i].on(eventType, hndlr);
    }

    return this;
} // function in (coOr) {
//   for (let i = 0, len = this.stack.length; i < len; i += 1) {
//     this.stack[i].in(coOr)
//   }
//   return this
// }

function remove() {
    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        this.stack[i].remove();
    }

    return this;
}

function interrupt() {
    for (let i = 0, len = this.stack.length; i < len; i += 1) {
        this.stack[i].interrupt();
    }

    return this;
}

function resolveObject(config, node, i) {
    const obj = {};
    let key;

    for (key in config) {
        if (key !== "end") {
            if (typeof config[key] === "function") {
                obj[key] = config[key].call(node, node.dataObj, i);
            } else {
                obj[key] = config[key];
            }
        }
    }

    return obj;
}

const textArray = function textArray(value) {
    let node;

    if (typeof value !== "function") {
        for (let i = 0; i < this.stack.length; i += 1) {
            node = this.stack[i];
            node.text(value);
        }
    } else {
        for (let i = 0; i < this.stack.length; i += 1) {
            node = this.stack[i];
            node.text(value.call(node, node.dataObj, i));
        }
    }

    return this;
};

// CreateElements as CollectionPrototype

function CollectionPrototype(contextInfo, data, config, vDomIndex) {
    if (!data) {
        data = [];
    }

    let transform;
    let key;
    const attrKeys = config ? (config.attr ? Object.keys(config.attr) : []) : [];
    const styleKeys = config ? (config.style ? Object.keys(config.style) : []) : [];
    const bbox = config ? (config.bbox !== undefined ? config.bbox : true) : true;
    this.stack = data.map((d, i) => {
        const node = this.createNode(
            contextInfo.ctx,
            {
                el: config.el,
                bbox: bbox,
            },
            vDomIndex
        );

        for (let j = 0, len = styleKeys.length; j < len; j += 1) {
            key = styleKeys[j];

            if (typeof config.style[key] === "function") {
                const resValue = config.style[key].call(node, d, i);
                node.setStyle(key, resValue);
            } else {
                node.setStyle(key, config.style[key]);
            }
        }

        for (let j = 0, len = attrKeys.length; j < len; j += 1) {
            key = attrKeys[j];

            if (key !== "transform") {
                if (typeof config.attr[key] === "function") {
                    const resValue = config.attr[key].call(node, d, i);
                    node.setAttr(key, resValue);
                } else {
                    node.setAttr(key, config.attr[key]);
                }
            } else {
                if (typeof config.attr.transform === "function") {
                    transform = config.attr[key].call(node, d, i);
                } else {
                    ({ transform } = config.attr);
                }

                for (const trns in transform) {
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
    createEls,
    createEl,
    forEach,
    setAttr: setAttribute,
    fetchEls,
    setStyle,
    translate,
    rotate,
    scale,
    exec,
    // animateTo: animateArrayTo,
    // animateExe: animateArrayExe,
    // animatePathTo: animatePathArrayTo,
    remove,
    interrupt,
    text: textArray,
    join,
    on,
};

CollectionPrototype.prototype.createNode = function () {};

CollectionPrototype.prototype.wrapper = function wrapper(nodes) {
    const self = this;

    if (nodes) {
        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            self.stack.push(node);
        }
    }

    return this;
};

const layerResizeHandler = function (entries) {
    for (const key in entries) {
        const entry = entries[key];
        const cr = entry.contentRect;
        if (entry.target.resizeHandler) {
            entry.target.resizeHandler.forEach(function (exec) {
                exec(cr);
            });
        }
    }
};

export { NodePrototype, CollectionPrototype };
