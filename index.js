require('dotenv').config()
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const SteamTotp = require("steam-totp");
const dataPrime = require(`./files/${process.env.JSON_FILE_NAME}`);

const get2faCode = (secret) => {
  return SteamTotp.generateAuthCode(secret);
};

const login = async (page, loginAccount, password, secret) => {
  await page.click("#global_action_menu > a.global_action_link");

  await new Promise((resolve) => setTimeout(resolve, 3000));

  await page.waitForSelector(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > div > form > div:nth-child(1) > input"
  );
  await page.waitForSelector(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > div > form > div:nth-child(2) > input"
  );

  await page.click(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > div > form > div:nth-child(1) > input"
  );
  await page.type(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > div > form > div:nth-child(1) > input",
    loginAccount,
    { delay: 1 }
  );

  await page.click(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > div > form > div:nth-child(2) > input"
  );
  await page.type(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > div > form > div:nth-child(2) > input",
    password,
    { delay: 1 }
  );

  await page.click(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > div > form > div._14fsnp12JwkJ28EVtQXPty > button"
  );

  const guardCode = get2faCode(secret);

  await page.waitForSelector(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > form > div > div._2AnqSZicq50gXaJuQx-SdC > div._1mhmmseSBKL7v66ts9ZWnR._30P8xQn5oam3D2Am4nZ_Y4 > div"
  );
  await page.click(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > form > div > div._2AnqSZicq50gXaJuQx-SdC > div._1mhmmseSBKL7v66ts9ZWnR._30P8xQn5oam3D2Am4nZ_Y4 > div"
  );
  await page.type(
    "#responsive_page_template_content > div.page_content > div:nth-child(1) > div > div > div > div._3jLIHRG2NdD0C8kOi-cxzl > form > div > div._2AnqSZicq50gXaJuQx-SdC > div._1mhmmseSBKL7v66ts9ZWnR._30P8xQn5oam3D2Am4nZ_Y4 > div",
    guardCode,
    { delay: 1 }
  );

  await new Promise((resolve) => setTimeout(resolve, 7000));
};

const logout = async (page) => {
  await page.waitForSelector("#account_pulldown");
  await page.click("#account_pulldown");

  await page.click("#account_dropdown > div > a:nth-child(7)");
};

//need read this
const getInfo = async (page) => {
  await page.waitForSelector("#tabid_accountmain > div");

  let exp = "";
  let rank = "";

  const rows = await page.$$(".generic_kv_line");
  for (let row of rows) {
    const textContent = await row.evaluate((el) => el.textContent);
    if (textContent.includes("towards next rank")) {
      exp = textContent.toString().split("rds ")[1];
    }
    if (textContent.includes("CS:GO Profile")) {
      rank = textContent.toString().split("Profile ")[1];
    }
  }

  return { exp, rank };
};

const appendLineToFile = (filePath, line) => {
  fs.appendFile(filePath, line + "\n", (err) => {
    if (err) {
      console.error("Ошибка при записи в файл:", err);
    }
  });
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://steamcommunity.com/market/");

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.setViewport({ width: 1080, height: 1024 });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const filePath = path.join(
    __dirname + "/results",
    `results_${new Date()
      .toJSON()
      .slice(0, 19)
      .replace("T", ":")
      .toString()
      .replaceAll(":", "-")}.txt`
  );

  for (let item of dataPrime) {
    login(page, item.login, item.password, item.secret);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await page.waitForSelector("#account_pulldown");
    await page.goto("https://steamcommunity.com/my/");

    console.log(
      `Data:${new Date()
        .toJSON()
        .slice(0, 19)
        .replace("T", ":")}\nCurrent URL:`,
      page.url()
    );

    await page.goto(`${page.url()}gcpd/730/`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const info = await getInfo(page);

    const textToFile = `login: ${item.login}\tneed to ${info.exp}\t${info.rank}`;
    appendLineToFile(filePath, textToFile);

    logout(page);
    await page.waitForSelector("#global_action_menu > a.global_action_link");

    // if (+i%2 === 0)  await new Promise((resolve) => setTimeout(resolve, 20000));;
  }

  await browser.close();
})();
