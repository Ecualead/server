# CHANGELOG

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
