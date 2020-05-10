# LWC SOQL Builder

LWC SOQL Builder is a SOQL execution tool developed in LWC Open Source. LWC SOQL Builder makes building and running SOQL in Salesforce incredibly easy.

For more information, visit https://lwc-soql-builder.github.io/

![](https://lwc-soql-builder.github.io/images/lwc-soql-builder-animation.gif)

## Features

* Point and Click User Interface
  * A point and click user interface enables you to add SOQL boilerplate, fields, parent relationships, subquery and run a query.
* Autocomplete
  * Autocomplete is a feature that make you to complete field name. You can search by field label as well as by field name.
* PWA Support
  * LWC SOQL Builder can be installed as Progressive Web App (PWA). You can install it like a normal desktop app.
* Format SOQL
  * LWC SOQL Builder allows you to instantly beautify your SOQL queries. Formatted SOQL is very easy to use in Apex code.
* CSV Export
  * You can export the query result to a CSV file. The CSV file can be upserted to Salesforce using Data Loader.
* Support for ignoring default namespace
  * You can run a SOQL without the namespace prefix of a managed package. So, you can copy and paste the SOQL into your Apex code as-is.

## How to setup local machine for development

1. Setup proxy. You must set `proxy.allowed_origin=http://localhost:3001`.  
For more information, see [lwc-soql-builder/jsforce-ajax-proxy-cloud-functions](https://github.com/lwc-soql-builder/jsforce-ajax-proxy-cloud-functions)

2. Copy & edit `config/development.js.example` file to add your custom configurations.

```
$ cp config/development.js.example config/development.js
```

3. Run the following command to start the app.

```
$ npm run watch
```

This will start the project with a local development server on `http://localhost:3001`.

## How to deploy

1. Setup proxy. You must set `proxy.allowed_origin=http://<username>.github.io`.  
For more information, see [lwc-soql-builder/jsforce-ajax-proxy-cloud-functions](https://github.com/lwc-soql-builder/jsforce-ajax-proxy-cloud-functions)

2. Copy & edit `config/production.js.example` file to add your custom configurations.

```
$ cp config/production.js.example config/production.js
```

3. Run the following command to build and deploy.

```
$ npm run deploy
```

This will publish files in `dist/` to a gh-pages branch on GitHub.

4. You can access LWC SOQL Builder with the following URL.  
`http://<username>.github.io/lwc-soql-builder/`
