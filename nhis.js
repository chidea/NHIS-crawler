const puppeteer = require('puppeteer');

async function print_personal_months(browser, page){
  await page.$('input#txtUserId');
  const inp = await page.$('input#r2');
  if(inp === null){
    console.log('404 error. retry after 10 seconds');
    await page.waitFor(10000);
    await page.reload({waitUntil:'load'});
    print_personal_months(browser, page);
    //browser.close();
    return;
  }
  await page.click('input#r2');
  await page.click('input#txtRegNo1');
  console.log('login now');
  /*const reg1 = 'input#txtRegNo1';
  await page.$(reg1);
  await page.waitForSelector(reg1);
  await page.type(reg1, '463');
  await page.type('#txtRegNo2', '16');
  await page.type('#txtRegNo3', '00482');
  await page.type('#txtUserId', 'chidea1');*/
  await page.waitForNavigation({timeout:0});
  console.log('wait login done');
  await page.waitForSelector('span.txt');
  await page.waitFor(1000);
  const [response] = await Promise.all([
    page.waitForNavigation({timeout:0}),
    page.evaluate(()=>{
      $('span.txt:contains("산출내역조회")')[0].click()
    }),
  ]);
  console.log('wait nav done');
  const names = ['건강보험', '국민연금', '고용보험', '산재보험'];
  const input_ids = ['health', 'pension', 'goyong', 'sanjae'];
  for(var i=0; i < names.length; i++){
    if(i>0){
      await page.click('input#'+input_ids[i]);
      await page.waitFor('#schMm');
    }
    let s = 1;
    let e = 12;
    if (process.argv.length>2){
      if (process.argv[2] == 1){
        e = 6;
      }else if (process.argv[2] == 2){
        s = 7;
      }
    }
    for(var m=s; m <= e; m++){
      await page.waitFor('#schMm');
      await page.select('#schMm', ''+m);
      await Promise.all([
        page.waitForNavigation({timeout:0}),
        page.click('a.btn_form01'),
      ]);
      await page.waitFor('button.sbtn');
      await page.click('button.sbtn');
      await page.emulateMedia('print');
      await page.waitFor(1000);
      await page.screenshot({path: names[i]+' '+m+'월.png'});
      await page.emulateMedia('screen');
      await page.evaluate(()=>{fn_popClose()});
      await page.waitFor(1000);
      //await page.pdf({path: names[i]+' '+m+'월.pdf'});
    }
  }
  await browser.close();
}

puppeteer.launch({headless: false, defaultViewport:{width:1024,height:768}, args:[`--window-size=1024,768`]}).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://si4n.nhis.or.kr/jpba/JpBaa00101.do');
  await print_personal_months(browser, page);
});
