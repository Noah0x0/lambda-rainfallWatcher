# lambda-rainfallWatcher
lambda for watching rainfall &amp; logging it.

## Develop
```
$ npm install
```

### Setup 
Initializes some files.
```
$ $(npm bin)/node-lambda setup
```

### Run Locally
Testing third party library.
```
$ $(npm bin)/node-lambda run
```

### Deploy Cloud
Uploading to Cloud via aws-cli.
1. Fill the blank in `.env` file
1. Write AWS_ENVIRONMENT, AWS_ROLE_ARN, AWS_FUNCTION_NAME
    ```
    AWS_ENVIRONMENT=development or production
    AWS_ROLE_ARN=arn:aws:***************
    AWS_FUNCTION_NAME=RailFallWatcher
    ```
1. Deploy
    ```
    $ $(npm bin)/node-lambda deploy 
    ```

If you want to use env variables.
1. Add env variables to `deploy.env` file
1. Deploy Cloud with -f options
    ```
    $ $(npm bin)/node-lambda deploy -f deploy.env
    ```
