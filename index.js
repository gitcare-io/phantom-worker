const cron = require('node-cron');
const config = require('config');
const PhantomWorker = require('./src/PhantomWorker');

const phantomWorker1 = new PhantomWorker(1);
const phantomWorker2 = new PhantomWorker(2);

// create_and_merge_pr
cron.schedule(config.get('worker1.task.create_and_merge_pr'), async () => {
  console.log('worker1: create_and_merge_pr START');
  await phantomWorker1.createAndMergePR()
  console.log('worker1: create_and_merge_pr END');
});

cron.schedule(config.get('worker2.task.create_and_merge_pr'), async () => {
  console.log('worker2: create_and_merge_pr START');
  await phantomWorker2.createAndMergePR()
  console.log('worker2: create_and_merge_pr END');
});