
export class initAudioVisualizer {
    isInit = false;
    analyser = null;

    dataArray = [];
    ctx = null;
    canvasWidth = 0;
    canvasHeight = 0;

    colorStore = ['#00DBDE','#FC00FF','#7441FF','#08AEEA','#2AF598','#FF630D','#FFE53B','#FF2525','#F400FF'];
    colors = [];

    options = {
        audioElement: null,
        canvasElement: null,
        type: 'bar',
        fftSize: 512,//取值：2的指数
        customHandle: null,
        gradient: () => {},
        maxValue: 256,
    };

    constructor(options) {
        this.init(options);
    }
    init(options) {
        const { canvasElement } = this.options = {...this.options,...options };
        this.ctx = canvasElement.getContext('2d');
        this.canvasWidth = canvasElement.width;
        this.canvasHeight = canvasElement.height;
        this.colorStore = options.colorStore || this.colorStore;
        this.getColors();
        this.start();
        this.render();
    }
    start() {
        const { audioElement, fftSize } = this.options;
        audioElement.onplay = () => {
            if (this.isInit) {
                return;
            }
            // 1. 创建音频上下文
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 2. 创建音频源
            const source = audioContext.createMediaElementSource(audioElement);
            // 3. 创建分析器
            this.analyser = audioContext.createAnalyser();
            // 4. 设置分析器的大小
            this.analyser.fftSize = fftSize;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            // 4. 连接分析器
            source.connect(this.analyser);
            // 5. 连接音频输出
            this.analyser.connect(audioContext.destination);
            this.isInit = true;
        };
    }

