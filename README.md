# gh-html [![TravisCI][travis-image]][travis-url]
> Github Pages alike for private repository

[Github Pages](https://pages.github.com/) is very useful to host html-based project and auto-generated document. However it lacks access control, which becomes a concern for projects under private repository, which you don't want anything go public.
On the other hand, for security reason `raw.githubusercontent.com` returns everything as `plain/text`, rendering it not veryuseful for trusted content.

`gh-html` aims to resolve this and provide an OAuth proxy to access to your github repository, with is particular useful for:
1. Previewing html directly hosted on github.
2. Have CI generate document and push on a particular branch, and enable you to view it.

<!-- Markdown link & img dfn's -->
[travis-image]: https://travis-ci.org/shadow-paw/gh-html.svg?branch=master
[travis-url]: https://travis-ci.org/shadow-paw/gh-html
