# 音频可视化

## 效果

![image](https://user-images.githubusercontent.com/26328508/147853669-5298204e-791a-401e-9995-888825802567.png)

## 简介

本项目是基于webAudio API

- 音频数据读取
- 音频数据处理
- 音频数据可视化

## 使用

```bash
npm i audio-visualizer
```

```bash
import { AudioVisualizer } from "AudioVisualizer";
const audioVisualizer = new AudioVisualizer(options);
```


```bash
options:{
    audioElement: htmlAudioElement, // 音频元素, document.querySelector('#audio')
    canvasElement: htmlCanvasElement, // canvas元素, document.querySelector('#canvas')
    type: 'bar'| 'line' | 'circle' | 'particle' | 'custom', // 类型
    fftSize: 512,// 采样点数, 取值必须为2的指数
    lineWidth:8, // 线条宽度, 默认为空, type === 'line' | 'circle'
    particleSize:3, // 粒子大小, 默认为空, type === 'particle'
    innerRadius:100, // 内半径, type === 'circle'
    maxValue:256, // 最大值, 限定图形高度
    //自定义渲染函数
    customHandle:({dataArray,ctx,canvasHeight,canvasWidth,})=>{}, 
    //渐变函数
    gradient: ({canvasWidth, canvasHeight,ctx})=>{},
    colorStore:[], //渐变色库，用于随机取色，自定义颜色请使用gradient函数
}

```



