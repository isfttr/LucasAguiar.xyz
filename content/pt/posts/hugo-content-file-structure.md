---
date: 2024-03-24T16:58:55.000Z
draft: false
title: Estrutura de Arquivos de Conteúdo do Hugo
description: null
url: /hugo-content-file-structure
featured_image: /images/hugo-file-manager.png
categories:
  - articles
tags:
  - documentation
  - hugo
  - ananke
translation_source_hash: cec107eb4d602ae570556afc9d27e30b216b1609d6b8bb75807490526d51b703
---
Tenho usado o tema `ananke` desde o início deste blog. Mas recentemente comecei a ter todo tipo de problemas devido à minha falta de compreensão de como a pasta `contents` está ligada à pasta `layouts` e à pasta `themes/ananke`.

## `/contents`

Assim, no tema `ananke` você tem a opção de ter mais de um idioma para o seu site. No meu caso, eu só preciso usar a pasta em inglês, que está na pasta `contents/en/`. Dentro da pasta contents, cada seção precisa ter um arquivo `_index.md` indicando que é a página principal. Cada seção pode ser representada por uma pasta com conteúdo dentro e um arquivo `_index.md` como cabeçalho da seção. No meu caso, minhas postagens estão em `contents/en/posts/`. Assim, a `contents/en/` tem um arquivo `_index.md` assim como a pasta `contents/en/posts/`.

Isso é importante porque, junto com o `_index.md`, você pode ter outras páginas, que serão exibidas de forma diferente de acordo com a sua localização na pasta contents. Assim, um `content/en/page.md` está no mesmo nível que `content/en/posts/_index.md`. No tema `ananke`, isso pode ser visto visualmente pelas páginas de cabeçalho.

## `/themes/ananke/layouts`

Os layouts `html` que são usados são armazenados na pasta `ananke/layouts`. Quando o `hugo` constrói o site, ele usa os layouts presentes lá por padrão.

## `/layouts`

Esta pasta é usada no caso de o utilizador querer fazer alterações nos ficheiros `html`. Quando a alteração é feita nesta pasta, o `hugo` usará o layout alterado presente nesta pasta, em vez do que está na pasta `/themes/ananke/layouts`.

Cada seção e página tem um ficheiro de layout `html` padrão que é usado quando o `hugo` está a construir o site.

## Os ficheiros de layout `html`

Os padrões são armazenados na pasta `layouts/_defaults`.

- `baseof.html`: é a base HTML do site. Contém todos os módulos que estão ligados a outras partes da página, como cabeçalho e rodapé.
- `list.html`: é um tipo de página que lista vários arquivos diferentes no mesmo diretório. Um exemplo seria a página `contents/en/posts/_index.md`.
- `single.html`: é o layout para páginas individuais, incluindo a pasta de posts `contents/en/posts/`.
- `summary-with-image.html`: para o tema `ananke`, representa as mini-páginas de resumos que são mostradas na lista de artigos.
- `summary.html`: o mesmo que o anterior, mas para artigos que não têm pré-visualização de imagem.
- `index.html`: no caso de `ananke`, este ficheiro mostra uma lista dos ficheiros recentes de uma dada seção. Mais comumente, mostra as postagens recentes.

Em conclusão, entender a relação entre os layouts e o conteúdo do site é fundamental para compreender onde é necessário fazer alterações para obter o que se deseja.

## Referência

Minhas referências para isso estão um pouco espalhadas, mas aqui estão elas:

1. [Template lookup order - Hugo](https://gohugo.io/templates/lookup-order/)
2. [Single page templates - hugo](https://gohugo.io/templates/single-page-templates/)
3. [GitHub repositories for "ananke"](https://github.com/search?q=ananke&type=repositories)

Leia também:

- [Guia Completo: Como Integrar Beehiiv com Hugo via Cloudflare Workers]({{< relref "posts/newsletter-beehiiv-cloudflare-github/" >}})
- [Usando o nível gratuito do Oracle Cloud]({{< relref "posts/oracle_cloud_vps/" >}})
- [Introdução ao meu novo espaço na internet]({{< relref "posts/introduction/" >}})

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail contact@lucasaguiar.xyz ou preenchendo o formulário abaixo.
