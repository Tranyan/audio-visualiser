var transo = (function (exports) {
  'use strict';

  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var initAudioVisualizer = /*#__PURE__*/function () {
    function initAudioVisualizer(options) {
      _classCallCheck(this, initAudioVisualizer);
      _defineProperty(this, "isInit", false);
      _defineProperty(this, "analyser", null);
      _defineProperty(this, "dataArray", []);
      _defineProperty(this, "ctx", null);
      _defineProperty(this, "canvasWidth", 0);
      _defineProperty(this, "canvasHeight", 0);
      _defineProperty(this, "colorStore", ['#00DBDE', '#FC00FF', '#7441FF', '#08AEEA', '#2AF598', '#FF630D', '#FFE53B', '#FF2525', '#F400FF']);
      _defineProperty(this, "colors", []);
      _defineProperty(this, "options", {
        audioElement: null,
        canvasElement: null,
        type: 'bar',
        fftSize: 512,
        //取值：2的指数
        customHandle: null,
        gradient: function gradient() {},
        maxValue: 256
      });
      this.init(options);
    }
    _createClass(initAudioVisualizer, [{
      key: "init",
      value: function init(options) {
        var _this$options = this.options = _objectSpread2(_objectSpread2({}, this.options), options),
          canvasElement = _this$options.canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.canvasWidth = canvasElement.width;
        this.canvasHeight = canvasElement.height;
        this.colorStore = options.colorStore || this.colorStore;
        this.getColors();
        this.start();
        this.render();
      }
    }, {
      key: "start",
      value: function start() {
        var _this = this;
        var _this$options2 = this.options,
          audioElement = _this$options2.audioElement,
          fftSize = _this$options2.fftSize;
        audioElement.onplay = function () {
          if (_this.isInit) {
            return;
          }
          // 1. 创建音频上下文
          var audioContext = new (window.AudioContext || window.webkitAudioContext)();
          // 2. 创建音频源
          var source = audioContext.createMediaElementSource(audioElement);
          // 3. 创建分析器
          _this.analyser = audioContext.createAnalyser();
          // 4. 设置分析器的大小
          _this.analyser.fftSize = fftSize;
          _this.dataArray = new Uint8Array(_this.analyser.frequencyBinCount);
          // 4. 连接分析器
          source.connect(_this.analyser);
          // 5. 连接音频输出
          _this.analyser.connect(audioContext.destination);
          _this.isInit = true;
        };
      }
    }, {
      key: "render",
      value: function render() {
        requestAnimationFrame(this.render.bind(this));
        var _this$options3 = this.options,
          type = _this$options3.type,
          customHandle = _this$options3.customHandle;
        var canvasWidth = this.canvasWidth,
          canvasHeight = this.canvasHeight,
          dataArray = this.dataArray,
          isInit = this.isInit,
          ctx = this.ctx,
          analyser = this.analyser;
        //清空画布
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        if (!isInit) {
          return;
        }
        // 获取频率数据
        analyser.getByteFrequencyData(dataArray);
        // 绘制图形
        switch (type) {
          case 'bar':
            this.drawBar();
            break;
          case 'line':
            this.drawLine();
            break;
          case 'circle':
            this.drawCircle();
            break;
          case 'particle':
            this.drawParticle();
            break;
          case 'custom':
            customHandle({
              dataArray: dataArray,
              ctx: ctx,
              canvasHeight: canvasHeight,
              canvasWidth: canvasWidth
            });
            break;
          default:
            this.drawBar();
            break;
        }
      }

      // 绘制条形图
    }, {
      key: "drawBar",
      value: function drawBar() {
        var dataArray = this.dataArray,
          canvasWidth = this.canvasWidth,
          canvasHeight = this.canvasHeight,
          ctx = this.ctx;
        var originalDataArray = dataArray;
        var arrLen = originalDataArray.length;
        var data = new Array(arrLen);
        for (var i = 0; i < arrLen / 2; i++) {
          data[i] = data[arrLen - i - 1] = originalDataArray[arrLen / 2 - i];
        }
        ctx.strokeStyle = this.options.gradient({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
          ctx: ctx
        }) || this.getLineGradient({
          canvasHeight: canvasHeight,
          ctx: ctx,
          canvasWidth: canvasWidth
        });
        var len = data.length;
        var lineWidth = this.options.lineWidth || canvasWidth / len;
        ctx.lineWidth = lineWidth - 2;
        ctx.lineCap = 'round';
        var maxValue = this.options.maxValue || 255;
        for (var _i = 0; _i < len; _i++) {
          var datai = data[_i] / 255 * maxValue; //<256
          if (!datai) {
            continue;
          }
          var x = _i * canvasWidth / len;
          var y = canvasHeight - datai;
          //画线
          ctx.beginPath();
          ctx.moveTo(x, canvasHeight);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
      // 绘制线条
    }, {
      key: "drawLine",
      value: function drawLine() {
        var dataArray = this.dataArray,
          canvasWidth = this.canvasWidth,
          canvasHeight = this.canvasHeight,
          ctx = this.ctx;
        var originalDataArray = dataArray;
        var arrLen = originalDataArray.length;
        var data = new Array(arrLen);

        //密度
        for (var i = 0; i < arrLen / 2; i++) {
          data[i] = data[arrLen - i - 1] = originalDataArray[arrLen / 2 - i];
        }
        var maxValue = this.options.maxValue || 255;
        var len = data.length;
        //间距
        var space = canvasWidth / len;
        var lineWidth = this.options.lineWidth || canvasWidth / len;
        ctx.strokeStyle = this.options.gradient({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
          ctx: ctx
        }) || this.getLineGradient({
          canvasHeight: canvasHeight,
          ctx: ctx,
          canvasWidth: canvasWidth
        });
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        // 开始路径  
        ctx.beginPath();
        // 移动到第一个控制点  
        // ctx.moveTo(0, canvasHeight);
        for (var _i2 = 0; _i2 < len; _i2++) {
          var d = data[_i2] / 255 * maxValue;
          var d2 = data[_i2 + 1] / 255 * maxValue;
          var x = _i2 * space;
          var y = canvasHeight - d;
          var x2 = (_i2 + 1) * space;
          var y2 = canvasHeight - d2;
          ctx.quadraticCurveTo(x, y, (x + x2) / 2, (y + y2) / 2);
        }
        ctx.stroke();
      }
      // 粒子
    }, {
      key: "drawParticle",
      value: function drawParticle() {
        var dataArray = this.dataArray,
          canvasWidth = this.canvasWidth,
          canvasHeight = this.canvasHeight,
          ctx = this.ctx;
        var originalDataArray = dataArray;
        var arrLen = originalDataArray.length;
        var data = new Array(arrLen);
        for (var i = 0; i < arrLen / 2; i++) {
          data[i] = data[arrLen - i - 1] = originalDataArray[arrLen / 2 - i];
        }
        ctx.fillStyle = this.options.gradient({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
          ctx: ctx
        }) || this.getLineGradient({
          canvasHeight: canvasHeight,
          ctx: ctx,
          canvasWidth: canvasWidth
        });
        var len = data.length;
        var particleSize = this.options.particleSize || canvasWidth / len;
        var maxValue = this.options.maxValue || 255;
        for (var _i3 = 0; _i3 < len; _i3++) {
          var datai = data[_i3] / 255 * maxValue; //<256
          if (!datai) {
            continue;
          }
          var x = _i3 * canvasWidth / len;
          var y = canvasHeight - datai;
          //画圆
          ctx.beginPath();
          ctx.arc(x, y, particleSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      // 绘制圆形
    }, {
      key: "drawCircle",
      value: function drawCircle() {
        var dataArray = this.dataArray,
          canvasWidth = this.canvasWidth,
          canvasHeight = this.canvasHeight,
          ctx = this.ctx;
        var originalDataArray = dataArray;
        var arrLen = originalDataArray.length;
        var data = new Array(arrLen);

        //密度
        for (var i = 0; i < arrLen / 2; i++) {
          data[i] = data[arrLen - i - 1] = originalDataArray[i] / 255 * 200;
        }
        //中心点
        var center = {
          x: canvasWidth / 2,
          y: canvasHeight / 2
        };
        //半径
        // const radius = data[0] / 255 * 200; // 使内圆变换
        var radius = this.options.innerRadius || 100;
        var maxValue = this.options.maxValue || 255;

        //圆周长
        var circumference = 2 * Math.PI * radius;
        var len = data.length;
        //坐标

        ctx.lineCap = 'round';
        ctx.strokeStyle = this.options.gradient({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
          ctx: ctx
        }) || this.getRadialGradient({
          canvasHeight: canvasHeight,
          ctx: ctx,
          canvasWidth: canvasWidth,
          maxValue: maxValue,
          radius: radius
        });
        var angle = Math.PI * 2 / len;
        var barWidth = circumference / len;
        ctx.lineWidth = barWidth;
        for (var _i4 = 0; _i4 < len; _i4++) {
          var x = center.x + Math.sin(_i4 * angle + Math.PI / 2) * radius;
          var y = center.y + Math.cos(_i4 * angle + Math.PI / 2) * radius;
          var x2 = center.x + Math.sin(_i4 * angle + Math.PI / 2) * (radius + data[_i4] / 255 * maxValue);
          var y2 = center.y + Math.cos(_i4 * angle + Math.PI / 2) * (radius + data[_i4] / 255 * maxValue);

          //画线
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      //获取线性渐变
    }, {
      key: "getLineGradient",
      value: function getLineGradient(_ref) {
        _ref.canvasHeight;
          var ctx = _ref.ctx,
          canvasWidth = _ref.canvasWidth;
        var gradient = ctx.createLinearGradient(0, 0, 0, canvasWidth);
        gradient.addColorStop(0, this.colors[0]);
        gradient.addColorStop(0.5, this.colors[1]);
        gradient.addColorStop(1, this.colors[2]);
        return gradient;
      }

      //获取径向渐变
    }, {
      key: "getRadialGradient",
      value: function getRadialGradient(_ref2) {
        var canvasHeight = _ref2.canvasHeight,
          ctx = _ref2.ctx,
          canvasWidth = _ref2.canvasWidth,
          radius = _ref2.radius,
          maxValue = _ref2.maxValue;
        var gradient = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, radius, canvasWidth / 2, canvasHeight / 2, radius + maxValue);
        gradient.addColorStop(0, this.colors[0]);
        gradient.addColorStop(0.5, this.colors[1]);
        gradient.addColorStop(1, this.colors[2]);
        return gradient;
      }
      //从colorStore中随机取出3个颜色,放入colors中
    }, {
      key: "getColors",
      value: function getColors() {
        for (var i = 0; i < 3; i++) {
          this.colors[i] = this.colorStore[Math.floor(Math.random() * this.colorStore.length)];
        }
      }

      //设置options
    }, {
      key: "setOptions",
      value: function setOptions(options) {
        this.options = _objectSpread2(_objectSpread2({}, this.options), options);
      }
    }]);
    return initAudioVisualizer;
  }();

  exports.initAudioVisualizer = initAudioVisualizer;

  return exports;

})({});
//# sourceMappingURL=index.js.map
