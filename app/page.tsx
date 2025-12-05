"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

type Servico = {
  id: number;
  nome: string;
  precoTotal: number;
  taxaReserva: number;
};

type Periodo = "manha" | "tarde" | "noite";

const servicos: Servico[] = [
  { id: 1, nome: "Alongamento natural quadrada", precoTotal: 150, taxaReserva: 50 },
  { id: 2, nome: "Alongamento baby color", precoTotal: 170, taxaReserva: 60 },
  { id: 3, nome: "Alongamento francesa tradicional", precoTotal: 170, taxaReserva: 60 },
  { id: 4, nome: "Alongamento formato almond", precoTotal: 170, taxaReserva: 60 },
  { id: 5, nome: "Blindagem com esmaltação em gel", precoTotal: 170, taxaReserva: 50 },
  { id: 6, nome: "Remoção de alongamento", precoTotal: 50, taxaReserva: 20 },
  { id: 7, nome: "Manutenção natural quadrada", precoTotal: 85, taxaReserva: 30 },
  { id: 8, nome: "Manutenção baby color", precoTotal: 95, taxaReserva: 35 },
  { id: 9, nome: "Manutenção francesa tradicional", precoTotal: 100, taxaReserva: 35 },
  { id: 10, nome: "Manutenção formato almond", precoTotal: 95, taxaReserva: 35 },
  { id: 11, nome: "Manutenção blindagem", precoTotal: 85, taxaReserva: 30 },
];

const horariosSugestao: Record<Periodo, string[]> = {
  manha: ["08:00", "10:00"],
  tarde: ["14:00", "16:00"],
  noite: ["18:00"],
};

function formatDateInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Home() {
  const [servicoId, setServicoId] = useState<number | "">("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [whatsCliente, setWhatsCliente] = useState("");
  const [data, setData] = useState("");
  const [periodo, setPeriodo] = useState<Periodo | "">("");
  const [horario, setHorario] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState<
    { data: string; periodo: Periodo; horario: string }[]
  >([]);

  const servicoSelecionado = useMemo(
    () => servicos.find((s) => s.id === servicoId),
    [servicoId]
  );

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + 7);
    return d;
  }, [hoje]);

  useEffect(() => {
    setHorario("");
  }, [periodo]);

  useEffect(() => {
    setPeriodo("");
    setHorario("");
  }, [data]);

  // Busca horários ocupados para a data escolhida
  useEffect(() => {
    if (!data) {
      setHorariosOcupados([]);
      return;
    }

    const carregarHorariosOcupados = async () => {
      const { data: rows, error } = await supabase
        .from("agendamentos")
        .select("data, periodo, horario, status")
        .eq("data", data)
        .neq("status", "cancelado"); // cancelado NÃO ocupa o horário

      if (error) {
        console.error("Erro ao buscar horários ocupados", error);
        setHorariosOcupados([]);
        return;
      }

      setHorariosOcupados(
        (rows ?? []).map((row) => ({
          data: row.data as string,
          periodo: row.periodo as Periodo,
          horario: row.horario as string,
        }))
      );
    };

    carregarHorariosOcupados();
  }, [data]);

  const podeConfirmar =
    !!(
      servicoSelecionado &&
      nomeCliente.trim() &&
      whatsCliente.trim() &&
      data &&
      periodo &&
      horario
    );

  const handleConfirmar = async () => {
    if (!podeConfirmar || !servicoSelecionado || !periodo || !horario) return;

    const { error } = await supabase.from("agendamentos").insert([
      {
        cliente_nome: nomeCliente,
        cliente_whatsapp: whatsCliente,
        servico_id: servicoSelecionado.id,
        servico_nome: servicoSelecionado.nome,
        data,
        periodo,
        horario,
        valor_total: servicoSelecionado.precoTotal,
        taxa_reserva: servicoSelecionado.taxaReserva,
        status: "pendente",
      },
    ]);

    if (error) {
      alert(
        "❌ Não conseguimos salvar seu agendamento agora.\n\n" +
          "Tente novamente em alguns minutos ou fale com a Estela pelo WhatsApp."
      );
      console.error(error);
    } else {
      alert(
        `✅ Agendamento confirmado com sucesso!\n\n` +
          `Olá, ${nomeCliente}! Seu horário com a Estela Araujo foi reservado com sucesso.\n\n` +
          `📌 Serviço: ${servicoSelecionado.nome}\n` +
          `📅 Data: ${data}\n` +
          `⏰ Horário: ${horario}\n\n` +
          `💳 A taxa de reserva já foi confirmada.\n\n` +
          `Em breve a Estela entrará em contato pelo WhatsApp informado para confirmar todos os detalhes.\n\n` +
          `💖 Agradecemos pela confiança e até breve!`
      );
    }
  };

  // monta a lista de horários do período com info se está ocupado
  const horariosComStatus =
    data && periodo
      ? horariosSugestao[periodo as Periodo].map((h) => {
          const ocupado = horariosOcupados.some(
            (o) => o.periodo === periodo && o.horario === h
          );
          return { hora: h, ocupado };
        })
      : [];

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 md:p-8 border-4 border-pink-400">
        <header className="mb-6 text-center">
         <img
           src="/logo.png"
           alt="Logo Estela Araujo"
          className="mx-auto mb-3 h-20 object-contain"
         />

          <h1 className="text-2xl font-semibold mb-1">
            Agende seu horário com a Estela Araujo
           </h1>

          <p className="text-sm text-gray-600">
           Atendimento profissional em unhas · Nail Designer 💅
          </p>
        </header>

        <div className="space-y-5">
          {/* Dados da cliente */}
          <section>
            <h2 className="text-base font-semibold mb-2">
              1️⃣ Seus dados para contato
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Nome completo</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  WhatsApp (para confirmar seu horário)
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={whatsCliente}
                  onChange={(e) => setWhatsCliente(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seu WhatsApp será usado apenas para confirmar seu horário.
            </p>
          </section>

          {/* Serviço */}
          <section>
            <h2 className="text-base font-semibold mb-2">
              2️⃣ Escolha o serviço desejado
            </h2>
            <select
              value={servicoId}
              onChange={(e) =>
                setServicoId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione um serviço</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — R$ {s.precoTotal.toFixed(2)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Valores e tempo de atendimento variam conforme o serviço
              escolhido.
            </p>
          </section>

          {/* Profissional */}
          <section>
            <h2 className="text-base font-semibold mb-2">
              3️⃣ Profissional
            </h2>
            <p className="text-sm text-gray-700">
              Você será atendida por{" "}
              <span className="font-semibold">Estela Araujo</span>, Nail
              Designer especializada em alongamentos e cuidados com as unhas.
            </p>
          </section>

          {/* Data */}
          <section>
            <h2 className="text-base font-semibold mb-2">
              4️⃣ Escolha a data
            </h2>
            <input
              type="date"
              value={data}
              min={formatDateInput(hoje)}
              max={formatDateInput(maxDate)}
              onChange={(e) => setData(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Você pode agendar dentro dos próximos 7 dias. As vagas são
              limitadas e os horários podem esgotar rapidamente.
            </p>
          </section>

          {/* Período + horário */}
          <section>
            <h2 className="text-base font-semibold mb-2">
              5️⃣ Qual período você prefere?
            </h2>
            {!data && (
              <p className="text-sm text-gray-500">
                Primeiro escolha a data, depois o período e o horário que melhor
                encaixam na sua rotina.
              </p>
            )}

            {data && (
              <>
                {/* Seleção de período */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPeriodo("manha")}
                    className={`flex-1 rounded-full px-3 py-2 text-sm border ${
                      periodo === "manha"
                        ? "border-black bg-gray-100"
                        : "border-gray-300"
                    }`}
                  >
                    Manhã
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodo("tarde")}
                    className={`flex-1 rounded-full px-3 py-2 text-sm border ${
                      periodo === "tarde"
                        ? "border-black bg-gray-100"
                        : "border-gray-300"
                    }`}
                  >
                    Tarde
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodo("noite")}
                    className={`flex-1 rounded-full px-3 py-2 text-sm border ${
                      periodo === "noite"
                        ? "border-black bg-gray-100"
                        : "border-gray-300"
                    }`}
                  >
                    Noite
                  </button>
                </div>

                {/* Horários do período */}
                {periodo && (
                  <div>
                    <p className="text-sm mb-2">
                      ⏰ Escolha seu horário disponível:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {horariosComStatus.map(({ hora, ocupado }) => (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => {
                            if (!ocupado) setHorario(hora);
                          }}
                          disabled={ocupado}
                          className={`rounded-full px-3 py-2 text-sm border ${
                            ocupado
                              ? "border-gray-300 bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                              : horario === hora
                              ? "border-black bg-gray-100"
                              : "border-gray-300"
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                    {horariosComStatus.length > 0 &&
                      horariosComStatus.every((h) => h.ocupado) && (
                        <p className="text-xs text-red-500 mt-2">
                          Todos os horários deste período já foram reservados.
                          Tente outro período ou escolha outra data.
                        </p>
                      )}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Resumo */}
          <section className="border-t pt-4">
            <h2 className="text-base font-semibold mb-2">
              📋 Resumo do seu agendamento
            </h2>

            {servicoSelecionado ? (
              <div className="space-y-1 text-sm">
                <p>
                  Cliente:{" "}
                  {nomeCliente || "preencha seu nome acima para continuar"}
                </p>
                <p>
                  WhatsApp:{" "}
                  {whatsCliente ||
                    "informe seu WhatsApp para receber a confirmação"}
                </p>
                <p>Serviço: {servicoSelecionado.nome}</p>
                <p>Profissional: Estela Araujo</p>
                <p>
                  Data e horário:{" "}
                  {data && horario
                    ? `${data} às ${horario}`
                    : "escolha a data, o período e o horário disponível"}
                </p>
                <p>
                  Valor total: R$ {servicoSelecionado.precoTotal.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">
                    Taxa para reservar o horário (paga agora):
                  </span>{" "}
                  R$ {servicoSelecionado.taxaReserva.toFixed(2)}
                </p>
                <p>
                  Restante para pagar no salão: R{"$ "}
                  {(
                    servicoSelecionado.precoTotal -
                    servicoSelecionado.taxaReserva
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  A taxa para reservar o horário garante sua vaga na agenda. Em
                  caso de não comparecimento ou cancelamento com menos de 24h
                  de antecedência, a taxa não é devolvida.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Escolha um serviço acima para ver o valor total, a taxa de
                reserva e o quanto ficará para pagar no salão.
              </p>
            )}

            <button
              type="button"
              disabled={!podeConfirmar}
              onClick={handleConfirmar}
              className={`mt-4 w-full rounded-full px-4 py-2 text-sm font-medium ${
                podeConfirmar
                  ? "bg-black text-white cursor-pointer"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Confirmar agendamento e pagar taxa de reserva
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
