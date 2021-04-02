import { MetadataClass, TileMetadata } from "../../Source/Cesium.js";

describe("Scene/TileMetadata", function () {
  var tileClass = new MetadataClass({
    id: "tile",
    class: {
      properties: {
        color: {
          type: "ARRAY",
          componentType: "FLOAT32",
          componentCount: 8,
          semantic: "COLOR",
        },
        isSquare: {
          description:
            "Is a square tile, rather than a rectangular partial tile",
          type: "BOOLEAN",
        },
      },
    },
  });

  var tileExtension = {
    class: "tile",
    properties: {
      color: [1.0, 0.5, 0.0],
      isSquare: true,
    },
  };

  var tileMetadata;
  beforeEach(function () {
    tileMetadata = new TileMetadata({
      tile: tileExtension,
      class: tileClass,
    });
  });

  it("throws without tile", function () {
    expect(function () {
      tileMetadata = new TileMetadata({
        tile: undefined,
        class: tileClass,
      });
    }).toThrowDeveloperError();
  });

  it("creates tile metadata with default values", function () {
    var metadata = new TileMetadata({
      tile: {},
    });

    expect(metadata.class).toBeUndefined();
    expect(metadata.properties).toBeUndefined();
    expect(metadata.extras).toBeUndefined();
    expect(metadata.extensions).toBeUndefined();
  });

  it("creates tile metadata", function () {
    var properties = {
      color: [0.0, 0.0, 1.0],
      isSquare: false,
    };

    var extras = {
      version: "0.0",
    };

    var extensions = {
      "3DTILES_extension": {},
    };
    tileMetadata = new TileMetadata({
      tile: {
        class: "tile",
        properties: properties,
        extras: extras,
        extensions: extensions,
      },
      class: tileClass,
    });
    expect(tileMetadata.class).toBe(tileClass);
    expect(tileMetadata.properties).toBe(properties);
    expect(tileMetadata.extras).toBe(extras);
    expect(tileMetadata.extensions).toBe(extensions);
  });

  it("hasProperty returns true if a property exists", function () {
    expect(tileMetadata.hasProperty("color")).toBe(true);
  });

  it("hasProperty returns false if a property does not exist", function () {
    expect(tileMetadata.hasProperty("numberOfPoints")).toBe(false);
  });

  it("getPropertyIds returns array of property IDs", function () {
    var propertyIds = tileMetadata.getPropertyIds([]);
    propertyIds.sort();
    expect(propertyIds).toEqual(["color", "isSquare"]);
  });

  it("getProperty returns undefined if a property does not exist", function () {
    expect(tileMetadata.getProperty("numberOfPoints")).not.toBeDefined();
  });

  it("getProperty returns the property value", function () {
    expect(tileMetadata.getProperty("color")).toEqual([1.0, 0.5, 0.0]);
    expect(tileMetadata.getProperty("isSquare")).toBe(true);
  });

  it("setProperty creates property if it doesn't exist", function () {
    expect(tileMetadata.getProperty("numberOfPoints")).not.toBeDefined();
    tileMetadata.setProperty("numberOfPoints", 10);
    expect(tileMetadata.getProperty("numberOfPoints")).toBe(10);
  });

  it("setProperty sets property value", function () {
    expect(tileMetadata.getProperty("isSquare")).toBe(true);
    tileMetadata.setProperty("isSquare", false);
    expect(tileMetadata.getProperty("isSquare")).toBe(false);
  });

  it("getPropertyBySemantic returns undefined when there's no property with the given semantic", function () {
    expect(
      tileMetadata.getPropertyBySemantic("HORIZON_OCCLUSION_POINT")
    ).not.toBeDefined();
  });

  it("getPropertyBySemantic returns the property value", function () {
    expect(tileMetadata.getPropertyBySemantic("COLOR")).toEqual([
      1.0,
      0.5,
      0.0,
    ]);
  });

  it("setPropertyBySemantic sets property value", function () {
    expect(tileMetadata.getPropertyBySemantic("COLOR")).toEqual([
      1.0,
      0.5,
      0.0,
    ]);
    tileMetadata.setPropertyBySemantic("COLOR", [0.0, 0.0, 0.0]);
    expect(tileMetadata.getPropertyBySemantic("COLOR")).toEqual([
      0.0,
      0.0,
      0.0,
    ]);
  });

  it("setPropertyBySemantic doesn't set property value when there's no matching semantic", function () {
    expect(tileMetadata.getPropertyBySemantic("NAME")).not.toBeDefined();
    tileMetadata.setPropertyBySemantic("NAME", "Test Tile");
    expect(tileMetadata.getPropertyBySemantic("NAME")).not.toBeDefined();
  });
});
