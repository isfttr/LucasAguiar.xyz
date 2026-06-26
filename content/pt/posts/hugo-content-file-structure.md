---
date: 2024-03-24T16:58:55.000Z
draft: false
title: Estrutura de Ficheiros de Conteúdo Hugo
description: null
url: /hugo-content-file-structure
featured_image: /images/hugo-file-manager.png
categories:
  - articles
tags:
  - documentation
  - hugo
  - ananke
translation_source_hash: 14afb46e4f5a21db4c24a7e536aaa4f0b28a45088bf41d277bd5c2e78a939c4d
---
Tenho usado o tema `ananke` desde o início deste blog. Mas recentemente comecei a ter todo tipo de problemas devido à minha falta de compreensão de como a pasta `contents` está ligada à pasta `layouts` e à pasta `themes/ananke`.

## `/contents`

Então, no tema `ananke`, você tem a opção de ter mais de um idioma para o seu site. No meu caso, só preciso usar a pasta em inglês, que está na pasta `contents/en/`. Dentro da pasta `contents`, cada seção precisa ter um arquivo `_index.md` indicando que é a página principal. Cada seção pode ser representada por uma pasta com conteúdo dentro e um arquivo `_index.md` como cabeçalho da seção. No meu caso, meus posts estão em `contents/en/posts/`. Assim, `contents/en/` tem uma pasta `_index.md`, assim como a pasta `contents/en/posts/`.

Isso é importante porque, juntamente com o `_index.md`, você pode ter outras páginas, que serão exibidas de forma diferente de acordo com o local em que estão na pasta `contents`. Assim, um `content/en/page.md` está no mesmo nível que `content/en/posts/_index.md`. No tema `ananke`, isso pode ser visto visualmente pelas páginas do cabeçalho.

## `/themes/ananke/layouts`

Os layouts `html` que são usados são armazenados na pasta `ananke/layouts`. Quando o `hugo` constrói o site, ele usa os layouts presentes lá por padrão.

## `/layouts`

Esta pasta é usada caso o usuário queira fazer alterações nos arquivos `html`. Quando a alteração é feita nesta pasta, o `hugo` usará o layout alterado presente nesta pasta, em vez do que está na pasta `/themes/ananke/layouts`.

Cada seção e página tem um arquivo de layout `html` padrão que é usado quando o `hugo` está construindo o site.

## Os arquivos de layout `html`

Os padrões são armazenados na pasta `layouts/_defaults`.

- `baseof.html`: é a base HTML do site. Contém todos os módulos que estão ligados a outras partes da página, como cabeçalho e rodapé.
- `list.html`: é um tipo de página que lista vários arquivos diferentes no mesmo diretório. Um exemplo seria a página `contents/en/posts/_index.md`.
- `single.html`: é o layout para páginas únicas, incluindo a pasta de posts `contents/en/posts/`.
- `summary-with-image.html`: para o tema `ananke`, representa as mini-páginas de resumo que são exibidas na lista de artigos.
- `summary.html`: o mesmo que o anterior, mas para artigos que não possuem pré-visualização de imagem.
- `index.html`: no caso do `ananke`, este arquivo mostra uma lista dos arquivos recentes de uma determinada seção. Mais comumente, mostra os posts recentes.

Em conclusão, entender a relação entre os layouts e o conteúdo do site é fundamental para compreender onde você precisa alterar as coisas para obter o que deseja.

## Referência

Minhas referências para isso estão por toda parte, mas aqui estão elas:

1. [Template lookup order - Hugo](https://gohugo.io/templates/lookup-order/)
2. [Single page templates - hugo](https://gohugo.io/templates/single-page-templates/)
3. [GitHub repositories for "ananke"](https://github.com/search?q=ananke&type=repositories)

Leia também:

- [Guia Completo: Como Integrar o Beehiiv ao Hugo via Cloudflare Workers]({{< relref "posts/newsletter-beehiiv-cloudflare-github/" >}})
- [Oracle Cloud Free Tier 2026: Ainda Vale a Pena? Guia Completo + Alternativas]({{< relref "posts/oracle_cloud_vps/" >}})
- [Introdução ao meu novo espaço na internet]({{< relref "posts/introduction/" >}})

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail contact@lucasaguiar.xyz ou preenchendo o formulário abaixo.
