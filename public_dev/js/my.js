$(function () { 
	var One = function () { };
	window.$O = One;
	
	One.config = function (options) {
		One._routes = options.routes;
		One.$container = options.container;
		var div = document.createElement('div');
		div.className = 'swiper-wrapper';
		One.$container.appendChild(div);
		One.wrapper = new Swiper(One.$container, {
            onlyExternal: true,
            simulateTouch: false,
            onSlideChangeEnd: function (swiper) {
                while (swiper.slides.length > (swiper.activeIndex + 1)) {
                    swiper.removeSlide(swiper.slides.length - 1);
                }
            }
		});
	};
	
	var Form = One.Form = function (name, options) {
        this.options = options = options || {};
        this.isRoot = false;
		this.name = name;
		this.$params = {};
		var _ary = name.split('?');
		if (_ary.length > 1) {
			this.name = _ary[0];
			var _q = _ary[1].split('&');
			for (var i = 0; i < _q.length; i++) {
				var _item = _q[i].split('=');
				this.$params[_item[0]] = _item[1];
			}
		}
        _ary = this.name.split('/');
        if (_ary.length > 1) {
            this._name = _ary[_ary.length - 1];
        } else {
            this.isRoot = true;
            this._name = this.name;
        }
		this.url = this._name + '/index.js';
		this.templateUrl = this._name + '/index.htm';
		return this;
	};
	
	Form.prototype._init = function (callbackFun) {
		var _this = this;
		//this._initCnf(function () {
		var _readyTemplate = function () {
			var div = document.createElement('div');
			_this.ele = div;
			_this.$el = $(_this.ele);
			if (_this.template) {
				div.innerHTML = _this.template;
				//_this.eles = [];
				//for (var i = 0; i < div.childNodes.length; i++) {
				//    _this.eles.push(div.childNodes[i]);
				//}
				if (_this.cnf) {
					if (_this.cnf.init) {
						_this.cnf.init.apply(_this, [_this.options.params]);
					}
				}
			}
			
			if (callbackFun) {
				callbackFun.apply(_this, []);
			}
		};
		if (_this.template || _this.ele) {
			_readyTemplate();
		} else {
			_this.templateUrl = (_this.cnf && _this.cnf.templateUrl) || _this.templateUrl;
			if (_this.templateUrl) {
				require(['text!../my/' + _this.templateUrl], function (template) {
					_this.template = template;
					_readyTemplate();
				});
			} else {
				_readyTemplate();
			}
		}
		//});
		
		return this;
	};
	
	Form.prototype._initCnf = function (callbackFun) {
		var _this = this;
		var onInitCnf = function () {
			if (_this.cnf) {
				for (var k in _this.cnf) {
					_this[k] = _this.cnf[k];
				}
			}
			if (_this.options.onInitCnf) {
				_this.options.onInitCnf.apply(_this, []);
			}
		};
		if (this.cnf || this.ele) {
			onInitCnf();
			callbackFun.apply(this, []);
		} else {
			require([this.url], function (cnf) {
				_this.cnf = cnf;
				onInitCnf();
				callbackFun.apply(_this, []);
			});
		}
	};
	
	Form.prototype.render = function (callbackFun) {
		var _this = this,
            _render = function () {
                if (_this.isRoot) {
                    while (One.wrapper.slides.length > 1) {
                        One.wrapper.removeSlide(One.wrapper.slides.length - 1);
                    }
                    if (One.wrapper.slides.length == 0) {
                        One.wrapper.appendSlide('<div class="swiper-slide o-form"></div>');
                    }
                    One.wrapper.slides[0].innerHTML = '';
                } else {
                    One.wrapper.appendSlide('<div class="swiper-slide o-form"></div>');
                }
                One.wrapper.slideTo(One.wrapper.slides.length - 1);
                One.wrapper.slides[One.wrapper.slides.length - 1].appendChild(_this.ele);
                One.wrapper.slides[One.wrapper.slides.length - 1].form = _this;
				if (_this.onRender) { 
					_this.onRender.apply(_this, []);
				}
			};
		
		this._initCnf(function () {
			this._init(function () {
				_render();
			});
		});
		
		return this;
	};
	
	Form.change = function (name, options) {
		//options = options || {};
		//if (options.params == undefined) {
		//	options.params = {};
		//}
		//var idx = O.wrapper.activeIndex || 0;
		//if (!options.notNewForm) {
		//	idx++;
		//}
		//if (idx >= O.wrapper.slides.length) {
		//	One.wrapper.appendSlide('<div class="swiper-slide o-form"></div>');
		//}
		//One.wrapper.slideTo(idx);
		//var slide = O.wrapper.slides[idx];
		//slide.innerHTML = '';
		//var form = new Form(name, options);
		//form.render(slide);

        One.curhash = name;
        new Form(name).render();
	};
	
	Form.back = function () {
		//var idx = O.wrapper.activeIndex;
		//if (idx > 0) {
		//	step = step || 1;
		//	idx -= step;
		//	if (idx < 0) {
		//		idx = 0;
		//	}
		//	One.wrapper.slideTo(idx);
		//}

		var idx = One.wrapper.activeIndex;
		if (idx) {
			var slide = One.wrapper.slides[idx - 1];
			One.wrapper.slideTo(idx - 1);
			One.disableHashEvent = true;
			location.href = '#' + slide.form.name;
			One.curhash = slide.form.name;
			setTimeout(function () {
				One.disableHashEvent = false;
			}, 100);
		}
	}
	
	Form.backTo = function (idx) {
		var curIdx = O.wrapper.activeIndex;
		if (idx < curIdx) {
			var startIdx = idx + 1;
			for (var i = startIdx; i < curIdx; i++) {
				One.wrapper.removeSlide(startIdx);
			}
			One.wrapper.slideTo(idx);
		}
	};
	
	Form.first = function () {
		var slide = One.wrapper.slides[0];
		if (slide) { 
			return slide.form;
		}
		return null;
	};
	
	
	require.config({
		baseUrl: '../jslib',
		paths: {
			root: '../my'
		},
		urlArgs: 't=' + Date.now()
	});
	
    One.curHash = null;
    One.disableHashEvent = false;

    One.chkHash = function () {
        if (!One.disableHashEvent) {
            var hash = location.hash.substr(1);
            if (hash != One.curhash) {
                if (hash == '') {
                    hash = 'index';
                }
                One.curhash = hash;
                var ary = hash.split('/');
                if (ary.length > 1) {
                    if (One.wrapper.slides.length > 0) {
                        new Form(hash).render();
                    } else {
                        One.curhash = ary[0];
                        if (One.wrapper.slides.length == 0) {
                            One.wrapper.appendSlide('<div class="swiper-slide o-form"></div>');
                        }
                        location.href = '#' + ary[0];
                        new Form(ary[0]).render();
                    }
                } else {
                    while (One.wrapper.slides.length > 1) {
                        One.wrapper.removeSlide(One.wrapper.slides.length - 1);
                    }
                    if (One.wrapper.slides.length == 0) {
                        One.wrapper.appendSlide('<div class="swiper-slide o-form"></div>');
                    }
                    new Form(hash).render();
                }
            }
        }
	};

	if ('onhashchange' in window) {
		$(window).on('hashchange', One.chkHash);
	} else if (history.pushState) {
		$(window).on('popstate', One.chkHash);
	} else {
		var _chkhash = function () {
			One.chkHash();
			setTimeout(_chkhash, 50);
		};
		_chkhash();
	}
	
	One.config({
		container: document.getElementById('container'),
		routes: {
			
		}
	});
    One.chkHash();

    One.backButton = $('.head_main>.btnBack');

    One.backButton.click(function () {
		Form.back();
    });

    var chkBack = function () {
        One.backButton.css('display', One.wrapper.activeIndex ? 'inline-block' : 'none');
        setTimeout(chkBack, 200);
    };
    chkBack();
});