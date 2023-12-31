/**
 * @author Zachary Wartell, Jialei Li, K.R. Subrmanian,
 * @file '2D Drawing.js'
 * 
 * Skeleton code for this project is provided for by Prof. zachary Wartell
 * at https://cci-git.uncc.edu/UNCC_Graphics/ITCS_3120_2D_Drawing.git 
 *
 * @copyright Zachary Wartell, All Rights Reserved, 2018.
 */

/*****
 * 
 * GLOBALS
 * 
 *****/

// only for generating student skeleton code
var skeleton=true;

// 'draw_mode' are names of the different user interaction modes.
// \todo Student Note: others are probably needed...
var draw_mode = {DrawLines: 0, DrawTriangles: 1, DrawQuads: 2, ClearScreen: 3, None: 4};

// 'curr_draw_mode' tracks the active user interaction mode
var curr_draw_mode = draw_mode.DrawLines;

var last_draw_mode = draw_mode.None;


// 'active_color' stores r,g,b float value of current color set on color sliders
var active_color=[1.0,1.0,1.0];



/**
 * Represents a group of WebGL primitives
 * @constructor
 */
var PrimitivesGroup = function()
{
    this.primitiveSize = 0;   // should be from set {2,3,4}
    this.buffer = null;        // GL buffer for vertex attributes
    this.vertices = [];        // array of [x,y] coordinates
    this.colors = [];          // array of [r,g,b] colors
};

// array of PrimitivesGroup objects
var primitivesGroups=[];

// current primitive group being created
var curr_primitive_group=null;


// Represents via array indices the current primitive selected.  shapeIndex === -1 indicates none is selected.
var selectedPrimitive = { shapeIndex: -1, primitiveIndex: 0};

// GL array buffers for placedPoints
var placedPoints_buf;

// Array's storing 2D vertex coordinates of placedPoints
// Each array element is an array of size 2 storing :u:$ x,y coordinate.
var placedPoints = [];


// \todo Student Note: need similar arrays for other draw modes...
// ???

/*****
 * 
 * MAIN
 * 
 *****/
