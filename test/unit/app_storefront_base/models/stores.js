'use strict';

var assert = require('chai').assert;
var StoresModel = require('../../../../app_storefront_base/cartridge/models/stores');

describe('stores', function () {
    var actionUrl = '/on/demandware.store/Sites-SiteGenesis-Site/en_US/Stores-FindStores';
    var apiKey = 'YOUR_API_KEY';
    var searchKey = { lat: 42.4019, long: -71.1193 };
    var radius = 100;
    var radiusOptions = [15, 30, 50, 100, 300];

    it('should return Stores Model with stores found', function () {
        var storesResults = [{
            name: 'Downtown TV Shop',
            address1: '333 Washington St',
            address2: '',
            city: 'Boston',
            postalCode: '02108',
            phone: '333-333-3333',
            stateCode: 'MA',
            latitude: 42.5273334,
            longitude: -71.13758250000001
        }];
        var stores = new StoresModel(storesResults, searchKey, radius, actionUrl, apiKey);

        assert.deepEqual(stores, {
            stores: [
                {
                    name: 'Downtown TV Shop',
                    address1: '333 Washington St',
                    address2: '',
                    city: 'Boston',
                    postalCode: '02108',
                    phone: '333-333-3333',
                    stateCode: 'MA'
                }
            ],
            locations: [{
                name: 'Downtown TV Shop',
                latitude: 42.5273334,
                longitude: -71.13758250000001
            }],
            searchKey: searchKey,
            radius: radius,
            actionUrl: actionUrl,
            googleMapsApi: 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY',
            radiusOptions: radiusOptions

        });
    });

    it('should return Stores Model with stores that do not have a phone or state', function () {
        var storesResults = [{
            name: 'Downtown TV Shop',
            address1: '333 Washington St',
            address2: '',
            city: 'Boston',
            postalCode: '02108',
            latitude: 42.5273334,
            longitude: -71.13758250000001
        }];
        var stores = new StoresModel(storesResults, searchKey, radius, actionUrl, apiKey);

        assert.deepEqual(stores, {
            stores: [
                {
                    name: 'Downtown TV Shop',
                    address1: '333 Washington St',
                    address2: '',
                    city: 'Boston',
                    postalCode: '02108'
                }
            ],
            locations: [{
                name: 'Downtown TV Shop',
                latitude: 42.5273334,
                longitude: -71.13758250000001
            }],
            searchKey: searchKey,
            radius: radius,
            actionUrl: actionUrl,
            googleMapsApi: 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY',
            radiusOptions: radiusOptions

        });
    });

    it('should return Stores Model with no stores found', function () {
        var stores = new StoresModel([], searchKey, radius, actionUrl, apiKey);

        assert.deepEqual(stores, {
            stores: [],
            locations: [],
            searchKey: searchKey,
            radius: 100,
            actionUrl: actionUrl,
            googleMapsApi: 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY',
            radiusOptions: radiusOptions

        });
    });
});
