'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var Collection = require('../../../mocks/dw.util.Collection');
var getMockMoney = require('../../../mocks/dw.value.Money');

var createShipmentShippingModel = function () {
    return {
        applicableShippingMethods: new Collection([
            {
                description: 'Order received within 7-10 business days',
                displayName: 'Ground',
                ID: '001',
                custom: {
                    estimatedArrivalTime: '7-10 Business Days'
                }
            },
            {
                description: 'Order received in 2 business days',
                displayName: '2-Day Express',
                ID: '002',
                shippingCost: '$0.00',
                custom: {
                    estimatedArrivalTime: '2 Business Days'
                }
            }
        ]),
        getShippingCost: function () {
            return {
                amount: {
                    valueOrNull: 7.99
                }
            };
        }
    };
};

var defaultShipment = {
    setShippingMethod: function () {
        return 'something';
    }
};

describe('Shipping', function () {
    var ShippingModel = null;
    var helper = proxyquire('../../../../app_storefront_base/cartridge/scripts/dwHelpers', {
        'dw/util/ArrayList': Collection
    });
    ShippingModel = proxyquire('../../../../app_storefront_base/cartridge/models/shipping', {
        '~/cartridge/scripts/dwHelpers': helper,
        'dw/util/StringUtils': {
            formatMoney: function () {
                return 'formattedMoney';
            }
        },
        'dw/value/Money': getMockMoney,
        'dw/order/ShippingMgr': {
            getDefaultShippingMethod: function () {
                return new Collection([
                    {
                        description: 'Order received within 7-10 business days',
                        displayName: 'Ground',
                        ID: '001',
                        custom: {
                            estimatedArrivalTime: '7-10 Business Days'
                        }
                    }
                ]);
            },
            getShipmentShippingModel: function () {
                return createShipmentShippingModel();
            }
        }
    });

    it('should receive an empty object when shipmentModel is null', function () {
        var result = new ShippingModel(null);
        assert.deepEqual(result, { });
    });

    it('should get shipping methods and convert to a plain object', function () {
        var result = new ShippingModel(createShipmentShippingModel());
        assert.equal(
            result.applicableShippingMethods[0].description,
            'Order received within 7-10 business days'
        );
        assert.equal(result.applicableShippingMethods[0].displayName, 'Ground');
        assert.equal(result.applicableShippingMethods[0].ID, '001');
        assert.equal(result.applicableShippingMethods[0].estimatedArrivalTime, '7-10 Business Days');
    });

    it('should set default shipping method when shippingMethodID is supplied', function () {
        var shippingMethodID = '002';

        ShippingModel.selectShippingMethod(defaultShipment, shippingMethodID);
    });

    it('should set default shipping method when shippingMethodID is not supplied', function () {
        var shippingMethodID = null;
        ShippingModel.selectShippingMethod(defaultShipment, shippingMethodID);
    });

    it('should set default shipping method when shippingMethods are supplied', function () {
        var shippingMethodID = '001';
        var shippingMethods = new Collection([
            {
                description: 'Order received within 7-10 business days',
                displayName: 'Ground',
                ID: '001',
                custom: {
                    estimatedArrivalTime: '7-10 Business Days'
                }
            }
        ]);
        ShippingModel.selectShippingMethod(defaultShipment, shippingMethodID, shippingMethods);
    });
});

