# renderer-bb

Javascript WebGL library based on Backbone.


## Status

In Progress - Built for [photoworld_web](https://github.com/baguetteapps/photoworld_web).


## Dependencies

- [jQuery](http://jquery.com/)
- [Underscore](http://underscorejs.org/)
- [Backbone](http://backbonejs.org/)


## Example

1. Clone this repository
2. Install node.js
3. Launch the local server - node server.js
4. Compile shaders - python shaders.py
4. Compile objects - python objects.py
5. Go to [http://127.0.0.1:1337](http://127.0.0.1:1337)
6. Browse the pages and change language


## Usage

0. Add renderer-bb.js to your scripts,
1. Compile your shaders using the python script (python shaders.py), change the path to your shaders in the script if necessary,
2. Compile your objects using the python script (python objects.py), change the path to your objects in the script if necessary,
3. ...
4. Finally, in your app, add this line:
```JS
	var my_options = { baseURL: "/path_to_shaders_and_objects_folder" };
	RendererBB.ready(my_renderer_holder, my_options, my_callback);
```
Where my_renderer_holder is where your renderer will be stored; my_options is parameters you wish to pass to the renderer (like the baseURL to your shaders and objects folder, etc); my_callback is a function to be executed once the renderer is ready.


## License

renderer-bb.js is released under the MIT license.


## Author

[Rémi Chaignon](http://www.github.com/remichaignon) - Front End Developer at Simple Energy - [@remichaignon](http://twitter.com/remichaignon)