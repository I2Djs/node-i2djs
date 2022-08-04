import canvasAPI from "./modules/canvas.js";
import geometry from "./modules/geometry.js";
import color from "./modules/colorMap.js";
import path from "./modules/path.js";

const pathIns = path.instance;
const canvasLayer = canvasAPI.canvasLayer;
const canvasPdfLayer = canvasAPI.pdfLayer;
export { canvasLayer };
export { canvasPdfLayer };
export { geometry };
export { color };
export { pathIns as Path };
