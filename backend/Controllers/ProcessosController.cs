using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IDataApi.Data;
using IDataApi.DTOs;

namespace IDataApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProcessosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProcessosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("questao2")]
    public async Task<ActionResult<IEnumerable<ProcessoQuestao2Dto>>> ObterQuestao2()
    {
        string sql = @"
            SELECT 
                p.processoid AS ProcessoId,
                p.nro_pro AS NroPro,
                p.ano_pro AS AnoPro,
                p.cod_importador AS CodImportador,
                p.cod_exportador AS CodExportador,
                p.dt_ab_pro AS DtAbPro,
                p.dt_enc_pro AS DtEncPro,
                p.dt_lib_pro AS DtLibPro,
                p.processo_usuario AS ProcessoUsuario,
                p.ident_cli_pro AS IdentCliPro,
                imp.razaosocial_emp AS NomeImportador,
                exp.razaosocial_emp AS NomeExportador,
                u.nome_usu AS NomeUsuario,
                pt.confirmacaodata AS DataConfirmacaoEmbarque
            FROM processo p
            LEFT JOIN empresa imp ON p.cod_importador = imp.cod_emp
            LEFT JOIN empresa exp ON p.cod_exportador = exp.cod_emp
            LEFT JOIN usuario u ON p.processo_usuario = u.usuarioid
            LEFT JOIN processotracking pt ON p.nro_pro = pt.nro_pro 
                                          AND p.ano_pro = pt.ano_pro 
                                          AND pt.ordem = 1";

        var dados = await _context.ProcessosQuestao2
            .FromSqlRaw(sql)
            .AsNoTracking()
            .ToListAsync();

        return Ok(dados);
    }

    [HttpGet("questao3")]
    public async Task<ActionResult<IEnumerable<ProcessoQuestao3Dto>>> ObterQuestao3()
    {
        string sql = @"
            SELECT 
                p.processoid AS ProcessoId,
                p.nro_pro AS NroPro,
                p.ano_pro AS AnoPro,
                p.cod_importador AS CodImportador,
                p.cod_exportador AS CodExportador,
                p.dt_ab_pro AS DtAbPro,
                p.dt_enc_pro AS DtEncPro,
                p.dt_lib_pro AS DtLibPro,
                p.processo_usuario AS ProcessoUsuario,
                p.ident_cli_pro AS IdentCliPro,
                imp.razaosocial_emp AS NomeImportador,
                exp.razaosocial_emp AS NomeExportador,
                u.nome_usu AS NomeUsuario,
                emb.confirmacaodata AS DataConfirmacaoEmbarque,
                che.confirmacaodata AS DataConfirmacaoChegada
            FROM processo p
            LEFT JOIN empresa imp ON p.cod_importador = imp.cod_emp
            LEFT JOIN empresa exp ON p.cod_exportador = exp.cod_emp
            LEFT JOIN usuario u   ON p.processo_usuario = u.usuarioid
            LEFT JOIN processotracking emb
                   ON emb.nro_pro = p.nro_pro
                  AND emb.ano_pro = p.ano_pro
                  AND emb.ordem = 1
            LEFT JOIN processotracking che
                   ON che.nro_pro = p.nro_pro
                  AND che.ano_pro = p.ano_pro
                  AND che.ordem = (
                        SELECT MAX(t.ordem)
                        FROM processotracking t
                        WHERE t.nro_pro = p.nro_pro
                          AND t.ano_pro = p.ano_pro
                  )";

        var dados = await _context.ProcessosQuestao3
            .FromSqlRaw(sql)
            .AsNoTracking()
            .ToListAsync();

        return Ok(dados);
    }
}