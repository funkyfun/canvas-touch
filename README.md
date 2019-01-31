# 处理Canvas上元素的点击事件

> 我们在浏览器处理点击交互时，通常是在DOM元素上注册点击事件监听函数`(domElement.addEventListener('click', callback))`，而Canvas作为一个DOM元素，我们要怎么处理画在Canvas上的元素的点击呢？

> 这是一个简单的实现DEMO。

## 简化问题
Canvas相关知识点很多，关注点过多，容易让问题变得越来越复杂，就像阅读某个库的源码，分解问题，简化问题，忽略一些细节实现，专注关注点，逐个击破，往往能让我们更容易分析问题得出结论。
所以在这里，抛开Canvas的渲染相关，只使用[drawImage](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage)来绘制图片元素，使用[requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Advanced_animations)来实现帧函数。
坐标系：以Canvas左上角为坐标原点(0,0),x轴向右递增，y轴向下递增，所有元素坐标锚点在左上角，所有元素的坐标为全局坐标(通常引擎的做法是每个容器元素一个坐标系，子元素相对父元素的坐标)。
![coordinates](https://gstatic.funkyfun.cn/common/canvastouch/canvas_touch_coordinates.png)

## 结构设计

```
节点关系
├─┬ CanvasElement 原生dom
│ ├─┬ Stage 舞台对象，绘制节点的根节点
│ │ ├── Sprite 绘制的节点对象

继承关系
Stage=>Sprite=>EventEmitter
```
- EventEmitter 实现自定义事件
- Sprite Canvas内基本绘制节点/容器，记录节点信息
- Stage 舞台，Sprite节点的根节点，管理渲染

## 实现
监听Canvas的原生点击事件，计算Canvas在页面上的位置，获取鼠标点击在页面上的坐标点，`点击点坐标` - `Canvas位置偏移量` = `点击点再Canvas坐标系上的坐标`。
```
  // Stage.js
  initTouchHandel() {
    this._stageEl.addEventListener('click', (event)=> {
      // egret引擎的实现
      // https://github.com/egret-labs/egret-core/blob/31ce53495642e847ccdd4f90f5a223d2e3526f35/src/egret/web/WebTouchHandler.ts#L177
      const doc = document.documentElement
      const box = this._stageEl.getBoundingClientRect()
      const left = box.left + window.pageXOffset - doc.clientLeft
      const top = box.top + window.pageYOffset - doc.clientTop
      let x = event.pageX - left
      let y = event.pageY - top
      // 得到点击点再Canvas坐标系的坐标xy
      // 根据坐标信息找到命中的元素
      let sp = this.findTarget(x, y, this._children)
      this.emitClick(sp, x, y)
    })
  }
  /**
   * 根据坐标找击中的目标
   */
  findTarget(pointX, pointY, children) {
    return children.find(sp => {
      let rs = sp.hitTest(pointX, pointY)
      return !!rs
    })
  }
  /**
   * 派发自定义点击事件
   */
  emitClick(sp,stageX, stageY) {
    if (!sp) return
    const children = sp._children
    const len = children.length
    const emitList = [sp]
    if (len) {
      for (let i = 0; i < len; i++) {
        const child = children[i]
        if (child.hitTest(stageX, stageY)) {
          emitList.push(child)
        }
      }
    }
    emitList.forEach(child=> child.emit('click', {stageX, stageY}))
  }
```
由于换算获取到了点击相对Canvas的坐标点，而Canvas内只有一个坐标系，所以这里很好实现元素的点击检测。
```
  // Sprite.js
  hitTest(stageX, stageY) {
    const sp = this
    let rs = false
    if (
      sp.width > 0 
      && sp.height > 0
      && sp.touchEnable
    ){
      const {x, y, width, height} = sp
      rs = (stageX > x && stageX < x + width) && (stageY > y && stageY < y + height)
    }
    return rs
  }
```

## start up
```
npm install
npm run dev
```
点击对应icon，控制台会有对应的打印。

