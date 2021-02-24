class Movel {
  /**
   * @private
   */
  id
  /**
   * @private
   */
  categoriaId
  /**
   * @private
   */
  usuarioId
  /**
   * @private
   */
  descricao
  /**
   * @private
   */
  imagem
  /**
   * @private
   */
  nome
  /**
   * @private
   */
  valorMes
  /**
   * @private
   */
  status
  /**
   * @private
   */
  altura
  /**
   * @private
   */
  largura
  /**
   * @private
   */
  espessura

  /**
   * @returns {number}
   */
  get Id() {
    return this.id
  }
  /**
   * @param {number} id
   */
  set Id(id) {
    if (isNaN(id)) throw 'Id não permitido'
    id = parseInt(id)
    if (id <= 0) throw 'Id não permitido'
    this.id = id
  }

  /**
   * @returns {number}
   */
  get CategoriaId() {
    return this.categoriaId
  }
  /**
   * @param {number} categoriaId
   */
  set CategoriaId(categoriaId) {
    if (isNaN(categoriaId)) throw 'Id categoria não permitido'
    categoriaId = parseInt(categoriaId)
    if (categoriaId <= 0) throw 'Id categoria não permitido'
    this.categoriaId = categoriaId
  }

  /**
   * @returns {number}
   */
  get UsuarioId() {
    return this.usuarioId
  }
  /**
   * @param {number} usuarioId
   */
  set UsuarioId(usuarioId) {
    if (isNaN(usuarioId)) throw 'Id usuário não permitido'
    usuarioId = parseInt(usuarioId)
    if (usuarioId <= 0) throw 'Id usuário não permitido'
    this.usuarioId = usuarioId
  }

  /**
   * @returns {string}
   */
  get Descricao() {
    return this.descricao
  }
  /**
   * @param {string} descricao
   */
  set Descricao(descricao) {
    if (typeof descricao !== 'string') throw 'Descrição não permitida'
    if (descricao.length === 0) throw 'Descrição não permitida'
    this.descricao = descricao
  }

  /**
   * @returns {string}
   */
  get Imagem() {
    return this.imagem
  }
  /**
   * @param {string} imagem
   */
  set Imagem(imagem) {
    if (typeof imagem !== 'string') throw 'Imagem não permitida'
    if (imagem.length === 0) throw 'Imagem não permitida'
    this.imagem = imagem
  }

  /**
   * @returns {string}
   */
  get Nome() {
    return this.nome
  }
  /**
   * @param {string} nome
   */
  set Nome(nome) {
    if (typeof nome !== 'string') throw 'Nome não permitido'
    if (nome.length === 0) throw 'Nome não permitido'
    this.nome = nome
  }

  /**
   * @returns {number}
   */
  get ValorMes() {
    return this.valorMes
  }
  /**
   * @param {number} valorMes
   */
  set ValorMes(valorMes) {
    if (isNaN(valorMes)) throw 'Valor mês não permitido'
    valorMes = parseFloat(valorMes)
    if (valorMes <= 0) throw 'Valor mês não permitido'
    this.valorMes = valorMes
  }

  /**
   * @returns {string}
   */
  get Status() {
    return this.status
  }
  /**
   * @param {string} status
   */
  set Status(status) {
    if (typeof status !== 'string') throw 'Status não permitido'
    if (status.length === 0) throw 'Status não permitido'
    if (status !== 'disponivel' && status !== 'indisponivel') throw 'Status não permitido'
    this.status = status
  }

  /**
   * @returns {number}
   */
  get Altura() {
    return this.altura
  }
  /**
   * @param {number} altura
   */
  set Altura(altura) {
    if (isNaN(altura)) throw 'Altura não permitida'
    altura = parseFloat(altura)
    if (altura <= 0) throw 'Altura não permitida'
    this.altura = altura
  }

  /**
   * @returns {number}
   */
  get Largura() {
    return this.largura
  }
  /**
   * @param {number} largura
   */
  set Largura(largura) {
    if (isNaN(largura)) throw 'Largura não permitida'
    largura = parseFloat(largura)
    if (largura <= 0) throw 'Largura não permitida'
    this.largura = largura
  }

  /**
   * @returns {number}
   */
  get Espessura() {
    return this.espessura
  }
  /**
   * @param {number} espessura
   */
  set Espessura(espessura) {
    if (isNaN(espessura)) throw 'Espessura não permitida'
    espessura = parseFloat(espessura)
    if (espessura <= 0) throw 'Espessura não permitida'
    this.espessura = espessura
  }

  /**
   * @method
   * @returns {string}
   */
  Insert = () =>
    `insert into tbl_movel (id, categoriaId, usuarioId, descricao, imagem, nome, valorMes, status, altura, largura, espessura) values (
      null,
      '${this.categoriaId}',
      '${this.usuarioId}',
      '${this.descricao}',
      '${this.imagem}',
      '${this.nome}',
      '${this.valorMes}',
      '${this.status}',
      '${this.altura}',
      '${this.largura}',
      '${this.espessura}'
      )`
}

