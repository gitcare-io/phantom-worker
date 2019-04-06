const puppeteer = require('puppeteer');
const config = require('config');
const randomstring = require('randomstring');
const logger = require('./Logger');

class PhantomWorker {
  constructor(num) {
    this.num = num;
    this.browser = null;
    this.page = null;
    this.workerConfig = config.get('workers')[num - 1];
  }

  resolveTask(name) {
    this.task = name;
    switch (name) {
      case 'create_and_merge_pr':
        return this.createAndMergePR();
      default:
        return;
    }
  }

  async createAndMergePR() {
    await this.launch();
    await this.authenticate();
    this.page = await this.browser.newPage();
    await this.page.goto(this.workerConfig.factory_repo_file_url);
    logger.info(`[Worker #${this.num}] ${this.task}: went to file edit page`)
    await this.page.waitFor(2000);
    await this.page.evaluate((content) => {
      const simulateClick = (elem) => {
        const evt = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        !elem.dispatchEvent(evt);
      };
      const textarea = document.querySelector('.js-code-textarea');
      textarea.value = `${textarea.value.slice(0, -3)}\n${content}\n`;
      document.querySelector('#submit-file').removeAttribute('disabled');
      simulateClick(document.querySelectorAll('input[name="commit-choice"]')[1])
      return Promise.resolve()
    }, randomstring.generate(Math.floor(Math.random() * 100) + 10))
    logger.info(`[Worker #${this.num}] ${this.task}: added content`)
    await this.page.waitFor(3000);
    await this.page.click('#submit-file');
    logger.info(`[Worker #${this.num}] ${this.task}: submited file`)
    await this.page.waitFor(8000);
    logger.info(`[Worker #${this.num}] ${this.task}: went to open pull request page`)
    await this.page.type('#pull_request_body', randomstring.generate(Math.floor(Math.random() * 300) + 100));
    await this.page.click('.new-pr-form button[type="submit"]');
    logger.info(`[Worker #${this.num}] ${this.task}: created pull request`)
    await this.page.waitFor(6000);
    await this.page.evaluate(() => {
      document.querySelector('.btn-group-merge > button').click();
      setTimeout(() => {
        document.querySelector('.commit-form-actions .js-merge-commit-button').click();
        return Promise.resolve()
      }, 500);
    });
    logger.info(`[Worker #${this.num}] ${this.task}: merged pull request`)
    await this.page.waitFor(6000);
    await this.logout();
  }

  // private

  async launch() {
    this.browser = await(await puppeteer.launch({
      args : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })).createIncognitoBrowserContext();
    logger.info(`[Worker #${this.num}] ${this.task}: launched`)
  }

  async authenticate() {
    this.page = await this.browser.newPage();
    await this.page.waitFor(1000);
    await this.page.goto(config.get('github.login_url'));
    await this.page.type('#login_field', this.workerConfig.authentication.user);
    await this.page.type('#password', this.workerConfig.authentication.password);
    await this.page.waitFor(1000);
    await this.page.click('#login input[type="submit"]');
    await this.page.waitFor(6000);
    logger.info(`[Worker #${this.num}] ${this.task}: authenticated`)
  }

  async logout() {
    this.page = await this.browser.newPage();
    await this.page.goto(config.get('github.logout_url'));
    await this.page.waitFor(5000);
    await this.page.evaluate(() => {
      document.querySelector('.auth-form form').submit();
      return Promise.resolve()
    })
    await this.browser.close();
    logger.info(`[Worker #${this.num}] ${this.task}: logout`)
  }
}

module.exports = PhantomWorker;