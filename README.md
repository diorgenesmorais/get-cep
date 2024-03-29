# Get CEP function

- Exemplo de build com gcloud

```bash
gcloud functions deploy my-function-name \
--gen2 \
--service-account=minha-conta@dev.gserviceaccount.com \
--runtime=nodejs20 \
--region=us-central1 \
--source=. \
--entry-point=chat \
--trigger-http \
--allow-unauthenticated
```

- Criar está function com gcloud

> O parâmetro '--allow-unauthenticated' permite acesso público (não autenticado)

```bash
gcloud functions deploy get-cep-fn \
--gen2 \
--runtime=nodejs20 \
--region=us-central1 \
--source=. \
--entry-point=chat \
--trigger-http \
--allow-unauthenticated
```

- Teste local

```bash
yarn start
```

##### Deploy na cloud

```bash
yarn deploy
```

* [**Diorgenes Morais**](https://github.com/diorgenesmorais)