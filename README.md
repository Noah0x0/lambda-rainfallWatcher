# lambda-rainfallWatcher
lambda for watching rainfall &amp; logging it.

### Setup
Initializes some files.
```
$ yarn install
$ yarn setup
```

### Run Locally
run locally
```
$ yarn start
```

### Deploy Cloud
Uploading to Cloud via aws-cli.
1. Fill the blank in `.env` file
1. Write AWS_ENVIRONMENT, AWS_ROLE_ARN, AWS_FUNCTION_NAME
    ```
    AWS_ENVIRONMENT=development or production
    AWS_ROLE_ARN=arn:aws:***************
    ```
1. Deploy
    ```
    $ yarn deploy
    ```
