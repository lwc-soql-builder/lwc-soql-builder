# LWC SOQL Builder

> [!IMPORTANT]
> **LWC SOQL Builder will stop working by February 20, 2027 at the latest.**
> Logging in already fails at times, and this cannot be fixed with its current design. Please use its successor, [sfbench](https://github.com/atskimura/sfbench).
> Thank you for using LWC SOQL Builder.
>
> **LWC SOQL Builder は、遅くとも2027年2月20日には使えなくなります。**
> すでにログインできない問題が起きていて、今の仕組みのままでは直せません。後継の [sfbench](https://github.com/atskimura/sfbench/blob/main/README.ja.md) をお使いください。
> これまで LWC SOQL Builder を使ってくださったみなさん、ありがとうございました。

## Why it is ending

LWC SOQL Builder logs in to Salesforce with the OAuth user-agent flow.
Salesforce is retiring this flow as part of its security hardening, on February 20, 2027 ([#49](https://github.com/lwc-soql-builder/lwc-soql-builder/issues/49)), and LWC SOQL Builder will not be able to log in after that.
Possibly because of this, logging in failed in late July 2026 ([#47](https://github.com/lwc-soql-builder/lwc-soql-builder/issues/47)), and as of October 2026 it fails in scratch orgs.

Moving to another flow would require an admin to create an external client app in each org ([#48](https://github.com/lwc-soql-builder/lwc-soql-builder/pull/48)), which is too much for a tool meant for quick use, so its successor, sfbench, was made instead.

LWC SOQL Builder は、OAuth のユーザーエージェントフローで Salesforce にログインしています。
このフローは、Salesforce がセキュリティ強化のために2027年2月20日で廃止するので（[#49](https://github.com/lwc-soql-builder/lwc-soql-builder/issues/49)）、その日からはログインできなくなります。
その影響か、2026年7月末にはログインがエラーになり（[#47](https://github.com/lwc-soql-builder/lwc-soql-builder/issues/47)）、2026年10月時点ではスクラッチ組織でログインできません。

代わりのフローに移るには、組織ごとに管理者が外部クライアントアプリケーションを作る必要があり（[#48](https://github.com/lwc-soql-builder/lwc-soql-builder/pull/48)）、気軽に使うツールには手間が大きすぎるので、後継の sfbench を作りました。

## sfbench

[sfbench](https://github.com/atskimura/sfbench) runs SOQL, REST API requests and anonymous Apex in your browser, using the auth you already have in the Salesforce CLI.

[sfbench](https://github.com/atskimura/sfbench/blob/main/README.ja.md) は、Salesforce CLI の認証を使って、SOQL、REST API、匿名 Apex を手元のブラウザで実行するツールです。

```
sf org login web -a my-org
npx sfbench
```

## The original README

The rest is the original README.
The proxy server it mentions will be stopped after February 20, 2027.

ここから下は、元の README です。
README の中の中継サーバーは、2027年2月20日のあとに止めます。

LWC SOQL Builder is a SOQL execution tool developed in LWC Open Source. LWC SOQL Builder makes building and running SOQL in Salesforce incredibly easy.

For more information, visit https://lwc-soql-builder.github.io/

![](https://lwc-soql-builder.github.io/images/lwc-soql-builder-animation.gif)

### Features

-   Point and Click User Interface
    -   A point and click user interface enables you to add SOQL boilerplate, fields, parent relationships, subquery and run a query.
-   Autocomplete
    -   Autocomplete is a feature that make you to complete field name. You can search by field label as well as by field name.
-   PWA Support
    -   LWC SOQL Builder can be installed as Progressive Web App (PWA). You can install it like a normal desktop app.
-   Format SOQL
    -   LWC SOQL Builder allows you to instantly beautify your SOQL queries. Formatted SOQL is very easy to use in Apex code.
-   CSV Export
    -   You can export the query result to a CSV file. The CSV file can be upserted to Salesforce using Data Loader.
-   Support for ignoring default namespace
    -   You can run a SOQL without the namespace prefix of a managed package. So, you can copy and paste the SOQL into your Apex code as-is.

### How to setup local machine for development

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

To ensure that you can view your changes, in Chrome DevTools, go to Application tab, click 'Service Workers' and select 'Bypass for network'.

### How to deploy

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
