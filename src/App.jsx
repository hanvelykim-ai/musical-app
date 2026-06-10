import { useState, useEffect, useCallback } from "react";
import { ACTORS, CAST, getActorScenes, sceneKey } from "./data";
import ActorScreen from "./ActorScreen";
import ResultScreen from "./ResultScreen";
import "./App.css";

const API = "/api/data";

function calcActorProgress(actor, dirsData) {
  const scenes = getActorScenes(actor);
  const dirs = dirsData || {};
  let done = 0;
  scenes.forEach((s, idx) => {
    const d = dirs[sceneKey(s)] || {};
    const isFirst = idx === 0, isLast = idx === scenes.length - 1;
    const needed = isFirst && isLast ? [d.exit]
      : isFirst ? [d.exit]
      : isLast ? [d.entry]
      : [d.entry, d.exit];
    if (needed.every(Boolean)) done++;
  });
  return { done, total: scenes.length };
}

export default function App() {
  const [screen, setScreen] = useState("main");
  const [savedData, setSavedData] = useState({});
  const [currentActor, setCurrentActor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 앱 시작 시 KV에서 불러오기
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(data => { setSavedData(data || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // KV에 저장
  const saveToKV = useCallback(async (data) => {
    setSaving(true);
    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } finally {
      setSaving(false);
    }
  }, []);

  const totalProgress = (() => {
    let done = 0, total = 0;
    ACTORS.forEach(a => {
      const p = calcActorProgress(a, savedData[a]);
      done += p.done; total += p.total;
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  })();

  const fullyDoneActors = ACTORS.filter(a => {
    const p = calcActorProgress(a, savedData[a]);
    return p.done === p.total;
  }).length;

  async function saveActor(actor, dirs) {
    const next = { ...savedData, [actor]: dirs };
    setSavedData(next);
    await saveToKV(next);
    setScreen("main");
  }

  async function resetAll() {
    if (window.confirm("모든 데이터를 초기화할까요?")) {
      setSavedData({});
      await saveToKV({});
    }
  }

  if (loading) {
    return (
      <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>I ❤</div>
          <div style={{ fontSize: 14 }}>불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (screen === "actor") {
    return (
      <ActorScreen
        actor={currentActor}
        initialDirs={savedData[currentActor] || {}}
        onSave={(dirs) => saveActor(currentActor, dirs)}
        onBack={() => setScreen("main")}
      />
    );
  }

  if (screen === "result") {
    return <ResultScreen savedData={savedData} onBack={() => setScreen("main")} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1 className="app-title">I ❤ 동선 관리</h1>
            <p className="app-sub">배우별 상수/하수 입장·퇴장 방향 입력</p>
          </div>
          <div className="header-actions">
            {saving && <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>저장 중...</span>}
            <button className="btn-ghost" onClick={resetAll}>초기화</button>
            <button className="btn-primary" onClick={() => setScreen("result")} disabled={fullyDoneActors === 0}>
              결과 보기
            </button>
          </div>
        </div>
        <div className="progress-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${totalProgress}%` }} />
          </div>
          <span className="progress-label">{totalProgress}% 완료</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
          {fullyDoneActors}명 완료 / {ACTORS.length}명
        </div>
      </header>

      <main className="main-content">
        <div className="cast-section">
          <div className="cast-label">CAST I</div>
          <div className="actor-grid">
            {["도연","세민","인성","우진","민규"].map(a => (
              <ActorCard key={a} actor={a} dirsData={savedData[a]} onClick={() => { setCurrentActor(a); setScreen("actor"); }} />
            ))}
          </div>
        </div>
        <div className="cast-section">
          <div className="cast-label">CAST ❤</div>
          <div className="actor-grid">
            {["수연","한나","종대","효민","준태"].map(a => (
              <ActorCard key={a} actor={a} dirsData={savedData[a]} onClick={() => { setCurrentActor(a); setScreen("actor"); }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ActorCard({ actor, dirsData, onClick }) {
  const { done, total } = calcActorProgress(actor, dirsData);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = done === total;
  const started = done > 0;
  return (
    <button className={`actor-card ${allDone ? "actor-card--done" : started ? "actor-card--partial" : ""}`} onClick={onClick}>
      <div className="actor-card-name">{actor}</div>
      <div className="actor-card-pct">{started ? `${pct}%` : `${total}장면`}</div>
      {started && (
        <div className="actor-mini-bar">
          <div className="actor-mini-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      {allDone && <div className="actor-card-check">✓</div>}
    </button>
  );
}
