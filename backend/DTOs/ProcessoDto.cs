namespace IDataApi.DTOs;

public class ProcessoQuestao2Dto
{
    public int ProcessoId { get; set; }
    public int NroPro { get; set; }
    public int AnoPro { get; set; }
    public int? CodImportador { get; set; }
    public int? CodExportador { get; set; }
    public DateTime? DtAbPro { get; set; }
    public DateTime? DtEncPro { get; set; }
    public DateTime? DtLibPro { get; set; }
    public int? ProcessoUsuario { get; set; }
    public string? IdentCliPro { get; set; }

    public string? NomeImportador { get; set; }
    public string? NomeExportador { get; set; }
    public string? NomeUsuario { get; set; }
    public DateTime? DataConfirmacaoEmbarque { get; set; }
}

public class ProcessoQuestao3Dto
{
    public int ProcessoId { get; set; }
    public int NroPro { get; set; }
    public int AnoPro { get; set; }
    public int? CodImportador { get; set; }
    public int? CodExportador { get; set; }
    public DateTime? DtAbPro { get; set; }
    public DateTime? DtEncPro { get; set; }
    public DateTime? DtLibPro { get; set; }
    public int? ProcessoUsuario { get; set; }
    public string? IdentCliPro { get; set; }

    public string? NomeImportador { get; set; }
    public string? NomeExportador { get; set; }
    public string? NomeUsuario { get; set; }
    public DateTime? DataConfirmacaoEmbarque { get; set; }
    public DateTime? DataConfirmacaoChegada { get; set; }
}