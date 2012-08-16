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

			// Triangle's ModelView matrix
			var values = triangle.get("values");
			var mvMatrix = mat4.create();

			// Square's ModelView matrix
			values = square.get("values");
			var mvMatrix2 = mat4.create();

			var rotation = 0;

			setInterval(
				function() {
					mat4.identity(mvMatrix);
					mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
					mat4.rotate(mvMatrix, rotation * Math.PI / 180, [1, 0, 0]);
					values = triangle.get("values");
					values["uPMatrix"] = pMatrix;
					values["uMVMatrix"] = mvMatrix;
					triangle.set("values", values);

					mat4.identity(mvMatrix2);
					mat4.translate(mvMatrix2, [1.5, 0.0, -7.0]);
					mat4.rotate(mvMatrix2, rotation * Math.PI / 180, [0, 1, 0]);
					values2 = square.get("values");
					values2["uPMatrix"] = pMatrix;
					values2["uMVMatrix"] = mvMatrix2;
					square.set("values", values2);

					// Render all and update angle
					app.renderer.view.render();
					rotation++;
				},
				10
			);
		};

		// Render all objects once the renderer is ready
		RendererBB.ready(app, { baseURL: config.url + "/app" }, renderObjects);
	};


	window.app = app;
	$(document).ready(app.init);

})(this, jQuery);