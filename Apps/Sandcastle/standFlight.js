window.CESIUM_BASE_URL = "../../Source/";

import {
  Cartesian3,
  Cartographic,
  Credit,
  CzmlDataSource,
  GeoJsonDataSource,
  HeadingPitchRoll,
  Ion,
  KmlDataSource,
  Math as CesiumMath,
  Math,
  ProviderViewModel,
  Quaternion,
  Rectangle,
  ReferenceFrame,
  SampledPositionProperty,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  TileMapServiceImageryProvider,
  Transforms,
  VelocityOrientationProperty,
  VelocityVectorProperty,
  Viewer,
  WebMapTileServiceImageryProvider,
  createDefaultImageryProviderViewModels,
  createWorldTerrain,
  defined,
  formatError,
  objectToQuery,
  queryToObject,
  viewerCesiumInspectorMixin,
  viewerDragDropMixin,
  knockout,
} from "../../Source/Cesium.js";

var czml = [
  {
    id: "document",
    version: "1.0",
    name: "document",
    description: "document description from prolog",
    clock: {
      interval: "2021-05-24T04:21:32Z/2021-05-24T04:55:27Z",
      currentTime: "2021-05-24T04:21:32Z",
      multiplier: 2.0,
      range: "LOOP_STOP",
      step: "SYSTEM_CLOCK_MULTIPLIER",
    },
  },

  {
    id: "track0",
    name: "track visualisation",
    description: "description",
    availability: "2021-05-24T04:21:32Z/2021-05-24T04:55:27Z",
    properties: {
      //  constant_property: true,
      burner_intervals: [
        {
          interval: "2021-05-24T04:21:32Z/2021-05-24T04:21:08Z",
          number: 2,
        },
        {
          interval: "2021-05-24T04:22:32Z/2021-05-24T04:22:36Z",
          number: 1,
        },
        {
          interval: "2021-05-24T04:53:32Z/2021-05-24T04:53:40Z",
          number: 1,
        },
      ],
      temperature: {
        epoch: "2021-05-24T04:21:32Z",
        interpolationAlgorithm: "LINEAR",
        // "interpolationDegree": 3,
        number: [
          // seconds offset from epoch, value
          0.0,
          42,
          840.0,
          104,
          2035.0,
          59.0,
        ],
      },
      basket_orientation: {
        epoch: "2021-05-24T04:21:32Z",
        interpolationAlgorithm: "LINEAR",
        // "interpolationDegree": 3,
        number: [
          // seconds offset from epoch, value
          0.0,
          0,
          60,
          89,
          120,
          359,
          840,
          180,
          2035.0,
          20,
        ],
      },
    },

    position: {
      epoch: "2021-05-24T04:21:32Z",
      interpolationAlgorithm: "LAGRANGE",
      interpolationDegree: 3,
      cartographicDegrees: [
        0.0,
        15.632979,
        48.44614,
        370.0,
        3.0,
        15.632979,
        48.446148,
        369.0,
        445.0,
        15.600128,
        48.460968,
        1009.0,
        657.0,
        15.574837,
        48.482864,
        1242.0,
        675.0,
        15.572741,
        48.484657,
        1247.0,
        760.0,
        15.562637,
        48.493271,
        1190.0,
        840.0,
        15.552629,
        48.501537,
        1248.0,
        1216.0,
        15.502874,
        48.531284,
        675.0,
        1222.0,
        15.502369,
        48.531437,
        674.0,
        1260.0,
        15.49902,
        48.532372,
        696.0,
        1349.0,
        15.491514,
        48.534107,
        636.0,
        1531.0,
        15.473248,
        48.538158,
        733.0,
        1990.0,
        15.448418,
        48.544579,
        604.0,
        2022.0,
        15.44841,
        48.544613,
        620.0,
        2035.0,
        15.448427,
        48.544617,
        615.0,
      ],
    },
    model: {
      gltf: "https://static.mah.priv.at/cors/D-OTNI.glb",
      scale: 1.0,
      minimumPixelSize: 64,
    },
    path: {
      leadTime: 0,
      trailTime: 100000,
      width: 6,
      resolution: 5,
      material: {
        polylineOutline: {
          color: {
            rgba: [255, 0, 0, 64],
          },
          outlineColor: {
            rgba: [0, 255, 0, 64],
          },
          outlineWidth: 4,
        },
      },
    },
  },
];

