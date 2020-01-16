/* eslint-disable no-undef */
import * as yup from 'yup';
import simpleSchemaMock from 'simple.mock.json';
import buildYupSchemaValidation from '../index';

describe('Schema validation builder', () => {
  const blackListFields = ['create_at', 'updated_at'];
  const customValidation = yup.string().email();
  let validationSchema;

  beforeEach(() => {
    validationSchema = buildYupSchemaValidation(simpleSchemaMock, {
      blackList: blackListFields,
      customValidationFields: {
        first_name: customValidation
      }
    });
  });

  it('should top level fields on validation schema', () => {
    expect(Object.keys(validationSchema.fields)).toEqual(
      expect.arrayContaining([
        'code',
        'unit_amount',
        'unit_quantity',
        'unit_amount_currency',
        'charge_code',
        'accessorials'
      ])
    );
  });

  it('should not have black listed fields', () => {
    expect(Object.keys(validationSchema.fields)).not.toEqual(
      expect.arrayContaining(['created_at', 'updated_at'])
    );
  });

  it('should custom validation fields', () => {
    expect(validationSchema.fields.first_name).toEqual(customValidation);
  });

  it('should set required fields in validation schema', () => {
    expect(validationSchema.fields.unit_amount._exclusive.required).toEqual(true);
    expect(validationSchema.fields.unit_quantity._exclusive.required).toEqual(true);
  });

  it('should not set non required fields in validation schema', () => {
    expect(validationSchema.fields.code._exclusive.required).toEqual(undefined);
    expect(validationSchema.fields.unit_amount_currency._exclusive.required).toEqual(undefined);
  });

  it('should set string types in validation schema', () => {
    expect(validationSchema.fields.code._type).toEqual('string');
    expect(validationSchema.fields.code._nullable).toEqual(true);
  });

  it('should set number types in validation schema', () => {
    expect(validationSchema.fields.unit_amount._type).toEqual('number');
    expect(validationSchema.fields.unit_amount._nullable).toEqual(true);
  });

  it('should set integer types in validation schema', () => {
    expect(validationSchema.fields.unit_quantity._type).toEqual('number');
    expect(validationSchema.fields.unit_quantity._nullable).toEqual(true);
    expect(validationSchema.fields.unit_quantity._exclusive).toHaveProperty('integer');
  });

  it('should set object types in validation schema', () => {
    expect(validationSchema.fields.charge_code._type).toEqual('object');
    expect(validationSchema.fields.charge_code._nullable).toEqual(undefined);
    expect(Object.keys(validationSchema.fields.charge_code.fields)).toEqual(
      expect.arrayContaining(['id', 'code', 'description'])
    );
  });

  it('should set array types in validation schema', () => {
    expect(validationSchema.fields.accessorials._type).toEqual('array');
    expect(validationSchema.fields.accessorials._nullable).toEqual(undefined);
    expect(validationSchema.fields.accessorials._nullable).toEqual(undefined);
    expect(Object.keys(validationSchema.fields.accessorials._subType.fields)).toEqual(
      expect.arrayContaining(['id', 'is_charge_code', 'price', 'currency_unit'])
    );
  });

  it('should validate against required fields', async () => {
    try {
      await validationSchema.validate({}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining([
          'stops',
          'unit_amount',
          'unit_quantity',
          'company.carrier',
          'company.name',
          'company.dba_name'
        ])
      );
    }
  });

  it('should validate against required array item fields', async () => {
    try {
      await validationSchema.validate(
        {accessorials: [{}], unit_amount: 'asb'},
        {abortEarly: false}
      );
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining([
          'stops',
          'unit_amount',
          'unit_quantity',
          'company.carrier',
          'company.name',
          'company.dba_name',
          'accessorials[0].id',
          'accessorials[0].is_charge_code',
          'accessorials[0].price',
          'accessorials[0].currency_unit'
        ])
      );
    }
  });

  it('should validate against minimum array item fields', async () => {
    try {
      await validationSchema.validate(
        {stops: [{name: 'stopName1', address: 'stopAddress1'}]},
        {abortEarly: false}
      );
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining(['stops'])
      );
      expect(error.inner.find(error => error.path === 'stops').type).toEqual('min');
    }
    try {
      await validationSchema.validate(
        {
          stops: [
            {name: 'stopName1', address: 'stopAddress1'},
            {name: 'stopName2', address: 'stopAddress2'}
          ]
        },
        {abortEarly: false}
      );
    } catch (error) {
      expect(error.inner.map(error => error.path)).not.toEqual(
        expect.arrayContaining(['stops'])
      );
      expect(error.inner.find(error => error.path === 'stops')).toBeUndefined();
    }
  });

  it('should validate against maximum array item fields', async () => {
    try {
      await validationSchema.validate(
        {
          stops: [
            {name: 'stopName1', address: 'stopAddress1'},
            {name: 'stopName2', address: 'stopAddress2'},
            {name: 'stopName3', address: 'stopAddress3'},
            {name: 'stopName4', address: 'stopAddress4'}
          ]
        },
        {abortEarly: false}
      );
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining(['stops'])
      );
      expect(error.inner.find(error => error.path === 'stops').type).toEqual('max');
    }
    try {
      await validationSchema.validate(
        {
          stops: [
            {name: 'stopName1', address: 'stopAddress1'},
            {name: 'stopName2', address: 'stopAddress2'},
            {name: 'stopName3', address: 'stopAddress3'}
          ]
        },
        {abortEarly: false}
      );
    } catch (error) {
      expect(error.inner.map(error => error.path)).not.toEqual(
        expect.arrayContaining(['stops'])
      );
      expect(error.inner.find(error => error.path === 'stops')).toBeUndefined();
    }
  });

  it('should validate against required array field', async () => {
    try {
      await validationSchema.validate({}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining(['stops'])
      );
      expect(error.inner.find(error => error.path === 'stops').type).toEqual('required');
    }
    try {
      await validationSchema.validate(
        {
          stops: [
            {name: 'stopName1', address: 'stopAddress1'},
            {name: 'stopName2', address: 'stopAddress2'}
          ]
        },
        {abortEarly: false}
      );
    } catch (error) {
      expect(error.inner.map(error => error.path)).not.toEqual(
        expect.arrayContaining(['stops'])
      );
      expect(error.inner.find(error => error.path === 'stops')).toBeUndefined();
    }
  });

  it('should validate against minimum number fields', async () => {
    try {
      await validationSchema.validate({unit_amount: '0'}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining(['unit_amount'])
      );
      expect(error.inner.find(error => error.path === 'unit_amount').type).toEqual('min');
    }
    try {
      await validationSchema.validate({unit_amount: '1'}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).not.toEqual(
        expect.arrayContaining(['unit_amount'])
      );
      expect(error.inner.find(error => error.path === 'unit_amount')).toBeUndefined();
    }
  });

  it('should validate against maximum number fields', async () => {
    try {
      await validationSchema.validate({unit_amount: '11'}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining(['unit_amount'])
      );
      expect(error.inner.find(error => error.path === 'unit_amount').type).toEqual('max');
    }
    try {
      await validationSchema.validate({unit_amount: '10'}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).not.toEqual(
        expect.arrayContaining(['unit_amount'])
      );
      expect(error.inner.find(error => error.path === 'unit_amount')).toBeUndefined();
    }
  });

  it('should validate against minimum string fields', async () => {
    try {
      await validationSchema.validate({code: ''}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining(['code'])
      );
      expect(error.inner.find(error => error.path === 'code').type).toEqual('min');
    }
    try {
      await validationSchema.validate({code: '12345'}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).not.toEqual(
        expect.arrayContaining(['code'])
      );
      expect(error.inner.find(error => error.path === 'code')).toBeUndefined();
    }
  });

  it('should validate against maximum string fields', async () => {
    try {
      await validationSchema.validate({code: '12345678910'}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).toEqual(
        expect.arrayContaining(['code'])
      );
      expect(error.inner.find(error => error.path === 'code').type).toEqual('max');
    }
    try {
      await validationSchema.validate({code: '123456789'}, {abortEarly: false});
    } catch (error) {
      expect(error.inner.map(error => error.path)).not.toEqual(
        expect.arrayContaining(['code'])
      );
      expect(error.inner.find(error => error.path === 'code')).toBeUndefined();
    }
  });
});
