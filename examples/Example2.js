#!/usr/bin/env node

	let { canvasPdfLayer } = require("./../dist/node-i2d.js");
	const fs = require('fs');
	var path = require('path');

	let PDFInstance = canvasPdfLayer({}, 297 * 3, 210 * 3);

	let page1 = PDFInstance.addPage();

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

		page1.createEl({
			el: "text",
			attr: {
				x: (210 * 3 * 0.5),
				y: 100,
				text: "My First Report"
			},
			style: {
				strokeStyle: linearGradiant,
				font: "30px Arial",
				textAlign: "center"
			}
		});

		page1.createEl({
			el: "rect",
			attr: {
				x: 30,
				y: 200,
				width: (210 * 3 - 80) * 0.5,
				height: 150,
				rx: 10,
				ry: 10
			},
			style: {
				strokeStyle: "#FF7C80",
				lineWidth: 2,
				fillStyle: "none"
			}
		});

		page1.createEl({
			el: "text",
			attr: {
				x: 40,
				y: 210,
				text: "The post added that it is a challenging time for their family. Bruce Willis' daughter, Rumer, shared a joint statement on her Instagram handle that read, To Bruce's amazing supporters, as a family, we wanted to share that our beloved Bruce has been experiencing some health issues and has recently been diagnosed with aphasia, which is impacting his cognitive abilities. As a result of this and with much consideration Bruce is stepping away from the career that has meant so much to him.",
				width: (210 * 3 - 80) * 0.48
			},
			style: {
				strokeStyle: "#000000",
				font: "10px Arial",
				textAlign: "left",
				"word-wrap": "break-word",
			}
		});

		page1.createEl({
			el: "rect",
			attr: {
				x: 40 + (210 * 3 - 80) / 2,
				y: 200,
				width: (210 * 3 - 80) * 0.5,
				height: 150,
				rx: 10,
				ry: 10
			},
			style: {
				strokeStyle: "#0075F3",
				lineWidth: 2,
				fillStyle: "none"
			}
		});


		page1.createEl({
			el: "text",
			attr: {
				x: 50 + (210 * 3 - 80) / 2,
				y: 210,
				text: "The post added that it is a challenging time for their family. Bruce Willis' daughter, Rumer, shared a joint statement on her Instagram handle that read, To Bruce's amazing supporters, as a family, we wanted to share that our beloved Bruce has been experiencing some health issues and has recently been diagnosed with aphasia, which is impacting his cognitive abilities. As a result of this and with much consideration Bruce is stepping away from the career that has meant so much to him.",
				width: (210 * 3 - 80) * 0.48
			},
			style: {
				strokeStyle: "#000000",
				font: "10px Arial",
				textAlign: "left",
				"word-wrap": "break-word",
			}
		});

		page1.createEl({
			el: "polygon",
			attr: {
				transform: {
					translate: [200, 410]
				},
				points: [{x: 100, y: 100}, {x: 100, y: 0}, {x: 0, y: 100}]
			},
			style: {
				fillStyle: "#0075F3"
			}
		});

		PDFInstance.execute();

		fs.writeFileSync((process.cwd() + "/examples/example2.pdf"), PDFInstance.exportPdf(), err => {
		  if (err) {
		    console.error(err)
		    return
		  }
		  console.log("file written successfully");
		});


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
