#!/usr/bin/env node

let { canvasPdfLayer } = require("./../dist/i2d.js");
const fs = require('fs');

let newPdf = canvasPdfLayer({}, 297 * 3, 210 * 3);

let page1 = newPdf.addPage();

var linearGradiant = page1.createLinearGradient({
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 100,
                id: "11",
                colorStops: [
                    { color: "#FF7C80", value: 0 },
                    { color: "#0075F3", value: 100 },
                ],
            });

page1.exec(renderRemplate);
// page1.createEl({
// 	el: "rect",
// 	attr: {
// 		x: 20,
// 		y: 20,
// 		width: (210 * 3) - 40,
// 		height: (297 * 3) - 40,
// 		rx: 10,
// 		ry: 10
// 	},
// 	style: {
// 		strokeStyle: linearGradiant,
// 		lineWidth: 5
// 	}
// });

page1.createEl({
	el: "image",
	attr: {
		x: (210 * 3 * 0.5) - 75,
		y: 50,
		src: "/Users/nswamy14/Documents/GitHub/node-i2djs/examples/images/nodeI2djsLogo.svg",
		onload: function () {
			let width = this.getAttr("width");
			let height = this.getAttr("height");
			this.setAttr("width", 150);
			this.setAttr("height", (height / width) * 150);
		}
	}
});

page1.createEl({
	el: "text",
	attr: {
		x: (210 * 3 * 0.5),
		y: 200,
		text: "My First Report"
	},
	style: {
		strokeStyle: linearGradiant,
		font: "30px Arial",
		textAlign: "center"
	}
});

let ccount = 900
let sqrtCc = Math.ceil(Math.sqrt(ccount));
page1.createEls(Array.from(Array(ccount).keys()), {
	el: "circle",
	attr: {
		cy: function (d, i) {
			return 300 + Math.floor(i / sqrtCc) * 17
		},
		cx: function (d, i) {
			return 50 + (i % sqrtCc) * 18
		},
		r: 6
	},
	style: {
		fillStyle: function (d, i) {
			return "hsl(" + i * (360 / ccount) + ",100%, 75%)";
		},
		strokeStyle: "none"
	}
})

let page2 = newPdf.addPage();

page2.exec(renderRemplate);
// page2.createEl({
// 	el: "rect",
// 	attr: {
// 		x: 20,
// 		y: 20,
// 		width: (210 * 3) - 40,
// 		height: (297 * 3) - 40,
// 		rx: 10,
// 		ry: 10
// 	},
// 	style: {
// 		strokeStyle: linearGradiant,
// 		lineWidth: 5,
// 		fillStyle: "none"
// 	}
// });

let count = 1000
let sqrtC = Math.ceil(Math.sqrt(count));
page2.createEls(Array.from(Array(count).keys()), {
	el: "rect",
	attr: {
		y: function (d, i) {
			return 50 + Math.floor(i / sqrtC) * 25
		},
		x: function (d, i) {
			return 50 + (i % sqrtC) * 17
		},
		width: 10,
		height: 16
	},
	style: {
		fillStyle: function (d, i) {
			return "hsl(" + i * (360 / count) + ",100%, 75%)";
		},
		strokeStyle: "none"
	}
})

newPdf.execute();

fs.writeFileSync('/Users/nswamy14/Documents/GitHub/node-i2djs/examples/sample.pdf', newPdf.exportPdf(), err => {
  if (err) {
    console.error(err)
    return
  }
  console.log("file written successfully");
})


function renderRemplate () {
	this.createEl({
		el: "rect",
		attr: {
			x: 20,
			y: 20,
			width: (210 * 3) - 40,
			height: (297 * 3) - 40,
			rx: 10,
			ry: 10
		},
		style: {
			strokeStyle: linearGradiant,
			lineWidth: 5,
			fillStyle: "none"
		}
	});
}
