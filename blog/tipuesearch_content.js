var tipuesearch = {"pages":[{"title":"About","text":"cmsimde 內容管理系統 倉儲: https://github.com/mdecycu/cmsimde_site 網站: https://mde.tw/cmsimde_site/ 簡報: https://mde.tw/cmsimde_site/reveal 網誌: https://mde.tw/cmsimde_site/blog","tags":"misc","url":"./pages/about/"},{"title":"W5","text":"第四週實作內容報告 w5 統整網誌+繪製NX零件","tags":"w5","url":"./2024-Spring-w5-blog-tutorial.html"},{"title":"W4","text":"第四週實作內容報告 w4 影片上字幕 將各週影片上字幕並置入分組網頁上。 統整各週內容合併成網誌，目前進度中的專案還有LaTeX轉pdf及各週還有一些影片沒完整上傳 ，對於使用LaTeX還是很有問題，想直接在倉儲裡新建一個新目錄存放圖片檔或後續的零件繪製的檔案，這樣downloaads目錄才不會那麼亂，就只是檔案路徑要改在我自己建立的目錄下。","tags":"w4","url":"./2024-Spring-w4-blog-tutorial.html"},{"title":"W3","text":"第三週實作內容報告 w3 如何協同製作分組報告，並將各組組員加入至分組倉儲建立子模組，LaTeX 轉 pdf教學. 期中協同分組報告(將組員的個人倉儲設為分組倉儲子模組) 我是使用可攜環境直接抓取組員倉儲並建立子目錄，前期在git clone時有在putty建立了一個key，有了權限就能克隆及push，如下html 1.創建putty中的key 2.開啟可攜系統cmd 3.開啟後輸入cd tmp 導入tmp目錄中 4.進去tmp後 輸入git clone --recurse-submodules 倉儲網址.git(克隆遠端數據庫) 5.確認tmp目錄下有自己倉儲目錄後 輸入cd 倉儲名稱 6.進入倉儲目錄後，cms即可開啟動態網站 克隆完分組倉儲後，在依照下面html方式抓取: 1.git clone https://github.com/mdecd2024/2a-midag8.git cd 2a-midag8 #克隆完分組倉儲後進入2a-midag x中 。 2.git submodule add 組員課程倉儲網址.git +組員學號(此為子目錄名稱) #有組員學號目的是為了後續抓取組員課程倉儲資料較為方便 3.git add . 4.git commit -m \"\" 5.git push 若要更新組員課程倉儲資料作法如下: 1.cd 2a-midag8 #進入分組倉儲2a-midag x中 。 2.cd 41023108 #輸入 cd 組員子目錄名稱 。 3.git pull origin main #進入組員子目錄中 從遠端拉取最新的子模組代碼。 4.cd .. #退出組員子目錄 5.git add . 6.git commit -m \"\" 7.git push #這是確保在更新子模組之後，將變更提交推送回主存儲庫。 使用 Gitpod 維護倉儲與網站 感覺Gitpod 使用方式和codespaces、replit很像，跟replit差別是，跑的快多了，Gitpod 加上前面幾個維護方式也已經有4個了，都大同小異 有關 LaTeX 轉 pdf","tags":"w3","url":"./2024-Spring-w3-blog-tutorial.html"},{"title":"W1","text":"第一週實作內容報告 w1 建立個人課程倉儲，下載當期可攜環境檔案後將個人倉儲 import 至 Replit，以及設定個人網誌. 2a 建個人課程倉儲 登入個人github帳號，使用老師給的 https://github.com/mdecycu/cmsimde_site 網址倉儲建立名稱為github名稱/cd2024倉儲。 將個人倉儲 import 至 Replit 登入replit，建議以github直接登入可以在後續認證時他會幫你做相關連接查驗。 設定 Github 帳號的雙重認證 進入個人倉儲settings中的ssh and gpg key 項目裡two-factor authentication選項啟動雙重認證，可以綁定手機或手錶，軟體名稱為authy app 有一點別重要，那就是當認證遺失只能以回復碼，才能找回帳號。 如何 import 倉儲至 Replit 進行改版 Replit中設定個人網誌的方法，使用markdown目錄原始檔做複製，可複製Pelican的程式碼，只需將其中的內容改成自己所要發表的內容即可，而Pelican轉換完的網誌內容則會出現在blog目錄下，如要將markdown中.md檔轉入blog中變成.html檔指令為pelican markdown -o blog -s local_publishconf.py，除了這個設定外還有其他別的的方式設定，這就得看使用者的帳號是甚麼在做其他設定。","tags":"w1","url":"./2024-Spring-w1-blog-tutorial.html"},{"title":"W2","text":"第二週實作內容報告 w2 建立Github Classroom 指定分組倉儲，並使用replit、Codespaces及可攜環境維護分組倉儲，在git clone至近端執行動態網站. 利用 Github Classroom 指定分組倉儲 1.由組長建立2a-midagx名稱的倉儲分組網站，並找定組員join至剛建立的網站，使用codespaces維護倉儲網站，可直接安裝模組啟動動態網站，做法上和replit很像，一樣使用python3 main.py進入分組動態網站，使用python3 -m http.sever開啟靜態網站，說明codespaces使用上的限制。 2.使用replit管理github分組倉儲 利用 Codespaces 維護倉儲與網站 利用code中的Codespaces維護，開啟後用終端機開啟動態靜態網站，也可以在裡面更新網誌，記得在開啟python3前需要先安裝模組，就跟replit一樣需先確認是否有安裝過模組。 在近端執行動態網站 可攜環境需先至mde.tw網站上下載 portable_2024.7z 這個壓縮檔案，解壓縮至個人隨身系統，步驟如下 1.創建putty中的key 2.開啟可攜系統cmd 3.開啟後輸入cd tmp 導入tmp目錄中 4.進去tmp後 輸入git clone --recurse-submodules 倉儲網址.git(克隆遠端數據庫) 5.確認tmp目錄下有自己倉儲目錄後 輸入cd 倉儲名稱 6.進入倉儲目錄後，cms即可開啟動態網站","tags":"w2","url":"./2024-Spring-w2-blog-tutorial.html"},{"title":"2024 Spring 課程","text":"各週上課內容心得及實作項目 內容管理系統 使用者可以自行利用 cmsimde_site 倉儲作為 Template, 建立自己的網站內容管理系統. 引用網站網址連結的方法: cmsimde_site - 在文章中多次引用同一個網站連結時, 可以使用此種方法. https://github.com/mdecycu/cmsimde_site - 假如想要快速將網址套用 html 網站連結, 可以使用此種方法. cmsimde_site - 也可以使用 Markdown 的標準網站連結使用格式. ## 引用 Python 程式的方法 for i in range(10): print(i, \"列出字串\") 也可以直接在 .md 檔案中使用 html 標註, 或加入 Javascript 或 Brython 程式碼. 從 1 累加到 100: 1 add to 100 將 iterable 與 iterator 相關說明 , 利用 Brython 與 Ace Editor 整理在這個頁面. Filename: .py Run Output 清除輸出區 清除繪圖區 Reload 從 1 累加到 100 part2: 1 add to 100 cango_three_gears BSnake AI Tetris Rotating Block Filename: .py Run Output 清除輸出區 清除繪圖區 Reload","tags":"w0","url":"./2024-Spring-w0-blog-tutorial.html"}]};