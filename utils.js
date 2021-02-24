const fetch = require('node-fetch')

const { log } = console

const API_URL = 'https://www.mapacep.com.br'

/**
 * Buscar um CEP
 * @param {String} cep CEP a ser buscado
 */

const buscaGeo = async cep => {
  return await new Promise((resolve, reject) => {
    if (!cep.match('-'))
      cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2')
    log('buscando', cep)
    fetch(`${API_URL}/busca-cep.php?busca-cep=${cep}`)
      .then(d => d.text())
      .then(d => {
        const [match, lat, long] = d.match(/meta\sname="description".+Latitude\s(-?\d+\.?\d+),\sLongitude\s(-?\d+\.?\d+)/)
        log(`cep: ${cep} lat: ${lat} long: ${long}`)
        resolve({ cep, lat, long })
      })
      .catch(e => {
        log(e)
        reject('Erro ao buscar cep')
      })
  })
}

module.exports = { buscaGeo }