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
			mat4.identity(mvMatrix);
			mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
			values["uPMatrix"] = pMatrix;
			values["uMVMatrix"] = mvMatrix;
			triangle.set("values", values);

			// Square's ModelView matrix
			values = square.get("values");
			var mvMatrix2 = mat4.create();
			mat4.identity(mvMatrix2);
			mat4.translate(mvMatrix2, [1.5, 0.0, -7.0]);
			values["uPMatrix"] = pMatrix;
			values["uMVMatrix"] = mvMatrix2;
			square.set("values", values);

			// Render all
			app.renderer.view.render();
		};

		// Render all objects once the renderer is ready
		RendererBB.ready(app, { baseURL: config.url + "/app" }, renderObjects);
	};


	window.app = app;
	$(document).ready(app.init);

})(this, jQuery);