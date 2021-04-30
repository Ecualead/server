# CHANGELOG

## [1.1.22] - 2021-04-30
- Add response handler success/error ad global middlewares
- Update package documentation

## [1.1.21] - 2021-04-25
- Fix middlewares import

## [1.1.20] - 2021-04-25
- Fix express middlewares response

## [1.1.19] - 2021-04-21
- Updating project dependencies

## [1.1.18] - 2020-12-26
- Moving @ikoabo/core as peer dependency
- Updating project dependencies

## [1.1.17] - 2020-12-03
- Adding support for skip and limit
- Adding support for data sort
- Change CRUD base options
- Handle conditional query status field

## [1.1.16] - 2020-11-11
- Adding conditional body request log
- Adding conditional body response log
- Add slave hook to dispatch actions before routes initialization

## [1.1.15] - 2020-11-02
- Adding GeoJSON date model

## [1.1.14] - 2020-11-01
- Force JOI validation to convert value types
- Update project dependencies version

## [1.1.13] - 2020-09-14
- Set CRUD owner as ObjectId type

## [1.1.12] - 2020-09-14
- Fix CRUD operations required _id field
- Remove CRUD operations data type
- Remove CRUD data class type template parameter

## [1.1.11] - 2020-09-14
- Adding ObjectId validation on CRUD query
- Update base model to extends base Typegoose class and allow _id on class documents

## [1.1.10] - 2020-09-10
- Update CRUD query parameter to handle id string or object query
- Add options to update action inside CRUD

## [1.1.9] - 2020-09-03
- Update package dependencies
- Update eslint configuration

## [1.1.7] - 2020-09-02
- Change @hapi/joi to joi dependency
- Change express, mongoose and typegoose dependencies as peer dependencies

## [1.1.6] - 2020-08-22
- Initial public version
- Cluster HTTP server
- Response middlewares
- Jo validator middlewares
- Base data model for Typegoose
- Base CRUD class
