import Check from "../Core/Check.js";
import defaultValue from "../Core/defaultValue.js";

/**
 * Metadata about a 3D tile, from a <code>3DTILES_metadata</code> extension
 * within a subtree from the <code>3DTILES_implicit_tiling</code> extension
 * <p>
 * </p>
 *
 * @param {ImplicitSubtree} options.implicitSubtree The implicit subtree the tile belongs to. It is assumed that the subtree's readyPromise has already resolved.
 * @param {ImplicitTileCoordinates} options.implicitCoordinates Implicit tiling coordinates for the tile.
 * @param {MetadataClass} [options.class] The class that group metadata conforms to.
 *
 * @alias ImplicitTileMetadata
 * @constructor
 *
 * @private
 */
export default function ImplicitTileMetadata(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.object("options.implicitSubtree", options.implicitSubtree);
  Check.typeOf.object(
    "options.implicitCoordinates",
    options.implicitCoordinates
  );
  //>>includeEnd('debug');

  this._class = options.class;

  var subtree = options.implicitSubtree;
  this._metadataTable = subtree.metadataTable;
  this._entityId = subtree.getEntityId(options.implicitCoordinates);

  var subtreeExtension = subtree.metadataExtension;
  this._extensions = subtreeExtension.extensions;
  this._extras = subtreeExtension.extras;
}

Object.defineProperties(ImplicitTileMetadata.prototype, {
  /**
   * The class that properties conform to.
   *
   * @memberof ImplicitTileMetadata.prototype
   * @type {MetadataClass}
   * @readonly
   */
  class: {
    get: function () {
      return this._class;
    },
  },

  /**
   * Extras in the JSON object.
   *
   * @memberof MetadataGroup.prototype
   * @type {*}
   * @readonly
   */
  extras: {
    get: function () {
      return this._extras;
    },
  },

  /**
   * Extensions in the JSON object.
   *
   * @memberof MetadataGroup.prototype
   * @type {Object}
   * @readonly
   */
  extensions: {
    get: function () {
      return this._extensions;
    },
  },
});

/**
 * Returns whether this property exists.
 *
 * @param {String} propertyId The case-sensitive ID of the property.
 * @returns {Boolean} Whether this property exists.
 */
ImplicitTileMetadata.prototype.hasProperty = function (propertyId) {
  return this._metadataTable.hasProperty(propertyId);
};

/**
 * Returns an array of property IDs.
 *
 * @param {String[]} [results] An array into which to store the results.
 * @returns {String[]} The property IDs.
 */
ImplicitTileMetadata.prototype.getPropertyIds = function (results) {
  return this._metadataTable.getPropertyIds(results);
};

/**
 * Returns a copy of the value of the property with the given ID.
 * <p>
 * If the property is normalized the normalized value is returned.
 * </p>
 *
 * @param {String} propertyId The case-sensitive ID of the property.
 * @returns {*} The value of the property or <code>undefined</code> if the property does not exist.
 */
ImplicitTileMetadata.prototype.getProperty = function (propertyId) {
  return this._metadataTable.getProperty(this._entityId, propertyId);
};

/**
 * Sets the value of the property with the given ID.
 * <p>
 * If the property is normalized a normalized value must be provided to this function.
 * </p>
 * <p>
 * If a property with the given ID doesn't exist, it is created.
 * </p>
 *
 * @param {String} propertyId The case-sensitive ID of the property.
 * @param {*} value The value of the property that will be copied.
 */
ImplicitTileMetadata.prototype.setProperty = function (propertyId, value) {
  this._metadataTable.setProperty(this._entityId, propertyId, value);
};

/**
 * Returns a copy of the value of the property with the given semantic.
 *
 * @param {String} semantic The case-sensitive semantic of the property.
 * @returns {*} The value of the property or <code>undefined</code> if the property does not exist.
 */
ImplicitTileMetadata.prototype.getPropertyBySemantic = function (semantic) {
  return this._metadataTable.getPropertyBySemantic(this._entityId, semantic);
};

/**
 * Sets the value of the property with the given semantic.
 *
 * @param {String} semantic The case-sensitive semantic of the property.
 * @param {*} value The value of the property that will be copied.
 */
ImplicitTileMetadata.prototype.setPropertyBySemantic = function (
  semantic,
  value
) {
  this._metadataTable.setPropertyBySemantic(this._entityId, semantic, value);
};
