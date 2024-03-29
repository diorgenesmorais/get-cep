const ff = require('@google-cloud/functions-framework');
const buscaCep = require('busca-cep');

ff.http('chat', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
  
    if(req.method == 'OPTIONS') {
      res.setHeader("Access-Control-Allow-Credentials", "false");
      res.setHeader("Access-Control-Allow-Methods", "POST");
      res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
      res.status(204).send('');
    }
    
    const { cep } = req.query;
    if (!cep) {
      res.status(400).send('Informe o CEP na query');
      return;
    }
    buscaCep(cep, {sync: false, timeout: 1000})
      .then((address) => {
        res.status(200).send(address);
      })
      .catch((error) => {
        res.status(500).send('Erro de execução');
      });
  });