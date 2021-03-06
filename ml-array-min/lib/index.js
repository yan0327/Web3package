'use strict';

var isArray = require('is-any-array');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var isArray__default = /*#__PURE__*/_interopDefaultLegacy(isArray);

function min(input, options = {}) {
  if (!isArray__default['default'](input)) {
    throw new TypeError('input must be an array');
  }

  if (input.length === 0) {
    throw new TypeError('input must not be empty');
  }

  const { fromIndex = 0, toIndex = input.length } = options;

  if (
    fromIndex < 0 ||
    fromIndex >= input.length ||
    !Number.isInteger(fromIndex)
  ) {
    throw new Error('fromIndex must be a positive integer smaller than length');
  }

  if (
    toIndex <= fromIndex ||
    toIndex > input.length ||
    !Number.isInteger(toIndex)
  ) {
    throw new Error(
      'toIndex must be an integer greater than fromIndex and at most equal to length',
    );
  }

  let minValue = input[fromIndex];
  for (let i = fromIndex + 1; i < toIndex; i++) {
    if (input[i] < minValue) minValue = input[i];
  }
  return minValue;
}

module.exports = min;
