document.addEventListener('DOMContentLoaded', () => {

		

	var container, stats;
	var camera, scene, renderer, splineCamera, cameraHelper, cameraEye;
	var binormal = new THREE.Vector3();
	var normal = new THREE.Vector3();
	var isClicking = false;
	var width = 600;
	var height = 600;
	var lines = getSlopeData();
	var pipes = [];
	for (var i = 0; i < lines.length; i++) {
		pipes.push( new THREE.CatmullRomCurve3(lines[i]))
	}

	var parent, tubeGeometry, group;
	var params = {
		spline: 'PipeSpline',
		scale: 3,
		extrusionSegments: 100,
		radiusSegments: 9,
		closed: false,
		animationView: false,
		lookAhead: false,
		cameraHelper: false,
	};
	var material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
	var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );

	/**
	* build a curve from points sent by the api
	*/
	function getSlopeData()
	{
		
		if(window.slopeData)
		{
			var slopePoints = window.slopeData.coordinates;
			//get min and max values
			var max = null;
			var min = null;
			for (var h = 0; h < slopePoints.length; h++) {
				for (var i = 0; i < slopePoints[h].length; i++) {
				slopePoints[h][i][0] = slopePoints[h][i][0] * Math.pow(10, 14) 
				slopePoints[h][i][1] = slopePoints[h][i][1] * Math.pow(10, 13) 
				slopePoints[h][i][2] = slopePoints[h][i][2] * Math.pow(10, 11) 
				if(!max && !min)
				{
					var max =[slopePoints[h][i][0], slopePoints[h][i][1], slopePoints[h][i][2]];
					var min =[slopePoints[h][i][0], slopePoints[h][i][1], slopePoints[h][i][2]];
				}else{
					for (var j = 0; j < min.length; j++) {
						if(min[j] > slopePoints[h][i][j])
						{
							min[j] = slopePoints[h][i][j];
						}
						if(max[j] < slopePoints[h][i][j])
						{
							max[j] = slopePoints[h][i][j];
						}
					}
				}
			}
			}
			
			//translate points
			for (var h = 0; h < slopePoints.length; h++) {
				for (var i = 0; i < slopePoints[h].length; i++) {
					slopePoints[h][i][0] = (slopePoints[h][i][0]  - min[0] - (max[0] - min[0]) / 2)  * 100 / (max[0] - min[0]) ;
					slopePoints[h][i][1] = (slopePoints[h][i][1]  - min[1] - (max[1] - min[1]) / 2) * 100 / (max[1] - min[1]) ;
					slopePoints[h][i][2]= (slopePoints[h][i][2]  - min[2] - (max[2] - min[2]) / 2) * 100 / (max[2] - min[2]) ;
				}
			}
			var vectors = [];
			for (var h = 0; h < slopePoints.length; h++) {
				vectors.push([])
				for (var i = 0; i < slopePoints[h].length; i++) {
					vectors[h].push(new THREE.Vector3( slopePoints[h][i][0],slopePoints[h][i][1], slopePoints[h][i][2]) )
				}
			}
			return vectors;
		}else{
			return [];
		}
		
	}

	function addTube() {
		if ( group !== undefined ) {
			parent.remove( group );
			group.children[ 0 ].geometry.dispose();
			group.children[ 1 ].geometry.dispose();
		}
		for (var i = 0; i < pipes.length; i++) {
			extrudePath = pipes[i];
			tubeGeometry = new THREE.TubeBufferGeometry( extrudePath, params.extrusionSegments, 2, params.radiusSegments, params.closed );
			addGeometry( tubeGeometry );
		}
		setScale();
	}
	function setScale() {
		group.scale.set( params.scale, params.scale, params.scale );
	}
	function addGeometry( geometry ) {
		// 3D shape
		group = THREE.SceneUtils.createMultiMaterialObject( geometry, [ material, wireframeMaterial ] );
		parent.add( group );
	}
	function animateCamera() {
		cameraHelper.visible = params.cameraHelper;
		cameraEye.visible = params.cameraHelper;
	}
	init();
	animate();
	function init() {
		container = document.getElementById( 'threeJsContainer' );
		// camera
		camera = new THREE.PerspectiveCamera( 50, width / height, 0.01, 10000 );
		camera.position.set( 0, 50, 500 );
		// scene
		scene = new THREE.Scene();
		// light
		var light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 0, 1 );
		scene.add( light );
		// tube
		parent = new THREE.Object3D();
		scene.add( parent );
		addTube();
		// renderer
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xf0f0f0 );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width , height );
		container.appendChild( renderer.domElement );
		
		// controls
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		// event listener
		window.addEventListener( 'resize', onWindowResize, false );
		window.addEventListener('mousedown', onMouseDown, false);
		window.addEventListener('mouseup', onMouseUp, false);
		window.addEventListener('mouseout', onMouseUp, false);
	}
	function onMouseDown(ev)
	{
		if(ev.target.parentElement.getAttribute("id") == "threeJsContainer")
		{
			isClicking = true;
			console.log("isCLick")
		}else{
			console.log(ev)
		}
	}
	function onMouseUp(ev)
	{
		isClicking = false;
	}

	function onWindowResize()
	{
		var hasChanged = false;
		var cH = height;
		var cW = width;
		if(window.innerWidth < width)
		{
			cW = window.innerWidth;
			hasChanged = true;
		}
		if(window.innerHeight < height)
		{
			cH = window.innerHeight;
			hasChanged = true;
		}

		if(hasChanged)
		{
			camera.aspect = cW/ cH;
			camera.updateProjectionMatrix();
			renderer.setSize( cW , cH);
		}
	}

	function animate() {
		if(!isClicking)
			parent.rotation.y += 0.005
		requestAnimationFrame( animate );
		render();
		/*stats.update();*/
	}
	
	function render() {
		renderer.render( scene, camera );
	}


	

})
