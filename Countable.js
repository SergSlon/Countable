/**
 * Countable is a script to allow for live paragraph-, word- and character-
 * counting on an HTML element. Usage is recommended on `input` and `textarea`
 * elements.
 *
 * @author   Sacha Schmid (http://github.com/RadLikeWhoa)
 * @version  1.2.0
 * @license  MIT
 */

;(function () {
  'use strict';

  /**
   * String.trim() polyfill for non-supporting browsers.
   *
   * @return  {String}  The original string with leading and trailing
   *                    whitespace removed.
   */

  if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  /**
   * Create a new Countable instance on an HTML element.
   *
   * @constructor
   *
   * @param    {HTMLElement}  element     The element to be used for the
   *                                      counting.
   * @param    {Function}     [callback]  The callback to receive and process
   *                                      the result. The callback should
   *                                      accept only one parameter. (default:
   *                                      logs to console)
   * @param    {Boolean}      [hard]      Sets whether to use hard returns (2
   *                                      line breaks) or not. (default: false)
   *
   * @example  new Countable(elem, function (counter) {
   *             alert(counter.paragraphs, counter.words, counter.characters);
   *           });
   *
   * @return   {Countable}    An instance of the Countable class.
   */

  var _ = window.Countable = function (element, callback, hard) {

    /**
     * Expect a valid HTMLElement. If no element or an invalid value is given,
     * Countable returns nothing.
     */

    if (!element || element.nodeType !== 1) return;

    this.element = element;
    this.callback = typeof callback === 'function' ? callback : function (counter) {
      if (typeof console !== 'undefined') console.log(counter);
    };
    this.hard = hard;

    this.init();

    return this;
  };

  _.prototype = {

    /**
     * decode function from the punycode.js library also on an MIT license.
     * This function allows for the proper counting of unicode characters.
     *
     * @return  {Array}   This returns an array of unicode character codes.
     *                    Javascript internally uses ucs2.
     */

    decode: function (string) {
      var output = [],
          counter = 0,
          length = string.length,
          value, extra;

      while (counter < length) {
        value = string.charCodeAt(counter++);

        if ((value & 0xF800) == 0xD800 && counter < length) {
          extra = string.charCodeAt(counter++);
          if ((extra & 0xFC00) == 0xDC00) {
            output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
          } else {
            output.push(value, extra);
          }
        } else {
          output.push(value);
        }
      }

      return output;
    },

    /**
     * Trim leading and trailing whitespace and count paragraphs, words and
     * characters.
     *
     * @return  {Object}  The object containing the number of paragraphs, words
     *                    and characters, all accessible by their names.
     */

    count: function () {
      var orig = (this.element.value || this.element.innerText || this.element.textContent || ''),
          tagRegEx = /<([a-zA-Z]+).*>(.*)<\/\1>/,
          isTag = tagRegEx.exec(orig),
          str = isTag ? isTag[2].trim() : orig.trim();

      return {
        paragraphs: str ? (str.match(this.hard ? /\n{2,}/g : /\n+/g) || []).length + 1 : 0,
        words: str ? (str.replace(/['";:,.?¿\-!¡]+/g, '').match(/\S+/g) || []).length : 0,
        characters: str ? this.decode(str.replace(/\s/g, '')).length : 0,
        all: this.decode(orig.replace(/[\n\r]/g, '')).length
      };
    },

    /**
     * Initiate the Countable object by calling the `count()` function and
     * adding the `input` event listener to the given element.
     */

    init: function () {
      var self = this;

      self.callback(self.count());

      if (typeof self.element.addEventListener !== 'undefined') {
        self.element.addEventListener('input', function () {
          self.callback(self.count());
        });
      } else if (typeof self.element.attachEvent !== 'undefined') {
        self.element.attachEvent('onkeydown', function () {
          self.callback(self.count());
        });
      }
    }

  };
}());