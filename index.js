require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mysql = require('mysql')
const session = require('express-session')
const cors = require('cors')
const sha1 = require('sha1')
const fileUpload = require('express-fileupload')
const uniqid = require('uniqid')
const utils = require('./utils')

const app = express()
const port = process.env.PORT || 5000

const connection = () => {
  const temp = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: '',
    port: 3306,
    timezone: '-2:00',
  })

  temp.connect()

  temp.on('error', e => log(e))

  return temp
}

const { log } = console

app.use(fileUpload({ createParentPath: true }))
app.use(cors())
app.use(session({ secret: 'movella1234' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set('view engine', 'ejs')

const { Movel, Usuario, Categoria, Contato, Aluguel } = require('./model')

const MESES = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
}

const today = () => {
  let date = new Date()
  date.setHours(date.getHours() - 2)
  const [match, a, b] = date.toISOString().match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/)
  return `${a} ${b}`
}

const query = async _query => await new Promise((resolve, reject) => {
  const con = connection()
  con.query(_query, (error, results, fields) => log(results) || error ? reject(error) : resolve(results))
  con.end()
})

app.get('/', (req, res) => {
  res.render('moveis.ejs', { page: 'moveis', session: req.session })
})

app.get('/sobre', (req, res) => {
  res.render('sobre.ejs', { page: 'sobre', session: req.session })
})

app.get('/perfil', (req, res) => {
  res.render('perfil.ejs', { page: 'perfil', session: req.session })
})

app.get('/contato', (req, res) => {
  res.render('contato.ejs', { page: 'contato', session: req.session })
})

app.get('/entrar', (req, res) => {
  res.render('entrar.ejs', { page: 'entrar', session: req.session })
})

app.get('/criarconta', (req, res) => {
  res.render('criarconta.ejs', { page: 'criarconta', session: req.session })
})

app.get('/cadastrarmovel', (req, res) => {
  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }
  res.render('cadastrarmovel.ejs', { page: 'cadastrarmovel', session: req.session })
})

app.get('/admin', (req, res) => {
  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }
  if (req.session.usuario.acesso < 3) {
    res.status(401).redirect(401, '/')
    return
  }
  res.render('admin.ejs', { page: 'admin', session: req.session })
})

app.get('/sair', (req, res) => {
  req.session.destroy()
  res.render('moveis.ejs', { page: 'moveis', session: req.session })
})

