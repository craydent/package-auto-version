const $c = require('craydent');

const { question, config, changelog, generateMessage, getData, updateChangelog } = require('../utils/utils');
const start = async () => {
  try {
    const { data, content, changelogTemplateStr, promptTemplateStr } = await getData();

    let pattern = new RegExp(
      `(${changelogTemplateStr.replace(/\$\{.*?\}/g, '.*?').replace(/\|/g, '\\|')})`
    );

    let message = await generateMessage(changelogTemplateStr, data);

    const prompt = $c.fillTemplate(promptTemplateStr, { message });
    if (config.noPrompt != true) {
      message = (await question(prompt)).trim() || message;
    }
    if (updateChangelog) {
      const match = content.match(pattern),
        head = match && match[0];
      if (head) {
        content = content.replace(head, `${message}\n${head}`);
        await $c.writeFile(changelog, content);
      }
    }
  } catch (e) {
    console.error('\x1b[31m\x1b[40m%s\x1b[0m', e.output || e);
  } finally {
    // process.exit(0);
  }
};

module.exports.start = start;