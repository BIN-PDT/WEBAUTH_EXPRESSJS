**1. PROJECT**

```
git clone https://github.com/BIN-PDT/WEBAUTH_EXPRESSJS.git && rm -rf WEBAUTH_EXPRESSJS/.git
```

_For privacy reasons, follow the format of `.env.example` and replace the sensitive information in `.env` with your own._

-   _Generate `SECRET_KEY`_.

    ```
    openssl rand -hex 32
    ```

-   _Register MongoDB Atlas or MongoDB Compass to obtain `DATABASE_URI`_.

-   _Register OAuth Application of Social Provider to obtain `CLIENT_ID`, `CLIENT_SECRET` & `CALLBACK_URI`_.

**2. DEPENDENCY**

```
npm install
```

**3. RUN APPLICATION**

```
npm run start:dev
```
