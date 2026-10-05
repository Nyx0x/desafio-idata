import React, { useState, useEffect, useMemo } from 'react';
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
  CssBaseline
} from '@mui/material';

// Estilos obrigatórios do AG Grid
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Tema com contraste refinado
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
        setErro('Não foi possível conectar à API .NET. Certifique-se de que o backend está em execução.');
      })
      .finally(() => setCarregando(false));
  }, [tabAtiva]);

  // Renderizador com badge colorido para datas ou pendências
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
    { field: 'processoId', headerName: 'ID', width: 85, filter: 'agNumberColumnFilter' },
    { 
      field: 'nroPro', 
      headerName: 'Nº Processo', 
      width: 140,
      cellRenderer: (p) => <strong>{p.value}/{p.data?.anoPro}</strong>
    },
    { field: 'nomeImportador', headerName: 'Empresa Importadora', flex: 1.2, minWidth: 160 },
    { field: 'nomeExportador', headerName: 'Empresa Exportadora', flex: 1.2, minWidth: 160 },
    { field: 'nomeUsuario', headerName: 'Responsável', width: 140 },
    {
      field: 'dataConfirmacaoEmbarque',
      headerName: 'Confirmação Embarque (Ordem 1)',
      width: 240,
      cellRenderer: formatadorDataStatus
    }
  ], []);

  const colunasQuestao2 = useMemo(() => [...colunasBase], [colunasBase]);

  const colunasQuestao3 = useMemo(() => [
    ...colunasBase,
    {
      field: 'dataConfirmacaoChegada',
      headerName: 'Confirmação Chegada (Última Ordem)',
      width: 250,
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
            Desafio Técnico iData — Integração SQL Server/MySQL + .NET 8 API + React & AG Grid
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={tabAtiva}
            onChange={(_, novoValor) => setTabAtiva(novoValor)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Questão 2 — Status de Embarque" sx={{ fontWeight: 'bold', py: 2 }} />
            <Tab label="Questão 3 — Embarque & Chegada (Ordem Máxima)" sx={{ fontWeight: 'bold', py: 2 }} />
          </Tabs>
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
                rowData={tabAtiva === 0 ? dadosQ2 : dadosQ3}
                columnDefs={tabAtiva === 0 ? colunasQuestao2 : colunasQuestao3}
                defaultColDef={{
                  sortable: true,
                  filter: true,
                  resizable: true,
                  floatingFilter: true,
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