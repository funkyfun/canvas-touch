import Sprite from './sprite'
import Stage from './stage'

const stage = new Stage({el: '#cavs'});

const sp1 = new Sprite({
  source: '../example/image/icon1.png',
  width: 100,
  height: 100,
  name: 'icon1'
})
const sp2 = new Sprite({
  source: '../example/image/icon2.png',
  width: 100,
  height: 100,
  x: 100,
  y: 100,
  name: 'icon2'
})
sp1.on('click', ()=> console.log('icon1 clicked'))
sp2.on('click', ()=> console.log('icon2 clicked'))
stage.addChild(sp1)
stage.addChild(sp2)
stage.loop()