    render() {
        requestAnimationFrame(this.render.bind(this))
        const { type,customHandle } = this.options;
        const { canvasWidth, canvasHeight, dataArray,isInit,ctx,analyser } = this;
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
                customHandle({dataArray,ctx,canvasHeight,canvasWidth,});
                break;
            default:
                this.drawBar();
                break;
        }
    }

    // 绘制条形图
    drawBar() {
        const { dataArray,canvasWidth, canvasHeight,ctx } = this;
        const originalDataArray = dataArray;
        let arrLen = originalDataArray.length;
        const data = new Array(arrLen);
        for (let i = 0; i < arrLen / 2; i++) {
            data[i] = data[arrLen - i - 1] = originalDataArray[arrLen / 2 - i]
        }

        ctx.strokeStyle = this.options.gradient({canvasWidth, canvasHeight,ctx}) || this.getLineGradient({canvasHeight,ctx});

        const len = data.length;
        const lineWidth = this.options.lineWidth || canvasWidth / len;
        ctx.lineWidth = lineWidth - 2;
        ctx.lineCap = 'round';
        let maxValue = this.options.maxValue || 255;
        for (let i = 0; i < len; i++) {
            const datai = data[i] / 255 * maxValue; //<256
            if (!datai) {
                continue;
            }
            const x = i * canvasWidth / len;
            const y = canvasHeight - datai;
            //画线
            ctx.beginPath();
            ctx.moveTo(x, canvasHeight);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

    }
    // 绘制线条
    drawLine() {
        const { dataArray,canvasWidth, canvasHeight,ctx } = this;
        const originalDataArray = dataArray;
        let arrLen = originalDataArray.length;
        const data = new Array(arrLen);

        //密度
        for (let i = 0; i < arrLen / 2; i++) {
            data[i] = data[arrLen - i - 1] = originalDataArray[arrLen / 2 - i]
        }

        let maxValue = this.options.maxValue || 255;
        const len = data.length;
        //间距
        let space = canvasWidth / len;

        let lineWidth = this.options.lineWidth || canvasWidth / len;
        ctx.strokeStyle = this.options.gradient({canvasWidth, canvasHeight,ctx}) || this.getLineGradient({canvasHeight,ctx});

        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        // 开始路径  
        ctx.beginPath();
        // 移动到第一个控制点  
        // ctx.moveTo(0, canvasHeight);
        for (let i = 0; i < len; i++) {
            const d = data[i] / 255 * maxValue;
            const d2 = data[i + 1] / 255 * maxValue;
            const x = i * space;
            const y = canvasHeight  - d
            const x2 = (i + 1) * space;
            const y2 = canvasHeight - d2;
            ctx.quadraticCurveTo(x, y, (x + x2) / 2, (y + y2) / 2);
        }
        ctx.stroke();

    }
    // 粒子
    drawParticle() {
        const { dataArray,canvasWidth, canvasHeight,ctx } = this;
        const originalDataArray = dataArray;
        let arrLen = originalDataArray.length;
        const data = new Array(arrLen);
        for (let i = 0; i < arrLen / 2; i++) {
            data[i] = data[arrLen - i - 1] = originalDataArray[arrLen / 2 - i]
        }

        ctx.fillStyle = this.options.gradient({canvasWidth, canvasHeight,ctx}) || this.getLineGradient({canvasHeight,ctx});

        const len = data.length;
        const particleSize = this.options.particleSize || canvasWidth / len;
        let maxValue = this.options.maxValue || 255;
        for (let i = 0; i < len; i++) {
            const datai = data[i] / 255 * maxValue; //<256
            if (!datai) {
                continue;
            }
            const x = i * canvasWidth / len;
            const y = canvasHeight - datai;
            //画圆
            ctx.beginPath();
            ctx.arc(x, y, particleSize, 0, 2 * Math.PI);
            ctx.fill();
           
        }
    }
    // 绘制圆形
    drawCircle(){
        const { dataArray,canvasWidth, canvasHeight,ctx } = this;
        const originalDataArray = dataArray;
        let arrLen = originalDataArray.length;
        const data = new Array(arrLen);

         //密度
         for (let i = 0; i < arrLen / 2; i++) {
             data[i] = data[arrLen - i - 1] = originalDataArray[i] / 255 * 200
         }
         //中心点
        const center = {
            x: canvasWidth / 2,
            y: canvasHeight / 2
        }
        //半径
        // const radius = data[0] / 255 * 200; // 使内圆变换
        const radius = this.options.innerRadius || 100;
        let maxValue = this.options.maxValue || 255;

        //圆周长
        const circumference = 2 * Math.PI * radius;
        const len = data.length;
        //坐标
       
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.options.gradient({canvasWidth, canvasHeight,ctx}) || this.getRadialGradient({canvasHeight,ctx,canvasWidth,maxValue,radius});

        const angle = Math.PI * 2 / len;

        const barWidth = circumference / len;
        ctx.lineWidth = barWidth;

        for (let i = 0; i < len; i++) {
            const x = center.x + Math.sin(i * angle + Math.PI / 2) * radius;
            const y = center.y + Math.cos(i * angle + Math.PI / 2) * radius;

            const x2 = center.x + Math.sin(i * angle + Math.PI / 2) * (radius + data[i] / 255 * maxValue);
            const y2 = center.y + Math.cos(i * angle + Math.PI / 2) * (radius + data[i] / 255 * maxValue);

            //画线
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
    //获取线性渐变
    getLineGradient({canvasHeight, ctx}){
         const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
         gradient.addColorStop(0, this.colors[0]);
         gradient.addColorStop(0.5, this.colors[1]);
         gradient.addColorStop(1, this.colors[2]);
         return gradient;
    }
    //获取径向渐变
    getRadialGradient({canvasHeight, ctx, canvasWidth,radius,maxValue}){    
        const gradient = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, radius,canvasWidth / 2, canvasHeight / 2,radius+maxValue);
        gradient.addColorStop(0, this.colors[0]);
        gradient.addColorStop(0.5, this.colors[1]);
        gradient.addColorStop(1, this.colors[2]);
        return gradient;
    }
    //从colorStore中随机取出3个颜色,放入colors中
    getColors(){
        for(let i = 0; i < 3; i++){
            this.colors[i] = this.colorStore[Math.floor(Math.random() * this.colorStore.length)]
        }
    }

    //设置options
    setOptions(options){
        this.options = {...this.options,...options }
    }
}