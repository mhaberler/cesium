window.CESIUM_BASE_URL = "../../Source/";

import {
    Ion,
    Cartesian3,
    createWorldTerrain,
    defined,
    formatError,
    Math as CesiumMath,
    objectToQuery,
    queryToObject,
    CzmlDataSource,
    GeoJsonDataSource,
    KmlDataSource,
    TileMapServiceImageryProvider,
    Viewer,
    viewerCesiumInspectorMixin,
    viewerDragDropMixin,
} from "../../Source/Cesium.js";

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

      mah extensions:
      viewFrom=angle (deg), horizontal distance, vertical distance (m)
      autostart

      needed:
      multiplier=60 # clockspeed override
      currentTime=<isotime> warp timeline
      stop=<isotime> warp timeline
      traj=url
    */

    Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Y2IxNmUzYS1jMjM2LTRiMDQtODc5My1lNzY0NWVmMmIxZGYiLCJpZCI6MTQ0MjAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjY4OTU3MzJ9.eNbRjekmhTuTUGnVnzPInXJO_1deoWNMcDIEB25fg8M";
    var endUserOptions = queryToObject(window.location.search.substring(1));

    var imageryProvider;
    if (defined(endUserOptions.tmsImageryUrl)) {
        imageryProvider = new TileMapServiceImageryProvider({
            url: endUserOptions.tmsImageryUrl,
        });
    }

    var loadingIndicator = document.getElementById("loadingIndicator");
    var viewer;
    try {
        var hasBaseLayerPicker = !defined(imageryProvider);
        viewer = new Viewer("cesiumContainer", {
            imageryProvider: imageryProvider,
            baseLayerPicker: hasBaseLayerPicker,
            scene3DOnly: endUserOptions.scene3DOnly,
            requestRenderMode: true,
            geocoder: false,
            homeButton: false,
            vrButton: true,
            shouldAnimate:  (defined(endUserOptions.autostart)) ? true : false
        });

        if (hasBaseLayerPicker) {
            var viewModel = viewer.baseLayerPicker.viewModel;
            viewModel.selectedTerrain = viewModel.terrainProviderViewModels[1];
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

        var viewFrom = endUserOptions.viewFrom;
        if (defined(viewFrom)) {
            //viewFrom=angle (deg), horizontal distance and vertical distance
            var splitQuery = viewFrom.split(/[ ,]+/);
            if (splitQuery.length == 3) {
                var angle = !isNaN(+splitQuery[0]) ? CesiumMath.toRadians(+splitQuery[0]) : 0.0;
                var hDistance = !isNaN(+splitQuery[1]) ?  +splitQuery[1] : 100.0;
                var vDistance = !isNaN(+splitQuery[2]) ?  +splitQuery[2] : 50.0;
                var viewFromC3 = new Cartesian3(-Math.sin(angle) * hDistance, -Math.cos(angle) * hDistance, vDistance);
                console.log("custom viewFrom:", viewFromC3);
            }
        }

        if (defined(loadPromise)) {
            viewer.dataSources
                .add(loadPromise)
                .then(function (dataSource) {
                    var lookAt = endUserOptions.lookAt;
                    if (defined(lookAt)) {
                        var entity = dataSource.entities.getById(lookAt);
                        if (defined(entity)) {
                            if (defined(viewFromC3)) {
                                entity.viewFrom = viewFromC3;
                                console.log("----viewFrom:", entity.viewFrom);

                            }
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
    //---
    var source2 = endUserOptions.source2;
    var sourceType2;
    if (defined(source2)) {
        // autodetect using file extension if not specified
        if (/\.czml$/i.test(source2)) {
            sourceType2 = "czml";
        } else if (
            /\.geojson$/i.test(source2) ||
                /\.json$/i.test(source2) ||
                /\.topojson$/i.test(source2)
        ) {
            sourceType2 = "geojson";
        } else if (/\.kml$/i.test(source2) || /\.kmz$/i.test(source2)) {
            sourceType2 = "kml";
        }

        var loadPromise2;
        if (sourceType2 === "czml") {
            loadPromise2 = CzmlDataSource.load(source2);
        } else if (sourceType2 === "geojson") {
            loadPromise2 = GeoJsonDataSource.load(source2);
        } else if (sourceType2 === "kml") {
            loadPromise2 = KmlDataSource.load(source2, {
                camera: scene.camera,
                canvas: scene.canvas,
            });
        } else {
            showLoadError(source2, "Unknown format.");
        }

        if (defined(loadPromise2)) {
            viewer.dataSources.add(loadPromise2);
        }
    }

    //..
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

    loadingIndicator.style.display = "none";
}

main();
