# CHANGELOG

## 3.0.0 - 2023-11-12

- Update dependencies
- Expose express, mongoose, typegoose, joi
- Update error mechanism

## 2.2.3 - 2022-01-04

- Fix CRUD query parameters

## 2.2.2 - 2022-01-03

- Fix import

## 2.2.1 - 2021-12-29

- Fix type exports

## 2.2.0 - 2021-12-29

- Update project dependencies
- Move project to ECUALEAD
- Fix Mongoose version support

## [2.1.0] - 2021-09-26

- Update project dependencies
- Support for Typegoose 9
- Support for Mongoose 6

## [2.0.1] - 2021-08-03

- Fix through dev dependency

## [2.0.0] - 2021-08-03

- Update error handler
- Moving core components to server package
- Update to typegoose 8.x and mongoose 5.13.x

## [1.1.24] - 2021-06-09

- Update error handler schema

## [1.1.24] - 2021-06-09

- Back to mongoose 5.10.x and Typegoose 7.x
- Allow Typegoose to user `any`as field types
- Add on fields MongoDB ops to base CRUD
- Add support for errors description
- Fix express middlewares assignation

## [1.1.23] - 2021-06-09

- Testing for mongoose 5.12 with Typegoose 8 Beta

## [1.1.22] - 2021-04-30

- Add response handler success/error as global middlewares
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

- Fix CRUD operations required \_id field
- Remove CRUD operations data type
- Remove CRUD data class type template parameter

## [1.1.11] - 2020-09-14

- Adding ObjectId validation on CRUD query
- Update base model to extends base Typegoose class and allow \_id on class documents

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
