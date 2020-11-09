var FRAMERATE_FPS= 30;            //in FPS
var CONNECTION_DISTANCE = 150;    //in px
var MAX_NODES = 50;                //just a number!
var MAX_CONNECTIONS = 5;                //just a number!


//animation helper
var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame || 
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame;


var canvasWidth, canvasHeight;
//app setup
var lineMaxDraw = CONNECTION_DISTANCE;
var numPoints = MAX_NODES;
var FRAMERATE_MS = Math.round(1000 / FRAMERATE_FPS);


var uniqueID = 0;
var pointsArray = [];
var linesArray = [];

//compare distance functions
function compareDistance(a,b) {
  if (a.distance < b.distance)
     return -1;
  if (a.distance > b.distance)
    return 1;
  return 0;
}


//Check in array

function containsObjectbyID(ID, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].ID === ID) {
            return true;
        }
    }

    return false;
}














  /* @class Line */
  function Line(px,py, alpha, distance, ID) {
    this.ID = -1;
    this.startPoint = px;
    this.endPoint = py;
    this.distance = distance;
    this.alpha = alpha;
    this.kill = false;
    
    this.active = false;
  }
  /* @end class Line */

Line.prototype = {};

  Line.prototype.update = function() {
    
    this.distance = lineDistance(this.startPoint.x, this.startPoint.y, this.endPoint.x,this.endPoint.y);
       
  }
  
  Line.prototype.killme = function() {
    this.kill = true;
       
  }
  
  Line.prototype.checkAlpha = function() {

    if (this.active == false) {
      //incactive
      var targetAlpha = 1 - ( this.distance / lineMaxDraw );
      this.alpha += 0.005;
      if ( this.alpha >=  targetAlpha) {
        this.active = true;
        //console.log('line active');
      }
    } else {
      //active
      //manage alpha
      this.alpha = 1 - ( this.distance / lineMaxDraw );
    }

       
  }
  










  
  /* @class Point */

  function Point(x, y, z, angle, vel, r, g, b, a) {
    
    this.ID = -1;
    
    //set defaults on init
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.angle = angle || 1;
    this.vel = vel || 1;
    
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
    this.a = a || 0;
    this.maxAlpha = 0.8;
   
    this.connections = [];
    
    this.kill = false;
  }

  Point.prototype = {};

  Point.prototype.move = function() {
     this.x += this.vel * Math.cos(this.angle);
    this.y += this.vel * Math.sin(this.angle);
    
    if ( this.x < -lineMaxDraw ) {
      this.kill = true;
    } else if (this.x > canvasWidth + lineMaxDraw) {
      this.kill = true;
    }
    
    if ( this.y < 0 - lineMaxDraw) {
      this.kill = true;
    } else if (this.y > canvasHeight + lineMaxDraw) {
      this.kill = true;
    }
  };

Point.prototype.visibility = function() {
    if (this.a < this.maxAlpha) {
      this.a += 0.01;
    }
  
  if (this.a >= this.maxAlpha) {
    this.a = this.maxAlpha
  }
}

Point.prototype.findPoints = function() {
  //IF less than max connections then try find a new one
  if (this.connections.length < MAX_CONNECTIONS) {
    //console.log(this.connections.length);
    for (p = pointsArray.length - 1; p > 0 ; p--) {
       var t = pointsArray[p];
       if (t.ID !== this.ID ) { //not this add the point
         //console.log('Someone else!')
        
         //if line is in the square ZONE
         var td = lineDistance(this.x, this.y, t.x,t.y);
         if (td < lineMaxDraw && td > 0) {
           //is near
           
           //check if the line is already connected to this point

           var lineisconnected = containsObjectbyID(t.ID, this.connections);
           if (lineisconnected == false) {
              //console.log("I'm not in you - reach out and make a connection");

             //make line
             var newLine = new Line(this, t, 0, td);
             
             //add Unique ID
             newLine.ID = uniqueID;
             uniqueID++;
             
             //add to array of lines
             linesArray.push(newLine);
             
             //register this connection with all parties!
             this.connections.push(t.ID);
             t.connections.push(this.ID);
             //console.log(this.connections, t.connections);
           } else {
            //console.log("I'm in you - carry on");
           }
         }//within the square ZONE end

       } else {
        //console.log('meeeee!')
       }
    }
  }
  else if (this.connections.length > MAX_CONNECTIONS) {
    //full up
    
    //kill some lines
    
    var pointID = this.ID;
    for (var l = linesArray.length - 1; l >= 0 ; l--) {
      var line = linesArray[l];
      if (line.startPoint.ID == pointID || line.endPoint.ID == pointID) {
        line.kill=true;
        break;
      }
    }
  }
}


/* End @class Point */

function lineDistance( x1, y1, x2, y2 )
{
  var xs = 0;
  var ys = 0;

  xs = x2 - x1;
  xs = xs * xs;

  ys = y2 - y1;
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}
























