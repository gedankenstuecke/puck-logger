var BANGLE_CODE = `
setInterval(function () {
  console.log("wrote data");
  now = new Date();
  light = Puck.light();
  temperature = Puck.getTemperature();
  accel = Puck.accel().acc;
  recFile = require("Storage").open("logging.csv","a");
  recFile.write([now,temperature,light,accel.x,accel.y,accel.z].join(",")+";");
  console.log([now,temperature,light,accel.x,accel.y,accel.z].join(","));
}, 300000);\n
`;

// When we click the connect button...
document.getElementById("btnConnect").addEventListener("click", function() {
  $("#pb_div").show();
  Puck.write('reset();',function(){
    $("#progress_bar").removeClass('bg-success');
    Puck.setTime();
    Puck.write(BANGLE_CODE, function(){
    console.log('connected and installed 1button');
    $("#pb_div").hide();
    });
  });
})

function saveCSV(filename, csvData) {
  let a = document.createElement("a"),
    file = new Blob([csvData], {type: "Comma-separated value file"});
  let url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename+".csv";
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
  $("#pb_div").hide();
  console.log('finished download')
}

function saveButtonRecord(record,name) {
  var csv = `${record.map(rec=>[rec.time,rec.temperature,rec.light,rec.x,rec.y,rec.z].join(",")).join("\n")}`;
  csv = csv + "\n";
  console.log(csv);
  saveCSV(name, csv);
};
//now,temperature,light,accel.x,accel.y,accel.z
function ButtonRecordLineToObject(l) {
  var t = l.trim().split(",");
  var o = {
    time: t[0],
    temperature: parseFloat(t[1]),
    light: parseFloat(t[2]),
    x: parseFloat(t[3]),
    y: parseFloat(t[4]),
    z: parseFloat(t[5]),
  };
  return o;
};

function downloadButtonPresses(callback) {
  var flength;
  var record;
  Puck.eval('require("Storage").open("logging.csv","r").getLength()',function(x){
    flength=x;
    Puck.eval('require("Storage").open("logging.csv","r").read('+flength+')',function(data){
      record = data.slice(0, -1).split(";").map(l=>ButtonRecordLineToObject(l));
      callback(record);
    })
  });
}

function deleteButtonPresses(callback) {
  Puck.eval('require("Storage").open("logging.csv","r").erase()',function(x){
    console.log('deleted storage');
  });
}

document.getElementById("btnDownload").addEventListener("click", function() {
  console.log('start download');
  $("#pb_div").show();
});

document.getElementById("btnDownload").addEventListener("click", function() {
  downloadButtonPresses(record => saveButtonRecord(record, `puck_logging.csv`));
});

document.getElementById("btnErase").addEventListener("click", function() {
  if (confirm("Are you sure? This will delete all of your button presses!")) {
      deleteButtonPresses();
  }
});
