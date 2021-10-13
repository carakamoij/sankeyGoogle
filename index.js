google.charts.load("current", {
  packages: ["sankey"],
});
google.charts.setOnLoadCallback(constructChart);

const colors = ["#369a9b", "#23728d", "#6ec2a1", "#164a74"];
const font = { name: "sans-serif", size: "10", color: "#000000" };
let chart1 = null;
let data = null;
let chartSelected = false;

const options = {
  height: 400,
  width: 690,
  sankey: {
    node: {
      colors: colors,
      width: 30,
      interactivity: true,
      label: {
        fontName: font.name,
        fontSize: font.size,
        color: font.color,
      },
    },
    link: {
      colorMode: "gradient",
      colors: colors,
    },
  },
  tooltip: {
    textStyle: {
      color: colors[0],
      italic: true,
    },
    showColorCode: true,
    isHtml: true,
  },
};

function constructChart() {
  data = new google.visualization.DataTable();
  data.addColumn("string", "From");
  data.addColumn("string", "To");
  data.addColumn("number", "Weight");
  data.addRows([
    ["Myocarditis (n = 7)", "Myocarditis (n = 6)", 4],
    ["Myocarditis (n = 7)", "Pericarditis (n = 1)", 1],
    ["Myocarditis (n = 7)", "No cause found (n = 2)", 1],
    ["Myocarditis (n = 7)", "Myopericarditis (n = 2)", 1],
    ["MINOCA (n = 5)", "Myocarditis (n = 6)", 2],
    ["MINOCA (n = 5)", "No cause found (n = 2)", 1],
    ["MINOCA (n = 5)", "Significant incidental finding (n = 3)", 1],
    ["MINOCA (n = 5)", "MINOCA (n = 3)", 1],
    [
      "Unspecified chest pain (n = 5)",
      "Significant incidental finding (n = 3)",
      2,
    ],
    ["Unspecified chest pain (n = 5)", "Myopericarditis (n = 2)", 1],
    ["Unspecified chest pain (n = 5)", "MINOCA (n = 3)", 1],
    ["Unspecified chest pain (n = 5)", "Normal (n = 1)", 1],
    ["Takotsubo cardiomyopathy (n = 1)", "MINOCA (n = 3)", 1],
  ]);
  // Instantiates and draws our chart, passing in some options.

  chart1 = new google.visualization.Sankey(
    document.getElementById("sankey_basic")
  );
  //google.visualization.events.addListener(chart1, "ready", fireOnRendered);
  google.visualization.events.addListener(chart1, "select", fireChartSelected);
  redrawChart();
}

function redrawChart() {
  chart1.draw(data, options);
  console.log("redrawing");
}

function fireChartSelected() {
  chartSelected = true;
  // var selected = chart1.getSelection();
  // console.log(selected);
}

//method to fix issue of gradient svg paths having url not pointing to local resource
//resulting in CORS issues when exporting with html2canvas.
function fixGradientUrlsCORS() {
  //Get all svg paths with linear gradient
  const paths = document.querySelectorAll("path");
  const pathsArray = [];
  paths.forEach((p) => pathsArray.push(p));
  const pathsWithGradientFilling = pathsArray.filter(
    (el) => el.getAttribute("fill").indexOf("#") !== -1
  );

  //replace svg path gradient urls
  pathsWithGradientFilling.forEach((el) => {
    const parts = el.getAttribute("fill").split("#");
    const fillComputed = `url(#${parts[1]}`;
    el.setAttribute("fill", fillComputed);
  });
}

function generatePng() {
  if (options.sankey.link.colorMode === "gradient") fixGradientUrlsCORS();

  html2canvas($("#sankey_basic")[0], {
    letterRendering: true,
  }).then(function (canvas) {
    canvas.style.display = "none";
    $(canvas)
      .appendTo($(document.body))
      .slideDown("fast")
      .attr("title", "Right Click to Save .png");
  });
}

function clearPngs() {
  $("canvas").fadeTo(400, 0.8, function () {
    $(this).slideUp(150, function () {
      $(this).remove();
    });
  });
}

$(document).ready(function () {
  $("#colorMode").on("change", function (e) {
    options.sankey.link.colorMode = e.target.value;
    redrawChart();
  });

  $(".size").on("change", function (e) {
    if (e.target.placeholder === "width") {
      options.width = e.target.value;
    } else if (e.target.placeholder === "height") {
      options.height = e.target.value;
    } else if (e.target.placeholder === "nodeWidth") {
      options.sankey.node.width = e.target.value;
    }
    redrawChart();
  });

  $("[id^=color]").on("change", function (e) {
    colors[e.target.id.split("color")[1]] = e.target.value;
    redrawChart();
  });

  $("[id^=label-]").on("change", function (e) {
    options.sankey.node.label[e.target.id.split("label-")[1]] = e.target.value;
    //console.log(options);
    redrawChart();
  });

  $("#generate").on("click", function () {
    generatePng();
  });

  $("#clear").on("click", function () {
    clearPngs();
  });

  $("html").on("click", function () {
    if (chartSelected) redrawChart();
    chartSelected = false;
  });

  $("#backgroundColor").on("change", function (e) {
    $("#sankey_basic")[0].style.backgroundColor = e.target.value;
  });
});
