JSON Editor/Viewer for Mendix
===

This widget can view and edit a JSON object. The object is stored in a String attribute on an Entity

## Compatibility

The widget should be compatible with Mendix 5.21 and higher. The widget itself was built and tested in Mendix 7, but uses API's that are in Mendix 5 and 6 as well.

## Features

- View JSON
- Edit JSON

## Dependencies

This widget is built using the [widget-base](https://github.com/JelteMX/widget-base) setup in combination with [widget-base-helpers](https://github.com/JelteMX/widget-base-helpers). The following external libraries are used:

- [jsoneditor](https://www.npmjs.com/package/jsoneditor) (Apache-2.0 LICENSE)

## TODO

- Add schema for validation
- Add objects for easy insertion

## Configuration

The widget configuration speaks for itself. You should choose a String attribute that contains the JSON object. You can set readOnly or not.

## License

This widget is licensed undewr Apache 2.0
