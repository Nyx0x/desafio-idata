import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Button
} from '@mui/material';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
});

export default function App() {
  const [tabAtiva, setTabAtiva] = useState(0);
  const [dadosQ2, setDadosQ2] = useState([]);
  const [dadosQ3, setDadosQ3] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const gridRef = useRef(null);

 const exportarCSV = () => {
    const dados = tabAtiva === 0 ? dadosQ2 : dadosQ3;
    if (!dados || dados.length === 0) return;

    // Cabeçalhos das colunas
    const cabecalhos = [
      'ID Processo',
      'Nº Processo',
      'Ano',
      'Importador',
      'Exportador',
      'Responsável',
      'Confirmação Embarque (Ordem 1)'
    ];

    if (tabAtiva === 1) {
      cabecalhos.push('Confirmação Chegada (Ordem Máx)');
    }

    // Monta as linhas formatadas
    const linhas = dados.map(item => {
      const dataEmbarque = item.dataConfirmacaoEmbarque 
        ? new Date(item.dataConfirmacaoEmbarque).toLocaleString('pt-BR') 
        : 'Pendente';

      const linha = [
        item.processoId,
        item.nroPro,
        item.anoPro,
        `"${item.nomeImportador || ''}"`,
        `"${item.nomeExportador || ''}"`,
        `"${item.nomeUsuario || ''}"`,
        `"${dataEmbarque}"`
      ];

      if (tabAtiva === 1) {
        const dataChegada = item.dataConfirmacaoChegada 
          ? new Date(item.dataConfirmacaoChegada).toLocaleString('pt-BR') 
          : 'Pendente';
        linha.push(`"${dataChegada}"`);
      }

      return linha.join(';');
    });

    // Adiciona o BOM (\uFEFF) para garantir que caracteres acentuados abram perfeitos no Excel
    const conteudoCSV = '\uFEFF' + [cabecalhos.join(';'), ...linhas].join('\n');
    
    // Cria o link temporário e dispara o download no navegador
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `processos_${tabAtiva === 0 ? 'questao2' : 'questao3'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setCarregando(true);
    setErro(null);
    const endpoint = tabAtiva === 0 ? 'questao2' : 'questao3';

    fetch(`http://localhost:5248/api/processos/${endpoint}`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao comunicar com a API');
        return res.json();
      })
      .then((data) => {
        if (tabAtiva === 0) setDadosQ2(data);
        else setDadosQ3(data);
      })
      .catch((err) => {
        console.error('Erro na requisição:', err);
        setErro('Não foi possível conectar à API .NET. Verifique se ela está rodando no terminal.');
      })
      .finally(() => setCarregando(false));
  }, [tabAtiva]);

  const formatadorDataStatus = (params) => {
    if (!params.value) {
      return <Chip label="Pendente" color="warning" size="small" variant="outlined" />;
    }
    return (
      <Chip 
        label={new Date(params.value).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} 
        color="success" 
        size="small" 
        sx={{ fontWeight: '500' }}
      />
    );
  };

const colunasBase = useMemo(() => [
    { 
      field: 'processoId', 
      headerName: 'ID', 
      width: 75, 
      filter: 'agNumberColumnFilter' 
    },
    { 
      field: 'nroPro', 
      headerName: 'Nº Processo', 
      width: 130,
      cellRenderer: (p) => <strong>{p.value}/{p.data?.anoPro}</strong>
    },
    { 
      field: 'nomeImportador', 
      headerName: 'Empresa Importadora', 
      flex: 1.2, 
      minWidth: 170 
    },
    { 
      field: 'nomeExportador', 
      headerName: 'Empresa Exportadora', 
      flex: 1.2, 
      minWidth: 170 
    },
    { 
      field: 'nomeUsuario', 
      headerName: 'Responsável', 
      width: 140 
    },
    {
      field: 'dataConfirmacaoEmbarque',
      headerName: 'Confirmação de Embarque (Ordem 1)',
      minWidth: 260,
      flex: 1,
      cellRenderer: formatadorDataStatus
    }
  ], []);

  const colunasQuestao2 = useMemo(() => [...colunasBase], [colunasBase]);

  const colunasQuestao3 = useMemo(() => [
    ...colunasBase,
    {
      field: 'dataConfirmacaoChegada',
      headerName: 'Confirmação de Chegada (Ordem Máxima)',
      minWidth: 270,
      flex: 1,
      cellRenderer: formatadorDataStatus
    }
  ], [colunasBase]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4, maxWidth: 1360, margin: '0 auto' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="700" color="primary">
            Monitoramento de Processos de Comércio Exterior
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Desafio Técnico iData — Integração MySQL + .NET 8 API + React & AG Grid
          </Typography>
        </Box>

       <Paper 
          elevation={2} 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pr: 2
          }}
        >
          <Tabs
            value={tabAtiva}
            onChange={(_, novoValor) => setTabAtiva(novoValor)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ flex: 1 }}
          >
            <Tab label="Questão 2 — Status de Embarque" sx={{ fontWeight: 'bold', py: 2 }} />
            <Tab label="Questão 3 — Embarque & Chegada (Ordem Máxima)" sx={{ fontWeight: 'bold', py: 2 }} />
          </Tabs>

          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            onClick={exportarCSV}
            sx={{ textTransform: 'none', fontWeight: 'bold', px: 2, py: 1 }}
          >
            Exportar CSV
          </Button>
        </Paper>

        {erro && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erro}
          </Alert>
        )}

        {carregando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress size={50} />
          </Box>
        ) : (
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <div className="ag-theme-alpine" style={{ height: 480, width: '100%' }}>
              <AgGridReact
  ref={gridRef}            
  rowData={tabAtiva === 0 ? dadosQ2 : dadosQ3}
  columnDefs={tabAtiva === 0 ? colunasQuestao2 : colunasQuestao3}
  defaultColDef={{
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    wrapHeaderText: true,       
    autoHeaderHeight: true,     
  }}
  pagination={true}
  paginationPageSize={10}
/>
            </div>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}