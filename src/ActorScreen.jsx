import { useState } from "react";
import { CAST, getActorScenes, sceneKey, sceneLabel } from "./data";

export default function ActorScreen({ actor, initialDirs, onSave, onBack }) {
  const scenes = getActorScenes(actor);

  function initDirs(saved) {
    const result = {};
    scenes.forEach(s => {
      const key = sceneKey(s);
      result[key] = { entry: null, exit: null, ...(saved[key] || {}) };
    });
    return result;
  }

  const [dirs, setDirs] = useState(() => initDirs(initialDirs));

  function setDirection(key, type, val) {
    setDirs(prev => {
      const next = {};
      scenes.forEach(s => { next[sceneKey(s)] = { ...prev[sceneKey(s)] }; });
      const idx = scenes.findIndex(s => sceneKey(s) === key);

      if (type === "exit") {
        next[key].exit = val;
        if (idx < scenes.length - 1) {
          next[sceneKey(scenes[idx + 1])].entry = val;
        }
      } else {
        next[key].entry = val;
        if (idx > 0) {
          next[sceneKey(scenes[idx - 1])].exit = val;
        }
      }
      return next;
    });
  }

  // 완료 조건: 각 장면의 필수 항목이 모두 채워졌는지
  // 첫 장면: exit만 / 마지막 장면: entry만 / 중간: entry + exit 둘 다
  function isSceneDone(s, idx) {
    const d = dirs[sceneKey(s)];
    const isFirst = idx === 0;
    const isLast = idx === scenes.length - 1;
    if (isFirst && isLast) return !!d.exit;
    if (isFirst) return !!d.exit;
    if (isLast) return !!d.entry;
    return !!d.entry && !!d.exit;
  }

  const doneScenes = scenes.filter((s, idx) => isSceneDone(s, idx)).length;
  const totalScenes = scenes.length;
  const allDone = doneScenes === totalScenes;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn-ghost" onClick={onBack}>← 목록</button>
            <div>
              <h1 className="app-title">{actor}</h1>
              <p className="app-sub">CAST {CAST[actor]} · {scenes.length}개 장면</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => onSave(dirs, allDone)}>저장</button>
        </div>
        <div className="progress-wrap" style={{ marginTop: 10 }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(doneScenes / totalScenes) * 100}%` }} />
          </div>
          <span className="progress-label">{doneScenes}/{totalScenes} 완료</span>
        </div>
      </header>

      <main className="main-content">
        {scenes.map((s, idx) => {
          const key = sceneKey(s);
          const d = dirs[key];
          const prevS = idx > 0 ? scenes[idx - 1] : null;
          const nextS = idx < scenes.length - 1 ? scenes[idx + 1] : null;
          const done = isSceneDone(s, idx);

          return (
            <div key={key} className={`scene-block ${done ? "scene-block--done" : ""}`}>
              {prevS && (
                <div className="scene-context scene-context--prev">
                  <span className="context-label">직전</span>
                  <span className="context-title">{sceneLabel(prevS)} {prevS.title}</span>
                  <span className="context-role">{prevS.roles[actor]}</span>
                  {dirs[sceneKey(prevS)].exit && (
                    <span className={`exit-tag exit-tag--${dirs[sceneKey(prevS)].exit}`}>
                      {dirs[sceneKey(prevS)].exit === "left" ? "← 상수 퇴장" : "하수 퇴장 →"}
                    </span>
                  )}
                </div>
              )}

              <div className="scene-main">
                <div className="scene-info">
                  <div className="scene-num">{sceneLabel(s)}</div>
                  <div className="scene-title-text">{s.title}</div>
                  <div className="scene-role-badge">{s.roles[actor]}</div>
                </div>

                <div className="dir-selectors">
                  {prevS && (
                    <div className="dir-group">
                      <div className="dir-label">입장</div>
                      <div className="exit-btns">
                        <button className={`exit-btn exit-btn--left ${d.entry === "left" ? "active" : ""}`} onClick={() => setDirection(key, "entry", "left")}>← 상수</button>
                        <button className={`exit-btn exit-btn--right ${d.entry === "right" ? "active" : ""}`} onClick={() => setDirection(key, "entry", "right")}>하수 →</button>
                      </div>
                    </div>
                  )}
                  {nextS && (
                    <div className="dir-group">
                      <div className="dir-label">퇴장</div>
                      <div className="exit-btns">
                        <button className={`exit-btn exit-btn--left ${d.exit === "left" ? "active" : ""}`} onClick={() => setDirection(key, "exit", "left")}>← 상수</button>
                        <button className={`exit-btn exit-btn--right ${d.exit === "right" ? "active" : ""}`} onClick={() => setDirection(key, "exit", "right")}>하수 →</button>
                      </div>
                    </div>
                  )}
                  {!prevS && !nextS && (
                    <div className="dir-group">
                      <div className="dir-label">퇴장</div>
                      <div className="exit-btns">
                        <button className={`exit-btn exit-btn--left ${d.exit === "left" ? "active" : ""}`} onClick={() => setDirection(key, "exit", "left")}>← 상수</button>
                        <button className={`exit-btn exit-btn--right ${d.exit === "right" ? "active" : ""}`} onClick={() => setDirection(key, "exit", "right")}>하수 →</button>
                      </div>
                    </div>
                  )}
                  {!prevS && nextS && !dirs[key].entry && (
                    <div className="dir-group">
                      <div className="dir-label" style={{ visibility: "hidden" }}>입장</div>
                    </div>
                  )}
                </div>
              </div>

              {nextS && (
                <div className="scene-context scene-context--next">
                  <span className="context-label">다음</span>
                  <span className="context-title">{sceneLabel(nextS)} {nextS.title}</span>
                  <span className="context-role">{nextS.roles[actor]}</span>
                  {dirs[sceneKey(nextS)].entry && (
                    <span className={`exit-tag exit-tag--${dirs[sceneKey(nextS)].entry}`}>
                      {dirs[sceneKey(nextS)].entry === "left" ? "← 상수 입장" : "하수 입장 →"}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ height: 80 }} />
        <div className="bottom-bar">
          <button className="btn-primary btn-full" onClick={() => onSave(dirs, allDone)}>
            {allDone ? "✓ 완료 — 저장" : `저장 (${doneScenes}/${totalScenes} 입력됨)`}
          </button>
        </div>
      </main>
    </div>
  );
}
