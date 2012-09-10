//
// app.js
//
// Example application for renderer-bb.
//
// ============================================================================
//
// APPLICATION
// INITIALIZATION
//
// ============================================================================
//


(function(window, $) {

	// Global configuration
	var config = {
		url: "http://127.0.0.1:1337"
	};

	// Test classes holder
	app = {};


	///////////////////////////////////////////////////////////////////////////
	// $APPLICATION


	///////////////////////////////////////////////////////////////////////////
	// $INITIALIZATION

	app.init = function(){
		console.log("Hello app using renderer-bb!");

		var renderObjects = function() {
			var gl = app.renderer.view.gl;

			// Projection matrix
			var pMatrix = mat4.create();
			mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

			// Get objects
			var triangle = app.renderer.get("objects").where({ name: "triangle" })[0];
			var square = app.renderer.get("objects").where({ name: "square" })[0];
			var pyramid = app.renderer.get("objects").where({ name: "pyramid" })[0];
			var cube = app.renderer.get("objects").where({ name: "cube" })[0];

			// ModelView matrices
			var triangleMVMatrix = mat4.create();
			var squareMVMatrix = mat4.create();
			var pyramidMVMatrix = mat4.create();
			var cubeMVMatrix = mat4.create();

			var rotation = 0;
			var triangleValue, squareValue, pyramidValue, cubeValue;

//			setTimeout(
//				function() {
					setInterval(
						function() {
							mat4.identity(triangleMVMatrix);
							mat4.translate(triangleMVMatrix, [-1.5, 1.5, -7.0]);
							mat4.rotate(triangleMVMatrix, rotation * Math.PI / 180, [1, 0, 0]);
							triangleValue = triangle.get("values");
							triangleValue["uPMatrix"] = pMatrix;
							triangleValue["uMVMatrix"] = triangleMVMatrix;
							triangle.set("values", triangleValue);
							//triangle.set("noRender", true);

							mat4.identity(squareMVMatrix);
							mat4.translate(squareMVMatrix, [1.5, 1.5, -7.0]);
							mat4.rotate(squareMVMatrix, rotation * Math.PI / 180, [0, 1, 0]);
							squareValue = square.get("values");
							squareValue["uPMatrix"] = pMatrix;
							squareValue["uMVMatrix"] = squareMVMatrix;
							square.set("values", squareValue);
							//square.set("noRender", true);

							mat4.identity(pyramidMVMatrix);
							mat4.translate(pyramidMVMatrix, [-1.5, -1.5, -7.0]);
							mat4.rotate(pyramidMVMatrix, rotation * Math.PI / 180, [1, 1, 0]);
							pyramidValue = pyramid.get("values");
							pyramidValue["uPMatrix"] = pMatrix;
							pyramidValue["uMVMatrix"] = pyramidMVMatrix;
							pyramid.set("values", pyramidValue);
							//pyramid.set("noRender", true);

							mat4.identity(cubeMVMatrix);
							mat4.translate(cubeMVMatrix, [1.5, -1.5, -7.0]);
							mat4.rotate(cubeMVMatrix, rotation * Math.PI / 180, [0, 0, 1]);
							cubeValue = cube.get("values");
							cubeValue["uPMatrix"] = pMatrix;
							cubeValue["uMVMatrix"] = cubeMVMatrix;
							cube.set("values", cubeValue);
							//cube.set("noRender", true);

							// Render all and update angle
							app.renderer.view.render();
							rotation++;
						},
						1000 / 60
					);
//				},
//				2000
//			);
		};

		// Render all objects once the renderer is ready
		RendererBB.ready(app, { baseURL: config.url + "/app" }, renderObjects);
	};


	window.app = app;
	$(document).ready(app.init);

})(this, jQuery);