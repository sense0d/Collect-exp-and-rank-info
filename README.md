# Collect exp to next rank info

Script for collecting info about rank and amount exp for next rank in txt file

## Dependencies

Script dependencies are listed in [package.json](./package.json) file.
All internal dependencies must be built before run service.

> [!IMPORTANT]  
> need fill .env file and json file with accounts info.

JSON file example under

```
[   
    {
        "login": "acc_login_1",
        "password": "password_1",
        "secret": "shared_secret_1"
    },
    {
        "login": "acc_login_2",
        "password": "password_2",
        "secret": "shared_secret_2"
    }
]
```

## Running locally

Script can be run locally using the following command:
First install dependencies

```bash
npm ci
```

After installation dependencies it can be run local using the following command:

```bash
npm start
```

## Configuring

You can configure script via environment variables (see [.env.example](./.env.example)) for more details.
For local development you can pass environment variables via `.env` file (see [dotenv](https://www.npmjs.com/package/dotenv) for more details).
