# json-yup
[![npm](https://img.shields.io/npm/v/json-yup.svg?style=flat-square)](https://www.npmjs.com/package/react-native-calendar-events)
[![npm](https://img.shields.io/npm/l/json-yup.svg?style=flat-square)](https://github.com/wmcmahan/react-native-calendar-events/blob/master/LICENSE.md)

A simple utility for converting a [JSON schema](https://json-schema.org/) into [Yup](https://github.com/jquense/yup) schema.

## Setup
```
npm install -S json-yup
```
```
import createValidationSchema from 'json-yup';
```

## API

```javascript
createValidationSchema(schema, options);
```

### Arguments
|Argument       | Type  | Description   |
|-------------- | --- |---|
|schema      | Object | A valid JSON schema conforming to [JSON schema](https://json-schema.org/) specifications. |
| customValidationFields | Object | Custom Yup mappings for schema properties |

### Options

|Property       | Type  | Description   |
|-------------- | --- |---|
|blackList      | Array | A list of fields to omit from the schema. |
|customValidationFields | Object | Custom Yup mappings for schema properties |
|validationTypes| Object | Custom Yup mappings for schema types. |

### Returns
Yup validation object

## Usage

```javascript
// Valid JSON Schema
const jsonSchema = {
  "type": "object",
  "required": [
    "first_name"
  ],
  "properties": {
    "create_at": {
      "type": "string"
    },
    "first_name": {
      "type": "string"
    },
    "age": {
      "type": "number",
      "min": 1,
      "max": 200
    }
  }
};

// Build Yup Schema
const validationSchema = createValidationSchema(jsonSchema, {
  blackList: [
    'create_at'
  ],
  validationTypes: {
    string: yup.string().nullable()
  },
  customValidationFields: {
    first_name: yup.string().test(
      'isWilly',
      'Oops! You\'re not Willy',
      value => value === 'Willy'
    )
  }
});

// Check validity
validationSchema.isValid({
  first_name: 'Willy',
  age: 24
})

```