class Categoria {
  /**
   * @private
   */
  id
  /**
   * @private
   */
  nome

  /**
   * @returns {number}
   */
  get Id() {
    return this.id
  }
  /**
   * @param {number} id
   */
  set Id(id) {
    if (isNaN(id)) throw 'Id não permitido'
    id = parseInt(id)
    if (id <= 0) throw 'Id não permitido'
    this.id = id
  }

  /**
   * @returns {string}
   */
  get Nome() {
    return this.nome
  }
  /**
   * @param {string} nome
   */
  set Nome(nome) {
    if (typeof nome !== 'string') throw 'Nome não permitido'
    if (nome.length === 0) throw 'Nome não permitido'
    this.nome = nome
  }

  /**
   * @method
   * @returns {string}
   */
  Insert = () =>
    `insert into tbl_categoria values (
      null,
      '${this.nome}'
      )`
}

class Usuario {
  /**
   * @private
   */
  id
  /**
   * @private
   */
  celular
  /**
   * @private
   */
  email
  /**
   * @private
   */
  foto
  /**
   * @private
   */
  senha
  /**
   * @private
   */
  usuario
  /**
   * @private
   */
  acesso
  /**
   * @private
   */
  cep
  /**
   * @private
   */
  logradouro
  /**
   * @private
   */
  complemento
  /**
   * @private
   */
  bairro
  /**
   * @private
   */
  cidade
  /**
   * @private
   */
  uf
  /**
   * @private
   */
  cpf
  lat
  long

  /**
   * @returns {number}
   */
  get Id() {
    return this.id
  }
  /**
   * @param {number} id
   */
  set Id(id) {
    if (isNaN(id)) throw 'Id não permitido'
    id = parseInt(id)
    if (id <= 0) throw 'Id não permitido'
    this.id = id
  }

  /**
   * @returns {string}
   */
  get Celular() {
    return this.celular
  }
  /**
   * @param {string} celular
   */
  set Celular(celular) {
    if (typeof celular !== 'string') throw 'Celular não permitido'
    if (celular.length === 0) throw 'Celular não permitido'
    this.celular = celular
  }

  /**
   * @returns {string}
   */
  get Email() {
    return this.email
  }
  /**
   * @param {string} email
   */
  set Email(email) {
    if (typeof email !== 'string') throw 'Email não permitido'
    if (email.length === 0) throw 'Email não permitido'
    this.email = email
  }

  /**
   * @returns {string}
   */
  get Foto() {
    return this.foto
  }
  /**
   * @param {string} foto
   */
  set Foto(foto) {
    if (typeof foto !== 'string') throw 'Foto não permitida'
    if (foto.length === 0) throw 'Foto não permitida'
    this.foto = foto
  }

  /**
   * @returns {string}
   */
  get Senha() {
    return this.senha
  }
  /**
   * @param {string} senha
   */
  set Senha(senha) {
    if (typeof senha !== 'string') throw 'Senha não permitida'
    if (senha.length === 0) throw 'Senha não permitida'
    this.senha = senha
  }

  /**
   * @returns {string}
   */
  get Usuario() {
    return this.usuario
  }
  /**
   * @param {string} usuario
   */
  set Usuario(usuario) {
    if (typeof usuario !== 'string') throw 'Usuario não permitido'
    if (usuario.length === 0) throw 'Usuario não permitido'
    this.usuario = usuario
  }

  /**
   * @returns {number}
   */
  get Acesso() {
    return this.acesso
  }
  /**
   * @param {number} acesso
   */
  set Acesso(acesso) {
    if (isNaN(acesso)) throw 'Acesso não permitido'
    acesso = parseFloat(acesso)
    if (acesso <= 0) throw 'Acesso não permitido'
    this.acesso = acesso
  }

  /**
   * @returns {string}
   */
  get Cep() {
    return this.cep
  }
  /**
   * @param {string} cep
   */
  set Cep(cep) {
    if (typeof cep !== 'string') throw 'Cep não permitido'
    if (cep.length === 0) throw 'Cep não permitido'
    this.cep = cep
  }

