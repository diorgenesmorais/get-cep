const ff = require('@google-cloud/functions-framework');
const buscaCep = require('busca-cep');

function log(message, content) {

  const entry = {
    severity: 'DEBUG',
    message: message,
    content: content
  };

  console.log(JSON.stringify(entry));
}

function generatePayload(req) {
  const body = req.body;
  const payload = {};

  log('Content of body', body);

  if(req.headers['user-agent'] === 'Google-Dialogflow') {
    payload['cep'] = body.sessionInfo.parameters['infoCep'];
    return payload;
  }

  return {...body};
}

function getAddress(address) {
  const {logradouro, bairro, localidade, uf, cep} = address;
  return `O CEP ${cep} é referente ao endereço: ${logradouro}, ${bairro}, ${localidade} - ${uf}`;
}

ff.http('chat', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if(req.method == 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Credentials", "false");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.status(204).send('');
  }

  const { cep } = generatePayload(req);
  if (!cep) {
    res.status(400).send('Informe o CEP no payload');
    return;
  }
  buscaCep(cep, {sync: false, timeout: 1000})
    .then((address) => {
      const resText = getAddress(address);
      const data = {
        fulfillment_response: {
          messages: [
            {
              text: {
                text: [resText]
              }
            }
          ]
        },
        sessionInfo: {
          parameters: {
            api_response: resText
          }
        }
      }
      res.status(200).json(data);
    })
    .catch((error) => {
      log('Erro na execução', error);
      res.status(500).send('Erro de execução');
    });
});