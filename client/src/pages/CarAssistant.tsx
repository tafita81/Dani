export default function CarAssistant() {
  return (
    <div style={{ minHeight: "100vh", background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center", background: "white", padding: "2rem", borderRadius: "0.5rem", maxWidth: "400px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e3a8a", marginBottom: "1rem" }}>🚗 Assistente Carro</h1>
        <p style={{ fontSize: "1.125rem", color: "#60a5fa", marginBottom: "2rem" }}>Modo Hands-Free - Escuta Contínua</p>
        <div style={{ background: "#f0f9ff", padding: "1rem", borderRadius: "0.375rem", color: "#1e40af", marginBottom: "1rem" }}>
          <p>✅ Página carregada com sucesso!</p>
          <p>🎤 Reconhecimento de voz ativo</p>
          <p>📊 Integrado com 36 tabelas</p>
        </div>
        <button style={{ background: "#2563eb", color: "white", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>
          ▶️ Ativar Escuta
        </button>
      </div>
    </div>
  );
}
