#!/usr/bin/env node

/*******************************
 * Author: Nswamy14
 * Implemented using node-i2djs framework
 * https://github.com/I2Djs/node-i2djs
 ********************************/

	let { canvasPdfLayer } = require("./../dist/node-i2d.js");
	const fs = require('fs');
	var path = require('path');
	let height = 891;
	let width = 630;
	// Importing I2Djs PDF Canvas layer, by specifying height and width
	let PDFInstance = canvasPdfLayer({}, height, width);
	// Creating First Page by calling .addPage method
	let page1 = PDFInstance.addPage();

	// Creating linear gradient, using in page border
	var borderGradiant = page1.createLinearGradient({
		x1: 0,
		y1: 0,
		x2: 100,
		y2: 100,
		id: "11",
		colorStops: [
		  { color: "#FF7C80", value: 0 },
		  { color: "#0075F3", value: 100 }
		]
	});

	var fillGradiant = page1.createLinearGradient({
		x1: 0,
		y1: 0,
		x2: 100,
		y2: 100,
		id: "11",
		colorStops: [
		  { color: "#071e36", value: 0 },
		  { color: "#401213", value: 100 }
		]
	});

	var titleGradiant = page1.createLinearGradient({
	x1: 0,
	y1: 0,
	x2: 100,
	y2: 100,
	id: "11",
	colorStops: [
	  { color: "#db7d80", value: 0 },
	  { color: "#71aceb", value: 100 }
	]
	});

	// invoking renderPageBorder method, renders page border.
	page1.exec(renderPageBorder);

	// render Logo.
	page1.createEl({
	el: "image",
	attr: {
	  x: 0,
	  y: 0,
	  transform: {
	  	translate: [width * 0.5 - 50, 50],
	  	scale: [0.1, 0.1]
	  },
	  src: process.cwd() + "/examples/images/node-logo.png",
	  onload: function () {
	  }
	}
	});

	// render Title.
	page1.createEl({
	el: "text",
	attr: {
	  x: width * 0.5,
	  y: 150,
	  text: "My Sample Report"
	},
	style: {
	  fillStyle: titleGradiant,
	  font: "small-caps bold 35px arial",
	  textAlign: "center"
	}
	});

	let content = page1.createEl({
	el: "group",
	attr: {
	  transform: {
	    translate: [40, 180]
	  }
	}
	});

	content
	.createEls(
	  [
	    { id: 1, endcolor: "#8C2828", stcolor: "#FF9D9D" },
	    { id: 2, endcolor: "#8E6210", stcolor: "#FFC79D" },
	    { id: 3, endcolor: "#10748E", stcolor: "#9DE3FF" },
	    { id: 4, endcolor: "#671270", stcolor: "#efd0f2" }
	  ],
	  {
	    el: "group",
	    attr: {
	      transform: function (d, i) {
	        return {
	          translate: [40 + i * 125, 40]
	        };
	      }
	    }
	  }
	)
	.forEach(function (d) {
	  let fillStyle = content.createRadialGradient({
	    innerCircle: { x: 50, y: 0, r: 0 },
	    outerCircle: { x: 50, y: 50, r: 100 },
	    colorStops: [
	      { color: d.stcolor, value: 0 },
	      { color: d.endcolor, value: 100 }
	    ]
	  });
	  this.createEl({
	    el: "rect",
	    attr: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 100,
	      rx: 10,
	      ry: 10
	    },
	    style: {
	      strokeStyle: "none",
	      fillStyle: fillStyle
	    }
	  });
	  this.createEl({
	    el: "text",
	    attr: {
	      x: 35,
	      y: 20,
	      text: d.id
	    },
	    style: {
	      strokeStyle: "none",
	      fillStyle: "#ffffff",
	      font: "bold 48px Verdana"
	    }
	  });
	});

	content.createEl({
	el: "text",
	attr: {
	  class: "title",
	  x: 0,
	  y: 200,
	  text: "Ohtani is a baseball savant"
	},
	style: {
	  fillStyle: "#ffffff",
	  font: "italic bold 15px Verdana"
	}
	});

	// render Text.
	content.createEl({
	el: "text",
	attr: {
	  x: 0,
	  y: 240,
	  width: 300, // wraps text if width specified
	  text:
	    "Ohtani is a baseball savant doing what has never been seen in Major League Baseball history. The last player to both pitch and hit at an elite level was Babe Ruth, a century ago. But the Bambino stopped pitching relatively early in his career to concentrate on hitting. And no one ever called Ruth fast. Ohtani, the unanimous American League MVP, stole 26 bases last year.Ohtani is a baseball savant doing what has never been seen in Major League Baseball history. The last player to both pitch and hit at an elite level was Babe Ruth, a century ago. But the Bambino stopped pitching relatively early in his career to concentrate on hitting. And no one ever called Ruth fast. Ohtani, the unanimous American League MVP, stole 26 bases last year.Ohtani is a baseball savant doing what has never been seen in Major League Baseball history."
	},
	style: {
	  fillStyle: "#db7d80",
	  font: "12px Verdana"
	}
	});

	content.createEl({
	el: "text",
	attr: {
	  x: 0,
	  y: 550,
	  width: 550,
	  text:
	    "Ohtani is a baseball savant  doing what has never been seen in Major League Baseball history. The last player to both pitch and hit at an elite level was Babe Ruth, a century ago. But the Bambino stopped pitching relatively early in his career to concentrate on hitting."
	},
	style: {
	  fillStyle: "#db7d80",
	  font: "12px Verdana"
	}
	});

	content
	.createEls(
	  [
	    { id: 1, endcolor: "#8C2828", stcolor: "#FF9D9D" },
	    { id: 2, endcolor: "#8E6210", stcolor: "#FFC79D" },
	    { id: 3, endcolor: "#10748E", stcolor: "#9DE3FF" },
	    { id: 4, endcolor: "#671270", stcolor: "#efd0f2" }
	  ],
	  {
	    el: "group",
	    attr: {
	      transform: function (d, i) {
	        return {
	          translate: [370 + (i % 2) * 105, 220 + i * 70]
	        };
	      }
	    }
	  }
	)
	.forEach(function (d) {
	  let fillStyle = content.createRadialGradient({
	    innerCircle: { x: 50, y: 0, r: 0 },
	    outerCircle: { x: 50, y: 50, r: 100 },
	    colorStops: [
	      { color: d.stcolor, value: 0 },
	      { color: d.endcolor, value: 100 }
	    ]
	  });
	  this.createEl({
	    el: "circle",
	    attr: {
	      cx: 0,
	      cy: 30,
	      r: 40
	    },
	    style: {
	      strokeStyle: "none",
	      fillStyle: fillStyle
	    }
	  });
	  this.createEl({
	    el: "text",
	    attr: {
	      x: 0,
	      y: 0,
	      text: d.id
	    },
	    style: {
	      strokeStyle: "none",
	      fillStyle: "#ffffff",
	      font: "bold 48px Verdana",
	      textAlign: "center"
	    }
	  });
	});

	PDFInstance.execute();
	console.log("execute called");

	// Method to render page border
	function renderPageBorder() {
		this.createEl({
		  el: "rect",
		  attr: {
		    x: 20,
		    y: 20,
		    width: 630 - 40,
		    height: 891 - 40,
		    rx: 10,
		    ry: 10
		  },
		  style: {
		    strokeStyle: borderGradiant,
		    fillStyle: fillGradiant,
		    lineWidth: 2,
		    // fillStyle: "#ffffff"
		  }
		});
	}

	fs.writeFileSync((process.cwd() + "/examples/example4.pdf"), PDFInstance.exportPdf(), err => {
	  if (err) {
	    console.error(err)
	    return
	  }
	  console.log("file written successfully");
	});