  /**
   * @returns {string}
   */
  get Logradouro() {
    return this.logradouro
  }
  /**
   * @param {string} logradouro
   */
  set Logradouro(logradouro) {
    if (typeof logradouro !== 'string') throw 'Logradouro não permitido'
    if (logradouro.length === 0) throw 'Logradouro não permitido'
    this.logradouro = logradouro
  }

  /**
   * @returns {string}
   */
  get Complemento() {
    return this.complemento
  }
  /**
   * @param {string} complemento
   */
  set Complemento(complemento) {
    if (typeof complemento !== 'string') throw 'Complemento não permitido'
    if (complemento.length === 0) throw 'Complemento não permitido'
    this.complemento = complemento
  }

  /**
   * @returns {string}
   */
  get Bairro() {
    return this.bairro
  }
  /**
   * @param {string} bairro
   */
  set Bairro(bairro) {
    if (typeof bairro !== 'string') throw 'Bairro não permitido'
    if (bairro.length === 0) throw 'Bairro não permitido'
    this.bairro = bairro
  }

  /**
   * @returns {string}
   */
  get Cidade() {
    return this.cidade
  }
  /**
   * @param {string} cidade
   */
  set Cidade(cidade) {
    if (typeof cidade !== 'string') throw 'Cidade não permitida'
    if (cidade.length === 0) throw 'Cidade não permitida'
    this.cidade = cidade
  }

  /**
   * @returns {string}
   */
  get Uf() {
    return this.uf
  }
  /**
   * @param {string} uf
   */
  set Uf(uf) {
    if (typeof uf !== 'string') throw 'Uf não permitido'
    if (uf.length !== 2) throw 'Uf não permitido'
    this.uf = uf
  }

  /**
   * @returns {string}
   */
  get Cpf() {
    return this.cpf
  }
  /**
   * @param {string} cpf
   */
  set Cpf(cpf) {
    if (typeof cpf !== 'string') throw 'Cpf não permitido'
    if (!this.validarCPF(cpf)) throw 'Cpf não permitido'
    this.cpf = cpf
  }

  /**
   * @returns {Number}
   */
  get Lat() {
    return this.lat
  }
  /**
   * @param {Number} lat
   */
  set Lat(lat) {
    this.lat = parseFloat(lat)
  }

  /**
   * @returns {Number}
   */
  get Long() {
    return this.long
  }
  /**
   * @param {Number} long
   */
  set Long(long) {
    this.long = parseFloat(long)
  }

  /**
   * @function
   * @private
   * @param {string} cpf
   * @returns {boolean}
   */
  validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf == '') return false
    if (cpf.length != 11 ||
      cpf == "00000000000" ||
      cpf == "11111111111" ||
      cpf == "22222222222" ||
      cpf == "33333333333" ||
      cpf == "44444444444" ||
      cpf == "55555555555" ||
      cpf == "66666666666" ||
      cpf == "77777777777" ||
      cpf == "88888888888" ||
      cpf == "99999999999")
      return false
    let add = 0
    for (let i = 0; i < 9; i++)
      add += parseInt(cpf.charAt(i)) * (10 - i)
    let rev = 11 - (add % 11)
    if (rev == 10 || rev == 11)
      rev = 0
    if (rev != parseInt(cpf.charAt(9)))
      return false
    add = 0
    for (let i = 0; i < 10; i++)
      add += parseInt(cpf.charAt(i)) * (11 - i)
    rev = 11 - (add % 11)
    if (rev == 10 || rev == 11)
      rev = 0
    if (rev != parseInt(cpf.charAt(10)))
      return false
    return true
  }

  /**
   * @method
   * @returns {string}
   */
  Insert = () => `
  insert into tbl_usuario (id, celular, email, foto, senha, usuario, acesso, cep, logradouro, complemento, bairro, cidade, uf, cpf) values (
    null,
    null,
    '${this.email}',
    'default.png',
    sha1('${this.senha}'),
    '${this.usuario}',
    '1',
    null,
    null,
    null,
    null,
    null,
    null,
    null
    )
  `

  /**
   * @method
   * @returns {string}
   */
  Update = () => `
  update tbl_usuario set
    acesso = '${this.acesso}',
    bairro = '${this.bairro}',
    celular = '${this.celular}',
    cep = '${this.cep}',
    cidade = '${this.cidade}',
    cpf = '${this.cpf}',
    complemento = '${this.complemento}',
    email = '${this.email}',
    foto = '${this.foto}',
    logradouro = '${this.logradouro}',
    uf = '${this.uf}',
    usuario = '${this.usuario}',
    senha = '${this.senha}',
    lat = '${this.lat}',
    \`long\` = '${this.long}'
  where id = '${this.id}'
  `
}