function main() {

    /** run test code and exist (optional) */
    var justRunMathTest=false;
    if (justRunMathTest)
    {
	math2d_test();
	return;
    }

    /*
     **      Initialize WebGL Components
     **/
    
    // Retrieve <canvas> Element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize Shaders
    if (!initShadersFromID(gl, "vertex-shader", "fragment-shader")) {
        console.log('Failed to intialize shaders.');
        return;
    }

    if(skeleton)
    {
        document.getElementById("App_Title").innerHTML += "-Skeleton";
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // get GL shader variable locations
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    placedPoints_buf = gl.createBuffer();
    if (!placedPoints_buf) {
	console.log('Failed to create the buffer object');
	return -1;
    }        

    /**
     **  Set Event Handlers
     **
     **  Student Note: the WebGL book uses an older syntax. The newer syntax, explicitly calling addEventListener, is preferred.
     **  See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     **/
    // set event handlers for buttons
    document.getElementById("LineButton").addEventListener(
            "click",
            function () {
                curr_draw_mode = draw_mode.DrawLines;
                placedPoints.length = 0;
            });

    document.getElementById("TriangleButton").addEventListener(
            "click",
            function () {
                curr_draw_mode = draw_mode.DrawTriangles;
                placedPoints.length = 0;
            });    
    
    document.getElementById("QuadButton").addEventListener(
            "click",
            function () {
                curr_draw_mode = draw_mode.DrawQuads;
                placedPoints.length = 0;
            });    

    document.getElementById("ClearScreenButton").addEventListener(
            "click",
            function () {
                curr_draw_mode = draw_mode.ClearScreen;
                
                // reset various globals
                primitivesGroups.length = 0;
                placedPoints.length = 0;
                // others... ?
                
                gl.clear(gl.COLOR_BUFFER_BIT);                
                curr_draw_mode = draw_mode.DrawLines;
            });
    document.getElementById("DeleteButton").addEventListener(
                "click",
                function () {
                    deleteSelectedObject()
                });
    
            
    
    //\todo add event handlers for other buttons as required....            

    // set event handlers for color sliders
    /* \todo right now these just output to the console, code needs to be modified... */
    document.getElementById("RedRange").addEventListener(
            "input",
            function () {
                console.log("RedRange:" + document.getElementById("RedRange").value);
                active_color[0]=document.getElementById("RedRange").value;                
            });
    document.getElementById("GreenRange").addEventListener(
            "input",
            function () {
                console.log("GreenRange:" + document.getElementById("GreenRange").value);
                active_color[1]=document.getElementById("GreenRange").value;                
            });
    document.getElementById("BlueRange").addEventListener(
            "input",
            function () {
                console.log("BlueRange:" + document.getElementById("BlueRange").value);
                active_color[2]=document.getElementById("BlueRange").value;                
            });                        
            
    
    // init sliders 
    document.getElementById("RedRange").value = active_color[0];
    document.getElementById("GreenRange").value = active_color[1];
    document.getElementById("BlueRange").value = active_color[2];

            
    // Register event handler to be called on a mouse button press
    canvas.addEventListener(
            "mousedown",
            function (ev) {
                handleMouseDown(ev, gl, canvas, a_Position, u_FragColor);
                });
}

/*****
 * 
 * FUNCTIONS
 * 
 *****/



/*
 * @author Zachary Wartell
 *
 * Handle mouse button press event.
 * 
 * @param {MouseEvent} ev - event that triggered event handler
 * @param {Object} gl - gl context
 * @param {HTMLCanvasElement} canvas - canvas 
 * @param {Number} a_Position - GLSL (attribute) vertex location
 * @param {Number} u_FragColor - GLSL (uniform) color
 * @returns {undefined}
 */

function deleteSelectedObject() {
    if (selectedPrimitive.shapeIndex >= 0) {
        primitivesGroups.splice(selectedPrimitive.shapeIndex, 1);
        selectedPrimitive.shapeIndex = -1;
        selectedPrimitive.primitiveIndex = 0;
        drawObjects(gl, a_Position, u_FragColor);
    }
}


function findSelectedPrimitive(x, y) {
    var selectionThreshold = 0.008;

    for (var i = 0; i < primitivesGroups.length; i++) {
        var sg = primitivesGroups[i];
        var primitiveSize = sg.primitiveSize;

        for (var j = 0; j < sg.vertices.length / primitiveSize; j++) {
            var startIndex = j * primitiveSize;
            var endIndex = startIndex + primitiveSize - 1;

            var dist;
            if (primitiveSize === 2) {
                // Line
                dist = pointLineDist([x, y], sg.vertices[startIndex], sg.vertices[endIndex]);
            } else if (primitiveSize === 3) {
                // Triangle
                dist = pointLineDist([x, y], sg.vertices[startIndex], sg.vertices[startIndex + 1]);
                var distToEdge2 = pointLineDist([x, y], sg.vertices[startIndex + 1], sg.vertices[startIndex + 2]);
                var distToEdge3 = pointLineDist([x, y], sg.vertices[startIndex + 2], sg.vertices[startIndex]);
                dist = Math.min(dist, distToEdge2, distToEdge3);
            } else if (primitiveSize === 4) {
                // Quad
                dist = pointLineDist([x, y], sg.vertices[startIndex], sg.vertices[startIndex + 1]);
                var distToEdge2 = pointLineDist([x, y], sg.vertices[startIndex + 1], sg.vertices[startIndex + 2]);
                var distToEdge3 = pointLineDist([x, y], sg.vertices[startIndex + 2], sg.vertices[startIndex + 3]);
                var distToEdge4 = pointLineDist([x, y], sg.vertices[startIndex + 3], sg.vertices[startIndex]);
                dist = Math.min(dist, distToEdge2, distToEdge3, distToEdge4);
            } else {
                // Handle other primitive types if needed
            }

            if (dist < selectionThreshold) {
                return { shapeIndex: i, primitiveIndex: j };
            }
        }
    }

    // No shape selected
    return { shapeIndex: -1, primitiveIndex: 0 };
}
function handleMouseDown(ev, gl, canvas, a_Position, u_FragColor) 
{
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    
    // Student Note: 'ev' is a MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
    
    // convert from canvas mouse coordinates to GL normalized device coordinates
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    var mp = new Vec2(x,y);  // 'mousePoint'

    console.log("button:" + ev.button);
    //return;
    switch(ev.button)
    {
        case 0:
            // mouse button 0 pressed, so handle primitive creation interaction
	    ev.stopPropagation();            
            if (curr_draw_mode !== last_draw_mode)
            {// draw mode changed, so prepare for the new mode 
                {        
                    placedPoints.length = 0;
                    curr_primitive_group = new PrimitivesGroup;
                    primitivesGroups.push(curr_primitive_group);
                    curr_primitive_group.buffer = gl.createBuffer();
                    if (!curr_primitive_group.buffer) {
                        console.log('Failed to create the buffer object');
                        return -1;
                    }        
		// FIXME Skeleton
		if(curr_draw_mode === draw_mode.DrawLines) {
            curr_primitive_group.primitiveSize = 2; 
        }
        else if(curr_draw_mode === draw_mode.DrawTriangles) {
            curr_primitive_group.primitiveSize = 3; 
        }
        else if(curr_draw_mode === draw_mode.DrawQuads) {
            curr_primitive_group.primitiveSize = 4; 
        }
                }
            }
	    // record last draw mode
            last_draw_mode = curr_draw_mode;

            // add placedPoint vertex point
            if (curr_draw_mode !== draw_mode.None) {
                // add clicked point to 'placedPoints'
                placedPoints.push([x, y]);        
            }

            // perform active drawing operation
            switch (curr_draw_mode) {
                case draw_mode.DrawLines:
                    // in line drawing mode, so draw lines
                    if (placedPoints.length === 2) {			
                        // got final point of new line, so update the primitive arrays
                        curr_primitive_group.vertices.push([x, y]);
                        curr_primitive_group.colors.push([active_color[0],active_color[1],active_color[2]]);
                        placedPoints.length = 0;
                    } else {						
                        // gathering placedPoints of new line segment, so collect placedPoints
                        curr_primitive_group.vertices.push([x, y]);
                    }
                    break;
                case draw_mode.DrawTriangles:
                    // Triangle drawing logic
                    if (placedPoints.length === 3) {			
                        // got final point of new line, so update the primitive arrays
                        curr_primitive_group.vertices.push([x, y]);
                        curr_primitive_group.colors.push([active_color[0],active_color[1],active_color[2]]);
                        placedPoints.length = 0;
                    } else {						
                        // gathering placedPoints of new line segment, so collect placedPoints
                        curr_primitive_group.vertices.push([x, y]);
                    }
                    break;    
                case draw_mode.DrawQuads:
                    if (placedPoints.length === 4) {			
                        // got final point of new line, so update the primitive arrays
                        curr_primitive_group.vertices.push([x, y]);
                        curr_primitive_group.colors.push([active_color[0],active_color[1],active_color[2]]);
                        placedPoints.length = 0;
                    } else {						
                        // gathering placedPoints of new line segment, so collect placedPoints
                        curr_primitive_group.vertices.push([x, y]);
                    }
                    break;
                    }
           
        case 1:      
        case 1: // Middle mouse button for selection
            selectedPrimitive = findSelectedPrimitive(x, y);
            drawObjects(gl, a_Position, u_FragColor);
            break;  
        case 2:   
    }
    
    drawObjects(gl,a_Position, u_FragColor);            
}

/*
 * @author Zachary Wartell
 *
 * Draw all objects
 *
 * @param {Object} gl - WebGL context
 * @param {Number} a_Position - position attribute variable
 * @param {Number} u_FragColor - color uniform variable
 * @returns {undefined}
 */
function drawObjects(gl, a_Position, u_FragColor) 
{

    // Clear <canvas>
    gl.clear (gl.COLOR_BUFFER_BIT);

    // draw all primitives
    
    //dbg_console.log(primitivesGroups);
    for (var si=0;si< primitivesGroups.length ; si++)
    {
        var sg = primitivesGroups[si];
	//dbg_console.log(sg);
	
        gl.bindBuffer(gl.ARRAY_BUFFER, sg.buffer);
        // set vertex data into buffer           (inefficient to redo every frame, but acceptable for firt project)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(sg.vertices), gl.STATIC_DRAW);
        // share location with shader
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // draw the primitives
        switch(sg.primitiveSize)
        {
            case 2:
                for(var i=0; i < Math.floor(sg.vertices.length/2); i++) {        
                    gl.uniform4f(u_FragColor, sg.colors[i][0],sg.colors[i][1],sg.colors[i][2],1.0);            
                    gl.drawArrays(gl.LINES, i*2, 2 );
                }
                break;
            // \todo draw triangles   
            case 3: // 3 vertices for each triangle
                for (var i = 0; i < Math.floor(sg.vertices.length / 3); i++) {
                    gl.uniform4f(u_FragColor, sg.colors[i][0], sg.colors[i][1], sg.colors[i][2], 1.0);
                    gl.drawArrays(gl.TRIANGLES, i * 3, 3);
                }
                break;
            case 4: 
                for(var i=0; i < Math.floor(sg.vertices.length/4); i++) {        
                    gl.uniform4f(u_FragColor, sg.colors[i][0],sg.colors[i][1],sg.colors[i][2],1.0);            
                    gl.drawArrays(gl.TRIANGLE_STRIP, i*4, 4);
                }
            // \todo draw quads
        }                            
    }

    // draw placedPoint highlight vertices 
    if (placedPoints.length !== 0)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, placedPoints_buf);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(placedPoints), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
        gl.drawArrays(gl.POINTS, 0, placedPoints.length); 
    }
    
    // highlight selected primitive
    if (selectedPrimitive.shapeIndex >= 0)
    {// a primitive is selected, so update visuals and GUI                
        // highlight vertices
        var sg = primitivesGroups[selectedPrimitive.shapeIndex];
        gl.bindBuffer(gl.ARRAY_BUFFER, sg.buffer);      // note, no need to set buffer data again        

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);        
        
        gl.uniform4f(u_FragColor, 1.0, 0.0, 1.0, 1.0);
        gl.drawArrays(gl.GL_POINTS, 
            sg.primitiveSize * selectedPrimitive.primitiveIndex,
            sg.primitiveSize );

        // update color selector to primitive's color
        active_color[0] = sg.colors[selectedPrimitive.primitiveIndex][0];
        active_color[1] = sg.colors[selectedPrimitive.primitiveIndex][1];
        active_color[2] = sg.colors[selectedPrimitive.primitiveIndex][2];
	
        document.getElementById("RedRange").value = active_color[0];
        document.getElementById("GreenRange").value = active_color[1];
        document.getElementById("BlueRange").value = active_color[2];
    }
    
}

/**
 * @author from Angel Textbook
 *
 * Converts 1D or 2D array of Number's 'v' into a 1D Float32Array.
 * 
 * @param {Number[] | Number[][]} v
 * @returns {Float32Array}
 */
function flatten(v)
{
    var n = v.length;
    var elemsAreArrays = false;

    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array(n);

    if (elemsAreArrays) {
        var idx = 0;
        for (var i = 0; i < v.length; ++i) {
            for (var j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for (var i = 0; i < v.length; ++i) {
            floats[i] = v[i];
        }
    }

    return floats;
}
