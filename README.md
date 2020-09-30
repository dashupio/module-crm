Dashup Module Phone
&middot;
[![Latest Github release](https://img.shields.io/github/release/dashup/module-phone.svg)](https://github.com/dashup/module-phone/releases/latest)
=====

A connect interface for phone on [dashup](https://dashup.io).

## Contents
* [Get Started](#get-started)
* [Connect interface](#connect)

## Get Started

This phone connector adds sms actions to Dashup flows:

```json
{
  "url" : "https://dashup.io",
  "key" : "[dashup module key here]",
}
```

To start the connection to dashup:

`npm run start`

## Deployment

1. `docker build -t dashup/module-phone .`
2. `docker run -d -v /path/to/.dashup.json:/usr/src/module/.dashup.json dashup/module-phone`