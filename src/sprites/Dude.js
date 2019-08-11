import Phaser from "phaser"

export default class extends Phaser.Physics.Arcade.Sprite {
  constructor({ scene, x, y, asset }) {
    super(scene, x, y, asset)
    scene.sys.displayList.add(this)
    scene.sys.updateList.add(this)
  }
}
