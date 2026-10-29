import { useCallback, useRef } from "react";
import { GameCanvas } from "./game/GameCanvas";
import type { RoomScene } from "./game/RoomScene";
import { ChatPanel } from "./components/ChatPanel";
import "./App.css";

function App() {
  const sceneRef = useRef<RoomScene | null>(null);
  const handleSceneReady = useCallback((scene: RoomScene) => {
    sceneRef.current = scene;
  }, []);

  return (
    <div className="app-layout">
      <GameCanvas onSceneReady={handleSceneReady} />
      <ChatPanel sceneRef={sceneRef} />
    </div>
  );
}

export default App;
