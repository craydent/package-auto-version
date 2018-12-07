const $c = require('craydent');

const { question, config, changelog, generateMessage, getData, updateChangelog } = require('../utils/utils');
const start = async () => {
  try {
    const { data, content, changelogTemplateStr, promptTemplateStr } = await getData();

    let pattern = config.match || new RegExp(
      `(${changelogTemplateStr.replace(/\$\{.*?\}/g, '.*?').replace(/\|/g, '\\|')})`
    );

    let message = await generateMessage(changelogTemplateStr, data);

    const prompt = $c.fillTemplate(promptTemplateStr, { message });
    if (config.noPrompt != true && updateChangelog) {
      message = (await question(prompt)).trim() || message;
    }
    if (updateChangelog) {
      const match = content.match(pattern),
        head = match && match[0] || '';
      if (head || !content) {
        let fileContent = message;
        if (head) {
          fileContent = content.replace(head, `${message}\n${head}`);
        }
        await $c.writeFile(changelog, fileContent);
      } else if (!head && content) {
        let fileContent = content + message;
        await $c.writeFile(changelog, fileContent);
      }
    }
    console.log(data.version);
  } catch (e) {
    console.error('\x1b[31m\x1b[40m%s\x1b[0m', e.output || e);
  } finally {
    process.exit(0);
  }
};

module.exports.start = start;