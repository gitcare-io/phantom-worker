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
        await randomizer.invokeWithProbability(task.probability, phantomWorker.resolveTask(task.name))
      } catch (error) {
        logger.error(error);
      }
    });
  })
})