# gh-html [![TravisCI][travis-image]][travis-url]
> Github Pages alike for private repository

[Github Pages](https://pages.github.com/) is very useful to host html-based project and auto-generated document. However it lacks access control, which becomes a concern for projects under private repository, which you don't want anything go public.
On the other hand, for security reason `raw.githubusercontent.com` returns everything as `plain/text`, rendering it not veryuseful for trusted content.

`gh-html` aims to resolve this and provide an OAuth proxy to access to your github repository, which is particular useful for:
1. Previewing html directly hosted on github.
2. Have CI generate document and push on a particular branch, and enable you to view it.


## Github OAuth App
The server proxy files on github on your behalf, to do so it uses the github OAuth API and require an app registry on github. You need to create an OAuth App entry on https://github.com/settings/developers and setup the `Authorization callback URL` to match your server.  
The URL shall be `$APP_SERVER_BASE/auth/github`, e.g. `https://www.example.com/gh-html/auth/github`.


## Initial Configuration
```
cd server
# generate secrets
make secret-reset
# adjust settings like github app id
vi .env
```
> Follow the comment in file for configuration detail.

## Running
#### Run as standalone
The server is written as typescript and run with node.js. It also connect to a redis server for session store.  
To run as standalone you need to [setup a redis server](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-redis-on-ubuntu-16-04).
```
cd server
npm install
make run
```

#### Run with docker
The server is written as typescript and run with node.js. It also connect to a redis server for session store.  
The docker-compose.yml setup these two images.
```
cd server
docker-compose build
docker-compose up -d
```

## Security Disclaimer
`gh-html` is intended for use with trusted content, while having standard practice in mind, the mechanism that it proxy multiple repositories under same URL means things like cookies are shared. It should not be used to preview untrusted or random public content. Doing so might put you at certain security risk, or the computer would just explode.  
To preview public repository just visit https://htmlpreview.github.io/

<!-- Markdown link & img dfn's -->
[travis-image]: https://travis-ci.org/shadow-paw/gh-html.svg?branch=master
[travis-url]: https://travis-ci.org/shadow-paw/gh-html
