const $c = require('craydent/noConflict');
const path = require('path');
const readline = require('readline'),
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  }),
  question = $c.yieldable(rl.question, rl),
  run = $c.CLI.exec;
const version = process.argv[2] || 'patch',
  DATA = 0,
  CHANGELOG = 1,
  TEMPLATE = 2,
  VERSION = 3;
const changelog = path.join(process.cwd(), '/CHANGELOG.md');
const template = path.join(process.cwd(), '/template.md');
const defaultTemplate = `| \${version} | (\${author}:\${date}) \${others.0} |\r\n`;

let start = async () => {
  try {
    const results = await Promise.all([
      getGitData(),
      $c.readFile(changelog, 'utf8'),
      $c.readFile(template, 'utf8'),
      updateVersion()
    ]);
    let data = results[DATA];
    let content = results[CHANGELOG];
    let templateStr = !$c.isError(results[TEMPLATE])
      ? results[TEMPLATE]
      : defaultTemplate;
    let versionNumber = results[VERSION];

    data.version = versionNumber;
    let pattern = new RegExp(
      `(${templateStr.replace(/\$\{.*?\}/g, '.*?').replace(/\|/g, '\\|')})`
    );
    let message = generateMessage(templateStr, data);

    const prompt = `>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n${message}\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nThis will be your git message. Please enter your text to change\n`;
    message = (await question(prompt)).trim() || message;

    const match = content.match(pattern),
      head = match && match[0];
    if (head) {
      content = content.replace(head, `${message}\n${head}`);
      await $c.writeFile(changelog, content);
    }
  } catch (e) {
    console.error('\x1b[31m\x1b[40m%s\x1b[0m', e.output || e);
  } finally {
    process.exit(0);
  }
};
function generateMessage(template, data) {
  return $c.fillTemplate(template, data);
}
async function getGitData() {
  const gitUsername = await run('git config user.name', { silent: true });
  // const gitTag =
  //   gitTagOutput.output.replace(/(.*)-.*?-.*/, '$1').strip('\n') &&
  //   'CDTAG-v1.19.2';
  const gitOutput = await run(`git log origin..HEAD --oneline`, {
    silent: true
  });
  var features = [],
    fixes = [],
    merges = [],
    docs = [],
    others = [];
  const gitLines = $c.condense(gitOutput.output.split('\n')).map(x => {
      let message = x.replace(/.*?\s/, '');
      if (!message.indexOf('feat:')) {
        features.push(message.replace(/feat:\s*?/, ''));
        return message;
      }
      if (!message.indexOf('fix:')) {
        fixes.push(message.replace(/fix:\s*?/, ''));
        return message;
      }
      if (!message.indexOf('docs:')) {
        docs.push(message.replace(/docs:\s*?/, ''));
        return message;
      }
      if (!message.indexOf("Merge branch '")) {
        merges.push(message);
        return message;
      }

      others.push(message);
      return message;
    }),
    author = gitUsername.output
      .strip('\n')
      .replace('OFFICE\\', '')
      .trim(),
    date = $c.toDateTime(new Date(), { format: 'm/d/y' });

  return { author, date, features, fixes, docs, merges, others };
}
async function updateVersion() {
  const versionObject = await run(`npm version ${version}`, { silent: true });
  return $c.strip(versionObject.output, ['v', '\n']);
}

start();
