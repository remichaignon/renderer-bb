//
// renderer-bb.js
//
// Javascript WebGL library based on Backbone.
//
// ============================================================================
//
// SHADER MODEL
// SHADER COLLECTION
// SHADER READY
// OBJECT MODEL
// OBJECT COLLECTION
// OBJECT READY
// RENDERER MODEL
// RENDERER VIEW
// RENDERER READY
//
// ============================================================================
//


(function() {

	RendererBB = {};


	///////////////////////////////////////////////////////////////////////////
	// SHADER MODEL

	RendererBB.ShaderModel = Backbone.Model.extend({
		defaults: {
			name: null, // Required
			locations: null,
			program: null,
			bound: false
		},
		// Initialize and build the shader's program
		initialize: function(args, options) {
			if (!this.get("bound")) {
				var gl = options.collection.gl;

				// Compile the shader's source
				this.compile(gl);
				// Link the fragment and the vertex shaders
				this.link(gl);
				// Bind the program and the locations
				this.bind(gl);
			}
		},
		// Compile the shader's source
		compile: function(gl) {
			if (_.isUndefined(this.get("fragmentObject")) && _.isUndefined(this.get("vertexObject"))) {
				// Fragment
				var fragmentObject = gl.createShader(gl.FRAGMENT_SHADER);

				// Compile fragment shader
				gl.shaderSource(fragmentObject, this.get("fragment"));
				gl.compileShader(fragmentObject);

				// Check for errors and set attributes
				if (!gl.getShaderParameter(fragmentObject, gl.COMPILE_STATUS)) {
					console.log(gl.getShaderInfoLog(fragmentObject));
					return null;
				}
				this.unset("fragment");
				this.set("fragmentObject", fragmentObject);

				// Vertex
				var vertexObject = gl.createShader(gl.VERTEX_SHADER);

				// Compile vertex shader
				gl.shaderSource(vertexObject, this.get("vertex"));
				gl.compileShader(vertexObject);

				// Check for errors and set attributes
				if (!gl.getShaderParameter(vertexObject, gl.COMPILE_STATUS)) {
					console.log(gl.getShaderInfoLog(vertexObject));
					return null;
				}
				this.unset("vertex");
				this.set("vertexObject", vertexObject);
			}
		},
		// Link the fragment and the vertex shaders
		link: function(gl) {
			if (_.isNull(this.get("program"))) {
				// Create program
				var program = gl.createProgram();

				// Attach and link shaders
				gl.attachShader(program, this.get("fragmentObject"));
				gl.attachShader(program, this.get("vertexObject"));
				gl.linkProgram(program);

				// Check for errors and set attributes
				if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
					console.log("Could not initialise shaders");
				}
				this.unset("fragmentObject");
				this.unset("vertexObject");
				this.set("program", program);
			}
		},
		// Bind the program and the locations
		bind: function(gl) {
			if (!this.get("bound")) {
				var locations = this.get("locations");
				var program = this.get("program");
				gl.useProgram(program);

				for (var name in locations) {
					if ("a" === name[0]) {
						// Attribute
						if (-1 !== locations[name]) {
							// Bind attribute location
							gl.bindAttribLocation(program, locations[name], name);
						}
						else {
							// Get attribute location
							locations[name] = gl.getAttribLocation(program, name);
						}
					}
					else {
						// Uniform
						if ("u" === name[0]) {
							// Get uniform location
							locations[name] = gl.getUniformLocation(program, name);
						}
					}
				}

				// Set the shader as being bound and ready
				this.set("bound", true);
			}
		},
		// Set this program as current
		use: function(gl) {
			gl.useProgram(this.get("program"));
		}
	});


	///////////////////////////////////////////////////////////////////////////
	// SHADER COLLECTION

	RendererBB.ShaderCollection = Backbone.Collection.extend({
		url: null, // Required
		gl: null,
		isReady: false,
		model: RendererBB.ShaderModel,
		// Initialize parameters
		initialize: function(args, options) {
			// Extend/Overwrite the parameters with the options in arguments
			_.extend(this, options);
		},
		// Parse the data returned by fetch()
		parse: function(data) {
			// Make sure valid data is returned
			if (!_.isUndefined(data) && data.length >= 1) {
				// Loop through shaders
				for (var index in data) {
					// Fragment source was returned
					if (!_.isUndefined(data[index].fragment)) {
						// Decode fragment source
						data[index].fragment = $("<div/>").html(data[index].fragment).text();
					}
					// Vertex source was returned
					if (!_.isUndefined(data[index].vertex)) {
						// Decode vertex source
						data[index].vertex = $("<div/>").html(data[index].vertex).text();
					}
					// Locations were returned
					if (!_.isUndefined(data[index].locations)) {
						// Parse and decode locations of attribs and uniforms
						data[index].locations = $.parseJSON($("<div/>").html(data[index].locations).text());
					}
				}
			}

			return data;
		}
	});


	///////////////////////////////////////////////////////////////////////////
	// SHADER READY

	RendererBB.shadersReady = function(renderer, options, callback) {
		// Make sure shaders are loaded
		if (!_.isNull(renderer.get("shaders")) && renderer.get("shaders").isReady) {
			// Shaders have already been fetched...
			if (_.isFunction(callback)) {
				callback();
			}
		}
		else {
			// Create and load shaders
			renderer.set("shaders", new RendererBB.ShaderCollection(null, _.extend(options, { gl: renderer.view.gl })));
			renderer.get("shaders").fetch().done(function() {
				renderer.get("shaders").isReady = true;

				// All the shaders have been fetched, let's get to business...
				if (_.isFunction(callback)) {
					callback();
				}
			});
		}
	};


	///////////////////////////////////////////////////////////////////////////
	// OBJECT MODEL

	RendererBB.ObjectModel = Backbone.Model.extend({
		defaults: {
			name: null, // Required
			shader: null,
			values: null,
			buffers: null,
			arrayBuffer: null,
			elementArrayBuffer: null,
			setUp: null,
			tearDown: null,
			noRender: false
		},
		// Initialize with parameters
		initialize: function(args, options) {
			var renderer = options.collection.renderer;
			var gl = renderer.view.gl;

			// Create and build vertices array buffer
			if (_.isObject(this.get("vertices")) &&
				_.isArray(this.get("vertices").buffer) &&
				_.isFinite(this.get("vertices").size) &&
				_.isFinite(this.get("vertices").count)) {

				var arrayBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.get("vertices").buffer), gl.STATIC_DRAW);
				arrayBuffer.size = this.get("vertices").size;
				arrayBuffer.count = this.get("vertices").count;

				this.set("arrayBuffer", arrayBuffer);
				this.unset("vertices");
			}
			else {
				console.log("No valid vertices for this object '" + this.get("name") + "'.");
				this.destroy();
				return;
			}

			// Create and build indices element array buffer (if necessary)
			if (_.isObject(this.get("indices")) &&
				_.isArray(this.get("indices").buffer) &&
				_.isFinite(this.get("indices").size) &&
				_.isFinite(this.get("indices").count)) {

				var elementArrayBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementArrayBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.get("indices").buffer), gl.STATIC_DRAW);
				elementArrayBuffer.size = this.get("indices").size;
				elementArrayBuffer.count = this.get("indices").count;

				this.set("elementArrayBuffer", elementArrayBuffer);
				this.unset("indices");
			}

			// Create and build colors array buffer (if necessary)
			// Create and build texture coordinates array buffer (if necessary)

			// Set drawing mode from string
			switch (this.get("mode")) {
				case "LINES": this.set("mode", gl.LINES); break;
				case "LINE_LOOP": this.set("mode", gl.LINE_LOOP); break;
				case "LINE_STRIP": this.set("mode", gl.LINE_STRIP); break;
				case "POINTS": this.set("mode", gl.POINTS); break;
				case "TRIANGLE_FAN": this.set("mode", gl.TRIANGLE_FAN); break;
				case "TRIANGLE_STRIP": this.set("mode", gl.TRIANGLE_STRIP); break;
				default: this.set("mode", gl.TRIANGLES); break;
			}

			// Retrieve shader
			this.set("shader", renderer.get("shaders").where({ name: this.get("shader_name") })[0]);
			this.unset("shader_name");

			// Duplicate locations as values
			this.set("values",  $.extend(true, {}, this.get("shader").get("locations")));
		},
		render: function(gl) {
			if (!this.get("noRender")) {
				this.get("shader").use(gl);

				// Set up WebGL
				var setUp = this.get("setUp");
				if (_.isFunction(setUp)) {
					setUp(gl);
				}

				// HACK
				// Set uniforms
				gl.uniformMatrix4fv(this.get("shader").get("locations")["uPMatrix"], false, this.get("values")["uPMatrix"]);
				gl.uniformMatrix4fv(this.get("shader").get("locations")["uMVMatrix"], false, this.get("values")["uMVMatrix"]);

				// Draw arrays
				gl.bindBuffer(gl.ARRAY_BUFFER, this.get("arrayBuffer"));
				gl.enableVertexAttribArray(this.get("shader").get("locations")["aVertexPosition"]);
				gl.vertexAttribPointer(this.get("shader").get("locations")["aVertexPosition"], this.get("arrayBuffer").size, gl.FLOAT, false, 0, 0);

				if (_.isNull(this.get("elementArrayBuffer"))) {
					gl.drawArrays(this.get("mode"), 0, this.get("arrayBuffer").count);
				}
				else {
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.get("elementArrayBuffer"));
					gl.drawElements(this.get("mode"), this.get("elementArrayBuffer").count, gl.UNSIGNED_SHORT, 0);
				}

				gl.disableVertexAttribArray(this.get("shader").get("locations")["aVertexPosition"]);

				// Tear down WebGL
				var tearDown = this.get("tearDown");
				if (_.isFunction(tearDown)) {
					tearDown(gl);
				}
			}
		}
	});


	///////////////////////////////////////////////////////////////////////////
	// OBJECT COLLECTION

	RendererBB.ObjectCollection = Backbone.Collection.extend({
		url: null, // Required
		gl: null,
		isReady: false,
		model: RendererBB.ObjectModel,
		// Initialize parameters
		initialize: function(args, options) {
			// Extend/Overwrite the parameters with the options in arguments
			_.extend(this, options);
		}
	});


	///////////////////////////////////////////////////////////////////////////
	// OBJECT READY

	RendererBB.objectsReady = function(renderer, options, callback) {
		// Make sure objects are loaded
		if (!_.isNull(renderer.get("objects")) && renderer.get("objects").isReady) {
			// Objects have already been fetched...
			if (_.isFunction(callback)) {
				callback();
			}
		}
		else {
			// Create and load objects
			renderer.set("objects", new RendererBB.ObjectCollection(null, _.extend(options, { renderer: renderer })));
			renderer.get("objects").fetch().done(function() {
				renderer.get("objects").isReady = true;

				// All the objects have been fetched, let's get to business...
				if (_.isFunction(callback)) {
					callback();
				}
			});
		}
	};


	///////////////////////////////////////////////////////////////////////////
	// RENDERER MODEL

	RendererBB.RendererModel = Backbone.Model.extend({
		defaults: {
			shaders: null,
			objects: null,
			setUp: null, // Optional
			tearDown: null // Optional
		},
		initialize: function(args, options) {}
	});


	///////////////////////////////////////////////////////////////////////////
	// RENDERER VIEW

	RendererBB.RendererView = Backbone.View.extend({
		el: "canvas",
		gl: null,
		events: {},
		initialize: function(args, options) {
			// Extend/Overwrite the parameters with the options passed in arguments
			_.extend(this, options);

			var gl;

			// Get canvas
			var canvas = this.$el[0];
			if (_.isNull(canvas)) {
				console.log("Canvas not available!");
				return;
			}

			// Initialize WebGL
			try {
				gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
				gl.viewportWidth = canvas.width;
				gl.viewportHeight = canvas.height;
			}
			catch (e) {}

			if (_.isNull(gl)) {
				console.log("WebGL not available!");
				return;
			}

			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
			this.gl = gl;
		},
		render: function() {
			var gl = this.gl;

			// Clear buffers
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			// Set up WebGL
			var setUp = this.model.get("setUp");
			if (_.isFunction(setUp)) {
				setUp(gl);
			}

			// Loop through the objects
			_.each(
				this.model.get("objects").models,
				function(object) {
					object.render(gl);
				}
			);

			// Tear down WebGL
			var tearDown = this.model.get("tearDown");
			if (_.isFunction(tearDown)) {
				tearDown(gl);
			}
		}
	});


	///////////////////////////////////////////////////////////////////////////
	// RENDERER READY

	RendererBB.ready = function(holder, options, callback) {
		// Build renderer
		holder.renderer = new RendererBB.RendererModel(null, options);
		holder.renderer.view = new RendererBB.RendererView({ model: holder.renderer });

		// Make sure shaders are loaded first
		var whenShadersReady = function() {
			// Then make sure the objects are loaded
			var whenObjectsReady = function() {
				// Execute callback
				if (_.isFunction(callback)) {
					callback();
				}
			};

			// Load objects
			RendererBB.objectsReady(holder.renderer, { url: options.baseURL + "/objects/objects.json" }, whenObjectsReady);
		};

		// Load shaders
		RendererBB.shadersReady(holder.renderer, { url: options.baseURL + "/shaders/shaders.json" }, whenShadersReady);
	};

}).call(this);