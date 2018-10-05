# firebase-auth-spa

[![Build Status](https://travis-ci.org/katsu-o/firebase-auth-spa.svg?branch=master)](https://travis-ci.org/katsu-o/firebase-auth-spa)
[![Maintainability](https://api.codeclimate.com/v1/badges/4f7b0920ea92cf431bed/maintainability)](https://codeclimate.com/github/katsu-o/firebase-auth-spa/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An example app(SPA: React/TypeScript) of Firebase Authentication.

## Description

This is an exapmle app(SPA) of Firebase Authentication.

This app(SPA) is created using React with TypeScript, scaffolding by CRA(create-react-app).

## Prerequisites

- A Firebase project
- Authentication: Enable **Password** and **Google**
  - (Optionally): Facebook, Twitter, GitHub -> _settings on each provider side are required_
    - [Authenticate Using Facebook Login with JavaScript](https://firebase.google.com/docs/auth/web/facebook-login)
    - [Authenticate Using Twitter in JavaScript](https://firebase.google.com/docs/auth/web/facebook-login)
    - [Authenticate Using GitHub with JavaScript](https://firebase.google.com/docs/auth/web/github-auth)

## Requirement

(confirmed version)

- Node >= 10.7.0
- npm >= 6.1.0
- yarn >= 1.10.1 -> _not required but recommended(when using npm, please read as appropriate)_
- firebase-tools >= 4.2.1

## Installation

```
# 1. clone this repository
$ git clone git@github.com:katsu-o/firebase-auth-spa.git
$ cd firebase-auth-spa

# 2. install packages
$ yarn install

# 3. rename(or copy) .env.sample to .env
$ mv .env.sample .env

# 4. fill up variables in .env file
(varibles are at Firebase Web settings as config)

# 5. login to Firebase
$ firebase login

# 6. select a Firebase project
$ firebase use --add

# 7. start app
$ yarn start

That's all.
Access to Hosting URL.

#### if you want to deploy app, follow the procedure below ####

# 7. build
$ yarn build

# 8. deploy
$ firebase deploy

you can access to Hosting URL.

# x. stop hosting
$ firebase hosting:disable
```

## Appendix

If you want to deploy via travis-ci,
Set variables defined in. env to travis-ci's Environment Variables
in addition to FIREBAE_TOKEN, FIREBASE_PROJECT used in .tarvis.yml.

## Author

[katsu-o](https://github.com/katsu-o)

## License

[MIT](https://github.com/katsu-o/test/blob/master/LICENSE)
