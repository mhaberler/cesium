var viewer = new Cesium.Viewer("cesiumContainer", {
  navigationHelpButton: false,
});

var builtInCzml = [
  {
    id: "document",
    version: "1.0",
    clock: {
      interval: "2012-08-04T16:00:00Z/2012-08-04T16:02:00Z",
      currentTime: "2012-08-04T16:00:00Z",
      multiplier: 1,
      range: "LOOP_STOP",
      step: "SYSTEM_CLOCK_MULTIPLIER",
    },
  },
  {
    id: "Vehicle",
    availability: "2012-08-04T16:00:00Z/2012-08-04T16:02:00Z",
    viewFrom: {
      cartesian: [-200, 50, 50],
    },
    billboard: {
      eyeOffset: {
        cartesian: [0.0, 0.0, 0.0],
      },
      horizontalOrigin: "CENTER",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEISURBVEhLvVXBDYQwDOuojHKj8LhBbpTbpBCEkZsmIVTXq1RVQGrHiWlLmTTqPiZBlyLgy/KSZQ5JSHDQ/mCYCsC8106kDU0AdwRnvYZArWRcAl0dcYJq1hWCb3hBrumbDAVMwAC82WoRvgMnVMDBnB0nYZFTbE6BBvdUGqVqCbjBIk3PyFFR/NU7EKzru+qZsau3ryPwwCRLKYOzutZuCL6fUmWeJGzNzL/RxAMrUmASSCkkAayk2IxPlwhAAYGpsiHQjbLccfdOY5gKkCXAMi7SscAwbQpAnKyctWyUZ6z8ja3OGMepwD8asz+9FnSvbhU8uVOHFIwQsI3/p0CfhuqCSQuxLqsN6mu8SS+N42MAAAAASUVORK5CYII=",
      pixelOffset: {
        cartesian2: [0.0, 0.0],
      },
      scale: 0.8,
      show: true,
      verticalOrigin: "BOTTOM",
    },
    label: {
      fillColor: {
        rgba: [255, 255, 0, 255],
      },
      font: "bold 10pt Segoe UI Semibold, sans-serif",
      horizontalOrigin: "LEFT",
      outlineColor: {
        rgba: [0, 0, 0, 255],
      },
      pixelOffset: {
        cartesian2: [10.0, 0.0],
      },
      scale: 1.0,
      show: true,
      style: "FILL",
      text: "Vehicle",
      verticalOrigin: "CENTER",
    },
    path: {
      material: {
        solidColor: {
          color: {
            rgba: [255, 255, 0, 255],
          },
        },
      },
      width: 5.0,
      show: true,
    },
    position: {
      interpolationAlgorithm: "LAGRANGE",
      interpolationDegree: 1,
      epoch: "2012-08-04T16:00:00Z",
      cartesian: [
        0.0,
        1254962.0093268978,
        -4732330.528380746,
        4074172.505865612,
        120.0,
        1256995.7322857284,
        -4732095.2154790815,
        4073821.2249589274,
      ],
    },
  },
];

var dataSource = new Cesium.CzmlDataSource();
viewer.dataSources.add(dataSource);
dataSource.load(builtInCzml).then(function () {
  // Track with camera
  viewer.trackedEntity = dataSource.entities.getById("Vehicle");
});
