/* eslint-disable no-loop-func */
import * as yup from 'yup';
import mergeWith from 'lodash/mergeWith';
import {getRequiredFields, getPath, mergeWithArray, omitField} from './utils';
import {defaultValidationTypes} from './constants';

/**
 * Options
 * @param {array}  blackList
 * @param {object} validationTypes
 * @param {object} customValidationFields
 */
const DEFAULT_OPTIONS = {
  validationTypes: defaultValidationTypes,
  customValidationFields: {},
  blackList: []
};

/**
 * Update Field Level Validation
 * @param {*} schema
 */
export const buildYupSchemaValidation = (jsonSchema, opts = {}) => {
  let schema = JSON.parse(JSON.stringify(jsonSchema));
  const options = {...DEFAULT_OPTIONS, ...opts};

  const blackListFields = new Set([...options.blackList]);
  const validationTypes = {...options.validationTypes};
  const customValidationFields = {...options.customValidationFields};

  const stack = [];
  let requiredFields = new Set();

  // Consolidate 'allOf' field definitions
  if (Object.prototype.hasOwnProperty.call(schema, 'allOf')) {
    const {allOf, ...mergedSchema} = mergeWith(
      schema,
      mergeWith(...schema.allOf, mergeWithArray),
      mergeWithArray
    );
    schema = mergedSchema;
  }

  // Consolidate required fields by path
  if (Object.prototype.hasOwnProperty.call(schema, 'required')) {
    requiredFields = new Set(
      getRequiredFields(schema.properties, schema.properties, schema.required)
    );
  }

  if (Object.prototype.hasOwnProperty.call(schema, 'properties')) {
    stack.push(omitField(schema.properties, blackListFields));
  }

  while (stack.length) {
    const fields = stack.pop();

    Object.keys(fields).forEach(field => {
      // Consolidate 'allOf' field definitions
      if (Object.prototype.hasOwnProperty.call(fields[field], 'allOf')) {
        const allOf = mergeWith(
          fields[field],
          mergeWith(...fields[field].allOf, mergeWithArray),
          mergeWithArray
        );
        const yupObj = yup
          .object()
          .shape(omitField(allOf.properties, blackListFields));
        const {required = []} = allOf;

        fields[field] = yupObj;
        stack.push(yupObj.fields);

        requiredFields = new Set([
          ...requiredFields,
          ...getRequiredFields(yupObj.fields, schema.properties, required)
        ]);

        // Manage 'array' field definitions
      } else if (
        fields[field].type === 'array' &&
        Object.prototype.hasOwnProperty.call(fields[field], 'items') &&
        !customValidationFields[field]
      ) {
        const {required = []} = fields[field].items;
        const yupObj = yup
          .object()
          .shape(omitField(fields[field].items.properties, blackListFields));

        fields[field] = yup.array().of(yupObj);
        stack.push(yupObj.fields);

        if (requiredFields.has(getPath(schema.properties, fields[field]))) {
          fields[field] = fields[field].required();
        }

        requiredFields = new Set([
          ...requiredFields,
          ...getRequiredFields(yupObj.fields, schema.properties, required)
        ]);

        // Manage 'object' field definitions
      } else if (
        fields[field].type === 'object' &&
        Object.prototype.hasOwnProperty.call(fields[field], 'properties') &&
        !customValidationFields[field]
      ) {
        const {required = []} = fields[field];
        const yupObj = yup
          .object()
          .shape(omitField(fields[field].properties, blackListFields));

        fields[field] = yupObj;
        stack.push(yupObj.fields);

        requiredFields = new Set([
          ...requiredFields,
          ...getRequiredFields(yupObj.fields, schema.properties, required)
        ]);

        // Manage 'object' field definitions
      } else if (!blackListFields.has(field)) {
        const isRequired = requiredFields.has(
          getPath(schema.properties, fields[field])
        );
        const enumValues = fields[field].enum;
        const minimum = fields[field].minimum || fields[field].minLength;
        const maximum = fields[field].maximum || fields[field].maxLength;

        if (customValidationFields[field]) {
          fields[field] = customValidationFields[field];
        } else if (validationTypes[fields[field].type]) {
          fields[field] = validationTypes[fields[field].type];
        } else {
          fields[field] = yup.mixed().nullable();
        }

        if (enumValues) {
          fields[field] = fields[field].oneOf([...enumValues]);
        }
        if (minimum) {
          fields[field] = fields[field].min(minimum);
        }
        if (maximum) {
          fields[field] = fields[field].max(maximum);
        }
        if (isRequired) {
          fields[field] = fields[field].required();
        }
      }
    });
  }

  return yup.object().shape(schema.properties);
};
