/**
 * 显示对象类
 */
import eventemitter from 'eventemitter3'

class Sprite extends eventemitter {
  name = ""
  _children = []
  _parent = null
  _stage = null
  /**
   * 图片
   */
  texture
  x
  y
  width
  height
  touchEnable = true
  constructor({source=null, width=0, height=0, x=0, y=0, name=""}) {
    super()
    source && this.setTexture(source)
    Object.assign(this, {width, height, x, y, name})
  }

  setTexture(source){
    if (typeof source === 'string') {
      this.loadImage(source).then(texture=> this.texture = texture)
    } else if (source instanceof Image) {
      this.texture = texture
    }
  }

  loadImage(source) {
    return new Promise((resolve, reject)=> {
      const img = new Image()
      img.src = source
      img.onload = ()=> resolve(img)
    })

  }

  getChildByName(name) {
    if (name) {
      return this._children.find(child => child.name === name)
    }
    return null
  }

  addChild(sp) {
    if (sp instanceof Sprite) {
      sp._parent = this
      this._children.push(sp)
    }
  }
  
  removeChild(sp) {
    const children = this._children
    const index = children.findIndex((c)=> c === sp)
    children.splice(index, 1)
    sp._parent = null
  }

  removeChildAt(index) {
    const len = this._children.length
    if (index >= len || index < 0) {
      console.error('[Sprite removeChildAt] index out of range')
      return
    }
    const child = this._children[index]
    this.removeChild(child)
  }

  getRenderInfo() {
    let {texture, x, y, width, height} = this
    if (!texture || !width || !height) {
      return null
    }
    return {texture, x, y, width, height}
  }

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
}

export default Sprite
