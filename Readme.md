# Melone Transaction Mail API

[![Build Status](https://secure.travis-ci.org/t-visualappeal/melone.png)](http://travis-ci.org/t-visualappeal/melone) [![Dependency Status](https://gemnasium.com/t-visualappeal/melone.png)](https://gemnasium.com/t-visualappeal/melone)

## Config

Change config with `export MELONE_CONFIG=my_config.json`. A default config is provided in `config/default.json`.

## Install

Install dependencies and database scheme with `(sudo) make install` and delete the scheme with `make uninstall`.

## Usage

Start the interface with `node server.js` and the api (send/track emails) with `node api.js`.

### Sending emails

**URL**
```bash
[POST] http://localhost:8080/api/mail/send
```

**Body**
```javascript
{
 "key": "f8a6657dc19b61cbd142c57ebb381128",
 "secret": "524f3bc30d23f70b300877885a48509c",
 "to": [
   {
     "email": "receiver@gmail.com",
     "name": "Tom Test",
     "vars": {
       "name": "Tom Test"
     }
   }
 ],
 "subject": "Test Email",
 "content": {
   "html": {
     "text": "<h1>#{heading} #{name}</h1><p>This is a <a href='#{url}'>test</a> email</p>",
     "vars": {
       "url": "http://www.example.com"
     }
   },
   "plain": {
     "text": "#{heading} #{name}\n\nThis is a test email:\n#{url}",
     "vars": {
       "url": "www.example.com"
     }
   },
   "vars": {
      "heading": "Hello"
   }
 },
 "tracking": {
   "open": true,
   "links": true
 }
}
```

#### Response

```javascript
{
  "status": "ok"
}
```