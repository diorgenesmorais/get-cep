const ff = require('@google-cloud/functions-framework');
const buscaCep = require('busca-cep');
let payload = {};

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
  payload = {};

  log('Content of body', body);

  if(req.headers['user-agent'] === 'Google-Dialogflow') {
    payload['cep'] = body.sessionInfo.parameters['infocep'];
    if(body.messages) {
      payload['messages'] = JSON.parse(body.messages);
    } else {
      payload['messages'] = [];
    }
    saveMessage(`O usuário consultou o ${payload['cep']}`, 'user');
    return payload;
  }

  return {...body};
}

function getAddress(address) {
  const {logradouro, bairro, localidade, uf, cep} = address;
  return `O CEP ${cep} é referente ao endereço: ${logradouro}, ${bairro}, ${localidade} - ${uf}`;
}

function getResponseData(resText) {
  saveMessage(resText, 'assistant');
  return {
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
        api_response: resText,
        messages: JSON.stringify([...payload['messages']])
      }
    }
  }
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
    res.status(400).json(getResponseData('Informe o CEP no payload'));
    return;
  }
  buscaCep(cep, {sync: false, timeout: 1000})
    .then((address) => {
      const resText = getAddress(address);
      const data = getResponseData(resText);
      log('Response API', data);
      res.status(200).json(data);
    })
    .catch((error) => {
      log('Erro na execução', error);
      res.status(500).send('Erro de execução');
    });
});

/**
 * Cria um objeto do contexto de mensagem
 * 
 * @param {string} content 
 * @param {string} role 
 * @returns objeto no padrão do contexto.
 */
function setMessage(content, role) {
  return {
    content,
    role
  }
}

/**
 * Salva a mensagem na lista de mensagens
 * 
 * @param {string} message 
 * @param {string} role 
 */
function saveMessage(message, role) {
  const list = payload['messages'];

  payload['messages'] = [...list, setMessage(message, role)];
}