class Contato {
  /**
   * @private
   */
  id
  /**
   * @private
   */
  nome
  /**
   * @private
   */
  email
  /**
   * @private
   */
  assunto
  /**
   * @private
   */
  mensagem
  /**
   * @private
   */
  data

  /**
   * @returns {number}
   */
  get Id() {
    return this.id
  }
  /**
   * @param {number} id
   */
  set Id(id) {
    if (isNaN(id)) throw 'Id não permitido'
    id = parseInt(id)
    if (id <= 0) throw 'Id não permitido'
    this.id = id
  }

  /**
   * @returns {string}
   */
  get Nome() {
    return this.nome
  }
  /**
   * @param {string} nome
   */
  set Nome(nome) {
    if (typeof nome !== 'string') throw 'Nome não permitido'
    if (nome.length === 0) throw 'Nome não permitido'
    this.nome = nome
  }

  /**
   * @returns {string}
   */
  get Email() {
    return this.email
  }
  /**
   * @param {string} email
   */
  set Email(email) {
    if (typeof email !== 'string') throw 'Email não permitido'
    if (email.length === 0) throw 'Email não permitido'
    this.email = email
  }

  /**
   * @returns {string}
   */
  get Assunto() {
    return this.assunto
  }
  /**
   * @param {string} assunto
   */
  set Assunto(assunto) {
    if (typeof assunto !== 'string') throw 'Assunto não permitido'
    if (assunto.length === 0) throw 'Assunto não permitido'
    this.assunto = assunto
  }

  /**
   * @returns {string}
   */
  get Mensagem() {
    return this.mensagem
  }
  /**
   * @param {string} mensagem
   */
  set Mensagem(mensagem) {
    if (typeof mensagem !== 'string') throw 'Mensagem não permitido'
    if (mensagem.length === 0) throw 'Mensagem não permitido'
    this.mensagem = mensagem
  }

  /**
   * @returns {string}
   */
  get Data() {
    return this.data
  }
  /**
   * @param {string} data
   */
  set Data(data) {
    if (typeof data !== 'string') throw 'Data não permitida'
    if (data.length !== 10) throw 'Data não permitida'
    this.data = data
  }

  /**
   * @method
   * @returns {string}
   */
  Insert = () =>
    `insert into tbl_contato values (
      null,
      '${this.nome}',
      '${this.email}',
      '${this.assunto}',
      '${this.mensagem}',
      default
      )`
}

class Aluguel {

  // id, movelId, usuarioId, dataInicio, dataFim, valorFrete, descricao, imagem, nome, valorMes, status

  /**
   * @private
   */
  id
  /**
   * @private
   */
  movelId
  /**
   * @private
   */
  usuarioId
  /**
   * @private
   */
  pagamentoId
  /**
   * @private
   */
  dataInicio
  /**
   * @private
   */
  dataFim
  /**
   * @private
   */
  valorFrete
  /**
   * @private
   */
  descricao
  /**
   * @private
   */
  imagem
  /**
   * @private
   */
  nome
  /**
   * @private
   */
  valorMes
  /**
   * @private
   */
  status

  /**
   * @returns {number}
   */
  get Id() {
    return this.id
  }
  /**
   * @param {number} id
   */
  set Id(id) {
    if (isNaN(id)) throw 'Id não permitido'
    id = parseInt(id)
    if (id <= 0) throw 'Id não permitido'
    this.id = id
  }

  /**
   * @returns {number}
   */
  get MovelId() {
    return this.movelId
  }
  /**
   * @param {number} movelId
   */
  set MovelId(movelId) {
    if (isNaN(movelId)) throw 'MovelId não permitido'
    movelId = parseInt(movelId)
    if (movelId <= 0) throw 'MovelId não permitido'
    this.movelId = movelId
  }

  /**
   * @returns {number}
   */
  get PagamentoId() {
    return this.pagamentoId
  }
  /**
   * @param {number} pagamentoId
   */
  set PagamentoId(pagamentoId) {
    if (isNaN(pagamentoId)) throw 'PagamentoId não permitido'
    pagamentoId = parseInt(pagamentoId)
    if (pagamentoId <= 0) throw 'PagamentoId não permitido'
    this.pagamentoId = pagamentoId
  }