app.post('/api/moveis', (req, res) => {

  log('/api/moveis')

  console.warn(req.session)

  let { pagina, quantidade, categoria, filtro, disponiveis, ordenar } = req.body

  pagina = pagina || 1
  quantidade = quantidade || 2
  categoria = categoria || 'Tudo'
  disponiveis = disponiveis == 'true'
  ordenar = ordenar || 'nome asc'

  const aplicarFiltro = filtro !== undefined && filtro.length !== 0

  query(categoria == 'Tudo'
    ? `select *, ceil((select count(*) from view_movel where '1' ${aplicarFiltro ? `and nome like '%${filtro}%'` : ''} ${disponiveis ? `and status = 'disponivel'` : ''}) / ${quantidade}) as count${ordenar === 'distancia asc' ? `, sqrt(pow(${req.session.usuario.lat} - \`lat\`, 2) + pow(${req.session.usuario.long} - \`long\`, 2)) AS distancia` : ``} from view_movel where '1' ${aplicarFiltro ? `and nome like '%${filtro}%'` : ''} ${disponiveis ? `and status = 'disponivel'` : ''} order by ${ordenar} limit ${quantidade} offset ${(pagina - 1) * quantidade}`
    : `select *, ceil((select count(*) from view_movel where '1' and categoria = '${categoria}' ${aplicarFiltro ? `and nome like '%${filtro}%'` : ''} ${disponiveis ? `and status = 'disponivel'` : ''}) / ${quantidade}) as count${ordenar === 'distancia asc' ? `, sqrt(pow(${req.session.usuario.lat} - \`lat\`, 2) + pow(${req.session.usuario.long} - \`long\`, 2)) AS distancia` : ``} from view_movel where '1' and categoria = '${categoria}' ${aplicarFiltro ? `and nome like '%${filtro}%'` : ''} ${disponiveis ? `and status = 'disponivel'` : ''} order by ${ordenar} limit ${quantidade} offset ${(pagina - 1) * quantidade}`)
    .then(d =>
      res.status(200).send({
        data: {
          moveis: d,
          paginas: d[0]?.count || 1,
          session: req.session.usuario,
        },
      }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.post('/api/moveis/create', (req, res) => {

  log('/api/moveis/create')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  if (req.session.usuario.acesso < 2) {
    res.status(400).send({ msg: 'Não autorizado, usuário não verificado' })
    return
  }

  log(req.files)

  if (req.files?.foto === undefined) {
    res.status(400).send({ msg: 'Imagem não fornecida' })
    return
  }

  let movel = new Movel()

  const { foto } = req.files

  const _uniqid = `${uniqid('img_')}.${foto.mimetype.match(/^image\/(\w+)/)[0]}`

  let {
    id,
    categoriaId,
    usuarioId,
    descricao,
    imagem,
    nome,
    valorMes,
    status,
    altura,
    largura,
    espessura,
  } = req.body

  try {
    //movel.Id = id
    movel.CategoriaId = categoriaId
    movel.UsuarioId = req.session.usuario.id
    movel.Descricao = descricao
    movel.Imagem = _uniqid
    movel.Nome = nome
    movel.ValorMes = valorMes
    movel.Status = 'disponivel'
    movel.Altura = altura
    movel.Largura = largura
    movel.Espessura = espessura
  } catch (err) {
    res.status(400).send({ msg: err })
    log(err)
    return
  }

  if (foto.mimetype !== 'image/png' && foto.mimetype !== 'image/jpeg') {
    res.status(400).send({ msg: 'Formato de imagem incorreto' })
    return
  }

  foto.mv(`./public/img/${_uniqid}`)

  query(movel.Insert())
    .then(d => res.status(200).send({ msg: 'Móvel cadastrado!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/categorias', (req, res) => {

  log('/api/categorias')

  query(`select * from tbl_categoria`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.post('/api/login', (req, res) => {

  log('/api/login')

  let usuario = new Usuario()

  let { email, senha } = req.body

  try {
    usuario.Email = email
    usuario.Senha = senha
  }
  catch (err) {
    res.status(400).send({ msg: err })
    log(err)
    return
  }

  query(`select * from tbl_usuario where email = '${usuario.Email}' and senha = '${sha1(usuario.Senha)}' limit 1`)
    .then(d => {
      if (d.length === 1) {
        req.session.usuario = d[0]
        res.status(200).send({ data: d[0] })
      } else res.status(400).send({ msg: 'Usuário ou senha incorretos.' })
    })
    .catch(e => res.status(500).send({ msg: e }))
})

app.post('/api/criarconta', (req, res) => {

  log('/api/criarconta')

  let _usuario = new Usuario()

  let { email, usuario, senha, repetesenha } = req.body

  try {
    if (senha !== repetesenha) throw 'Senha não confere'
    _usuario.Usuario = usuario
    _usuario.Email = email
    _usuario.Senha = senha
  }
  catch (err) {
    res.status(400).send({ msg: err })
    log(err)
    return
  }

  query(_usuario.Insert())
    .then(d => res.status(200).send({ msg: 'Conta criada!' }))
    .catch(e => {
      if (e.code !== undefined) {
        const match = e.sqlMessage.match(/for\skey\s\'([^']+)\'/)
        switch (match[1] || '') {
          case 'UQ_CPF':
            e = 'CPF já cadastrado.'
            break
          case 'UQ_EMAIL':
            e = 'Email já cadastrado.'
            break
        }
      }
      res.status(500).send({ msg: e })
    })
})

app.post('/api/usuario/update', async (req, res) => {

  log('/api/usuario/update')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  log(req.files)

  let _usuario = new Usuario()

  let _uniqid = req.session.usuario.foto
  let foto

  if (req.files?.foto !== undefined) {
    foto = req.files.foto
    _uniqid = `${uniqid('img_')}.${foto.mimetype.match(/^image\/(\w+)/)[0]}`
  }

  let {
    bairro,
    celular,
    cep,
    cidade,
    complemento,
    cpf,
    email,
    logradouro,
    uf,
    usuario,
  } = req.body

  log(req.body)

  try {
    cpf = cpf.replace(/[\.\-]/g, '')
    cep = cep.replace(/[\.\-]/g, '')
    celular = celular.replace(/[\(\)\s\.\-]/g, '')
    _usuario.Acesso = req.session.usuario.acesso === 3 ? 3 : 2
    _usuario.Bairro = bairro
    _usuario.Celular = celular
    _usuario.Cep = cep
    _usuario.Cidade = cidade
    _usuario.Complemento = complemento
    _usuario.Cpf = cpf
    _usuario.Email = email
    _usuario.Foto = _uniqid
    _usuario.Id = req.session.usuario.id
    _usuario.Logradouro = logradouro
    _usuario.Senha = req.session.usuario.senha
    _usuario.Uf = uf
    _usuario.Usuario = usuario
    const { lat, long } = await utils.buscaGeo(cep)
    _usuario.Lat = lat
    _usuario.Long = long
  } catch (err) {
    res.status(400).send({ msg: err })
    log(err)
    return
  }

  log('query', _usuario.Update())

  if (req.files?.foto !== undefined) {
    if (foto.mimetype !== 'image/png' && foto.mimetype !== 'image/jpeg') {
      res.status(400).send({ msg: 'Formato de imagem incorreto' })
      return
    }
    foto.mv(`./public/img/${_uniqid}`)
    log(`Moved image - uniqid: ${_uniqid}`)
  }

  query(_usuario.Update())
    .then(d =>
      query(`select * from tbl_usuario where id = '${req.session.usuario.id}' limit 1`)
        .then(d => {
          if (d.length === 1) {
            req.session.usuario = d[0]
            log('Sessão atualizada') || res.status(200).send({ msg: 'Dados atualizados!' })
          } else log('Sessão não atualizada') || res.status(400).send({ msg: 'Mais de 1 usuário encontrado.' })
        })
        .catch(e => res.status(400).send({ msg: 'Usuário não encontrado.' })))
    .catch(e => {
      log('error', e.sqlMessage)
      if (e.code !== undefined) {
        const match = e.sqlMessage.match(/for\skey\s\'([^']+)\'/)
        switch (match[1] || '') {
          case 'UQ_CPF':
            console.warn('cpf uq')
            e = 'CPF já cadastrado.'
            break
          case 'UQ_EMAIL':
            console.warn('email uq')
            e = 'Email já cadastrado.'
            break
        }
      }
      res.status(500).send({ msg: e })
    })
})

app.post('/api/contato/create', (req, res) => {

  log('/api/contato/create')

  let contato = new Contato()

  let { nome, email, assunto, mensagem } = req.body

  try {
    contato.Nome = nome
    contato.Email = email
    contato.Assunto = assunto
    contato.Mensagem = mensagem
  }
  catch (err) {
    res.status(400).send({ msg: err })
    log(err)
    return
  }

  query(contato.Insert())
    .then(d => res.status(200).send({ msg: 'Contato enviado!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/perfil/info', (req, res) => {

  log('/api/perfil/info')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  query(`
    select
	    cadastrados.count as cadastrados,
      disponiveis.count as disponiveis,
      alugados.count as alugados,
      avaliacao.avaliacao as avaliacao
    from (select count(*) as count from view_movel where usuarioId = '${req.session.usuario.id}') as cadastrados
    join (select count(*) as count from view_movel where usuarioId = '${req.session.usuario.id}' and status = 'disponivel') as disponiveis
    join (select count(*) as count from view_aluguel where locadorid = '${req.session.usuario.id}' and (status = 'ativo' or status = 'concluido')) as alugados
    join (select (sum(avaliacao) / count(*)) as avaliacao from tbl_avaliacao where avaliadoId = '${req.session.usuario.id}') as avaliacao
    `)
    .then(d => {
      query(`select month(dataInicio) as mes, year(dataInicio) as ano, sum(valorfrete) as frete, sum(total + valorFrete) as total, count(*) as quantidade from view_aluguel where locatarioId = '${req.session.usuario.id}' and (status = 'ativo' or status = 'concluido') group by month(dataInicio);`)
        .then(d2 => {
          query(`select month(dataInicio) as mes, year(dataInicio) as ano, sum(total) as total, count(*) as quantidade from view_aluguel where locadorId = '${req.session.usuario.id}' and (status = 'ativo' or status = 'concluido') group by month(dataInicio);`)
            .then(d3 => {
              const result = {
                data: [
                  { nome: 'Seus Móveis Cadastrados', valor: d[0].cadastrados },
                  { nome: 'Seus Móveis Alugados', valor: d[0].alugados },
                  { nome: 'Seus Móveis Disponíveis', valor: d[0].disponiveis },
                  { nome: 'Avaliação', valor: `${parseFloat(d[0].avaliacao || '0').toFixed(1)}★` },
                ],
                info: req.session.usuario,
                relatorio: {
                  gastos: d2.map(v => ({ ...v, total: parseFloat(v.total).toFixed(2), mes: `${MESES[v.mes]} de ${v.ano}` })),
                  ganhos: d3.map(v => ({ ...v, total: parseFloat(v.total).toFixed(2), mes: `${MESES[v.mes]} de ${v.ano}` })),
                },
              }
              log(result.relatorio.gastos)
              log(result.relatorio.ganhos)
              log(result) || res.status(200).send(result)
            })
            .catch(e => res.status(500).send({ msg: e }))
        })
        .catch(e => res.status(500).send({ msg: e }))
    })
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/historico', (req, res) => {

  log('/api/historico')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  query(`select * from view_aluguel where locatarioId = '${req.session.usuario.id}' order by dataInicio desc`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/moveis', (req, res) => {

  log('/api/moveis')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  query(`select * from view_movel where usuarioId = '${req.session.usuario.id}' order by data desc`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/avaliar/:id/:avaliacao', (req, res) => {

  log('/api/avaliar')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  let { id, avaliacao } = req.params

  try {
    if (isNaN(id)) throw 'Id não permitido.'
    if (isNaN(avaliacao)) throw 'Avaliação não permitida.'
    avaliacao = parseInt(avaliacao)
    switch (avaliacao) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break
      default:
        throw 'Avaliação não permitida.'
    }
    if (id == req.session.usuario.id) throw 'A avaliação não pode ser concluída.'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  log(`Avaliar id ${id}, avaliação ${avaliacao}`)

  query(`select fcn_iou_avaliacao('${req.session.usuario.id}', '${id}', '${avaliacao}')`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/avaliacao/:id', (req, res) => {

  log('/api/avaliacao')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  let { id } = req.params

  try {
    if (isNaN(id)) throw 'Id não permitido.'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  log(`Avaliacao de usuario ${req.session.usuario.id} para usuario id ${id}`)

  query(`select * from tbl_avaliacao where avaliadorId = '${req.session.usuario.id}' and avaliadoId = '${id}'`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.post('/api/aluguel/create', (req, res) => {

  log('/api/aluguel/create')

  if (req.session.usuario === undefined) {
    res.status(401).send({ msg: 'Entre para alugar.' })
    return
  }

  if (req.session.usuario.acesso < 2) {
    res.status(403).send({ msg: 'Verifique sua conta com CEP e CPF para continuar.' })
    return
  }

  let {
    id,
    movelId,
    usuarioId,
    dataInicio,
    dataFim,
    valorFrete,
    descricao,
    imagem,
    nome,
    valorMes,
    status,
    pagamentoId,
  } = req.body

  log(req.body)

  let _aluguel = new Aluguel()

  try {
    if (usuarioId == req.session.usuario.id) throw 'Aluguel do móvel não permitido, você é o proprietário do móvel.'
    _aluguel.DataFim = dataFim
    _aluguel.DataInicio = today()
    //_aluguel.Descricao = descricao
    //_aluguel.Id
    //_aluguel.Imagem = 'default.png'
    _aluguel.MovelId = movelId
    //_aluguel.Nome = nome
    //_aluguel.Status = status
    _aluguel.UsuarioId = req.session.usuario.id
    //_aluguel.ValorFrete = valorFrete
    //_aluguel.ValorMes = valorMes
    _aluguel.pagamentoId = pagamentoId
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(_aluguel.Insert())
    .then(d => res.status(200).send({ msg: 'Aluguel realizado!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/movel/delete/:id', (req, res) => {

  log('/api/movel/delete')

  if (req.session.usuario === undefined) {
    res.status(401).send({ msg: 'Operação não permitida.' })
    return
  }

  const { id } = req.params

  const usuarioId = req.session.usuario.id

  log(req.params)

  let _aluguel = new Aluguel()

  try {
    _aluguel.Id = id
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`select * from tbl_movel where id = '${id}' and usuarioId = '${usuarioId}'`)
    .then(d => {
      if (d.length !== 1) throw 'Móvel não encontrado'
      d = d[0]
      if (d.status !== 'disponivel') throw 'O móvel está alugado no momento.'
      query(`delete from tbl_movel where id = '${id}' and usuarioId = '${usuarioId}' and status = 'disponivel'`)
        .then(d => res.status(200).send({ msg: 'Móvel excluído!' }))
        .catch(e => res.status(500).send({ msg: e }))
    })
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/aluguel/cancel/:id', (req, res) => {

  log('/api/aluguel/cancel')

  if (req.session.usuario === undefined) {
    res.status(401).send({ msg: 'Operação não permitida.' })
    return
  }

  const { id } = req.params

  const usuarioId = req.session.usuario.id

  log(req.params)

  let _aluguel = new Aluguel()

  try {
    _aluguel.Id = id
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }
  const data = new Date()
  data.setHours(data.getHours() - 3)
  const [match, _d, _t] = data.toISOString().match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/)
  const _data = `${_d} ${_t}`

  query(`update tbl_aluguel set status = 'cancelado', dataFim = '${_data}' where id = '${id}' and usuarioId = '${usuarioId}'`)
    .then(d =>
      query(`update tbl_movel set status = 'disponivel' where id = (select movelId from tbl_aluguel where id = '${id}' and usuarioId = '${usuarioId}')`)
        .then(d => res.status(200).send({ msg: 'Aluguel cancelado e móvel disponibilizado!' }))
        .catch(e => res.status(500).send({ msg: e })))
    .catch(e => res.status(500).send({ msg: e }))
})

app.post('/api/moveis/update', (req, res) => {

  log('/api/moveis/update')

  if (req.session.usuario === undefined) {
    res.status(401).redirect(401, '/')
    return
  }

  if (req.session.usuario.acesso < 2) {
    res.status(400).send({ msg: 'Não autorizado, usuário não verificado' })
    return
  }

  log(req.files)

  let movel = new Movel()

  let {
    id,
    categoriaId,
    usuarioId,
    descricao,
    imagem,
    nome,
    valorMes,
    status,
    altura,
    largura,
    espessura,
  } = req.body

  try {
    movel.Id = id
  } catch (err) {
    res.status(400).send({ msg: err })
    log(err)
    return
  }

  query(`select * from tbl_movel where id = '${id}'`)
    .then(d => {
      log({ id, d })
      if (d.length !== 1) throw 'Móvel não encontrado'
      d = d[0]

      let _uniqid = d.imagem
      let foto

      if (req.files?.foto !== undefined) {
        foto = req.files.foto
        _uniqid = `${uniqid('img_')}.${foto.mimetype.match(/^image\/(\w+)/)[0]}`
      }

      try {
        movel.CategoriaId = categoriaId
        movel.UsuarioId = req.session.usuario.id
        movel.Descricao = descricao
        movel.Imagem = _uniqid
        movel.Nome = nome
        movel.ValorMes = valorMes
        movel.Status = d.status
        movel.Altura = altura
        movel.Largura = largura
        movel.Espessura = espessura
      } catch (err) {
        res.status(400).send({ msg: err })
        log(err)
        return
      }

      if (req.files?.foto !== undefined) {
        if (foto.mimetype !== 'image/png' && foto.mimetype !== 'image/jpeg') {
          res.status(400).send({ msg: 'Formato de imagem incorreto' })
          return
        }
        foto.mv(`./public/img/${_uniqid}`)
        log(`Moved image - uniqid: ${_uniqid}`)
      }

      query(`update tbl_movel set categoriaId = '${movel.CategoriaId}', descricao = '${movel.Descricao}', imagem = '${_uniqid}', nome = '${movel.Nome}', valorMes = '${movel.ValorMes}', altura = '${movel.Altura}', largura = '${movel.Largura}', espessura = '${movel.Espessura}' where id = '${movel.Id}'`)
        .then(d => res.status(200).send({ msg: 'Móvel atualizado!' }))
        .catch(e => res.status(500).send({ msg: e }))
    })
    .catch(log)

})

app.get('/api/pagamentos', (req, res) => {

  log('/api/pagamentos')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 2) return res.status(403).send({ msg: 'Não autorizado' })

  query(`select * from tbl_pagamento where usuarioId = '${req.session.usuario.id}'`)
    .then(d => res.status(200).send({
      data: d.map(v => ({
        ...v,
        tipo: 'Cartão de Crédito',
        numero: v.numero.replace(/^\d{12}/, '************'),
      }))
    }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.post('/api/pagamento/create', (req, res) => {

  log('/api/pagamento/create')

  if (req.session.usuario === undefined) return res.status(401).redirect(401, '/')

  let { numero, validade, cvv } = req.body

  try {
    // numero
    if (numero.length !== 19) throw 'Número inválido'
    if (!numero.match(/\d{4}\s\d{4}\s\d{4}\s\d{4}/)) throw 'Número inválido'
    // validade
    if (validade.length !== 5) throw 'Validade inválida'
    const match = validade.match(/(\d{2})\/(\d{2})/)
    if (!match) throw 'Validade inválida'
    if (isNaN(match[1]) || match[1] < 1 || match[1] > 12) throw 'Validade inválida'
    if (isNaN(match[2]) || match[2] < 20) throw 'Validade inválida'
    numero = numero.replace(/\s/g, '')
    // cvv
    if (cvv.length !== 3) throw 'CVV inválido'
    if (!cvv.match(/\d{3}/)) throw 'CVV inválido'
  } catch (e) {
    res.status(500).send({ msg: e })
    return
  }

  query(`insert into tbl_pagamento values (null, 'cartao credito', '${numero}', '${validade}', '${cvv}', '${req.session.usuario.id}')`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/pagamento/delete/:id', (req, res) => {

  log('/api/pagamento/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })

  const
    { id } = req.params,
    usuarioId = req.session.usuario.id

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_pagamento where id = '${id}' and usuarioId = '${usuarioId}'`)
    .then(d => res.status(200).send({ msg: 'Meio de pagamento removido!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/alugueis', (req, res) => {

  log('/api/admin/alugueis')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_aluguel`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/aluguel/delete/:id', (req, res) => {

  log('/api/admin/aluguel/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_aluguel where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Aluguel excluido!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/avaliacoes', (req, res) => {

  log('/api/admin/avaliacoes')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_avaliacao`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/avaliacao/delete/:id', (req, res) => {

  log('/api/admin/avaliacao/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_avaliacao where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Avaliação excluida!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/categorias', (req, res) => {

  log('/api/admin/categorias')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_categoria`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.post('/api/admin/categoria/create', (req, res) => {

  log('/api/admin/categoria/create')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { nome = '' } = req.body

  log(req.body)

  try {
    if (nome.length === 0) throw 'Nome não permitido'
    if (nome.length > 20) throw 'Nome não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`insert into tbl_categoria (nome) values ('${nome}')`)
    .then(d => res.status(200).send({ msg: 'Categoria criada!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/categoria/delete/:id', (req, res) => {

  log('/api/admin/categoria/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_categoria where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Categoria excluida!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/contato', (req, res) => {

  log('/api/admin/contato')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_contato`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/contato/delete/:id', (req, res) => {

  log('/api/admin/contato/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_contato where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Contato excluido!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/denuncias', (req, res) => {

  log('/api/admin/denuncias')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_denuncia`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/denuncia/delete/:id', (req, res) => {

  log('/api/admin/denuncia/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_denuncia where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Denúncia excluida!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/moveis', (req, res) => {

  log('/api/admin/moveis')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_movel`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/movel/delete/:id', (req, res) => {

  log('/api/admin/movel/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_movel where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Móvel excluido!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/pagamentos', (req, res) => {

  log('/api/admin/pagamentos')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_pagamento`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/pagamento/delete/:id', (req, res) => {

  log('/api/admin/pagamento/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_pagamento where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Meio de pagamento excluido!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/usuarios', (req, res) => {

  log('/api/admin/usuarios')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`select * from tbl_usuario`)
    .then(d => res.status(200).send({ data: d }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/info', (req, res) => {

  log('/api/admin/info')

  if (req.session.usuario === undefined) return res.status(401).redirect(403, '/')
  if (req.session.usuario.acesso < 3) return res.status(401).redirect(403, '/')

  query(`
    select
      *
    from (
      (select count(*) as alugueis from tbl_aluguel) as a,
      (select count(*) as alugueisativos from tbl_aluguel where status = 'ativo') as b,
      (select count(*) as alugueiscancelados from tbl_aluguel where status = 'cancelado') as c,
      (select count(*) as moveis from tbl_movel) as d,
      (select count(*) as moveisdisponiveis from tbl_movel where status = 'disponivel') as e,
      (select count(*) as moveisindisponiveis from tbl_movel where status = 'indisponivel') as f,
      (select count(*) as usuarios from tbl_usuario) as g,
      (select count(*) as categorias from tbl_categoria) as h,
      (select count(*) as avaliacoes from tbl_avaliacao) as i,
      (select count(*) as usuarios1 from tbl_usuario where acesso = '1') as j,
      (select count(*) as usuarios2 from tbl_usuario where acesso = '2') as k,
      (select usuario as usuariomaismoveis, count(*) as quantidademaismoveis from view_movel group by usuario order by quantidademaismoveis desc limit 1) as l
    )
  `)
    .then(h => {
      h = h[0]
      res.status(200).send([
        { label: 'Aluguéis', nome: 'alugueis', valor: h.alugueis },
        { label: 'Aluguéis Ativos', nome: 'alugueisativos', valor: h.alugueisativos },
        { label: 'Aluguéis Cancelados', nome: 'alugueiscancelados', valor: h.alugueiscancelados },
        { label: 'Móveis', nome: 'moveis', valor: h.moveis },
        { label: 'Móveis Disponíveis', nome: 'moveisdisponiveis', valor: h.moveisdisponiveis },
        { label: 'Móveis Indisponíveis', nome: 'moveisindisponiveis', valor: h.moveisindisponiveis },
        { label: 'Usuários', nome: 'usuarios', valor: h.usuarios },
        { label: 'Usuários Locatários', nome: 'usuarios1', valor: h.usuarios1 },
        { label: 'Usuários Locadores', nome: 'usuarios2', valor: h.usuarios2 },
        { label: 'Categorias', nome: 'categorias', valor: h.categorias },
        { label: 'Avaliações', nome: 'avaliacoes', valor: h.avaliacoes },
        { label: 'Usuário com mais móveis', nome: 'usuariomaismoveis', valor: h.usuariomaismoveis },
        { label: 'Maior quantidade de móveis do usuário', nome: 'quantidademaismoveis', valor: h.quantidademaismoveis },
      ])
    })
    .catch(e => res.status(500).send({ msg: e }))
})

app.get('/api/admin/usuario/delete/:id', (req, res) => {

  log('/api/admin/usuario/delete')

  if (req.session.usuario === undefined) return res.status(401).send({ msg: 'Operação não permitida.' })
  if (req.session.usuario.acesso < 3) return res.status(401).send({ msg: 'Operação não permitida.' })

  const { id } = req.params

  log(req.params)

  try {
    if (isNaN(id)) throw 'Id não permitido'
  } catch (e) {
    res.status(400).send({ msg: e })
    log(e)
    return
  }

  query(`delete from tbl_usuario where id = '${id}'`)
    .then(d => res.status(200).send({ msg: 'Usuário excluido!' }))
    .catch(e => res.status(500).send({ msg: e }))
})

app.listen(port, () => log(`Listening on port ${port}`))
