/* globals __DEV__ */
import Phaser from "phaser"
import Dude from "../sprites/Dude"

export default class extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" })
  }

  init() {
    this.score = 0
    this.gameOver = false
  }

  preload() {
    this.add.text(100, 100, "loading assets...")

    this.load.image("sky", "src/assets/images/sky.png")
    this.load.image("ground", "src/assets/images/platform.png")
    this.load.image("star", "src/assets/images/star.png")
    this.load.image("bomb", "src/assets/images/bomb.png")
    this.load.spritesheet("dude", "src/assets/images/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    })
  }

  create() {
    this.add.image(400, 300, "sky")

    this.platforms = this.physics.add.staticGroup()
    this.platforms
      .create(400, 568, "ground")
      .setScale(2)
      .refreshBody()
    this.platforms.create(600, 400, "ground")
    this.platforms.create(50, 250, "ground")
    this.platforms.create(750, 220, "ground")

    this.player = new Dude({
      scene: this,
      x: 100,
      y: 450,
      asset: "dude",
    })
    this.physics.add.existing(this.player)

    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    })

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    })

    this.cursors = this.input.keyboard.createCursorKeys()

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    })
    this.stars.children.iterate(function(child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })

    this.bombs = this.physics.add.group()

    this.scoreText = this.add.text(16, 16, "SCORE: 0", {
      fontSize: "32px",
      fill: "#000",
    })

    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.stars, this.platforms)
    this.physics.add.collider(this.bombs, this.platforms)
    this.physics.add.overlap(
      this.player,
      this.stars,
      (player, star) => {
        star.disableBody(true, true)
        this.score += 10
        this.scoreText.setText("SCORE: " + this.score)

        if (this.stars.countActive(true) === 0) {
          this.stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true)
          })

          var x =
            player.x < 400
              ? Phaser.Math.Between(400, 800)
              : Phaser.Math.Between(0, 400)
          var bomb = this.bombs.create(x, 16, "bomb")

          bomb.setBounce(1)
          bomb.setCollideWorldBounds(true)
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
        }
      },
      null,
      this
    )
    this.physics.add.collider(
      this.player,
      this.bombs,
      (player, bomb) => {
        this.physics.pause()
        this.player.setTint(0xff0000)
        this.player.anims.play("turn")
        this.gameOver = true
      },
      null,
      this
    )
  }

  update() {
    if (this.gameOver) {
      return
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
      this.player.anims.play("left", true)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
      this.player.anims.play("right", true)
    } else {
      this.player.setVelocityX(0)
      this.player.anims.play("turn")
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330)
    }
  }
}
