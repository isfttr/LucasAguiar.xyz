---
date: 2024-03-24T13:58:55-03:00
draft: false
title: Hugo Content File Structure
description: 
url: "/hugo-content-file-structure"
featured_image: "/images/hugo-file-manager.png"
categories:
  - article
tags:
  - documentation
  - hugo
  - ananke
---

I have been using the `ananke` theme since the inception of this blog. But recently I started to have all sorts of problems because of my lack of understading of how the `contents` folder is linked to the `layouts` folder and to the `themes/ananke` folder.

## `/contents`

So in the `ananke` theme you have the choice to have more than one language for your website. In my case I only need to use the english folder, which is in `contents/en/` folder. Inside the contents folder, every section needs to have a `_index.md` file indicating that it is the main page. Every section can be represented by a folder with content inside and `_index.md` file as the head of the section. In my case, my posts are at `contents/en/posts/`. So, the  `contents/en/` has a `_index.md` folder as well as the `contents/en/posts/` folder. 

This is important because alongside the `_index.md` you can have other pages, that will be displayed differently according to where in the contents folder they are. So a `content/en/page.md` is on the same level as `content/en/posts/_index.md`. In the `ananke` theme this can be seen visually by the header pages.

## `/themes/ananke/layouts`

The `html` layouts that are used are stored in the `ananke/layouts` folder. When `hugo` builds the website, it uses the layouts present there by default.

## `/layouts`

This folder is used in the case that the user wants to make changes to the `html` files. When the change is made in this folder, `hugo` will use the changed layout present in this folder, rather than what is in the `/themes/ananke/layouts` folder.

Each section and page has a default `html` layout file which is is used when `hugo` is building the website.

## The `html` layout files

The defaults are stored in the `layouts/_defaults` folder. 

- `baseof.html`: it is the base of html of the website. It contains all modules that are linked to other parts of the page, such as header and footer.
- `list.html`: it is a page type which list a number of different archives in the same directory. Example would be the `contents/en/posts/_index.md` page.
- `single.html`: it the layout for single pages, including the posts `contents/en/posts/` folder.
- `summary-with-image.html`: for the `ananke` theme it represents the summaries mini-pages that are show in the articles list.
- `summary.html`: same as above but for the articles that have no image preview.
- `index.html`: in the case of `ananke` this file show a list of the recent files from a given section. Most commonly it show the renet posts.

In conclusion, understanding the relationship between layouts and the content in the website is key to understanding where you need to change things in order to get what you want.

## Reference

My references for this is all over the place, but here they are:

1. [Template lookup order - Hugo](https://gohugo.io/templates/lookup-order/)
2. [Single page templates - hugo](https://gohugo.io/templates/single-page-templates/)
3. [GitHub repositories for "ananke"](https://github.com/search?q=ananke&type=repositories)

---
You can reach out to contact me about this and other topics at my email lucas.fernandes.df@gmail.com or by filling the form below.

{{< form-contact >}}
