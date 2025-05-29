// Data e hora na página
const diaDiv = document.getElementById("data-dia");
const semanaDiv = document.getElementById("data-semana");

const hoje = new Date();
const dia = hoje.toLocaleDateString("pt-BR", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});
const semana = hoje.toLocaleDateString("pt-BR", { weekday: "long" });

diaDiv.textContent = ` ${dia}`;
semanaDiv.textContent = ` ${semana.charAt(0).toUpperCase() + semana.slice(1)
  }`;


// =====================
// Filtro de busca na tabela
// =====================

function filtrarTabela() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const linhas = document.querySelectorAll("#tabela-os tr");

  linhas.forEach(linha => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(input) ? "" : "none";
  });
}


// =====================
// Filtro por data na tabela
// =====================

function filtrar(tipo) {
  const linhas = document.querySelectorAll("#tabela-os tr");
  const hoje = new Date();

  linhas.forEach((linha) => {
    const dataStr = linha.getAttribute("data-data");
    if (!dataStr) {
      linha.style.display = "none";
      return;
    }
    const dataOS = new Date(dataStr);

    let mostrar = false;

    if (tipo === "todos") {
      mostrar = true;
    } else if (tipo === "dia") {
      // comparar só data, ignorando horário
      mostrar = dataOS.toDateString() === hoje.toDateString();
    } else if (tipo === "semana") {
      const diaSemana = hoje.getDay(); // 0 (dom) - 6 (sab)

      // Ajusta para segunda ser 0, domingo 6
      // Exemplo: segunda=1 => 0, terça=2 =>1, domingo=0 => 6
      const diaSemanaAjustado = diaSemana === 0 ? 6 : diaSemana - 1;

      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - diaSemanaAjustado);
      inicioSemana.setHours(0, 0, 0, 0);

      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      fimSemana.setHours(23, 59, 59, 999);

      mostrar = dataOS >= inicioSemana && dataOS <= fimSemana;
    } else if (tipo === "mes") {
      mostrar =
        dataOS.getMonth() === hoje.getMonth() &&
        dataOS.getFullYear() === hoje.getFullYear();
    }

    linha.style.display = mostrar ? "" : "none";
  });
}


// Configuração inicial dos gráficos (com dados mockados)
let donutOptions = {
  series: [10, 30, 15, 45], // iniciando com zeros
  chart: {
    type: "donut",
  },
  labels: ["Aprovado", "Andamento", "Concluído", "Entregue"],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: "bottom" },
      },
    },
  ],
};
window.donutChart = new ApexCharts(
  document.querySelector("#donut-chart"),
  donutOptions
);
window.donutChart.render();

let barOptions = {
  series: [
    {
      name: "Servings",
      data: [], // será preenchido dinamicamente
    },
  ],
  chart: {
    height: 350,
    type: "bar",
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: "50%",
    },
  },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  grid: {
    row: { colors: ["#fff", "#f2f2f2"] },
  },
  xaxis: {
    categories: [], // categorias dinâmicas
    labels: { rotate: -45 },
    tickPlacement: "on",
  },
  yaxis: { title: { text: "Servings" } },
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "horizontal",
      shadeIntensity: 0.25,
      inverseColors: true,
      opacityFrom: 0.85,
      opacityTo: 0.85,
      stops: [50, 0, 100],
    },
  },
};
window.barChart = new ApexCharts(
  document.querySelector("#bar-chart"),
  barOptions
);
window.barChart.render();

