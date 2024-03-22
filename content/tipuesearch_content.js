var tipuesearch = {"pages": [{'title': 'About', 'text': '網頁:\xa0 https://mdecd2024.github.io/2a-midag8/content/index.html \n 網誌: https://mdecd2024.github.io/2a-midag8/blog \n 簡報:\xa0 https://mdecd2024.github.io/2a-midag8/reveal/index.html \n 倉儲:\xa0 https://github.com/mdecd2024/2a-midag8 \n \n 本 cmsimde 網際內容管理系統的對應 Template 倉儲: \n https://github.com/mdecycu/cmsimde_site \n 此 Template 將 cmsimde 作為子目錄而非子模組, 使用者可以依照需求自行修改 \n 倉儲對應網站:  https://mde.tw/cmsimde_site \n', 'tags': '', 'url': 'About.html'}, {'title': 'Practice', 'text': '練習1: 如何用Github Codespaces維護網站內容 \n 答:每一個倉儲都有<code>，在完成建立組倉儲後有code就可以改版。 任何一個倉儲中都有配置code，codespaces是一個線上整合環境與replit相似，只是介面是另一個配置。在倉儲下可以建一個在主分之來建codespaces。 先啟動動態在功能表還原終端系統，並新增一個終端系統，有兩意思給指令分別啟動動態與靜態。在開始run後要執行python3 main.py，遇到執行時沒有flask模組。就要去chmod u+x init-replit讓程式可以執行，讓他幫其安裝對應模組。最後在./init-replit。網站就會給一個阜可以開啟動態。 要在python3 mhttp.senver 啟動一個模組，因系統帶有一個動態一個靜態，靜態還有一個index，更且有一個index可以啟動，帶進編輯器。index阻礙小輸送快速，約0秒就跳進content跟index，只要用這指令啟用靜態就可以看到更改了，改版會力馬有反應。每一次阜號都是不一樣安全性高。 code每月給定數量相同，編輯可以在介面外，在上傳時開啟就好，使用完後要記得關閉，每月用量平均好就可以一直免費使用。 \n 練習2: \n 練習3: \n 期中作業: \n', 'tags': '', 'url': 'Practice.html'}, {'title': 'W3 Task', 'text': 'cd2024 w3 任務頁面 \n cd2024 w3 任務 \n 1. 請各組將組員的個人課程倉儲 cd2024 設為分組倉儲 2a-midag1 的子模組, 且以各組員的學號作為子模組的名稱 \n 議題: \n 如何在倉儲中設定子模組, 為何要將資料設為子模組? \n 能不能在 Replit 維護分組網站? 其他方法還可以直接使用 Codespaces, Gitpod 與 localhost 維護倉儲與網站 \n 假如仍希望使用 Replit 維護分組網站, 該如何進行? \n 2. 請各組員將負責分工處理的  https://webthesis.biblio.polito.it/16429/1/tesi.pdf  中英文並列資料 (LaTeX) 放在個人的倉儲網站, 最後在分組倉儲中整合建立出各組的期中報告 pdf 檔案 \n 該文章有 87 頁, 若有八名組員, 則每人可分工負責 11 頁, 若兩組以上結合協同, 則可按照規劃, 從文章標題開始到最後一頁, 先分配各組員任務後展開中英文並列編輯, 可以使用翻譯軟體或 ChatGPT 協助進行內容解釋或翻譯, 各組通篇完成中英並列資料整合後, 各學員必須於個人的課程倉儲 cd2024 中整理出協同過程的心得. \n --------------------------------------------------------------------------------------------------------- \n 1.需先將分組倉儲clone到近端可攜環境中的tmp目錄下，權限的部分依照前面putty設立的key. \n method: \n 第一步:git clone --recurse-submodules\xa0git@mdecycu:mdecd2024/2a-midag8.git\xa0\xa0#需有權限才能抓取到\n\n第二步:直接進入tmp目錄下分組倉儲，後輸入 git submodule add https://github.com/41023110/cd2024.git\xa041023110\xa0\xa0#分組組員個人cd2024倉儲，並以組員學號當作子目錄名稱，其中名稱並不影響組員抓取內容\n\n第三步:git add .\xa0 \xa0 \xa0\xa0git commit -m "add"\xa0 \xa0 \xa0 git push #將近端內容推致遠端 \n 2.我們將以4人分配87頁翻譯資料，平均1人22頁，並將各分配到的段數翻譯完成後放在自己的倉儲下，最後統一 \n 在分組倉儲中整合建立出各組的期中報告 pdf 檔案。 \n 第一段 1-21page 由41023108\xa0 ( ACKNOWLEDGMENTS.txt, Creative Commons.txt, LIST OF ACRONYMS.txt, abstract.txt, introduction_orig.txt,\xa0 \n 第二段 21-43page 由41023155 ( introduction_orig.txt, \n 第三段 43-65page 由41023110 ( introduction_orig.txt, \n 第四段 65-87page 由41023211 ( introduction_orig.txt, \n', 'tags': '', 'url': 'W3 Task.html'}, {'title': 'w4 Task', 'text': 'W4 各組員任務 \n 作業1: \n 各組員必須能在各自的個人課程倉儲放置所被交付編寫的 \xa0.txt (in LaTeX 格式), 然後整合至各組的分組倉儲, 由 xelatex 編譯出各週的分組報告 pdf 檔案. \n w4 2a 分組任務 \n 作業2: \n 請各組自行搜尋前面已經發布的教學影片, 分別 \n \n 在影片上填上字幕, 另行上傳到可以嵌入到各分組的網站上 \n 從影片字幕中整理出逐字稿, 放在影片下方, 以 .txt 連結安排 \n 並在各嵌入的教學影片下方, 以摘要方式說明該影片的教學重點 \n \n ------------------------------------------------------------------------------------------- \n 以下為影片剪輯後製分工情形: \n w1 video 41023211 \n w2 video 41023155 \n w3 video 41023110 \n w4 video 41023108 \n 誰先做完就幫助其他組員完成各週影片剪輯 !! \n', 'tags': '', 'url': 'w4 Task.html'}, {'title': 'w4 2a hw2(w1', 'text': 'w1 \n 2a 建個人課程倉儲 \n \n https://github.com/mdecd2024/2a-midag8/commit/7d7235382be3ee26d9b335f2982fe4d9482630b5 \n 將個人倉儲 import 至 Replit(上) \n \n https://github.com/mdecd2024/2a-midag8/commit/c46882f9ce10c6761cbf52688ef24fa76b69b524 \n 將個人倉儲 import 至 Replit(下) \n \n https://github.com/mdecd2024/2a-midag8/commit/c46882f9ce10c6761cbf52688ef24fa76b69b524 \n 設定 Github 帳號的雙重認證 \n \n \n 如何 import 倉儲至 Replit 進行改版 \n \n 如何設定網誌 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/2a_1.txt \n Odoo PLM 功能 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/cd2024_2a_2_odoo_plm%E7%B0%A1%E4%BB%8B%20%E5%AD%97%E5%B9%95%E6%96%87%E5%AD%97%E6%AA%94.txt \n \n', 'tags': '', 'url': 'w4 2a hw2(w1.html'}, {'title': 'w4 2a hw2(w2', 'text': 'w2 \n 利用 Github Classroom 指定分組倉儲 \n 1.甲班第一組組長如何建立 midag1 Team,\xa0 \n \n 2. 利用 Codespaces 維護倉儲與網站 \n \n 在近端執行動態網站 \n', 'tags': '', 'url': 'w4 2a hw2(w2.html'}, {'title': 'w4 2a hw2(w3', 'text': 'w3 \n 期中協同分組報告 \n 1.如何將 41123130 的個人倉儲設為 2a-midag2 分組倉儲的子模組 \n \n https://github.com/41023110/cd2024/commit/78a29b510fe45364d0037da13b85f6f9d66727d9 \n 2.將組員的個人倉儲設為分組倉儲子模組 \n \n https://github.com/41023110/cd2024/blob/509d3eccf7615221d7e813378c4319315a7c2a4d/downloads/20240320095241733.txt \n 3.wcm2024_1a_w3_3_如何在 replit 自設 .ssh 維護分組倉儲 \n \n https://github.com/41023110/cd2024/blob/fffb684bd377a6ecedadfac25333c936b26c8ba4/downloads/w3-3%E6%96%87%E6%AA%94.txt \n 使用 Gitpod 維護倉儲與網站 \n 1. 使用 Gitpod 維護個人網站 \n \n https://github.com/41023110/cd2024/blob/8e809c4510f3d47b944bc751840fd3de25c1254f/downloads/%E4%B8%8A.html \n 2. 使用 Gitpod 維護分組網站 \n \xa0 \n https://github.com/41023110/cd2024/blob/01b66a7ec89e5d2b1f89767e28ada795fc830b4b/downloads/w3-5.txt \n 有關 LaTeX 轉 pdf \n \n https://github.com/41023110/cd2024/blob/509d3eccf7615221d7e813378c4319315a7c2a4d/downloads/latex.txt.txt \n 設定網誌 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/2a_1.txt', 'tags': '', 'url': 'w4 2a hw2(w3.html'}, {'title': 'w4 2a hw2(w4', 'text': 'w4 \n 第一種介紹的倉儲維護方式 - Replit \n 1.如何在 Replit 檢視靜態網站 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/20240316214357460.txt \n 如何在 Replit 檢視靜態網站\xa0 摘要: \n 根據w2建立replit個人帳戶並與倉儲做雙向認證後，開始以replit維護倉儲 ，因為動態網站中的轉靜態按紐無法再執行檢視功能，也就是靜態動態無法在以一個網址做開啟，需分開，靜態網站檢視以python3 main2.py開啟，動態以python3 main.py開啟。 \n ---------------------------------------------------------------------------------------------------------- \n 2.如何下載 replit_main2.7z 並在倉儲中建立兩個檔案 \n \n https://github.com/KEHUEISIN/cd2024/blob/main/downloads/20240319092559049.txt \n 如何下載 replit_main2.7z 並在倉儲中建立兩個檔案 摘要: \n 依照上部影片檔內容將兩個7z下載 ，並在倉儲中建立兩個檔案，且要會啟動跟關掉，注意!!!這邊動態及靜態在不能同時以80開啟 。 \n', 'tags': '', 'url': 'w4 2a hw2(w4.html'}, {'title': 'w4 2b hw2(w1', 'text': 'cd2024_2b_3_如何設定 Github 帳號的雙重認證 \n \n \n \n \n 上傳cd2024_2b_2_如何從 Replit Account 設定 Connect 連結到 Github txt檔 \n \n https://github.com/mdecd2024/2a-midag8/commit/4f7c5a3b1c822fb91dddbf57a0bb5a6f712f0fb6', 'tags': '', 'url': 'w4 2b hw2(w1.html'}, {'title': 'w4 2b hw2(w2', 'text': '', 'tags': '', 'url': 'w4 2b hw2(w2.html'}, {'title': 'w4 2b hw2(w3', 'text': '', 'tags': '', 'url': 'w4 2b hw2(w3.html'}, {'title': 'w4 2b hw2(w4', 'text': '', 'tags': '', 'url': 'w4 2b hw2(w4.html'}, {'title': 'w5 Task', 'text': '統整各週網誌 \n', 'tags': '', 'url': 'w5 Task.html'}, {'title': 'blog', 'text': 'Replit/Codespaces \n \n \n chmod u+x gen_blog : \n \n chmod  是用於改變文件或目錄的權限設置的命令。 \n u+x  表示為擁有該文件的用戶（User）增加可執行（Execute）的權限。 \n gen_blog  是要設置權限的文件或可執行程序的名稱。 \n \n 總之，這個命令將  gen_blog  這個文件的用戶（擁有者）設置為可執行的。 \n \n \n ./gen_blog : \n \n ./  表示當前目錄（Working Directory），也就是這個命令所在的目錄。 \n gen_blog  是要執行的可執行文件或腳本。 \n \n 當你運行這個命令時，系統將查找當前目錄中的  gen_blog  文件，並執行它。這通常用於運行可執行文件或腳本。 \n \n \n 綜合起來，這兩個命令的組合是： \n \n 將  gen_blog  文件設置為可執行。 \n 執行  gen_blog  文件，通常用於運行一個生成或處理網站的腳本或命令。 \n \n chmod u+x gen_blog \n./gen_blog   #網誌推到靜態網站指令 \n \n localhost(可攜環境 \n 以下指令是使用 Pelican 的命令行指令，用於將 Markdown 文件轉換為靜態網站，並將結果輸出到名為  blog  的目錄中。讓我來解釋一下每個部分的含義： \n \n pelican : 這是 Pelican 靜態網站生成器的命令行工具。 \n markdown : 指定要處理的標記語言為 Markdown，這意味著要轉換的文件是 Markdown 格式的。 \n -o blog : 這個選項指定輸出目錄，即將生成的靜態網站文件輸出到名為  blog  的目錄中。 \n -s local_publishconf.py : 這個選項指定了一個配置文件，用於指導 Pelican 如何生成網站。在這個例子中，指定的是  local_publishconf.py  配置文件。這個文件通常包含了一些設置，比如指定主題、插件、輸出路徑等。 \n \n 總的來說，這個命令告訴 Pelican 使用 Markdown 格式的文件，根據  local_publishconf.py  配置文件的指示，將生成的靜態網站文件輸出到  blog  目錄中。 \n pelican markdown -o blog -s local_publishconf.py #網誌推到靜態網站指令 \n \n', 'tags': '', 'url': 'blog.html'}, {'title': 'cmsimde', 'text': "SMap  - SiteMap - 依照階次列出網站的所有頁面. \n EditA  - Edit All page - 將所有頁面放入編輯模式中, 主要用來處理頁面搬遷, 刪除或決定衝突頁面內容版本. \n Edit  - Edit page - 先選擇要編輯的單一頁面後, 再點選 Edit, 即可進入單一頁面的編輯模式. \n Config  - Configure Site - 編輯頁面標題與管理者密碼. \n Search  - 動態頁面內容的關鍵字搜尋. \n IUpload  - Image file Upload - 圖檔的上傳功能, 可以上傳 jpg, png 與 gif 檔案, 其中若在手機上傳圖檔, 系統會自動將圖片檔案縮小為 800x800 大小. \n IList  - Image file List - 列出可以直接在頁面編輯模式中引用的圖片檔案. \n FUpload  - File Upload - 一般檔案的上傳功能, 目前可以上傳的檔案副檔名包括 'jpg', 'png', 'gif', '7z', 'pdf', 'zip', 'ttt', 'stl', 'txt', 'html', 'mp4' 等, 使用者可以自行修改. \n FList  - File List - 列出可以直接在頁面編輯模式中引用的上傳檔案. \n Logout  - 登出頁面編輯模式. \n Convert  - 將動態網站中位於 config/content.htm 檔案, 透過分頁設定轉為 content 目錄中的靜態網頁. \n acp  - git add, git commit 與 git push, 通常只有在 localhost 或自架主機上利用網頁表單協助將倉儲改版內容推向 Github 倉儲. \n SStatic  - Start Static Site - 利用 Python 啟動網站伺服功能, 可以讓使用者檢查轉檔後的靜態網站內容. \n RStatic  - Replit Static Site URL - 僅用於 Replit 模式, 當使用者按下 SStatic 後, 可以按下 RStatic 進入當下尚未推向 Github Pages 的靜態網站. \n 80  - 由 init.py 中 static_port 所決定的連結字串, 一般不使用 80, 只有在 Replit 中為了與動態網站共用 port, 才特別設為 80. \n \n", 'tags': '', 'url': 'cmsimde.html'}, {'title': 'Replit', 'text': 'https://replit.com \n 利用 init_replit 指令安裝所需 Python 模組 chmod u+x init_replit ./init_replit \n On Replit: \n .replit: python3 main.py \n chmod u+x cms init_replit \n ./init_replit \n for cmsimde_site (not needed): git submodule update --init --recursive \n for cmsimde: pip install flask flask_cors bs4 lxml pelican markdown gevent \n password generator:\xa0 https://mde.tw/cmsite/content/Brython.html?src=https://gist.githubusercontent.com/mdecycu/b92b16621dd0246c352cf13d6463b333/raw/0bfa669750aba3abe48554509bbd43d65b6e5c82/hashlib_password_generator.py \xa0 \n \n for IPv6 only Ubuntu: .ssh 目錄中的 config, 將 SSH session 名稱設為 github.com: Host github.com User git Hostname github.com ProxyCommand /usr/bin/ncat --proxy p4.cycu.org:3128 --proxy-type http %h %p for Replit: .ssh 目錄中的 config, 將 SSH session 名稱設為 github.com: Host github.com User git Hostname github.co #since Replit works for IPv4, therefore no ProxyCommand setting needed #ProxyCommand /usr/bin/ncat --proxy p4.cycu.org:3128 --proxy-type http %h %p \n \n \n', 'tags': '', 'url': 'Replit.html'}, {'title': 'Brython', 'text': 'https://en.wikipedia.org/wiki/Python_(programming_language) \n Examples: \n https://gist.github.com/mdecycu/d9082d678096bd58378d6afe2c7fa05d \n https://www.geeksforgeeks.org/python-programming-examples/ \n https://www.programiz.com/python-programming/examples \n https://www.freecodecamp.org/news/python-code-examples-sample-script-coding-tutorial-for-beginners/ \n Python Tutorial: \n https://docs.python.org/3/tutorial/ \n An informal introduction to Python \n Indentation (Python 採 4 個 Spaces 縮排, 以界定執行範圍) \n Variables ( Python Keywords ) \n Comments (# 單行註解, 三個單引號或三個雙引號標註多行註解) \n Numbers  (整數 int(), 浮點數 float()) \n Strings  (字串) \n print (Python 內建函式,  print()  函式) \n Python control flow tools \n for \n if \n range \n open \n read \n lists \n tuples \n dictionaries \n functions \n try ... except \n break \n pass \n classes \n 這個頁面 demo 如何在同一頁面下納入多個線上 Ace 編輯器與執行按鈕 ( practice_html.txt  動態頁面超文件). \n practice_html.txt  動態頁面超文件應該可以在啟動 Brython 時, 設定將 .py 檔案放入 downloads/py 目錄中引用. \n 亦即將所有對應的 html 也使用 Brython 產生, 然後寫為  class  後, 在範例導入時透過  instance  引用. \n <!-- 啟動 Brython -->\n<script>\nwindow.onload=function(){\nbrython({debug:1, pythonpath:[\'./../cmsimde/static/\',\'./../downloads/py/\']});\n}\n</script> \n 從 1 累加到 100: \n 1 add to 100 \n 將 iterable 與 iterator  相關說明 , 利用 Brython 與 Ace Editor 整理在這個頁面. \n  導入 brython 程式庫  \n \n \n \n \n  啟動 Brython  \n \n \n \n  導入 FileSaver 與 filereader  \n \n \n \n \n  導入 ace  \n \n \n \n \n \n \n  導入 gearUtils-0.9.js Cango 齒輪繪圖程式庫  \n \n \n \n \n \n \n  請注意, 這裡使用 Javascript 將 localStorage["kw_py_src1"] 中存在近端瀏覽器的程式碼, 由使用者決定存檔名稱 \n \n \n \n \n \n \n  add 1 to 100 開始  \n \n \n  add 1 to 100 結束 \n  editor1 開始  \n  用來顯示程式碼的 editor 區域  \n \n  以下的表單與按鈕與前面的 Javascript doSave 函式以及 FileSaver.min.js 互相配合  \n  存擋表單開始  \n Filename:  .py   \n  存擋表單結束  \n \n  執行與清除按鈕開始  \n Run   Output   清除輸出區 清除繪圖區 Reload \n  執行與清除按鈕結束  \n \n  程式執行 ouput 區  \n \n  Brython 程式執行的結果, 都以 brython_div1 作為切入位置  \n \n  editor1 結束   ##########################################  \n 從 1 累加到 100 part2: \n 1 add to 100 cango_three_gears BSnake AI Tetris Rotating Block \n  請注意, 這裡使用 Javascript 將 localStorage["kw_py_src2"] 中存在近端瀏覽器的程式碼, 由使用者決定存檔名稱 \n \n \n \n  add 1 to 100 part2 開始  \n \n \n  add 1 to 100 part2 結束 \n  editor2 開始  \n  用來顯示程式碼的 editor 區域  \n \n  以下的表單與按鈕與前面的 Javascript doSave 函式以及 FileSaver.min.js 互相配合  \n  存擋表單開始  \n Filename:  .py   \n  存擋表單結束  \n \n  執行與清除按鈕開始  \n Run   Output   清除輸出區 清除繪圖區 Reload \n  執行與清除按鈕結束  \n \n  程式執行 ouput 區  \n \n  Brython 程式執行的結果, 都以 brython_div1 作為切入位置  \n \n  editor2 結束  \n \n \n', 'tags': '', 'url': 'Brython.html'}]};