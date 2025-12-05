"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  servico_nome: string;
  data: string;
  periodo: string;
  horario: string;
  valor_total: number;
  taxa_reserva: number;
  status: string;
};

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarAgendamentos = async () => {
    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true })
      .order("horario", { ascending: true });

    if (error) {
      setErro(error.message);
      setAgendamentos([]);
    } else if (data) {
      setAgendamentos(data as Agendamento[]);
    }

    setCarregando(false);
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const atualizarStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status");
      console.error(error);
      return;
    }

    // Atualiza na tela sem precisar recarregar tudo
    setAgendamentos((atual) =>
      atual.map((a) =>
        a.id === id ? { ...a, status: novoStatus } : a
      )
    );
  };

  return (
    <main style={{ minHeight: "100vh", padding: 24, fontFamily: "sans-serif", background: "#f3f4f6" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
          Painel da Estela — Agendamentos
        </h1>
        <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
          Aqui você vê todos os horários marcados, pode marcar como atendido ou cancelar.
        </p>

        <button
          onClick={carregarAgendamentos}
          style={{
            marginBottom: 16,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Atualizar lista
        </button>

        {carregando && <p>Carregando agendamentos...</p>}
        {erro && (
          <p style={{ color: "red", marginBottom: 8 }}>
            Erro ao carregar agendamentos: {erro}
          </p>
        )}

        {!carregando && agendamentos.length === 0 && !erro && (
          <p>Não há agendamentos cadastrados ainda.</p>
        )}

        {!carregando && agendamentos.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#e5e7eb" }}>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Cliente</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>WhatsApp</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Serviço</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Data</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Período</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Horário</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Valor</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Status</th>
                  <th style={{ border: "1px solid #d1d5db", padding: 8 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((a) => (
                  <tr key={a.id}>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{a.cliente_nome}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{a.cliente_whatsapp}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{a.servico_nome}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{a.data}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{a.periodo}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{a.horario}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                      R$ {a.valor_total?.toFixed ? a.valor_total.toFixed(2) : a.valor_total}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8, fontWeight: 600 }}>
                      {a.status}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                      <button
                        onClick={() => atualizarStatus(a.id, "atendido")}
                        style={{
                          padding: "4px 8px",
                          marginRight: 4,
                          borderRadius: 999,
                          border: "none",
                          background: "#16a34a",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        ✅ Atendido
                      </button>
                      <button
                        onClick={() => atualizarStatus(a.id, "cancelado")}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "none",
                          background: "#dc2626",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        ❌ Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
