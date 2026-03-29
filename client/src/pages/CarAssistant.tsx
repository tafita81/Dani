import { Fragment } from "react";

export default function CarAssistant() {
  return (
    <Fragment>
      <div style={{ minHeight: "100vh", background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "white", marginBottom: "1rem" }}>🚗 Assistente Carro</h1>
          <p style={{ fontSize: "1.25rem", color: "#bfdbfe" }}>Modo Hands-Free - Escuta Contínua</p>
          <div style={{ marginTop: "2rem", padding: "2rem", background: "white", borderRadius: "0.5rem" }}>
            <p style={{ color: "#1f2937" }}>✅ Página carregada com sucesso!</p>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
