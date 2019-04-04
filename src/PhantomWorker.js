const puppeteer = require('puppeteer');
const config = require('config');
const randomstring = require('randomstring');

class PhantomWorker {
  constructor(num) {
    this.num = num;
    this.browser = null;
    this.page = null;
  }

  async launch() {
    this.browser = await(await puppeteer.launch()).createIncognitoBrowserContext();
    return this.browser;
  }

  async authenticate() {
    if (!this.browser) return;
    this.page = await this.browser.newPage();
    await this.page.waitFor(1000);
    await this.page.goto(config.get('github.login_url'));
    await this.page.type('#login_field', config.get(`worker${this.num}.authentication.user`));
    await this.page.type('#password', config.get(`worker${this.num}.authentication.password`));
    await this.page.waitFor(1000);
    await this.page.click('#login input[type="submit"]');
    await this.page.waitForNavigation();
  }

  async createAndMergePR() {
    await this.launch();
    await this.authenticate();
    this.page = await this.browser.newPage();
    await this.page.goto(config.get(`worker${this.num}.factory_repo_file_url`));
    await this.page.waitFor(1000);
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
    await this.page.waitFor(500);
    await this.page.click('#submit-file');
    await this.page.waitForNavigation();
    await this.page.waitForSelector('#pull_request_body');
    await this.page.type('#pull_request_body', randomstring.generate(Math.floor(Math.random() * 300) + 10));
    await this.page.click('.new-pr-form button[type="submit"]');
    await this.page.waitForNavigation();
    await this.page.waitFor(4000);
    await this.page.evaluate(() => {
      document.querySelector('.btn-group-merge > button').click();
      setTimeout(() => {
        document.querySelector('.commit-form-actions .js-merge-commit-button').click();
        return Promise.resolve()
      }, 300);
    });
    await this.logout();
  }

  async logout() {
    if (!this.browser) return;
    this.page = await this.browser.newPage();
    await this.page.goto(config.get('github.logout_url'));
    await this.page.waitFor(5000);
    await this.page.evaluate(() => {
      document.querySelector('.auth-form form').submit();
      return Promise.resolve()
    })
    await this.browser.close();
  }
}

module.exports = PhantomWorker;