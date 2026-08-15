# Trust the Print — Shop expansion

Ficheiros novos:
- shop.html
- product.html
- mini-me.html (placeholder funcional para evitar links partidos)
- shop.css
- shop.js
- product.js
- products.js

Ficheiro alterado:
- index.html: apenas links da navegação, categorias e produtos em destaque.

## Adicionar um produto
Edita `products.js` e adiciona um novo objeto dentro de `TTP_PRODUCTS`.

## Alterar preço
No produto, altera:
- `price`
- `priceLabel`

## Adicionar imagem
Coloca a imagem em `assets/products/<produto>/` e define, por exemplo:
`image: "assets/products/flow-vase/flow-vase-main.webp"`

## Link direto
`product.html?id=ID_DO_PRODUTO`

Exemplo:
`product.html?id=cable-system`

## Encomendas nesta V1
O formulário não finge enviar dados para um backend.
Ele gera um email completo para `trusttheprint@gmail.com`, que o cliente revê e envia na sua aplicação de email.
A integração automática por Cloudflare Worker/email será feita numa fase posterior.
