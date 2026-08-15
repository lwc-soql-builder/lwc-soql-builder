# LWC SOQL Builder

LWC SOQL Builder is a SOQL execution tool developed in LWC Open Source. LWC SOQL Builder makes building and running SOQL in Salesforce incredibly easy.

For more information, visit https://lwc-soql-builder.github.io/

![](https://lwc-soql-builder.github.io/images/lwc-soql-builder-animation.gif)

## Features

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

## Login setup (External Client App)

LWC SOQL Builder logs in with the OAuth 2.0 Authorization Code flow with PKCE.
The previously used user-agent (implicit) flow was removed in OAuth 2.1 and no
longer works with Salesforce ([#47](https://github.com/lwc-soql-builder/lwc-soql-builder/issues/47)).
Also, since Salesforce restricts self-authorization of uninstalled connected
apps (September 2025) and no longer allows creating new connected apps
(Spring '26), each org now needs its own External Client App (ECA). An admin
creates it once per org:

1. In Setup, open **External Client App Manager** and create a new External
   Client App:
    - Enable OAuth. Scopes: `api`, `refresh_token`, `web`, `openid`
    - Callback URLs: the URL where the app is hosted, e.g.
      `https://lwc-soql-builder.github.io/lwc-soql-builder/`
      (add `http://localhost:3001/` for local development)
    - Flow: **Authorization Code and Credentials** is NOT required; the
      standard web server flow is used
    - **Require Proof Key for Code Exchange (PKCE): ON** (enforced by
      Salesforce anyway)
    - **Require Secret for Web Server Flow: OFF**
    - **Require Secret for Refresh Token Flow: OFF**
    - Policy: permitted users **All users may self-authorize** (or
      admin-approved, as your org prefers)
2. (Recommended) In Setup > **CORS**, add the app's origin (e.g.
   `https://lwc-soql-builder.github.io`) to the allowlist and check
   **Enable CORS for OAuth endpoints**. With this, the OAuth token exchange
   goes directly from the browser to your org. Without it, the app falls back
   to the jsforce AJAX proxy for the token exchange.
3. Open the app, and register the org on the welcome screen with a label, the
   org's **My Domain URL** (e.g. `https://yourdomain.my.salesforce.com`), and
   the ECA's **consumer key**. The consumer key of a PKCE public client is an
   identifier, not a secret.

You can register multiple orgs (production, sandboxes) and switch between
them on the welcome screen. Sandboxes need the ECA deployed in each sandbox
org, and their My Domain URL looks like
`https://yourdomain--sboxname.sandbox.my.salesforce.com`.

## How to setup local machine for development

1. Setup proxy. You must set `proxy.allowed_origin=http://localhost:3001`.  
   For more information, see [lwc-soql-builder/jsforce-ajax-proxy-cloud-functions](https://github.com/lwc-soql-builder/jsforce-ajax-proxy-cloud-functions)  
   (Optional: if you add `http://localhost:3001` to your org's CORS allowlist,
   API calls work without the proxy and `FIREBASE_PROJECT_ID` can stay empty.)

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
