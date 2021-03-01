# download-url-warning-service

Service that generates warning emails when url downloads failed.

/!\ When first added to the stack, the service might send many emails /!\

## Installation

To add the service to your `mu.semte.ch` stack, add the following snippet to docker-compose.yml:

```yaml
services:
  download-url-warning:
    image: lblod/download-url-warning-service:x.x.x
    environment:
      EMAIL_FROM: "from@test.com"
      EMAIL_TO: "to@test.com"
```

### Environment variables

Provided [environment variables](https://docs.docker.com/compose/environment-variables/) by the service. These can be added in within the docker declaration.

| Name                | Description                              | Default                         |
| ------------------- | ---------------------------------------- | ------------------------------- |
| `EMAIL_FROM`        | Email address from which emails are sent |                                 |
| `EMAIL_TO`          | Email address to which emails are sent   |                                 |
| `CRON_JOB_PATTERN`  | Cron job pattern                         | `0 */5 * * * *`                 |

## Development

For a more detailed look in how to develop a microservices based on
the [mu-javascript-template](https://github.com/mu-semtech/mu-javascript-template), we would recommend
reading "[Developing with the template](https://github.com/mu-semtech/mu-javascript-template#developing-with-the-template)"

### Developing in the `mu.semte.ch` stack

Paste the following snip-it in your `docker-compose.override.yml`:

````yaml  
download-url-warning:
  image: semtech/mu-javascript-template:1.4.0
  environment:
    NODE_ENV: "development"
  volumes:
    - /absolute/path/to/your/sources/:/app/
````
