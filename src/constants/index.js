import * as yup from 'yup';

/**
 * Default validation types
 */
export const defaultValidationTypes = {
  string: yup.string().nullable(),
  number: yup.number().nullable(),
  integer: yup
    .number()
    .integer()
    .nullable()
};
