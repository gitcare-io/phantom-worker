const express = require('express');
const app = express();
const cron = require('node-cron');
const config = require('config');
const PhantomWorker = require('./src/PhantomWorker');
const Randomizer = require('./src/Randomizer');
const workers = config.get('workers');
const logger = require('./src/Logger');

logger.info('Running...');

workers.forEach(({ tasks }, i) => {
  const num = i + 1;
  tasks.forEach((task) => {
    logger.info(`[Worker #${num}]`, `task: ${task.name}, cron: ${task.schedule}, p: ${task.probability || 100}%`);
    cron.schedule(task.schedule, async () => {
      try {
        const phantomWorker = new PhantomWorker(num);
        const randomizer = new Randomizer();
        logger.info(`[Worker #${num}]`, task.name);
        const shouldBeInvoked = randomizer.getProbabilityResult(task.probability);
        return shouldBeInvoked
          ? await phantomWorker.resolveTask(task.name)
          : logger.info(`[Worker #${num}] omitted`);
      } catch (error) {
        logger.error(error);
      }
    });
  })
})

app.get('/', (_req, res) => res.send(workers.map(x => ({ ...x, authentication: undefined }))));

app.listen(process.env.PORT || 3000);