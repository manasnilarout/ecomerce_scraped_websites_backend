- Get the static page up
- Build the serve to respond back data from DB

## Server
Clone the repository to server, populate `.env` file with appropriate values.
1. Run the build step
    `npm run build`
2. Run pm2 server start command
```sh
pm2 start "npm start" --name unlockcommerce_scraper --max-memory-restart 200M --cron-restart="0 0 * * *" -i max --exp-backoff-restart-delay=100 --watch
```