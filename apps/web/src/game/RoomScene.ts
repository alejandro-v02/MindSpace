import Phaser from "phaser";
import { speak, stopSpeaking } from "../lib/voice";

const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 600;
const WALL_THICKNESS = 24;
const PLAYER_SPEED = 180;
const PLAYER_DISPLAY_HEIGHT = 140;
const CLICK_MOVE_THRESHOLD = 6;

export class RoomScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private clickTarget: Phaser.Math.Vector2 | null = null;
  private idleTime = 0;

  private bubbleBg!: Phaser.GameObjects.Graphics;
  private bubbleText!: Phaser.GameObjects.Text;
  private bubbleBuffer = "";
  private bubbleVisible = false;
  private bubbleHideTimer?: Phaser.Time.TimerEvent;

  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super("room");
  }

  preload(): void {
    this.load.image("alejo", "/sprites/alejo.png");
  }

  create(): void {
    this.drawRoom();
    this.createPlayer();
    this.createBubble();
    this.createStatusText();
    this.createInput();

    this.physics.world.setBounds(
      WALL_THICKNESS,
      WALL_THICKNESS,
      ROOM_WIDTH - WALL_THICKNESS * 2,
      ROOM_HEIGHT - WALL_THICKNESS * 2,
    );
  }

  update(_time: number, delta: number): void {
    this.handleMovement();
    this.handleIdleBob(delta);
    this.updateBubblePosition();
  }

  // --- Setup -------------------------------------------------------------

  private drawRoom(): void {
    const floor = this.add.graphics();
    const tile = 32;
    for (let x = 0; x < ROOM_WIDTH; x += tile) {
      for (let y = 0; y < ROOM_HEIGHT; y += tile) {
        const even = (x / tile + y / tile) % 2 === 0;
        floor.fillStyle(even ? 0x2b2438 : 0x241e30, 1);
        floor.fillRect(x, y, tile, tile);
      }
    }

    const walls = this.add.graphics();
    walls.fillStyle(0x15101c, 1);
    walls.fillRect(0, 0, ROOM_WIDTH, WALL_THICKNESS);
    walls.fillRect(0, ROOM_HEIGHT - WALL_THICKNESS, ROOM_WIDTH, WALL_THICKNESS);
    walls.fillRect(0, 0, WALL_THICKNESS, ROOM_HEIGHT);
    walls.fillRect(ROOM_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, ROOM_HEIGHT);

    // TODO(fase 3): reemplazar por un tilemap real hecho en Tiled con estaciones
    // por herramienta, según docs/architecture.md.
  }

  private createPlayer(): void {
    const texture = this.textures.get("alejo").getSourceImage();
    const scale = PLAYER_DISPLAY_HEIGHT / texture.height;

    this.player = this.physics.add.sprite(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, "alejo");
    this.player.setScale(scale);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(texture.width * 0.6, texture.height * 0.3);
    this.player.body?.setOffset(texture.width * 0.2, texture.height * 0.65);
  }

  private createBubble(): void {
    this.bubbleBg = this.add.graphics().setVisible(false);
    this.bubbleText = this.add
      .text(0, 0, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#1a1626",
        wordWrap: { width: 220 },
      })
      .setVisible(false);
  }

  private createStatusText(): void {
    this.statusText = this.add
      .text(ROOM_WIDTH / 2, WALL_THICKNESS + 8, "", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#d9c7ff",
      })
      .setOrigin(0.5, 0)
      .setVisible(false);
  }

  private createInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.clickTarget = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    });
    [this.cursors.up, this.cursors.down, this.cursors.left, this.cursors.right].forEach(
      (key) => key?.on("down", () => (this.clickTarget = null)),
    );
    Object.values(this.wasd).forEach((key) => key.on("down", () => (this.clickTarget = null)));
  }

  // --- Movement ------------------------------------------------------------

  private handleMovement(): void {
    const keyboardVector = this.readKeyboardVector();

    if (keyboardVector.lengthSq() > 0) {
      keyboardVector.normalize().scale(PLAYER_SPEED);
      this.player.setVelocity(keyboardVector.x, keyboardVector.y);
      this.applyFacing(keyboardVector.x);
      this.idleTime = 0;
      return;
    }

    if (this.clickTarget) {
      const toTarget = this.clickTarget.clone().subtract(this.player.getCenter());
      if (toTarget.length() < CLICK_MOVE_THRESHOLD) {
        this.clickTarget = null;
        this.player.setVelocity(0, 0);
      } else {
        toTarget.normalize().scale(PLAYER_SPEED);
        this.player.setVelocity(toTarget.x, toTarget.y);
        this.applyFacing(toTarget.x);
      }
      this.idleTime = 0;
      return;
    }

    this.player.setVelocity(0, 0);
  }

  private readKeyboardVector(): Phaser.Math.Vector2 {
    const vector = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left?.isDown || this.wasd.left.isDown) vector.x -= 1;
    if (this.cursors.right?.isDown || this.wasd.right.isDown) vector.x += 1;
    if (this.cursors.up?.isDown || this.wasd.up.isDown) vector.y -= 1;
    if (this.cursors.down?.isDown || this.wasd.down.isDown) vector.y += 1;
    return vector;
  }

  private applyFacing(vx: number): void {
    // Placeholder: solo hay una pose estática (ver docs/architecture.md sección
    // "Sprites y animación"), así que simulamos dirección volteando el sprite.
    if (vx < 0) this.player.setFlipX(true);
    else if (vx > 0) this.player.setFlipX(false);
  }

  private handleIdleBob(delta: number): void {
    const isMoving = this.player.body!.velocity.lengthSq() > 1;
    if (isMoving) {
      this.player.setScale(this.player.scaleX, Math.abs(this.player.scaleY));
      return;
    }
    this.idleTime += delta;
    const bob = Math.sin(this.idleTime / 350) * 0.015;
    this.player.setScale(this.player.scaleX, Math.abs(this.player.scaleX) + bob);
  }

  // --- Chat / voice API (llamado desde React) -------------------------------

  showThinking(): void {
    this.statusText.setText("pensando...").setVisible(true);
    this.bubbleBuffer = "";
    this.hideBubble();
  }

  appendToken(token: string): void {
    this.statusText.setVisible(false);
    this.bubbleBuffer += token;
    this.showBubble(this.bubbleBuffer);
  }

  async say(fullMessage: string): Promise<void> {
    this.statusText.setVisible(false);
    this.bubbleBuffer = fullMessage;
    this.showBubble(fullMessage);

    await new Promise<void>((resolve) => {
      speak(fullMessage, {
        onMouthOpen: () => this.pulseTalk(1),
        onMouthClose: () => this.pulseTalk(0),
        onEnd: () => {
          this.scheduleBubbleHide();
          resolve();
        },
      });
    });
  }

  stop(): void {
    stopSpeaking();
    this.hideBubble();
    this.statusText.setVisible(false);
  }

  private pulseTalk(intensity: number): void {
    const squash = intensity ? 0.94 : 1;
    this.tweens.add({
      targets: this.player,
      scaleY: Math.abs(this.player.scaleX) * squash,
      duration: 80,
      ease: "Sine.easeInOut",
    });
  }

  // --- Bubble rendering ------------------------------------------------------

  private showBubble(text: string): void {
    this.bubbleHideTimer?.remove();
    this.bubbleVisible = true;
    this.bubbleText.setText(text).setVisible(true);
    this.bubbleBg.setVisible(true);
    this.redrawBubbleBackground();
    this.updateBubblePosition();
  }

  private hideBubble(): void {
    this.bubbleVisible = false;
    this.bubbleText.setVisible(false);
    this.bubbleBg.setVisible(false);
  }

  private scheduleBubbleHide(): void {
    this.bubbleHideTimer?.remove();
    this.bubbleHideTimer = this.time.delayedCall(2500, () => this.hideBubble());
  }

  private redrawBubbleBackground(): void {
    const padding = 10;
    const bounds = this.bubbleText.getBounds();
    this.bubbleBg.clear();
    this.bubbleBg.fillStyle(0xf4ecff, 0.95);
    this.bubbleBg.fillRoundedRect(
      -bounds.width / 2 - padding,
      -bounds.height - padding * 2,
      bounds.width + padding * 2,
      bounds.height + padding * 2,
      8,
    );
  }

  private updateBubblePosition(): void {
    if (!this.bubbleVisible) return;
    const top = this.player.getTopCenter();
    this.bubbleText.setPosition(top.x - this.bubbleText.width / 2, top.y - 14 - this.bubbleText.height);
    this.bubbleBg.setPosition(top.x, top.y - 14);
    this.redrawBubbleBackground();
  }
}

export const ROOM_SCENE_SIZE = { width: ROOM_WIDTH, height: ROOM_HEIGHT };
