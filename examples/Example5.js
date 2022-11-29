#!/usr/bin/env node

/*******************************
 * Author: Nswamy14
 * Implemented using node-i2djs framework
 * https://github.com/I2Djs/node-i2djs
 ********************************/

	let { canvasLayer } = require("./../dist/node-i2d.js");
	const fs = require('fs');
	var path = require('path');
	let height = 891;
	let width = 630;
	let canvasInstance = canvasLayer({}, height, width);
	// Creating First Page by calling .addPage method
	// Creating linear gradient, using in page border
	var borderGradiant = canvasInstance.createLinearGradient({
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

	var fillGradiant = canvasInstance.createLinearGradient({
		x1: 0,
		y1: 0,
		x2: 100,
		y2: 100,
		id: "11",
		colorStops: [
		  { color: "#023263", value: 0 },
		  { color: "#fcfaf0", value: 50 },
		  { color: "#6e38a1", value: 100 }
		]
	});

	var titleGradiant = canvasInstance.createLinearGradient({
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
	canvasInstance.exec(renderPageBorder);

	// render Logo.
	canvasInstance.createEl({
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
	canvasInstance.createEl({
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

	let content = canvasInstance.createEl({
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
	      fillStyle: fillStyle,
	      "clip-Path": null
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

	let boySprite = canvasInstance.createTexture({
                attr: {
                    src: process.cwd() + "/examples/images/boySprite.png",
                    width: 108,
                    height: 140,
                    clip: {
                        sx: 0,
                        sy: 0,
                        swidth: 108,
                        sheight: 140,
                    },
                    onload: function (argument) {
                    	// console.log("onload called");
                    }
                },
            });

	var boyimg = canvasInstance.createEl({
            el: "image",
            attr: {
                src: boySprite,
                width: 300,
                height: 400,
                x: width * 0.5 - 150,
                y: 400,
            },
        });

	var clipInstance = canvasInstance.createClip();
            clipInstance.clip.createEl({
                el: "polygon",
                attr: {
                    points: [{x: 100, y:410}, {x:40,y:598}, {x:190,y:478}, {x:10,y:478}, {x:160,y:598}],
                    transform: {
                    	translate: [ 50, 0]
                    }
                }
            });

            canvasInstance.createEl({
                el: "image",
                attr: {
                    src: process.cwd() + "/examples/images/grass.jpeg",
                    x: 0,
                    y: 400,
                    width: 566 * 2,
                    height: 200 * 2,
                },
                style: {
                    "clip": clipInstance,
                    // "globalAlpha": 0.8,
                },
            });

        canvasInstance.execute();

        fs.writeFileSync((process.cwd() + "/examples/examplej.png"), canvasInstance.export(), err => {
		  if (err) {
		    console.error(err)
		    return
		  }
		  console.log("file written successfully");
		});
	
	

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

	

