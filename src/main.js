import canvasAPI from "./modules/canvas.js";
import geometry from "./modules/geometry.js";
import color from "./modules/colorMap.js";
import path from "./modules/path.js";
import queue from "./modules/queue.js";
import ease from "./modules/ease.js";
import chain from "./modules/chain.js";
import behaviour from "./modules/behaviour.js";
import utility from "./modules/utilities";

const pathIns = path.instance;
const canvasNodeLayer = canvasAPI.canvasNodeLayer;
export { canvasNodeLayer };
export { geometry };
export { color };
export { pathIns as Path };
export { queue };
export { ease };
export { chain };
export { behaviour };
export { utility };
