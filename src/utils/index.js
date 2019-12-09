/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */

/**
 * Get string path to ref in schema
 * @param {*} schema
 * @param {*} value
 */
export const getPath = (schema, value) => {
  let fieldPath = '';
  Object.keys(schema).forEach(field => {
    if (value === schema[field]) {
      fieldPath = field;
    }
    if (schema[field] && typeof schema[field] === 'object') {
      const path = getPath(schema[field], value);
      if (path) {
        fieldPath = `${field}.${path}`;
      }
    }
  });
  return fieldPath;
};

/**
 * Get required fields for schema
 * @param {*} fields
 * @param {*} schema
 * @param {*} required
 */
export const getRequiredFields = (fields, schema, required = []) => {
  return required.map(field => {
    return getPath(schema, fields[field]);
  });
};

/**
 * Lodash customer for _.mergeWith - https://lodash.com/docs/4.17.15#mergeWith
 * @param {*} objValue
 * @param {*} srcValue
 */
export const mergeWithArray = (objValue, srcValue) => {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
};

/**
 * Remove fields from object
 * @param {*} object
 * @param {*} fields
 * @returns Original object reference
 */
export const omitField = (obj, fields = []) => {
  fields.forEach(field => {
    if (obj && field in obj) {
      delete obj[field];
    }
  });
  return obj;
};
