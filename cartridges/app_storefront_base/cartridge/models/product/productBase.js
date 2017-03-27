'use strict';

var dwHelpers = require('../../scripts/dwHelpers');
var AttributesModel = require('./productAttributes');
var ImageModel = require('./productImages');
var priceFactory = require('../../scripts/factories/price');

/**
 * Return type of the current product
 * @param  {dw.catalog.ProductVariationModel} product - Current product
 * @return {string} type of the current product
 */
function getProductType(product) {
    var result;
    if (product.master) {
        result = 'master';
    } else if (product.variant) {
        result = 'variant';
    } else if (product.variationGroup) {
        result = 'variationGroup';
    } else if (product.productSet) {
        result = 'set';
    } else if (product.bundle) {
        result = 'bundle';
    } else if (product.optionProduct) {
        result = 'optionProduct';
    } else {
        result = 'standard';
    }
    return result;
}

/**
 * Get fake rating for a product
 * @param  {string} id - Id of the product
 * @return {number} number of stars for a given product id rounded to .5
 */
function getRating(id) {
    var sum = id.split('').reduce(function (total, letter) {
        return total + letter.charCodeAt(0);
    }, 0);

    return Math.ceil((sum % 5) * 2) / 2;
}

/**
 * @typedef Promotion
 * @type Object
 * @property {string} calloutMsg - Promotion callout message
 * @property {boolean} enabled - Whether Promotion is enabled
 * @property {string} id - Promotion ID
 * @property {string} name - Promotion name
 * @property {string} promotionClass - Type of Promotion (Product, Shipping, or Order)
 * @property {number|null} rank - Promotion rank for sorting purposes
 */

/**
 * Retrieve Promotions that applies to thisProduct
 *
 * @param {dw.util.Collection.<dw.campaign.Promotion>} promotions - Promotions that apply to this
 *                                                                 product
 * @return {Promotion} - JSON representation of Promotion instance
 */
function getPromotions(promotions) {
    return dwHelpers.map(promotions, function (promotion) {
        return {
            calloutMsg: promotion.calloutMsg.markup,
            details: promotion.details.markup,
            enabled: promotion.enabled,
            id: promotion.ID,
            name: promotion.name,
            promotionClass: promotion.promotionClass,
            rank: promotion.rank
        };
    });
}

/**
 * Normalize product and return Product variation model
 * @param  {dw.catalog.Product} product - Product instance returned from the API
 * @param  {Object} productVariables - variables passed in the query string to
 *                                     target product variation group
 * @return {dw.catalog.ProductVarationModel} Normalized variation model
 */
function getVariationModel(product, productVariables) {
    var variationModel = product.variationModel;
    if (!variationModel.master && !variationModel.selectedVariant) {
        variationModel = null;
    } else if (productVariables) {
        var variationAttrs = variationModel.productVariationAttributes;
        Object.keys(productVariables).forEach(function (attr) {
            if (attr && productVariables[attr].value) {
                var dwAttr = dwHelpers.find(variationAttrs,
                    function (item) { return item.attributeID === attr; });
                var dwAttrValue = dwHelpers.find(variationModel.getAllValues(dwAttr),
                    function (item) { return item.value === productVariables[attr].value; });

                if (dwAttr && dwAttrValue) {
                    variationModel.setSelectedAttributeValue(dwAttr.ID, dwAttrValue.ID);
                }
            }
        });
    }
    return variationModel;
}

/**
 * @constructor
 * @classdesc Base product class. Used for product tiles
 * @param {dw.catalog.Product} product - Product instance returned from the API
 * @param {Object} productVariables - variables passed in the query string to
 *                                    target product variation group
 * @param {number} quantity - Integer quantity of products selected
 * @param {dw.util.Collection.<dw.campaign.Promotion>} promotions - Promotions that apply to this
 *                                                                 product
 */
function ProductBase(product, productVariables, quantity, promotions) {
    this.variationModel = this.getVariationModel(product, productVariables);
    if (this.variationModel) {
        this.product = this.variationModel.selectedVariant || product;
    } else {
        this.product = product;
    }
    this.imageConfig = {
        types: ['medium'],
        quantity: 'single'
    };
    this.quantity = quantity;

    this.attributeConfig = {
        attributes: ['color'],
        endPoint: 'Show'
    };
    this.useSimplePrice = true;
    this.apiPromotions = promotions;
    this.initialize();
}

ProductBase.prototype = {
    initialize: function () {
        this.id = this.product.ID;
        this.productName = this.product.name;
        this.price = priceFactory.getPrice(this.product, null, this.useSimplePrice,
            this.apiPromotions);
        this.productType = getProductType(this.product);
        this.images = this.variationModel ? new ImageModel(this.variationModel, this.imageConfig) :
            new ImageModel(this.product, this.imageConfig);
        this.rating = getRating(this.id);
        this.attributes = this.variationModel ?
            (new AttributesModel(this.variationModel, this.attributeConfig)).slice(0) : null;
        this.promotions = this.apiPromotions ? getPromotions(this.apiPromotions) : null;
    },
    /**
     * Normalize product and return Product variation model
     * @param  {dw.catalog.Product} product - Product instance returned from the API
     * @param  {Object} productVariables - variables passed in the query string to
     *                                     target product variation group
     * @return {dw.catalog.ProductVarationModel} Normalized variation model
     */
    getVariationModel: function (product, productVariables) {
        return getVariationModel(product, productVariables);
    }

};

/**
 * @constructor
 * @classdesc Base product class. Used for product tiles
 * @param {dw.catalog.Product} product - Product instance returned from the API
 * @param {Object} productVariables - variables passed in the query string to
 *                                    target product variation group
 * @param {dw.util.Collection.<dw.campaign.Promotion>} promotions - Collection of applicable
 *                                                                  Promotions
 */
function ProductWrapper(product, productVariables, promotions) {
    var productBase = new ProductBase(product, productVariables, null, promotions);
    var items = [
        'id',
        'productName',
        'price',
        'productType',
        'images',
        'rating',
        'attributes',
        'promotions'
    ];

    items.forEach(function (item) {
        this[item] = productBase[item];
    }, this);
}

module.exports = ProductWrapper;
module.exports.productBase = ProductBase;
module.exports.getProductType = getProductType;
module.exports.getVariationModel = getVariationModel;
