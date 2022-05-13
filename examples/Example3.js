#!/usr/bin/env node

	let { canvasPdfLayer, Path } = require("./../dist/node-i2d.js");
	// Importing d3 modules for charting
	const { stack, arc } = require("d3-shape");
	const { max } = require("d3-array");
	const { scaleBand, scaleRadial, scaleOrdinal } = require("d3-scale");
	const fs = require('fs');
	var path = require('path');

	const orgdata = require("./data/example3Data.json");
		orgdata.columns = [
		  "State",
		  "Under 5 Years",
		  "5 to 13 Years",
		  "14 to 17 Years",
		  "18 to 24 Years",
		  "25 to 44 Years",
		  "45 to 64 Years",
		  "65 Years and Over"
		];

	renderPdf();

	function renderPdf() {
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

	  // invoking renderPageBorder method, renders page border.
	  page1.exec(renderPageBorder);

	  // render Logo.
	  page1.createEl({
	    el: "image",
	    attr: {
	      x: width * 0.5 - 50,
	      y: 50,
	      src: process.cwd() + "/public/logo.png",
	      onload: function () {
	        let width = this.getAttr("width");
	        let height = this.getAttr("height");
	        this.setAttr("width", 100);
	        this.setAttr("height", (height / width) * 100);
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
	      strokeStyle: borderGradiant,
	      font: "25px Arial",
	      textAlign: "center"
	    }
	  });

	  let content = page1.createEl({
	    el: "group",
	    attr: {
	      transform: {
	        translate: [40, 200]
	      }
	    }
	  });

	  // render subtitle.
	  content.createEl({
	    el: "text",
	    attr: {
	      class: "title",
	      x: 0,
	      y: 5,
	      text: "Ohtani is a baseball savant"
	    },
	    style: {
	      strokeStyle: "#59aaff",
	      font: "italic bold 15px Verdana"
	    }
	  });

	  // render Text.
	  content.createEl({
	    el: "text",
	    attr: {
	      x: 0,
	      y: 30,
	      width: 600 * 0.5, // wraps text if width specified
	      text:
	        "Ohtani is a baseball savant doing what has never been seen in Major League Baseball history. The last player to both pitch and hit at an elite level was Babe Ruth, a century ago. But the Bambino stopped pitching relatively early in his career to concentrate on hitting. And no one ever called Ruth fast. Ohtani, the unanimous American League MVP, stole 26 bases last year.\n\nOhtani is a baseball savant doing what has never been seen in Major League Baseball history. The last player to both pitch and hit at an elite level was Babe Ruth, a century ago. But the Bambino stopped pitching relatively early in his career to concentrate on hitting. And no one ever called Ruth fast. Ohtani, the unanimous American League MVP, stole 26 bases last year.Ohtani is a baseball savant doing what has never been seen in Major League Baseball history."
	    },
	    style: {
	      strokeStyle: "#a3d0ff",
	      font: "12px Verdana"
	    }
	  });

	  // render Text.
	  content.createEl({
	    el: "text",
	    attr: {
	      x: 600 * 0.5 - 20,
	      y: 400,
	      width: 560 * 0.5, // wraps text if width specified
	      text:
	        "And no one ever called Ruth fast. Ohtani, the unanimous American League MVP, stole 26 bases last year.Ohtani is a baseball savant doing what has never been seen in Major League Baseball history. The last player to both pitch and hit at an elite level was Babe Ruth, a century ago. But the Bambino stopped pitching relatively early in his career to concentrate on hitting. And no one ever called Ruth fast. Ohtani, the unanimous American League MVP, stole 26 bases last year.Ohtani is a baseball savant doing what has never been seen in Major League Baseball history."
	    },
	    style: {
	      strokeStyle: "#a3d0ff",
	      font: "12px Verdana"
	    }
	  });

	  // render Chart on Top right of the page
	  let chart1 = content.createEl({
	    el: "group",
	    attr: {
	      transform: {
	        translate: [350, 200]
	      }
	    }
	  });
	  chart1.data({
	    data: orgdata,
	    angle: Math.PI
	  });
	  chart1.exec(chartContent);

	  // render Chart on bottom left of the page
	  let chart2 = content.createEl({
	    el: "group",
	    attr: {
	      transform: {
	        translate: [200, 550]
	      }
	    }
	  });
	  chart2.data({
	    data: orgdata
	      .map(function (d) {
	        return d;
	      })
	      .sort(function (a, b) {
	        return b.total - a.total;
	      }),
	    angle: -Math.PI
	  });
	  chart2.exec(chartContent);

	  let page2 = PDFInstance.addPage();

	  page2.exec(renderPageBorder);

	  let chart3 = page2.createEl({
	    el: "group",
	    attr: {
	      transform: {
	        translate: [width * 0.5, 300]
	      }
	    }
	  });
	  chart3.data({
	    data: orgdata.map(function (d) {
	      return d;
	    }),
	    angle: 2 * Math.PI
	  });
	  chart3.exec(chartContent);

	  PDFInstance.execute();

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
	        lineWidth: 2,
	        fillStyle: "#212121"
	      }
	    });
	  }

	  // Method to render Chart
	  function chartContent(data_) {
	    let data = data_.data;
	    let innerRadius = 50;
	    let outerRadius = 200;
	    let x = scaleBand()
	      .domain(
	        data.map(function (d) {
	          return d.State;
	        })
	      )
	      .range([0, data_.angle])
	      .align(0);
	    let y = scaleRadial()
	      .domain([
	        0,
	        max(data, function (d) {
	          return d.total;
	        })
	      ])
	      .range([innerRadius, outerRadius]);
	    let z = scaleOrdinal()
	      .domain(orgdata.columns.slice(1))
	      .range([
	        "#FF7C80",
	        "#ff7cd3",
	        "#c47cff",
	        "#7c7eff",
	        "#7cc4ff",
	        "#7cffc6",
	        "#ffd87c"
	      ]);
	    let arcExe = arc()
	      .innerRadius(function (d) {
	        return y(d[0]);
	      })
	      .outerRadius(function (d) {
	        return y(d[1]);
	      })
	      .startAngle(function (d) {
	        return x(d.data.State);
	      })
	      .endAngle(function (d) {
	        return x(d.data.State) + x.bandwidth();
	      })
	      .padAngle(0.01)
	      .padRadius(innerRadius);
	    this.createEls(stack().keys(orgdata.columns.slice(1))(data), {
	      el: "group",
	      attr: {}
	    }).forEach(function (d) {
	      this.createEls(d, {
	        el: "path",
	        attr: {
	          d: function (d) {
	            let pathInstance = Path(arcExe(d));
	            return pathInstance;
	          }
	        },
	        style: {
	          fillStyle: function () {
	            return z(d.key);
	          },
	          strokeStyle: "none"
	        }
	      });
	    });

	    this.createEl({
	      el: "text",
	      attr: {
	        class: "title",
	        x: 0,
	        y: -12,
	        text: "123k"
	      },
	      style: {
	        strokeStyle: "#ff7076",
	        font: "bold 18px Verdana",
	        textAlign: "center"
	      }
	    });
	  }

	  fs.writeFileSync((process.cwd() + "/example3.pdf"), PDFInstance.exportPdf(), err => {
		  if (err) {
		    console.error(err)
		    return
		  }
		  console.log("file written successfully");
		});
	}

