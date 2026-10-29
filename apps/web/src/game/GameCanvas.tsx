import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { RoomScene, ROOM_SCENE_SIZE } from "./RoomScene";

interface GameCanvasProps {
  onSceneReady: (scene: RoomScene) => void;
}

export function GameCanvas({ onSceneReady }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    const scene = new RoomScene();
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: ROOM_SCENE_SIZE.width,
      height: ROOM_SCENE_SIZE.height,
      backgroundColor: "#1a1626",
      physics: {
        default: "arcade",
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene,
    });
    gameRef.current = game;

    game.events.once(Phaser.Core.Events.READY, () => onSceneReady(scene));

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onSceneReady]);

  return <div ref={containerRef} className="game-canvas" />;
}