$(document).ready(function() {
    
  var canvas = document.getElementById("theCanvas");
  canvas.style.width='100vw';
  canvas.style.height='100vh';
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;  
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  var mainContext = canvas.getContext("2d");
  var canvasData = mainContext.getImageData(0, 0, canvasWidth, canvasHeight);



  function draw () {
      //clear the canvas please!
      mainContext.clearRect(0, 0, canvasWidth, canvasHeight);
       
     
     //Draw Points
     for (var i = pointsArray.length - 1; i >= 0 ; i--) { 
      //console.log(pointsArray[i])
      var point = pointsArray[i];

      //draw point
      mainContext.beginPath();
      //x, y, radius ...
      mainContext.fillStyle = 'rgba('+point.r+','+point.g+','+point.b+','+point.a+ ')';
      mainContext.arc(point.x, point.y, 1, 0, 2 * Math.PI, true);
      mainContext.fill();
     }
    
    //Draw Lines
     for (l = linesArray.length - 1; l >= 0 ; l--) {
      var line = linesArray[l];

      mainContext.beginPath();
      var p1 = line.startPoint;
      var p2 = line.endPoint;

      mainContext.moveTo(p1.x, p1.y);
      mainContext.lineTo(p2.x, p2.y);
      mainContext.lineWidth = 0.2;
      mainContext.strokeStyle = 'rgba(0,0,0,'+line.alpha+')';
      mainContext.stroke();
     } 
     
      //do it all again as soon as we are ready
      requestAnimationFrame(draw);
  }

  









  /* CALCULATIONS */
  function calculate() {

    //calculate points
    for (var i = pointsArray.length - 1; i >= 0 ; i--) { 
      //console.log(pointsArray[i])
      var point = pointsArray[i];
      point.move();
      point.visibility();
      point.findPoints();

      if (point.kill == true ) {
        //console.log('removed point');
        pointsArray.splice(i, 1)
      }

    }


    //calculate lines
    for (var l = linesArray.length - 1; l >= 0 ; l--) {
      var line = linesArray[l];
      if (line.kill != true ) {
        line.checkAlpha();
        line.update();
        if (line.distance > lineMaxDraw) {
          line.killme()
        }
      }
      if (line.kill == true ) {
        //killed line -remove
        //console.log('removed line');
        
        cleanPairingFromPoints(line.startPoint.ID, line.endPoint.ID);

        //remove line from the main array
        linesArray.splice(l, 1);

      }

     }

  }


  function cleanPairingFromPoints(ptA_ID, ptB_ID) {


    for (var i = pointsArray.length - 1; i >= 0 ; i--) { 
      var point = pointsArray[i];
      if (point.ID == ptA_ID) {
        var B_index = point.connections.indexOf(ptB_ID);
        if (B_index > -1) {
            point.connections.splice(B_index, 1);
            //console.log(ptB_ID + ' removed from ' + ptA_ID);
        }
      }

      if (point.ID == ptB_ID) {
        var A_index = point.connections.indexOf(ptA_ID);
        if (A_index > -1) {
            point.connections.splice(A_index, 1);
            //console.log(ptA_ID + ' removed from ' + ptB_ID);
        }
      }
    }

  }



  function spawnPixl() {
    //spawn a pixel
    if (pointsArray.length < numPoints) {

      var x = Math.floor((Math.random() * canvasWidth) + 1);
      var y = Math.floor((Math.random() * canvasHeight) + 1);


      var angle =  Math.floor((Math.random() * 360));
      var vel =  Math.random(); //don't round
      if ( vel < 0.25) {
        vel = 0.25;
      }
      
      var newPoint = new Point(x, y, 0, angle, vel);//, r, g, b );//Make playlist
      
      newPoint.ID = uniqueID;
      pointsArray.push(newPoint);//Put in array of lists
      uniqueID++;
    } else if ( pointsArray.length > numPoints ) {
      
      var pointID = pointsArray[0].ID;
      for (var l = linesArray.length - 1; l >= 0 ; l--) {
        var line = linesArray[l];
        if (line.startPoint.ID == pointID || line.endPoint.ID == pointID) {
          line.kill=true;
        }
        
      }
      pointsArray[0].kill = true;
    }
  }
    
  
  /*


  repeating actions


  */
  
  

  //animate the scene
  var animator = setInterval(calculate, FRAMERATE_MS);   
  
  //render the scene and start the animation loops
  draw();

  // set interval
  var spawner = setInterval(spawnPixl, 1);
  
    
    
    
    
  function abortTimer() { // to be called when you want to stop the timer
    clearInterval(spawner);
  }
   
  

  
  //Controls
  $('#nCount').on('change', function(e) {
    MAX_NODES = $(this).val();
    numPoints = MAX_NODES;
    $('#nCountValue').text(MAX_NODES);
  });
  
  
  $('#cRange').on('change', function(e) {
    CONNECTION_DISTANCE = $(this).val();
    lineMaxDraw = CONNECTION_DISTANCE;
    $('#cRangeValue').text(CONNECTION_DISTANCE);
  });
  
  $('#cNum').on('change', function(e) {
    
    MAX_CONNECTIONS = $(this).val();
    
    $('#cNumValue').text(MAX_CONNECTIONS);
  });
  
  
  
  });
