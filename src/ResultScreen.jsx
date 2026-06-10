import { useState } from "react";
import { ACTORS, getActorScenes, sceneKey, sceneLabel } from "./data";

export default function ResultScreen({ savedData, onBack }) {
  const [tab, setTab] = useState("flow");
  const [focusActor, setFocusActor] = useState(ACTORS.find(a => savedData[a]) || ACTORS[0]);
  const costumeData = buildCostumeData(savedData);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn-ghost" onClick={onBack}>← 목록</button>
            <h1 className="app-title">결과 정리</h1>
          </div>
          <div className="tab-toggle">
            <button className={`tab-btn ${tab === "flow" ? "active" : ""}`} onClick={() => setTab("flow")}>동선표</button>
            <button className={`tab-btn ${tab === "costume" ? "active" : ""}`} onClick={() => setTab("costume")}>의상 위치</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {tab === "flow" && (
          <>
            <div className="actor-tabs">
              {ACTORS.map(a => (
                <button
                  key={a}
                  className={`actor-tab ${a === focusActor ? "active" : ""} ${!savedData[a] ? "empty" : ""}`}
                  onClick={() => setFocusActor(a)}
                >{a}</button>
              ))}
            </div>
            <FlowTable actor={focusActor} savedData={savedData} />
          </>
        )}
        {tab === "costume" && <CostumeView costumeData={costumeData} />}
      </main>
    </div>
  );
}

function FlowTable({ actor, savedData }) {
  if (!savedData[actor]) return <div className="empty-state">아직 입력된 데이터가 없습니다.</div>;
  const scenes = getActorScenes(actor);
  const dirs = savedData[actor];

  return (
    <div className="flow-table-wrap">
      <table className="flow-table">
        <thead>
          <tr><th>막/장</th><th>장면</th><th>역할</th><th>입장</th><th>퇴장</th></tr>
        </thead>
        <tbody>
          {scenes.map((s, idx) => {
            const key = sceneKey(s);
            const d = dirs[key] || {};
            const isFirst = idx === 0;
            return (
              <tr key={key}>
                <td className="td-num">{sceneLabel(s)}</td>
                <td className="td-title">{s.title}</td>
                <td><span className="role-badge">{s.roles[actor]}</span></td>
                <td>
                  {isFirst
                    ? <span className="tag-first">첫 등장</span>
                    : d.entry
                      ? <span className={`exit-tag exit-tag--${d.entry}`}>{d.entry === "left" ? "← 상수" : "하수 →"}</span>
                      : <span className="tag-empty">-</span>}
                </td>
                <td>
                  {d.exit
                    ? <span className={`exit-tag exit-tag--${d.exit}`}>{d.exit === "left" ? "← 상수" : "하수 →"}</span>
                    : <span className="tag-empty">-</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CostumeView({ costumeData }) {
  return (
    <div className="costume-view">
      <div className="costume-columns">
        <div className="costume-col costume-col--left">
          <div className="costume-col-header">← 상수 대기 의상</div>
          {costumeData.left.length === 0
            ? <div className="empty-state">없음</div>
            : costumeData.left.map((item, i) => (
              <div key={i} className="costume-item">
                <div className="costume-actor">{item.actor}</div>
                <div className="costume-flow">
                  <span className="costume-from">{item.fromRole}</span>
                  <span className="costume-arrow">→</span>
                  <span className="costume-to">{item.toRole}</span>
                </div>
                <div className="costume-scene">{item.fromScene} 퇴장 후</div>
              </div>
            ))}
        </div>
        <div className="costume-col costume-col--right">
          <div className="costume-col-header">하수 대기 의상 →</div>
          {costumeData.right.length === 0
            ? <div className="empty-state">없음</div>
            : costumeData.right.map((item, i) => (
              <div key={i} className="costume-item">
                <div className="costume-actor">{item.actor}</div>
                <div className="costume-flow">
                  <span className="costume-from">{item.fromRole}</span>
                  <span className="costume-arrow">→</span>
                  <span className="costume-to">{item.toRole}</span>
                </div>
                <div className="costume-scene">{item.fromScene} 퇴장 후</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function buildCostumeData(savedData) {
  const left = [], right = [];
  ACTORS.forEach(actor => {
    if (!savedData[actor]) return;
    const scenes = getActorScenes(actor);
    const dirs = savedData[actor];
    scenes.forEach((s, idx) => {
      if (idx >= scenes.length - 1) return;
      const d = dirs[sceneKey(s)] || {};
      if (!d.exit) return;
      const nextS = scenes[idx + 1];
      const item = { actor, fromRole: s.roles[actor], toRole: nextS.roles[actor], fromScene: `${sceneLabel(s)} ${s.title}` };
      if (d.exit === "left") left.push(item);
      else right.push(item);
    });
  });
  return { left, right };
}
