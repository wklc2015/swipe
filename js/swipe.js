/*
 * swipe plugin
 *
 * swipe component
 */
+((function($, win, doc) {
	'use strict';
	var Utils = $.fn.utils;
	var mobileEvent = $.fn.mobileEvent;
	function etime(){
		return new Date().getTime();
	}

	function Swipe(container, options) {
		this.container = container;
		this.options = options;
		this.element = this.container.children[0];
		this.index = this.options.startSlide;
		this.translateZ = Utils.hasPerspective && this.options.translateZ ? ' translateZ(0px)' : '';
		this.startPosition = {};
		this.moveDelta = {};
		this.events = {};
		this.sizeParam = ['height', 'width'][this.options.direction === 'y' ? 0 : 1];
		this.sizePosition = ['top', 'left'][this.options.direction === 'y' ? 0 : 1];
		this.timer = null;
		this.isAnimating = false;
		this.init();
	}

	Swipe.DEFAULTS = {
		animated: 0,
		zoomTo: 0.9,
		zoomIng: 0.2,
		startSlide: 0,
		speed: 300,
		direction: 'y',
		distanceValue: 10,
		loop: true,
		disableToPrev: false,
		disableToNext: false,
		translateZ: true,
		bindToContainer: true,
		bind: true,
		showIcons: false,
		iconsClass: null,
		autoPlay: false,
		maskClass: 'swipe-mask',
		pageClass: 'swipe-page'
	}

	Swipe.prototype.disableToPrev = function() {
		this.options.disableToPrev = true;
	}

	Swipe.prototype.enableToPrev = function() {
		this.options.disableToPrev = false;
	}
	Swipe.prototype.disableToNext = function() {
		this.options.disableToNext = true;
	}
	Swipe.prototype.enableToNext = function() {
		this.options.disableToNext = false;
	}
	Swipe.prototype.getIndex = function() {
		return this.index;
	}
	Swipe.prototype.getLength = function() {
		return this.length;
	}
	Swipe.prototype.on = function(type, fn) {
		if (!this.events[type]) {
			this.events[type] = [];
		}
		this.events[type].push(fn);
	}
	Swipe.prototype.off = function(type, fn) {
		if (this.events[type]) {
			var index = this.events[type].indexOf(fn);
			if (index > -1) {
				this.events[type].splice(index, 1);
			}
		}
	}
	Swipe.prototype.execEvent = function(type) {
		var that = this;
		if (this.events[type]) {
			for (var i = 0, l = this.events[type].length; i < l; i++) {
				this.events[type][i].apply(this, [].slice.call(arguments, 1));
			}
		}
	}
	Swipe.prototype.autoPlay = function() {
		var that = this;
		if (this.options.autoPlay) {
			this.closeAuto();
			this.timer = setTimeout(function() {
				that.slideTo(that._circle(that.index + 1));
				that.autoPlay();
			}, that.options.autoPlay);
		}
	}
	Swipe.prototype.closeAuto = function() {
		clearTimeout(this.timer);
	}
	Swipe.prototype.init = function() {
		this.initNodes();
		this.initEvents();
		this.autoPlay();
	}
	Swipe.prototype.initNodes = function() {
		var width = this.container.getBoundingClientRect().width;
		var height = this.container.getBoundingClientRect().height;
		this.slides = this.element.children;
		this.length = this.slides.length;
		this.wraperSize = this.options.direction === 'y' ? height : width;
		this.element.style[this.sizeParam] = (this.length * this.wraperSize) + 'px';
		this.options.showIcons && (this.initIcons());
		this.slidePos = new Array(this.length);
		var pos = this.length;
		while (pos--) {
			var slide = this.slides[pos];
			var page = slide.children[0];
			var dist = this.index > pos ? -this.wraperSize : (this.index < pos ? this.wraperSize : 0);
			slide.setAttribute('data-index', pos);
			slide.style[this.sizeParam] = this.wraperSize + 'px';
			slide.style[this.sizePosition] = (pos * -this.wraperSize) + 'px';
			this._translate(slide, dist, 0);
			if (this.options.mask) {
				var div = doc.createElement('div');
				div.className = this.options.mask;
				page.appendChild(div);
			}
		}
		this.initPosition();
		this.container.style.visibility = 'visible';
		//this.target = $(this.options.bindToContainer ? (this.options.maskClass ? '.' + this.options.maskClass : this.container) : window);
		this.target = this.options.bindToContainer ? this.container : window;
	}
	Swipe.prototype.initIcons = function() {
		var pos = this.length,
			html = '';
		this.icons = doc.createElement('ul');
		for (var i = 0; i < this.length; i++) {
			html += '<li>' + i + '</li>';
		}
		this.icons.innerHTML = html;
		this.icons.className = 'mSwipe-icons' + (this.options.iconsClass ? ' ' + this.options.iconsClass : '');
		this.iconsItems = this.icons.children;
		this.container.appendChild(this.icons);
	}
	Swipe.prototype.initPosition = function(num, back) {
		var pos = this.length,
			prev, next;
		if (arguments.length == 2 && typeof num === 'number') {
			if (back) {
				prev = num;
				next = null;
			} else {
				prev = null;
				next = num;
			}
		} else {
			prev = this._circle(this.index - 1);
			next = this._circle(this.index + 1);
		}
		this.prevPage = null;
		this.currPage = null;
		this.nextPage = null;
		while (pos--) {
			var slide = this.slides[pos];
			var dist = this.index > pos ? -this.wraperSize : (this.index < pos ? this.wraperSize : 0);
			if (pos == prev) {
				this.prevPage = slide;
				slide.setAttribute('data-slide', 'prev');
				this._translate(slide, -this.wraperSize, 0);
				this.slidePos[pos] = -this.wraperSize;
			} else if (pos == this.index) {
				this.currPage = slide;
				slide.setAttribute('data-slide', 'curr');
				this._translate(slide, 0, 0);
				this.slidePos[pos] = 0;
			} else if (pos == next) {
				this.nextPage = slide;
				slide.setAttribute('data-slide', 'next');
				this._translate(slide, this.wraperSize, 0);
				this.slidePos[pos] = this.wraperSize;
			} else {
				slide.setAttribute('data-slide', 'none');
				this._translate(slide, dist, 0);
				this.slidePos[pos] = dist;
			}
			/**
			 * 处理icosn图标
			 * */
			if (this.options.showIcons) {
				var i = this.length - pos - 1;
				this.iconsItems[i].className = i == this.index ? 'active' : '';
			}
		}
		this.lastIndex = this.index;
	}
	Swipe.prototype.initEvents = function() {
		var that = this;
		win.addEventListener('resize', function() {
			that._resize();
		}, false)
		if (this.options.bind) {
			this.target.addEventListener(mobileEvent.start, function(e) {
				that._start(e);
			}, false);
			this.target.addEventListener(mobileEvent.move, function(e) {
				that._move(e);
			}, false);
			this.target.addEventListener(mobileEvent.end, function(e) {
				that._end(e);
			}, false);
		} else {
			win.on(mobileEvent.move, function() {
				return false;
			}, false);
		}
	}
	Swipe.prototype._circle = function(index, loop) {
		return (arguments.length == 2 ? loop : this.options.loop) ? (this.length + (index % this.length)) % this.length : index;
	}
	Swipe.prototype._translate = function(slide, dist, speed) {
		var style = slide && slide.style;
		if (style) {
			style[Utils.style.transitionDuration] = speed + 'ms';
			style[Utils.style.transform] = 'translate' + this.options.direction.toUpperCase() + '(' + dist + 'px)' + this.translateZ;
		}
	}
	Swipe.prototype._transformOrigin = function(style, distance) {
		if (distance > 0) {
			style[Utils.style.transformOrigin] = this.options.direction === 'x' ? '100% 50%' : '50% 100%';
		} else if (distance < 0) {
			style[Utils.style.transformOrigin] = this.options.direction === 'x' ? '0% 50%' : '50% 0%';
		}
	}
	Swipe.prototype._scale = function(slide, dist, speed) {
		var style = slide && slide.style;
		if (style) {
			var scaleTo = (this.wraperSize - Math.abs(dist) * this.options.zoomIng) / this.wraperSize;
			this._transformOrigin(style, dist);
			style[Utils.style.transitionDuration] = speed + 'ms';
			style[Utils.style.transform] = 'scale(' + scaleTo + ') translateZ(0px)';
		}
	}
	Swipe.prototype._resize = function() {
		this.initNodes();
	}
	Swipe.prototype._start = function(e) {
		if (!this.isAnimating) {
			var touches = e['targetTouches'] ? e['targetTouches'][0] : e;
			this.startPosition = {
				x: touches.pageX,
				y: touches.pageY
			};
			this.moveDelta = {
				x: 0,
				y: 0
			};
			this.isAnimating = false;
			this.isMouseDown = true;
			this.hasMoved = false;
			this.firstMoved = true;
			this.disableMove = true;
			this.time = etime();
			this.execEvent('beforetouchStart');
		}
	}
	Swipe.prototype._move = function(e) {
		e.preventDefault();
		e.stopPropagation(); 
		/*add the time interval*/
		var t = etime();
		//if(t - this.time < 100) return;
		this.time = t;
		if (this.isMouseDown ) {
			var touches = e['targetTouches'] ? e['targetTouches'][0] : e;
			this.moveDelta = {
				x: touches.pageX - this.startPosition.x,
				y: touches.pageY - this.startPosition.y
			};
			this.moveDistance = this.moveDelta[this.options.direction];
			if ((this.options.disableToNext && this.moveDistance < 0) || (this.options.disableToPrev && this.moveDistance > 0)) {
				this.disableMove = true;
			} else {
				if (this.firstMoved) {
					this.execEvent('touchStart');
				}
				this.disableMove = false;
				this.firstMoved = false;
				this.hasMoved = true;
				this._effectMove();
				this.execEvent('touchMove');
			}
		}
		return false;
	}
	Swipe.prototype._end = function(e) {
		if (this.isMouseDown) {
			this.isMouseDown = false;
			(!this.disableMove && this.hasMoved) && (this._effectEnd());
            this.execEvent('touchEnd');
		}
	}
	Swipe.prototype._effectMove = function() {
		var distance = this.moveDistance;
		if ((distance < 0 && !this.nextPage) || (distance > 0 && !this.prevPage)) {
			distance = distance * this.options.zoomIng;
		}
		switch (this.options.animated) {
			case 1:
				this._translate(this.prevPage, distance + this.slidePos[this._circle(this.index - 1)], 0);
				this._scale(this.currPage, distance, 0);
				this._translate(this.nextPage, distance + this.slidePos[this._circle(this.index + 1)], 0);
				break;
			case 2:
				if (!!this.prevPage) {
					this._translate(this.prevPage, distance + this.slidePos[this._circle(this.index - 1)], 0);
				} else {
					(distance >= 0) && (this._translate(this.currPage, distance + this.slidePos[this._circle(this.index)], 0));
				}
				if (!!this.nextPage) {
					this._translate(this.nextPage, distance + this.slidePos[this._circle(this.index + 1)], 0);
				} else {
					(distance <= 0) && (this._translate(this.currPage, distance + this.slidePos[this._circle(this.index)], 0));
				}
				break;
			default:
				this._translate(this.prevPage, distance + this.slidePos[this._circle(this.index - 1)], 0);
				this._translate(this.currPage, distance + this.slidePos[this._circle(this.index)], 0);
				this._translate(this.nextPage, distance + this.slidePos[this._circle(this.index + 1)], 0);
				break;
		}
	}
	Swipe.prototype._effectEnd = function(distance, to, speed) {
		var that = this;
		var isSlide = arguments.length == 3;
		var size, index = this.index;
		this.isAnimating = true;
		distance = isSlide ? arguments[0] : this.moveDistance;
		speed = isSlide ? arguments[2] : this.options.speed;
		if (distance > this.options.distanceValue && !!this.prevPage) {
			size = this.wraperSize;
			this.index = isSlide ? to : this._circle(this.index - 1);
		} else if (distance < -this.options.distanceValue && !!this.nextPage) {
			size = -this.wraperSize;
			this.index = isSlide ? to : this._circle(this.index + 1);
		} else {
			this.hasMoved = false;
			size = 0;
		}
		switch (this.options.animated) {
			case 1:
				this._translate(this.prevPage, size + this.slidePos[this._circle(index - 1)], speed);
				this._scale(this.currPage, size, speed);
				this._translate(this.nextPage, size + this.slidePos[this._circle(index + 1)], speed);
				break;
			case 2:
				if (!!this.prevPage) {
					this._translate(this.prevPage, size + this.slidePos[this._circle(index - 1)], speed);
				} else {
					(distance >= 0) && (this._translate(this.currPage, size + this.slidePos[index], speed));
				}
				if (!!this.nextPage) {
					this._translate(this.nextPage, size + this.slidePos[this._circle(index + 1)], speed);
				} else {
					distance <= 0 && (this._translate(this.currPage, size + this.slidePos[index], speed));
				}
				break;
			default:
				this._translate(this.prevPage, size + this.slidePos[this._circle(index - 1)], speed);
				this._translate(this.currPage, size + this.slidePos[index], speed);
				this._translate(this.nextPage, size + this.slidePos[this._circle(index + 1)], speed);
				break;
		}
		setTimeout(function () {
			that._transitionEnd();
		}, speed);
	}
	Swipe.prototype._transitionEnd = function() {
		this.isAnimating = false;
		if (this.lastIndex != this.index) {
			this.execEvent('pageCallback');
		}
		this.execEvent('transitionEnd');
		this.initPosition();
		this.autoPlay();
	}
	Swipe.prototype.prev = function() {
		this.slideTo(this._circle(this.index - 1, true), this.options.speed, true);
	}
	Swipe.prototype.next = function() {
		this.slideTo(this._circle(this.index + 1, true), this.options.speed, false);
	}
	Swipe.prototype.slideTo = function(num, speed, back) {
		if (!this.isAnimating && typeof num == 'number') {
			var that = this,
				symbol, to, from;
			if (num >= 0 && num < this.length && num != this.index) {
				this.isAnimating = true;
				this.closeAuto();
				if (arguments.length == 3) {
					to = back ? 1 : -1;
					from = back;
				} else {
					to = num < this.index ? 1 : -1;
					from = num < this.index;
				}
				symbol = to * (this.options.distanceValue + 1);
				this.initPosition(num, from);
				this.execEvent('beforeSlide', num);
				speed = speed != undefined ? speed : this.options.speed;
				setTimeout(function () {
					taht._effectEnd();
				}, 20, symbol, num, speed);
			}
		}
	}

	function Plugin(option) {
		return this.each(function() {
			var $this = $(this)
			var data = $this.data('wui.swipe');
			var options = $.extend({}, Swipe.DEFAULTS, option);
			if (!data) $this.data('wui.swipe', (data = new Swipe(this, options)));
		})
	}

	var old = $.fn.swipe;

	$.fn.swipe = Plugin;
	$.fn.swipe.Constructor = Swipe;

	$.fn.swipe.noConflict = function() {
		$.fn.swipe = old;
		return this;
	}
})(jQuery, window, document))