  /**
   * @returns {number}
   */
  get UsuarioId() {
    return this.usuarioId
  }
  /**
   * @param {number} usuarioId
   */
  set UsuarioId(usuarioId) {
    if (isNaN(usuarioId)) throw 'UsuarioId não permitido'
    usuarioId = parseInt(usuarioId)
    if (usuarioId <= 0) throw 'UsuarioId não permitido'
    this.usuarioId = usuarioId
  }

  /**
   * @returns {string}
   */
  get DataInicio() {
    return this.dataInicio
  }
  /**
   * @param {string} dataInicio
   */
  set DataInicio(dataInicio) {
    if (typeof dataInicio !== 'string') throw 'DataInicio não permitida'
    if (dataInicio.length === 0) throw 'DataInicio não permitida'
    if (!dataInicio.match(/^\d{4}-\d{2}-\d{2}/g)) throw 'DataInicio não permitida'
    this.dataInicio = dataInicio
  }

  /**
   * @returns {string}
   */
  get DataFim() {
    return this.dataFim
  }
  /**
   * @param {string} dataFim
   */
  set DataFim(dataFim) {
    if (typeof dataFim !== 'string') throw 'DataFim não permitida'
    if (dataFim.length === 0) throw 'DataFim não permitida'
    if (!dataFim.match(/^\d{4}-\d{2}-\d{2}/g)) throw 'DataFim não permitida'
    this.dataFim = dataFim
  }

  /**
   * @returns {number}
   */
  get ValorFrete() {
    return this.valorFrete
  }
  /**
   * @param {number} valorFrete
   */
  set ValorFrete(valorFrete) {
    if (isNaN(valorFrete)) throw 'ValorFrete não permitido'
    valorFrete = parseFloat(valorFrete)
    if (valorFrete <= 0) throw 'ValorFrete não permitido'
    this.valorFrete = valorFrete
  }

  /**
   * @returns {string}
   */
  get Descricao() {
    return this.descricao
  }
  /**
   * @param {string} descricao
   */
  set Descricao(descricao) {
    if (typeof descricao !== 'string') throw 'Descricao não permitida'
    if (descricao.length === 0) throw 'Descricao não permitida'
    this.descricao = descricao
  }

  /**
   * @returns {string}
   */
  get Imagem() {
    return this.imagem
  }
  /**
   * @param {string} imagem
   */
  set Imagem(imagem) {
    if (typeof imagem !== 'string') throw 'Imagem não permitida'
    if (imagem.length === 0) throw 'Imagem não permitida'
    this.imagem = imagem
  }

  /**
   * @returns {string}
   */
  get Nome() {
    return this.nome
  }
  /**
   * @param {string} nome
   */
  set Nome(nome) {
    if (typeof nome !== 'string') throw 'Nome não permitido'
    if (nome.length === 0) throw 'Nome não permitido'
    this.nome = nome
  }

  /**
   * @returns {number}
   */
  get ValorMes() {
    return this.valorMes
  }
  /**
   * @param {number} valorMes
   */
  set ValorMes(valorMes) {
    if (isNaN(valorMes)) throw 'Valor mês não permitido'
    valorMes = parseFloat(valorMes)
    if (valorMes <= 0) throw 'Valor mês não permitido'
    this.valorMes = valorMes
  }

  /**
   * @returns {string}
   */
  get Status() {
    return this.status
  }
  /**
   * @param {string} status
   */
  set Status(status) {
    if (typeof status !== 'string') throw 'Status não permitido'
    if (status.length === 0) throw 'Status não permitido'
    if (status !== 'ativo' && status !== 'cancelado') throw 'Status não permitido'
    this.status = status
  }

  // id, movelId, usuarioId, dataInicio, dataFim, valorFrete, descricao, imagem, nome, valorMes, status

  /**
   * @method
   * @returns {string}
   */
  Insert = () =>
    `insert into tbl_aluguel values (
      null,
      '${this.movelId}',
      '${this.usuarioId}',
      '${this.dataInicio}',
      '${this.dataFim}',
      '${this.valorFrete}',
      '${this.descricao}',
      '${this.imagem}',
      '${this.nome}',
      '${0 ?? this.valorMes}',
      default,
      '${this.pagamentoId}'
      )`
}

module.exports = { Movel, Categoria, Usuario, Contato, Aluguel }