// var pitch = 0;
// var roll = 0;
// var basket_heading;
// var hpr;

function main() {
  /*
      Options parsed from query string:
      source=url          The URL of a CZML/GeoJSON/KML data source to load at startup.
      Automatic data type detection uses file extension.
      sourceType=czml/geojson/kml
      Override data type detection for source.
      flyTo=false         Don't automatically fly to the loaded source.
      tmsImageryUrl=url   Automatically use a TMS imagery provider.
      lookAt=id           The ID of the entity to track at startup.
      stats=true          Enable the FPS performance display.
      inspector=true      Enable the inspector widget.
      debug=true          Full WebGL error reporting at substantial performance cost.
      theme=lighter       Use the dark-text-on-light-background theme.
      scene3DOnly=true    Enable 3D only mode.
      view=longitude,latitude,[height,heading,pitch,roll]
      Automatically set a camera view. Values in degrees and meters.
      [height,heading,pitch,roll] default is looking straight down, [300,0,-90,0]
      saveCamera=false    Don't automatically update the camera view in the URL when it changes.
    */

  var flightOrientation;
  var compass;
  var speed;
  var temperature;
  var altitude;
  var velocityVectorProperty;
  var velocityVector = new Cartesian3();
  var burnerstate = 0;

  // var viewModel = {
  //     alpha : 1,
  //     brightness : 1,
  //     saturation : 1,
  // };
  // knockout.track(viewModel);
  // var toolbar = document.getElementById('toolbar');
  // knockout.applyBindings(viewModel, toolbar);

  Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YmJlMzAyYy1hZTY4LTQ4OTUtYTIxMS02NTBlYzc1MDcxNTAiLCJpZCI6MTQ0MjAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjU0NzE5Mzl9.j9eQVA5txZG-lRmcUBEwgzRuAWzd0fPxgf5LmM_xNLU";

  var endUserOptions = queryToObject(window.location.search.substring(1));

  var imageryProvider;
  if (defined(endUserOptions.tmsImageryUrl)) {
    imageryProvider = new TileMapServiceImageryProvider({
      url: endUserOptions.tmsImageryUrl,
    });
  }
  var imageryViewModels = createDefaultImageryProviderViewModels();

  imageryViewModels.push(
    new ProviderViewModel({
      name: "Austria Basemap",
      iconUrl:
        "http://www.geoland.at/assets/images/IndexGrid/basemap_hover_en.png",
      tooltip: "Austrian OGD Basemap.\nhttps://www.basemap.at/index_en.html",
      creationFunction: function () {
        return new WebMapTileServiceImageryProvider({
          url:
            "https://maps{s}.wien.gv.at/basemap/bmaporthofoto30cm/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
          layer: "bmaporthofoto30cm",
          style: "normal",
          format: "image/jpeg",
          tileMatrixSetID: "google3857",
          subdomains: "1234",
          maximumLevel: 19,
          rectangle: Rectangle.fromDegrees(8.782379, 46.35877, 17.5, 49.037872),
          credit: new Credit(
            '<a href="https://www.basemap.at/" target="_blank">Datenquelle: basemap.at</a>',
            true
          ),
        });
      },
    })
  );
  // Select one from the existing list to be currently active.
  var selectedImagery = imageryViewModels[imageryViewModels.length - 1];

  var loadingIndicator = document.getElementById("loadingIndicator");
  // burnerled = document.getElementById("burner");

  var viewer;
  try {
    var hasBaseLayerPicker = !defined(imageryProvider);
    viewer = new Viewer("cesiumContainer", {
      imageryProviderViewModels: imageryViewModels,
      selectedImageryProviderViewModel: selectedImagery,

      imageryProvider: imageryProvider,
      baseLayerPicker: hasBaseLayerPicker,
      scene3DOnly: endUserOptions.scene3DOnly,
      // selectionIndicator: false, //Disable selection indicator
      //     infoBox: false, //Disable InfoBox widget
      requestRenderMode: true,
      geocoder: false,
      homeButton: false,
      vrButton: true,
    });
    // viewer.imageryLayers.addImageryProvider(austriaMap);

    if (hasBaseLayerPicker) {
      var __viewModel = viewer.baseLayerPicker.viewModel;
      __viewModel.selectedTerrain = __viewModel.terrainProviderViewModels[1];
    } else {
      viewer.terrainProvider = createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
      });
    }
  } catch (exception) {
    loadingIndicator.style.display = "none";
    var message = formatError(exception);
    console.error(message);
    if (!document.querySelector(".cesium-widget-errorPanel")) {
      //eslint-disable-next-line no-alert
      window.alert(message);
    }
    return;
  }

  Sandcastle.addToggleButton(
    "Ground atmosphere",
    // globe.showGroundAtmosphere,
    viewer,
    function (checked) {
      console.log(checked);
      //globe.showGroundAtmosphere = checked;
    }
  );

  // knockout.getObservable(viewModel, 'alpha').subscribe(
  //     function(newValue) {
  //         console.log("now the alpha is : " + newValue);
  //         imageryLayers.get(0).brightness = viewModel.alpha;
  //     }
  // );

  // knockout.getObservable(viewModel, 'brightness').subscribe(
  //     function(newValue) {
  //         console.log("now the brightness is : " + newValue);
  //         imageryLayers.get(0).brightness = viewModel.brightness;
  //     }
  // );

  // knockout.getObservable(viewModel, 'saturation').subscribe(
  //     function(newValue) {
  //         console.log("now the saturation is : " + newValue);
  //         imageryLayers.get(0).saturation = viewModel.saturation;
  //     }
  // );

  viewer.extend(viewerDragDropMixin);
  if (endUserOptions.inspector) {
    viewer.extend(viewerCesiumInspectorMixin);
  }

  var showLoadError = function (name, error) {
    var title = "An error occurred while loading the file: " + name;
    var message =
      "An error occurred while loading the file, which may indicate that it is invalid.  A detailed error report is below:";
    viewer.cesiumWidget.showErrorPanel(title, message, error);
  };

  viewer.dropError.addEventListener(function (viewerArg, name, error) {
    showLoadError(name, error);
  });

  var scene = viewer.scene;
  var context = scene.context;
  if (endUserOptions.debug) {
    context.validateShaderProgram = true;
    context.validateFramebuffer = true;
    context.logShaderCompilation = true;
    context.throwOnWebGLError = true;
  }

  var view = endUserOptions.view;
  var source = endUserOptions.source;
  if (defined(source)) {
    var sourceType = endUserOptions.sourceType;
    if (!defined(sourceType)) {
      // autodetect using file extension if not specified
      if (/\.czml$/i.test(source)) {
        sourceType = "czml";
      } else if (
        /\.geojson$/i.test(source) ||
        /\.json$/i.test(source) ||
        /\.topojson$/i.test(source)
      ) {
        sourceType = "geojson";
      } else if (/\.kml$/i.test(source) || /\.kmz$/i.test(source)) {
        sourceType = "kml";
      }
    }

    var loadPromise;
    if (sourceType === "czml") {
      loadPromise = CzmlDataSource.load(source);
    } else if (sourceType === "geojson") {
      loadPromise = GeoJsonDataSource.load(source);
    } else if (sourceType === "kml") {
      loadPromise = KmlDataSource.load(source, {
        camera: scene.camera,
        canvas: scene.canvas,
      });
    } else {
      showLoadError(source, "Unknown format.");
    }

    if (defined(loadPromise)) {
      viewer.dataSources
        .add(loadPromise)
        .then(function (dataSource) {
          var lookAt = endUserOptions.lookAt;
          if (defined(lookAt)) {
            var entity = dataSource.entities.getById(lookAt);
            if (defined(entity)) {
              viewer.trackedEntity = entity;
            } else {
              var error =
                'No entity with id "' +
                lookAt +
                '" exists in the provided data source.';
              showLoadError(source, error);
            }
          } else if (!defined(view) && endUserOptions.flyTo !== "false") {
            viewer.flyTo(dataSource);
          }
        })
        .otherwise(function (error) {
          showLoadError(source, error);
        });
    }
  }

  if (endUserOptions.stats) {
    scene.debugShowFramesPerSecond = true;
  }

  var theme = endUserOptions.theme;
  if (defined(theme)) {
    if (endUserOptions.theme === "lighter") {
      document.body.classList.add("cesium-lighter");
      viewer.animation.applyThemeChanges();
    } else {
      var error = "Unknown theme: " + theme;
      viewer.cesiumWidget.showErrorPanel(error, "");
    }
  }

  if (defined(view)) {
    var splitQuery = view.split(/[ ,]+/);
    if (splitQuery.length > 1) {
      var longitude = !isNaN(+splitQuery[0]) ? +splitQuery[0] : 0.0;
      var latitude = !isNaN(+splitQuery[1]) ? +splitQuery[1] : 0.0;
      var height =
        splitQuery.length > 2 && !isNaN(+splitQuery[2])
          ? +splitQuery[2]
          : 300.0;
      var heading =
        splitQuery.length > 3 && !isNaN(+splitQuery[3])
          ? CesiumMath.toRadians(+splitQuery[3])
          : undefined;
      var pitch =
        splitQuery.length > 4 && !isNaN(+splitQuery[4])
          ? CesiumMath.toRadians(+splitQuery[4])
          : undefined;
      var roll =
        splitQuery.length > 5 && !isNaN(+splitQuery[5])
          ? CesiumMath.toRadians(+splitQuery[5])
          : undefined;

      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll,
        },
      });
    }
  }

  var camera = viewer.camera;
  function saveCamera() {
    var position = camera.positionCartographic;
    var hpr = "";
    if (defined(camera.heading)) {
      hpr =
        "," +
        CesiumMath.toDegrees(camera.heading) +
        "," +
        CesiumMath.toDegrees(camera.pitch) +
        "," +
        CesiumMath.toDegrees(camera.roll);
    }
    endUserOptions.view =
      CesiumMath.toDegrees(position.longitude) +
      "," +
      CesiumMath.toDegrees(position.latitude) +
      "," +
      position.height +
      hpr;
    history.replaceState(undefined, "", "?" + objectToQuery(endUserOptions));
  }

  var timeout;
  if (endUserOptions.saveCamera !== "false") {
    camera.changed.addEventListener(function () {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(saveCamera, 1000);
    });
  }

  compass = new RadialGauge({
    renderTo: "compass",
    width: 200,
    height: 200,
    minValue: 0,
    maxValue: 360,
    majorTicks: ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"],
    minorTicks: 2,
    ticksAngle: 360,
    startAngle: 180,
    strokeTicks: false,
    highlights: false,
    colorPlate: "#21216F" /* blue plate color : #33a*/,
    colorMajorTicks: "#f5f5f5",
    colorMinorTicks: "#ddd",
    colorNumbers: "#ccc" /* grey = #ccc */,
    colorNeedle: "rgba(240, 128, 128, 1)",
    colorNeedleEnd: "rgba(255, 160, 122, .9)",
    valueBox: false,
    valueTextShadow: false,
    colorNeedleCircleInner: "#fff" /* #fff = white */,
    colorNeedleCircleOuter: "#ccc",
    needleCircleSize: 15,
    needleCircleOuter: false,
    animationRule: "linear",
    needleType: "line" /* arrow or line */,
    needleStart: 40 /*70 - needle tail length*/,
    needleEnd: 60 /*99 - needle head length */,
    needleWidth: 3,
    borders: true,
    borderInnerWidth: 0,
    borderMiddleWidth: 0,
    borderOuterWidth: 10,
    colorBorderOuter: "#ccc",
    colorBorderOuterEnd: "#ccc",
    colorNeedleShadowDown: "#222",
    borderShadowWidth: 0,
    animationTarget: "plate" /* needle or plate*/,
    units: "ᵍ",
    title: "Heading",
    fontTitleSize: 19,
    colorTitle: "#f5f5f5",
    animationDuration: 1500,
    value: 360,
    animateOnInit: true,
  }).draw();

  altitude = new LinearGauge({
    renderTo: "altitude",
    width: 200,
    height: 60,
    minValue: 0,
    maxValue: 2000,
    majorTicks: ["0", "500", "1000", "1500", "2000"],
    minorTicks: 5,
    strokeTicks: true,
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    barBeginCircle: false,
    tickSide: "left",
    numberSide: "left",
    needleSide: "left",
    needleType: "line",
    needleWidth: 3,
    colorNeedle: "#222",
    colorNeedleEnd: "#222",
    animationDuration: 1500,
    animationRule: "linear",
    animationTarget: "plate",
    barWidth: 5,
    title: "Altitude m",
    ticksWidth: 50,
    ticksWidthMinor: 15,
  }).draw();

  speed = new LinearGauge({
    renderTo: "speed",
    width: 200,
    height: 60,
    minValue: 0,
    maxValue: 100,
    majorTicks: [
      "0",
      "20",
      "40",
      "60",
      "80",
      "100",
      // "120",
      // "140",
      // "160"
    ],
    minorTicks: 5,
    strokeTicks: true,
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    barBeginCircle: false,
    tickSide: "left",
    numberSide: "left",
    needleSide: "left",
    needleType: "line",
    needleWidth: 3,
    colorNeedle: "#222",
    colorNeedleEnd: "#222",
    animationDuration: 1500,
    animationRule: "linear",
    animationTarget: "plate",
    barWidth: 5,
    title: "Speed",
    ticksWidth: 50,
    ticksWidthMinor: 15,
  }).draw();

  temperature = new LinearGauge({
    renderTo: "temperature",
    width: 200,
    height: 60,
    minValue: 40,
    maxValue: 140,
    majorTicks: ["40", "60", "80", "100", "120", "140"],
    highlights: [
      {
        from: 80,
        to: 140,
        color: "rgba(200, 50, 50, .75)",
      },
    ],
    minorTicks: 5,
    strokeTicks: true,
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    barBeginCircle: false,
    tickSide: "left",
    numberSide: "left",
    needleSide: "left",
    needleType: "line",
    needleWidth: 3,
    colorNeedle: "#222",
    colorNeedleEnd: "#222",
    animationDuration: 1500,
    animationRule: "linear",
    animationTarget: "plate",
    barWidth: 5,
    title: "Temperature °",
    ticksWidth: 50,
    ticksWidthMinor: 15,
  }).draw();

  loadingIndicator.style.display = "none";

  viewer.dataSources.dataSourceAdded.addEventListener(function (
    collection,
    dataSource
  ) {
    var entities = dataSource.entities.values;
    for (var i = 0; i < entities.length; i++) {
      var entity = entities[i];
      console.log(entity);
    }
  });

  var handler = new ScreenSpaceEventHandler(scene.canvas);
  handler.setInputAction(function (movement) {
    if (viewer.selectedEntity) {
      flightOrientation = new VelocityOrientationProperty(
        viewer.selectedEntity.position
      );
      velocityVectorProperty = new VelocityVectorProperty(
        viewer.selectedEntity.position,
        false
      );
      console.log("select:", viewer.selectedEntity.id, viewer.selectedEntity);
    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  viewer.clock.onTick.addEventListener(function (clock) {
    if (viewer.selectedEntity) {
      const position = viewer.selectedEntity.position.getValue(
        clock.currentTime
      );
      const carto = Cartographic.fromCartesian(position);
      altitude.value = carto.height;

      // const lat = Math.toDegrees(carto.latitude);
      // const lon = Math.toDegrees(carto.longitude);

      const orientation = flightOrientation.getValue(clock.currentTime);
      if (orientation) {
        const heading = Math.toDegrees(Quaternion.computeAngle(orientation));
        compass.value = (heading + 180) % 360;
      }
      velocityVectorProperty.getValue(clock.currentTime, velocityVector);
      if (velocityVector) {
        var kmPerHour = Cartesian3.magnitude(velocityVector) * 3.6;
        speed.value = kmPerHour;
      }

      var bs = viewer.selectedEntity.properties.burner_intervals.getValue(
        clock.currentTime
      );
      if (bs != burnerstate) {
        console.log("burner change to: ", bs);
        burnerstate = bs;
      }

      temperature.value = viewer.selectedEntity.properties.temperature.getValue(
        clock.currentTime
      );

      var basket_heading = viewer.selectedEntity.properties.basket_orientation.getValue(
        clock.currentTime
      );
      if (basket_heading) {
        // https://github.com/CesiumGS/cesium/pull/6738#issuecomment-401419826
        var pitch = 0;
        var roll = 0;
        var hpr = new HeadingPitchRoll(
          Math.toRadians(basket_heading),
          pitch,
          roll
        );
        var basket_orientation = Transforms.headingPitchRollQuaternion(
          position,
          hpr
        );
        viewer.selectedEntity.orientation = basket_orientation;
      }
    }
  });

  if (endUserOptions.builtin) {
    viewer.dataSources.add(CzmlDataSource.load(czml)).then(function (ds) {
      // var entity = ds.entities.getById('path');
      // // viewer.trackedEntity = entity;
      // var flightOrientation =  new VelocityOrientationProperty(entity.position);
      // entity.position.setInterpolationOptions({
      //     interpolationDegree : 1,
      //     interpolationAlgorithm : Cesium.HermitePolynomialApproximation
      // });
    });
  }
}

main();
