'use strict';

/**
 * creates a plain object that contains address information
 * @param {dw.order.OrderAddress} address user's address
 * @returns {Object} an object that contains information about the users address
 */
function createAddressObject(addressObject) {
    return {
        address1: addressObject.address1,
        address2: addressObject.address2,
        city: addressObject.city,
        countryCode: {
            displayValue: addressObject.countryCode.displayValue,
            value: addressObject.countryCode.value
        },
        firstName: addressObject.firstName,
        lastName: addressObject.lastName,
        phone: addressObject.phone,
        postalCode: addressObject.postalCode,
        stateCode: addressObject.stateCode
    };
}

/**
 * Address class that represents an orderAddress
 * @param {dw.order.OrderAddress} address user's address
 * @constructor
 */
function address(addressObject) {
    this.address = createAddressObject(addressObject);
}

module.exports = address;