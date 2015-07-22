/*
 * mobile.js
 * date 2015-07-21
 * 
 * check ths brower is mobile or not
 * and set the mobile or desktop event name
 * and set CSS3 animation related properties
 * */
+(function($, win, doc) {
	'use strict';
	var me = {};
	var Mobile = (function() {
		var isMobile = false;
		var sUserAgent = navigator.userAgent.toLowerCase();
		var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
		var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
		var bIsMidp = sUserAgent.match(/midp/i) == "midp";
		var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
		var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
		var bIsAndroid = sUserAgent.match(/android/i) == "android";
		var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
		var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
		if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
			isMobile = true;
		}
		return {
			check: isMobile,
			eventName: {
				start: isMobile ? 'touchstart' : 'mousedown',
				move: isMobile ? 'touchmove' : 'mousemove',
				end: isMobile ? 'touchend' : 'mouseup',
				tap: isMobile ? 'touchstart' : 'click'
			}
		};
	}())
	
	var _elementStyle = doc.createElement('div').style;
	var _vendor = (function() {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;
		for (; i < l; i++) {
			transform = vendors[i] + 'ransform';
			if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
		}
		return false;
	})();

	function _prefixStyle(style) {
		if (_vendor === false) return false;
		if (_vendor === '') return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}
	var _transform = _prefixStyle('transform');
	me.extend = function(target, obj) {
		for (var i in obj) {
			target[i] = obj[i];
		}
	};
	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: Mobile.check,
		hasPointer: win.PointerEvent || win.MSPointerEvent, // IE10 is prefixed
		hasTransition: _prefixStyle('transition') in _elementStyle
	});
	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transformOrigin: _prefixStyle('transformOrigin'),
		animationDelay: _prefixStyle('animationDelay'),
		animationDuration: _prefixStyle('animationDuration')
	});

	$.fn.isMobile = Mobile.check;

	$.fn.mobileEvent = Mobile.eventName;
	
	$.fn.utils = me;
}(jQuery, window, document))
