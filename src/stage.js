import Sprite from './sprite'

export default class Stage extends Sprite {
  _stageEl = null
  _ctx = null
  aniReqId = null
  constructor({width=300, height=300, el}) {
    super({width, height})
    const EL = typeof el === 'string' ? document.querySelector(el) : el
    const {tagName} = EL
    if (tagName!== 'CANVAS') {
      console.error('node is not a canvas')
      return
    }
    EL.width = width;
    EL.height = height;

    this._stageEl = EL;
    this._ctx = EL.getContext('2d')

    this.initTouchHandel()
  }


  /**
   * 舞台渲染函数
   */
  render() {
    // console.log('render')
    const ctx = this._ctx
    if(!ctx) return
    ctx.clearRect(0,0, this.width, this.height);
    this.drawImages(this._children, ctx)
    this.aniReqId = window.requestAnimationFrame(()=>this.render())
  }
  drawImages(children, ctx) {
    children.forEach(sp => {
      const info = sp.getRenderInfo()
      if (info) {
        const {texture, x, y, width, height} = info
        try {
          ctx.drawImage(texture, x, y, width, height)
        } catch(error) {
          // todo
          console.error(error)
        }
      }
      const nextChildren = sp._children
      if (nextChildren.length) {
        this.drawImage(nextChildren, ctx)
      }
    })
  }
  /**
   * 开始执行每帧渲染
   */
  loop() {
    this.aniReqId = window.requestAnimationFrame(() => this.render())
  }
  /**
   * 停止RAF
   */
  stopLoop() {
    window.cancelAnimationFrame(this.aniReqId)
  }
  /**
   * 注册原生点击事件
   */
  initTouchHandel() {
    this._stageEl.addEventListener('click', (event)=> {
      const doc = document.documentElement
      const box = this._stageEl.getBoundingClientRect()
      const left = box.left + window.pageXOffset - doc.clientLeft
      const top = box.top + window.pageYOffset - doc.clientTop
      let x = event.pageX - left
      let y = event.pageY - top
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
   * 派发自定义点击事件
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
}