// Highcharts exemplo (dados fixos, pode adaptar depois)
Highcharts.chart("container", {
  chart: { zoomType: "xy" },
  title: { text: "Esteira de Serviços", align: "left" },
  credits: {
    enabled: false,
  },
  xAxis: [
    {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      crosshair: true,
    },
  ],
  yAxis: [
    {
      labels: {
        format: "{value} Valores",
        style: { color: Highcharts.getOptions().colors[1] },
      },
      title: {
        text: "Vendas",
        style: { color: Highcharts.getOptions().colors[1] },
      },
    },
    {
      title: {
        text: "Engajamento",
        style: { color: Highcharts.getOptions().colors[0] },
      },
      labels: {
        format: "{value}",
        style: { color: Highcharts.getOptions().colors[0] },
      },
      opposite: true,
    },
  ],
  tooltip: { shared: true },
  legend: {
    align: "left",
    verticalAlign: "top",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  series: [
    {
      name: "Engajamento (Páginas visitadas)",
      type: "column",
      yAxis: 1,
      data: [
        45.7, 37.0, 28.9, 17.1, 39.2, 18.9, 90.2, 78.5, 74.6, 18.7, 17.1, 16.0,
      ],
      tooltip: { valueSuffix: "" },
    },
    {
      name: "Vendas",
      type: "spline",
      data: [
        -11.4, -9.5, -14.2, 0.2, 7.0, 12.1, 13.5, 13.6, 8.2, -2.8, -12.0, -15.5,
      ],
      tooltip: { valueSuffix: "°C" },
    },
  ],
});

// Função para preencher cards e tabela com dados vindos da API
async function carregarDados() {
  try {
    const response = await fetch("/api/servicos");
    const dados = await response.json();

    preencherCards(dados);
    preencherTabela(dados);
    atualizarBarChart(dados);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

function preencherCards(dados) {
  const statusCount = { Aprovado: 0, Andamento: 0, Concluído: 0, Entregue: 0 };

  dados.forEach(({ Status }) => {
    if (statusCount[Status] !== undefined) {
      statusCount[Status]++;
    }
  });

  document.querySelector("#aprovado p").textContent =
    statusCount["Aprovado"] || 0;
  document.querySelector("#andamento p").textContent =
    statusCount["Andamento"] || 0;
  document.querySelector("#concluido p").textContent =
    statusCount["Concluído"] || 0;
  document.querySelector("#entregue p").textContent =
    statusCount["Entregue"] || 0;

  window.donutChart.updateSeries([
    statusCount["Aprovado"],
    statusCount["Andamento"],
    statusCount["Concluído"],
    statusCount["Entregue"],
  ]);
}

function preencherTabela(dados) {
  const tabela = document.querySelector("#tabela-os");
  tabela.innerHTML = "";

  dados.forEach(({ Data, OS, Clientes, Status, Descricao }) => {
    const dataFormatada = new Date(Data).toLocaleDateString("pt-BR");
    const tr = document.createElement("tr");
    tr.setAttribute("data-data", Data);

    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${OS}</td>
      <td>${Clientes}</td>
      <td>${Status}</td>
      <td>${Descricao}</td>
    `;
    tabela.appendChild(tr);
  });
}

function atualizarBarChart(dados) {
  // Agrupar por cliente para exemplo no gráfico de barras
  const agrupado = {};
  dados.forEach(({ Clientes }) => {
    agrupado[Clientes] = (agrupado[Clientes] || 0) + 1;
  });

  const categorias = Object.keys(agrupado);
  const valores = Object.values(agrupado);

  window.barChart.updateOptions({
    xaxis: { categories },
    series: [{ data: valores }],
  });
}

// Carrega dados ao iniciar a página
carregarDados();


//Paginação da tabela

const rowsPerPage = 6;
const tbody = document.getElementById("tabela-os");
const pagination = document.getElementById("pagination");
let currentPage = 1;

function showPage(page) {
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  // Corrigir número de página se necessário
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;

  // Esconde todas as linhas
  rows.forEach((row, index) => {
    row.style.display = (index >= (page - 1) * rowsPerPage && index < page * rowsPerPage) ? "" : "none";
  });

  // Atualiza botões
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  pagination.innerHTML = "";

  // Botão anterior
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "<";
  prevBtn.className = "page-btn";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => showPage(currentPage - 1);
  pagination.appendChild(prevBtn);

  // Botões de páginas
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn" + (i === currentPage ? " active" : "");
    btn.onclick = () => showPage(i);
    pagination.appendChild(btn);
  }

  // Botão próximo
  const nextBtn = document.createElement("button");
  nextBtn.textContent = ">";
  nextBtn.className = "page-btn";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => showPage(currentPage + 1);
  pagination.appendChild(nextBtn);
}

// Inicia na primeira página
showPage(1);


