var tipuesearch = {"pages": [{'title': 'About', 'text': '網頁：\xa0  https://mdecd2024.github.io/2a-midag8/content/index.html \n 網誌： https://mdecd2024.github.io/2a-midag8/blog \n 簡報：\xa0  https://mdecd2024.github.io/2a-midag8/reveal/index.html \n 倉儲：\xa0  https://github.com/mdecd2024/2a-midag8 \n \n 本cmsimde網際內容管理系統的範本應答： \n https://github.com/mdecycu/cmsimde_site \n 此範本將cmsimde作為子目錄硬體子模組，使用者可依需求自行修改 \n 對應倉儲網站： https:  //mde.tw/cmsimde_site \n', 'tags': '', 'url': 'About.html'}, {'title': 'Practice', 'text': '練習1： 請各包製作一個以Web為基礎的網誌與簡報，了解如何利用隨身碟、\xa0  Replit \xa0與\xa0 Codespaces \xa0中維護個人與包的網站內容？ \n 答： 每個一個Blog 都有<code>，在完成建立組Blog後有code就可以修改版本。 是另一個設定 。開始運作後要執行python3 main。 -replit  。編輯器 。月給定數量相同，編輯可以在界面外，上傳時開啟就好，使用完後要記得關閉，每月用量平均好就可以一直免費使用。 \n 練習2： 請各包製作一個基於Web的網誌與簡報，說明如何在\xa0 CoppeliaSim \xa0環境中，利用IPv6\xa0  ZeroMQ Remote API  \xa0Python進行兩個自由度的鋼球平衡台自動控制系統模擬？ \n 答： \n ZeroMQ最終API 共分了7種不同的程式語言。 \n 1.Python客戶端 2.C++客戶端 3.Java客戶端 4.Matlab用戶端 5.Octave用戶端 6.Lua客戶端 7.Rust用戶端 \n 每種語言都需要套件 1.Python客戶端:$ python3 -m pip install coppeliasim-zmqremoteapi-client  2.C++客戶端:jsoncons和cppzmq套件 3.Java客戶端:Apache Maven 今天ex. $ 匯出 COPPELIASIM_ROOT_DIR=path/to/CoppeliaSim/exec/folder/or/resources/folder/on/macOS  $ cd zmqRemoteApi/clients/java  $ mvn package -D"GENERATE_INCLUDE_OBJECTSsim,IK." \n #注意需確保您的資料夾名稱不包含任何空格，並且 CoppeliaSim 正在運行（API 函數從 CoppeliaSim 獲取）前面只考慮了 sim 和 simIK 命名空間，您可以根據需要添加更多命名空間#  4.Matlab 用戶端：需要數十個JeroMQ，如果尚不存在，它會自動安裝 5.Octave用戶端：需要Octave 6.4+、octave通訊和Zeromq軟體包 6.Lua客戶端：目前，僅在CoppeliaSim腳本內支援Lua用戶端，或支援API用戶端方案碼 7.Rust用戶端：Samuel Cavalcanti 提供 \n 上面為ZeroMQ最終API應用程式與CoppeliaSim連接的多種方式及要連接所需的插件程式庫的各程式語言，後續能繼續分下去，上述指示統整。 \n 練習3： \n 建立 foot_basket_ball 模擬場景 \n 挽救cd2023的足球競技場景模擬檔：\xa0  cd2023_pj3_football_field_specation_ttt.7z  \xa0（需要密碼） \n 產品設計不是一件簡單的事，尤其是當設計的目的，是希望當前一套可以永續且認知的組成，而非單一的得到能滿足必需需求的內容。 \n 以 cd2024 的部分美好期末專案來說，可以在上列 cd2023 課程中的場景剛才延伸，其中將底座以下： \n \n 附加的零組件要採用何種套件製作, 當團隊選擇一項 MCAD(Mechanical Computer Aided Design, 電腦輔助設計) 套件後, 隨即便產生, 協同團隊成員是否都能使用所選擇的套件? 各成員所使用同一套件的不同版本進行零組件繪圖, 之後的協同流程會不會產生問題? \n 當零件在各協同成員的 MCAD 套件中進行繪圖, 是否使用相同的單位尺寸設定? 各零組件選擇不同的絕對與相對座標系統, 對於接下來在不同套件間的轉檔, 會不會產生問題, 或者讓協同設計流程更加繁瑣? \n 從 MCAD 將零組件轉出時, 各成員即便選擇了相同的輸出(Export)檔案格式, 不同的轉檔格式疏密度, 對於後續的零組件應用有沒有影響? \n 當零組件轉入機電模擬系統時, 將牽涉到輸入(Import)縮放比例, 以及各零件轉入後的絕對與相對座標選擇, 不同的選擇會不會對後續的動態模擬系統設定造成一定的影響?尤其過程中牽涉開放機構(Open-chain) 與封閉(Closed-chain)機構組件時, 選擇不同的零組件絕對與區域座標系統之後, 會不會對之後的機構連桿運動設定造成問題? \n 而最後, 當所需要的基本場景已經建立完成, 由於客戶或機電整合流程的配合需求, 必須改變特定零件的組立架構, 或是零組件的參數尺寸, 前面的所有步驟都需要重來一次嗎? \n 以下是在面對上列諸多議題時, 以 Solvespace 建立一塊籃球板, 然後正設法放置到規定位置的參考場景檔案:\xa0 cd2024_footbasket_ball_spec_add_slvs_board.7z \n \n \n 操作過程如下: \n \n 開啟 Solvespace, 確認作圖單位為 mm, 繪製一個 100mmx200mmx300mm 的方塊零件, 準備最為籃球板. \n 由於 CoppeliaSim 內定的場景地面座標為 X-Y, 因此若在 Solvespace 中建立零件, 必須要確定零件的局部座標系與絕對坐標系的關係. \n 由於開啟 cd2023 模擬場景後, 發現所有的零件都以其自身的局域坐標系原點, 放在零件的正中央, 因此若將零件轉入 CoppeliaSim 後, 希望精確掌握零件的定位, 則在繪製零件草圖時, 必須設定好輪廓與絕對座標系統之間的關係. \n 另外, 由於 CoppeliaSim 4.5.1 版會將所有的轉入零件採同一個座標原點, 而非如舊版本轉入後各自以其局部座標系統進行定位. \n 而且還必須了解 CoppeliaSim 內建的尺寸單位為 m, 目前 Solvespace 轉出的製圖單位則是 mm, 因此中間差別了 1000 倍, 所以將作圖單位設為 mm 的 Solvespace 零件, 轉入 CoppeliaSim 若要使用其原先的作圖尺寸, 則必須縮小 0.001 倍. \n 之後, 還必須利用 Edit -> Shape reference frame -> Relocate to mesh center 將各零件的參考座標系統原點, 從廣域座標系原點, 轉換到零件個別的物件中心原點. \n 若零件轉入 CoppeliaSim 時選擇 Z 軸向上, 則籃球板零件轉入後, 將平躺在場景中, 若要轉至與現有的足球門相同方位, 則必須分別對自己的 X 軸與 Y 軸個旋轉 90 度. \n 最後再任選一座球門的 X, Y 座標系統原點位置(position), 逐步將 basketball board 放到正確的位置, 結果如:\xa0 cd2024_footbasket_ball_spec_add_slvs_board.7z \n \n \n 協同零組件繪圖: Onshape \n 協同分組報告: LaTeX -> pdf \n', 'tags': '', 'url': 'Practice.html'}, {'title': 'W3 Task', 'text': 'cd2024 w3 任務頁面 \n cd2024 w3 任務 \n 1. 請各組將組員的個人課程倉儲 cd2024 設為分組倉儲 2a-midag1 的子模組, 且以各組員的學號作為子模組的名稱 \n 議題: \n 如何在倉儲中設定子模組, 為何要將資料設為子模組? \n 能不能在 Replit 維護分組網站? 其他方法還可以直接使用 Codespaces, Gitpod 與 localhost 維護倉儲與網站 \n 假如仍希望使用 Replit 維護分組網站, 該如何進行? \n 2. 請各組員將負責分工處理的  https://webthesis.biblio.polito.it/16429/1/tesi.pdf  中英文並列資料 (LaTeX) 放在個人的倉儲網站, 最後在分組倉儲中整合建立出各組的期中報告 pdf 檔案 \n 該文章有 87 頁, 若有八名組員, 則每人可分工負責 11 頁, 若兩組以上結合協同, 則可按照規劃, 從文章標題開始到最後一頁, 先分配各組員任務後展開中英文並列編輯, 可以使用翻譯軟體或 ChatGPT 協助進行內容解釋或翻譯, 各組通篇完成中英並列資料整合後, 各學員必須於個人的課程倉儲 cd2024 中整理出協同過程的心得. \n --------------------------------------------------------------------------------------------------------- \n 1.需先將分組倉儲clone到近端可攜環境中的tmp目錄下，權限的部分依照前面putty設立的key. \n method: \n 第一步:git clone --recurse-submodules\xa0git@mdecycu:mdecd2024/2a-midag8.git\xa0\xa0#需有權限才能抓取到 \n \n第二步:直接進入tmp目錄下分組倉儲，後輸入 git submodule add https://github.com/41023110/cd2024.git\xa041023110\xa0\xa0#分組組員個人cd2024倉儲，並以組員學號當作子目錄名稱，其中名稱並不影響組員抓取內容 \n \n第三步:git add .\xa0 \xa0 \xa0\xa0git commit -m "add"\xa0 \xa0 \xa0 git push #將近端內容推致遠端 \n 2.我們將以4人分配87頁翻譯資料，平均1人22頁，並將各分配到的段數翻譯完成後放在自己的倉儲下，最後統一 \n 在分組倉儲中整合建立出各組的期中報告 pdf 檔案。 \n 第一段 1-21page 由41023108\xa0 ( ACKNOWLEDGMENTS.txt, Creative Commons.txt, LIST OF ACRONYMS.txt, abstract.txt, introduction_orig.txt,\xa0 \n 第二段 21-43page 由41023155 ( introduction_orig.txt, \n 第三段 43-65page 由41023110 ( introduction_orig.txt, \n 第四段 65-87page 由41023211 ( introduction_orig.txt, \n', 'tags': '', 'url': 'W3 Task.html'}, {'title': 'w4 Task', 'text': 'W4 各組員任務 \n 作業1: \n 各組員必須能在各自的個人課程倉儲放置所被交付編寫的 \xa0.txt (in LaTeX 格式), 然後整合至各組的分組倉儲, 由 xelatex 編譯出各週的分組報告 pdf 檔案. \n w4 2a 分組任務 \n 作業2: \n 請各組自行搜尋前面已經發布的教學影片, 分別 \n \n 在影片上填上字幕, 另行上傳到可以嵌入到各分組的網站上 \n 從影片字幕中整理出逐字稿, 放在影片下方, 以 .txt 連結安排 \n 並在各嵌入的教學影片下方, 以摘要方式說明該影片的教學重點 \n \n ------------------------------------------------------------------------------------------- \n 以下為影片剪輯後製分工情形: \n w1 video 41023211 \n w2 video 41023155 \n w3 video 41023110 \n w4 video 41023108 \n 誰先做完就幫助其他組員完成各週影片剪輯 !! \n', 'tags': '', 'url': 'w4 Task.html'}, {'title': 'w4 2a hw2(w1', 'text': 'w1 \n 2a 建個人課程倉儲 \n \n https://github.com/mdecd2024/2a-midag8/commit/7d7235382be3ee26d9b335f2982fe4d9482630b5 \n 將個人倉儲 import 至 Replit(上) \n \n https://github.com/mdecd2024/2a-midag8/commit/c46882f9ce10c6761cbf52688ef24fa76b69b524 \n 將個人倉儲 import 至 Replit(下) \n \n https://github.com/mdecd2024/2a-midag8/commit/c46882f9ce10c6761cbf52688ef24fa76b69b524 \n 設定 Github 帳號的雙重認證 \n \n \n 如何 import 倉儲至 Replit 進行改版 \n \n 如何設定網誌 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/2a_1.txt \n Odoo PLM 功能 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/cd2024_2a_2_odoo_plm%E7%B0%A1%E4%BB%8B%20%E5%AD%97%E5%B9%95%E6%96%87%E5%AD%97%E6%AA%94.txt \n \n \n', 'tags': '', 'url': 'w4 2a hw2(w1.html'}, {'title': 'w4 2a hw2(w2', 'text': 'w2 \n 利用Github Classroom 指定分組錢包 \n 1.甲班第一組長如何組成midag1隊，\xa0 \n \n https://github.com/41023155/cd2024/blob/main/downloads/13.24.txt \n 用  Codespaces  開啟動態網頁 \n 執行以下命令使  init_replit  檔案具有執行權限： \n chmod u+x init_replit \n 執行  init_replit  檔案： \n ./init_replit \n 執行  main.py  檔案： \n python3 main.py \n 用  Codespaces  開啟靜態網頁 \n 執行以下命令啟動  Python  內建的簡易伺服器： \n python3 -m http.server \n 如何進行改版 \n 使用  git status  命令查看目前的修改狀態。 \n 使用  git add .  命令將所有修改的檔案添加到暫存區。 \n 使用  git commit -m " 新增的的內容 "  命令提交修改，並填入適合的提交訊息。 \n 使用  git push  將本地的提交推送到遠端倉儲。 \n \n 2. 利用Codespaces 維護錢包與網站 \n \n https://github.com/41023155/cd2024/blob/main/downloads/11.58.txt \n \n 在近端執行動態網站 \n \n https://github.com/41023155/cd2024/blob/main/downloads/14.18.txt \n \n  SSH  金鑰： 使用  Puttygen  建立一把  SSH  金鑰並將其存儲為  .ppk  格式的檔案。 \n \n 2.SSH  金鑰導入  Putty ： 使用  Putty  將  SSH  金鑰導入，以便在遠端伺服器上進行身份驗證。 \n \n  PuTTY  會話設定： 在  Regedit  中找到  HKEY_CURRENT_USER\\Software\\SimonTatham\\PuTTY\\Sessions\\github.com  鍵，將其匯出為  .reg  檔案，這將保存你的  PuTTY  會話設定。 \n \n 4. 本地端進行改版： \n 切換到暫存目錄： \n cd tmp \n 克隆倉庫： \n git clone --recurse-submodules git@github.com:mdecd2024/2a-midag1.git \n 進入克隆的倉庫目錄： \n cd 2a-midag1 \n 進行修改和提交： \n #  進行修改 ... \n git add . \n git commit -m " 自己要推的東西 " \n 推送到遠端倉庫： \n git push \n 5. 其他使用者推送： \n 獲取你的  IPv4  地址： \n ipconfig \n 在組別下的  Python  腳本中導入你的  IPv4  環境。 \n 允許組別中的其他成員更新和推送修改。 \n \n 利用 Replit 管理從 Classroom 取得的錢包錢包 \n \n https://github.com/41023155/cd2024/blob/main/downloads/25.txt \n', 'tags': '', 'url': 'w4 2a hw2(w2.html'}, {'title': 'w4 2a hw2(w3', 'text': 'w3 \n 期中友善分組報告 \n 1. 如何將 41123130 的個人倉儲設為 2a-midag2 分組倉儲的子模組。 \n \n https://github.com/41023110/cd2024/commit/78a29b510fe45364d0037da13b85f6f9d66727d9 \n \n 如何將 41123130 的個人倉儲設為 2a-midag2 分組倉儲的子模組摘要： \xa0 在確保獲得相應權限後，便可進行克隆操作。通常，C槽更為迅速，故需切換至此並建立一個tmp文件夾。接著，使用git clone指令，以--子模組recurse+ssh+對應帳號的方式進行克隆。成功克隆後，可將倉庫設置為子模組。為了將倉庫設置為子模組，首先進入倉庫對應目錄，將所有數據拉取下來，然後執行git add命令。在分組倉庫底下，使用git子模組add命令，指定組倉庫名稱，並以https方式拉取子模組，因分組倉庫權限不足。可以拉取組員的倉庫。在個人更新時，可以分段拉取，未處理完的章節可不引入。在git push後，除了建立目錄外，也會更新.gitmodules檔案。在第二個人尚未建立子模組之前，可先進行克隆操作，將個人倉庫添加為子模組。之後，需處理.gitmodules檔案的衝突問題。 \xa0 \xa0  \n 2.如何將組員的個人倉儲納入分組倉儲成為子模組 \n \n \n https://github.com/41023110/cd2024/blob/509d3eccf7615221d7e813378c4319315a7c2a4d/downloads/20240320095241733.txt \n 將組員的個人倉儲設為分組倉儲子模組摘要： \n \xa0 \xa0  \xa0 利用組別倉儲下的codespaces，在確認主分支與當前分支同步後，使用git submodule add命令向倉儲中新增一個子模組。此命令需要指定子模組所在的倉儲網址以及學號，並在指定的目錄中複製子模組的資料。成功克隆後，將新增的子模組添加、提交、推送至倉儲，並確認子模組資料已加入倉儲中。子模組具有版本控制，可隨時進行開發並同步至主倉儲，版本控制由開發者自行決定。 \n 3.如何在 Replit 維護分組倉儲 \n \n https://github.com/41023110/cd2024/blob/fffb684bd377a6ecedadfac25333c936b26c8ba4/downloads/w3-3%E6%96%87%E6%AA%94.txt \n 如何在 Replit 維護分組倉儲日誌: \n \xa0 \xa0 \xa0處理與Git和SSH相關的操作。獲取和安裝特定的子模塊，並準備環境以啟用編輯功能的步驟。在配置文件中權限很重要。接著創建和管理SSH密鑰以及將公鑰添加到特定的帳戶中。再來如何在Git中進行提交，並解決了由於權限問題和衝突。在操作過程中保持耐心和細心與定期備份數據的重要性。最後如何使用命令來移動和重命名文件，並通過上傳和移動文件來維護Git存儲庫。 \n 使用 Gitpod 維護與網站 \n 1. 使用Gitpod維護個人網站 \n \n https://github.com/41023110/cd2024/blob/8e809c4510f3d47b944bc751840fd3de25c1254f/downloads/%E4%B8%8A.html \n 使用 Gitpod 維護個人網站摘要： \n \xa0 \xa0 \xa0 使用Gitpod連結GitHub帳號，透過倉儲網址進入Gitpod後，若無對應的模組，需先執行chmod u+x init_replit進行模組安裝。儘管提供的資源與codespaces不同，但執行速度依然快速。在Gitpod中開啟python3，並具有多個終端機，程式將自動開啟瀏覽器進入編輯模式。即使未下載子模組，Gitpod仍會列出目錄，相較於codespaces功能稍好，且網址為亂碼式以保障安全性。 \n 若需查看靜態內容，可新增一個終端機，執行python3並啟動http server，直接在8000埠號瀏覽器中開啟即可查看靜態內容。要關閉執行，可在Gitpod.io儀錶板中進行操作，點擊"stop"即可停止計算時間。 \n \n 2. 使用Gitpod維護分組網站 \n \n https://github.com/41023110/cd2024/blob/01b66a7ec89e5d2b1f89767e28ada795fc830b4b/downloads/w3-5.txt \n 使用Gitpod維護分組網站: \n \xa0 \xa0 \xa0 進入Gitpod連結登陸github帳號。利用倉儲網址打開，裡面沒有對應的模組，所以要先chmod u+x init_replit安裝模組。其中給予的資源並不輸codespaces，執行速度依樣快速。照樣打開python3，並且也有多的終端機，程式一樣會自動開啟瀏覽器，就可以直接進入編輯。若假如沒有下載子模組，Gitpod一樣會幫忙列出目錄，比codespaces稍好些。並且網址也是亂碼式保全功能。 \n \xa0 \xa0 \xa0要看靜態，新增一個終端機，然後用python3執行模組。啟動http server，直接啟動8000埠號瀏覽器幫你開啟，open就可看到靜態。 \n \xa0 \xa0 \xa0要關閉執行，一樣在Gitpod.io儀錶板，可看到登陸與改變內容，需要關閉點stop就會停止計算時間。 \n #有關 LaTeX 轉 pdf \n \n https://github.com/41023110/cd2024/blob/509d3eccf7615221d7e813378c4319315a7c2a4d/downloads/latex.txt.txt \n 有關 LaTeX 轉 pdf日誌: \n \xa0 \xa0 \xa0 報告的主要內容通常放在團隊的Git倉庫中的downloads資料夾下。每個組員被分配了特定的任務，例如撰寫摘要、引言等。任務分配完成後，組員需要將自己的工作上傳到團隊的Git倉庫中，以便其他成員可以查看和整合。 \n #設定網志 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/2a_1.txt \n 設定網志日誌: \n \xa0 \xa0 \xa0了解網誌的原始文稿通常存放在Markdown目錄下，轉換為HTML檔案後存放在Blog目錄下。使用Pelican套件進行轉換，並根據不同需求設定不同的配置檔案，如local_publishconf.py和publishconf.py。這些配置檔案包含了網址、作者、網誌標題等信息，並根據需求設置絕對或相對路徑。另外，網誌內容需要按照一定的格式編寫，包括日期、標題、摘要、內容等。完成編寫後，使用gen_blog工具進行轉換，確認無誤後提交到GitHub上。 \n', 'tags': '', 'url': 'w4 2a hw2(w3.html'}, {'title': 'w4 2a hw2(w4', 'text': 'w4 \n Replit 靜態網站檢視 \n 1.如何在 Replit 檢視靜態網站 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/20240316214357460.txt \n 如何在 Replit 檢視靜態網站\xa0 摘要： \n 根據w2建立replit個人帳戶並與以太坊做身份認證後，開始以replit維護以太坊 ，因為動態網站中的轉靜態按紐無法再執行檢視功能，否則靜態動態無法在一個網址做開啟，需分開，靜態網站檢視以python3 main2.py開啟，動態以python3 main.py開啟。 \n -------------------------------------------------- -------------------------------------------------- ------ \n 2.如何下載replit_main2.7z並在錢包中建立兩個文件 \n \n https://github.com/KEHUUEISIN/cd2024/blob/main/downloads/20240319092559049.txt \n 如何下載replit_main2.7z並在錢包中建立兩個文件 \n 以上上部影片內容將兩個7z下載 ，並在以太坊中創建兩個文件，並且要啟動跟關掉，注意 ！ \n', 'tags': '', 'url': 'w4 2a hw2(w4.html'}, {'title': 'w4 2b hw2(w1', 'text': 'cd2024_2b_3_如何設定Github帳號的雙重認證 \n \n \n \n \n 上傳cd2024_2b_2_如何從Replit帳戶設定連結連結到Github txt檔 \n \n https://github.com/mdecd2024/2a-midag8/commit/4f7c5a3b1c822fb91dddbf57a0bb5a6f712f0fb6 \n 將個人錢包 import 至 Replit(上) \n \n 將個人錢包 import 至 Replit(上) \n https://github.com/mdecd2024/2a-midag8/commit/c46882f9ce10c6761cbf52688ef24fa76b69b524 \n', 'tags': '', 'url': 'w4 2b hw2(w1.html'}, {'title': 'w4 2b hw2(w2', 'text': '', 'tags': '', 'url': 'w4 2b hw2(w2.html'}, {'title': 'w4 2b hw2(w3', 'text': 'w3 \n 期中協同分組報告教學範例: \n 1.如何將組員的個人倉儲納入分組倉儲成為子模組 \n \n \n https://github.com/41023110/cd2024/blob/509d3eccf7615221d7e813378c4319315a7c2a4d/downloads/20240320095241733.txt \n 如何將組員的個人倉儲納入分組倉儲成為子模組摘要： \n \xa0 \xa0 \xa0  利用組別倉儲下的codespaces，在確認主分支與當前分支同步後，使用git submodule add命令向倉儲中新增一個子模組。子模組具有版本控制，可隨時進行開發並同步至主倉儲，版本控制由開發者自行決定。 \n 2.如何在 Replit 維護分組倉儲 \n \n 如何在 Replit 維護分組倉儲摘要: \n \xa0 \n 使用 Gitpod 維護倉儲與網站 \n 1.使用Gitpod維護個人網站 \n \n https://github.com/41023110/cd2024/blob/8e809c4510f3d47b944bc751840fd3de25c1254f/downloads/%E4%B8%8A.html \n 使用 Gitpod 維護個人網站摘要： \n \xa0 \xa0 \xa0 使用Gitpod連結GitHub帳號，透過網關網址進入Gitpod後，若無對應的模組，需先執行chmod u+x init_replit進行模組安裝。中開啟python3，並附有終端機，程式將自動開啟多個瀏覽器進入編輯模式。性。 \n \xa0 \xa0 \xa0若需查看靜態內容，可新增一個終端機，執行python3並啟動http伺服器，直接在8000連接埠瀏覽器中開啟即可查看靜態內容。停止”即可停止計算時間。 \n 4. 使用Gitpod維護分組網站 \n \xa0 \n https://github.com/41023110/cd2024/blob/01b66a7ec89e5d2b1f89767e28ada795fc830b4b/downloads/w3-5.txt \n \xa0 \n \xa0 \xa0 \n \n \n 有關 LaTeX 轉 pdf \n 1.如何利用 LaTeX 編寫分組期中報告 \n \n https://github.com/41023110/cd2024/blob/main/downloads/w3-b-5.txt \xa0 \n 設定網志 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/2a_1.txt \n', 'tags': '', 'url': 'w4 2b hw2(w3.html'}, {'title': 'w4 2b hw2(w4', 'text': 'Odoo 參考文章中英並列 \n 1.以第六組為例, 利用 Codespaces 維護倉儲內容 \n \n https://github.com/KEHUEISIN/cd2024/blob/main/downloads/20240426003837164.txt \n 摘要: \n 2.如何利用 Github Actions 編譯 LaTeX 得到分組 pdf 報告 \n \n https://github.com/KEHUEISIN/cd2024/blob/main/downloads/20240427223554128.txt \n 摘要: \n 3.如何利用 Gitpod 加上 token 取得分組倉儲權限 \n \n https://github.com/KEHUEISIN/cd2024/blob/main/downloads/20240426095652300.txt \n 摘要: \n Replit 靜態網站檢視 \n 沿用2a w4 \n Replit 靜態網站檢視 \n 1.如何在 Replit 檢視靜態網站 \n \n https://github.com/mdecd2024/2a-midag8/blob/main/downloads/20240316214357460.txt \n 如何在 Replit 檢視靜態網站\xa0 摘要： \n 根據w2建立replit個人帳戶並與以太坊做身份認證後，開始以replit維護以太坊 ，因為動態網站中的轉靜態按紐無法再執行檢視功能，否則靜態動態無法在一個網址做開啟，需分開，靜態網站檢視以python3 main2.py開啟，動態以python3 main.py開啟。 \n -------------------------------------------------- -------------------------------------------------- ------ \n 2.如何下載replit_main2.7z並在錢包中建立兩個文件 \n \n https://github.com/KEHUUEISIN/cd2024/blob/main/downloads/20240319092559049.txt \n 如何下載replit_main2.7z並在錢包中建立兩個文件 \n 以上上部影片內容將兩個7z下載 ，並在以太坊中創建兩個文件，並且要啟動跟關掉，注意 ！ \n', 'tags': '', 'url': 'w4 2b hw2(w4.html'}, {'title': 'w5 Task', 'text': '統整各週網誌 \n 這部分內容與blog上一致: 將組員個人網誌納入分組倉儲目錄下，並持續更新各影片剪輯後製，在嶔入影片過程中多次校正文檔，我們使用的軟體是https://www.capcut.com/my-edit這個軟體，目前字幕只支援簡體中文所以我們必須在翻完後再重新拉回進度條去逐字更改翻錯的內容及將簡體字改成繁體字，20分鐘以上的影片通常都會要剪上1hr以上時間。 \n', 'tags': '', 'url': 'w5 Task.html'}, {'title': 'w6 Task', 'text': '將w4-w5影片剪輯內容上繳至回報區，並指派w6 NX相關零件檔繪製內容 以及 CoppeliaSim 場景模擬相關檔案格式作業給與各組員 \n', 'tags': '', 'url': 'w6 Task.html'}, {'title': 'w10 Task', 'text': '任務一: 建立各班學員的倉儲、網站與分組連結 \n 老師寫的: \n from browser import window, ajax, document, html\n\ndef fetch_csv_data():\n  # CSV 檔案網址\n  url = "https://mdecd2024.github.io/2astud-2asite/downloads/2a.txt"\n  \n  def on_complete(req):\n    if req.status == 200 or req.status == 0:\n      # 讀取 CSV 檔案內容\n      content = req.text\n  \n      # 依照換行符號拆分資料\n      lines = content.split(\'\\n\')\n  \n      # 建立空列表儲存資料\n      data = []\n  \n      # 遍歷每一行資料\n      for line in lines:\n        # 忽略空白行\n        if line.strip() == "":\n          continue\n  \n        # 依照逗號拆分資料\n        items = line.split(\',\')\n  \n        # 將拆分後的資料加入列表\n        data.append(items)\n      \n      # 必須去除 data 的第一列標題資料, 只取序號為 1 之後的資料\n      data = data[1:]\n  \n      # 取得 html 可以插入的標註位置\n      brython_div = document["brython_div1"]\n      course_title = "cd2024"\n\n      # 逐一處理學員資料\n      index = 0\n      for items in data:\n        index += 1\n        student_id, github_username, group = items\n        \n        if github_username == "":\n          github_username = "000"\n        \n        # 建立網站和倉儲連結，使用正確的模板\n        site_url = f"https://{github_username}.github.io/{course_title}"\n        repo_url = f"https://github.com/{github_username}/{course_title}"\n        group_site_url = f"https://mdecd2024.github.io/2a-midag{group}"\n        group_repo_url = f"https://github.com/mdecd2024/2a-midag{group}"\n\n        # 添加學號, 網站, 倉儲連結和序號到 brython_div\n        brython_div <= str(index) + ". " + html.A(student_id, href=site_url)\n        brython_div <= " ("\n        brython_div <= html.A("repo", href=repo_url)\n        brython_div <= ") | " \n        brython_div <= html.A("Group Site", href=group_site_url)\n        brython_div <= " | "\n        brython_div <= html.A("Group Repo", href=group_repo_url)\n        brython_div <= html.BR()\n\n    else:\n      print("Error:", req.text)\n  \n  # 發送 AJAX 請求\n  req = ajax.ajax()\n  req.bind(\'complete\', on_complete)\n  req.open(\'GET\', url, True)\n  req.set_header(\'content-type\', \'application/x-www-form-urlencoded\')\n  req.send()\n  \n# 呼叫函式讀取 CSV 資料\nfetch_csv_data() \n chatgpt相似不同寫法程式碼: \n from browser import ajax, document, html\n\ndef fetch_csv_data():\n    # CSV 文件的 URL\n    url = "https://mdecd2024.github.io/2astud-2asite/downloads/2a.txt"\n\n    def on_complete(req):\n        if req.status == 200 or req.status == 0:\n            # 读取 CSV 文件内容\n            content = req.text\n\n            # 解析 CSV 数据并去除标题行\n            data = [line.strip().split(\',\') for line in content.split(\'\\n\')[1:] if line.strip()]\n\n            # 获取 HTML 中的标记位置\n            brython_div = document["brython_div1"]\n            course_title = "cd2024"\n\n            # 生成学生信息链接并添加到 brython_div 中\n            for index, (student_id, github_username, group) in enumerate(data, start=1):\n                github_username = github_username if github_username else "000"\n                site_url = f"https://{github_username}.github.io/{course_title}"\n                repo_url = f"https://github.com/{github_username}/{course_title}"\n                group_site_url = f"https://mdecd2024.github.io/2a-midag{group}"\n                group_repo_url = f"https://github.com/mdecd2024/2a-midag{group}"\n\n                brython_div <= f"{index}. " + html.A(student_id, href=site_url)\n                brython_div <= " ("\n                brython_div <= html.A("repo", href=repo_url)\n                brython_div <= ") | "\n                brython_div <= html.A("Group Site", href=group_site_url)\n                brython_div <= " | "\n                brython_div <= html.A("Group Repo", href=group_repo_url)\n                brython_div <= html.BR()\n\n        else:\n            print("Error:", req.text)\n\n    # 发送 AJAX 请求\n    req = ajax.ajax()\n    req.bind(\'complete\', on_complete)\n    req.open(\'GET\', url, True)\n    req.set_header(\'content-type\', \'application/x-www-form-urlencoded\')\n    req.send()\n\n# 调用函数读取 CSV 数据\nfetch_csv_data()\n \n \n 兩者差別: \n 這段代碼與之前的代碼相比，主要的改進在於我要求其精簡化，相比之前73行，這段精簡程式碼只有47行 及可做跟73行相同方式列出學員數據，寫法講解如下。 \n \n 使用列表推導式來解析 CSV 數據，並在生成學生信息時省略了對空白行的額外判斷。 \n  直接在 enumerate() 函數中指定 start=1，不再單獨定義 index 變量。  \n 使用條件表達式統一處理 GitHub 用戶名的空值情況。 \n', 'tags': '', 'url': 'w10 Task.html'}, {'title': 'w10 task2', 'text': '任務二: 鋼球平衡台 PID 控制與模擬 \n', 'tags': '', 'url': 'w10 task2.html'}, {'title': 'w10 task3', 'text': '任務三: 鋼球平衡台零組件繪圖', 'tags': '', 'url': 'w10 task3.html'}, {'title': 'blog', 'text': 'Replit/Codespaces \n \n \n chmod u+x gen_blog : \n \n chmod  是用於改變文件或目錄的權限設置的命令。 \n u+x  表示為擁有該文件的用戶（User）增加可執行（Execute）的權限。 \n gen_blog  是要設置權限的文件或可執行程序的名稱。 \n \n 總之，這個命令將  gen_blog  這個文件的用戶（擁有者）設置為可執行的。 \n \n \n ./gen_blog : \n \n ./  表示當前目錄（Working Directory），也就是這個命令所在的目錄。 \n gen_blog  是要執行的可執行文件或腳本。 \n \n 當你運行這個命令時，系統將查找當前目錄中的  gen_blog  文件，並執行它。這通常用於運行可執行文件或腳本。 \n \n \n 綜合起來，這兩個命令的組合是： \n \n 將  gen_blog  文件設置為可執行。 \n 執行  gen_blog  文件，通常用於運行一個生成或處理網站的腳本或命令。 \n \n chmod u+x gen_blog  \n./gen_blog   #網誌推到靜態網站指令 \n localhost(可攜環境 \n 以下指令是使用 Pelican 的命令行指令，用於將 Markdown 文件轉換為靜態網站，並將結果輸出到名為 \xa0 blog \xa0 的目錄中。讓我來解釋一下每個部分的含義： \n \n pelican : 這是 Pelican 靜態網站生成器的命令行工具。 \n markdown : 指定要處理的標記語言為 Markdown，這意味著要轉換的文件是 Markdown 格式的。 \n -o blog : 這個選項指定輸出目錄，即將生成的靜態網站文件輸出到名為 \xa0 blog \xa0 的目錄中。 \n -s local_publishconf.py : 這個選項指定了一個配置文件，用於指導 Pelican 如何生成網站。在這個例子中，指定的是 \xa0 local_publishconf.py \xa0 配置文件。這個文件通常包含了一些設置，比如指定主題、插件、輸出路徑等。 \n \n 總的來說，這個命令告訴 Pelican 使用 Markdown 格式的文件，根據 \xa0 local_publishconf.py \xa0 配置文件的指示，將生成的靜態網站文件輸出到 \xa0 blog \xa0 目錄中。 \n pelican markdown -o blog -s local_publishconf.py #網誌推到靜態網站指令 \n', 'tags': '', 'url': 'blog.html'}, {'title': 'Blog 2', 'text': '分組網誌統整指令為下面html檔 \n pelican combined_markdown -o blog -s local_publishconf.py \n 我先在近端資料夾中建立一個gen_cblog.bat的批次檔，每次抓取各組員網誌內容時，直接在小黑窗輸入 gen_cblog.bat指令則會自動跑上面html檔程式碼。無須特別記程式碼 \n', 'tags': '', 'url': 'Blog 2.html'}, {'title': 'Exercise', 'text': '此頁面用來放置練習題標題網頁內容 \n 練習1 對映網頁1 \n 練習2 對映網頁2 \n 練習3 對映網頁3 \n', 'tags': '', 'url': 'Exercise.html'}, {'title': '1', 'text': '練習1 :請各分組製作一個 Web-based 網誌與簡報, 該如何利用隨身碟、\xa0 Replit \xa0與\xa0 Codespaces \xa0中維護個人與分組的網站內容? \n 答: 每一個倉儲都有<code>，在完成建立組倉儲後有code就可以改版。 任何一個倉儲中都有配置code，codespaces是一個線上整合環境與replit相似，只是介面是另一個配置。在倉儲下可以建一個在主分之來建codespaces。 先啟動動態在功能表還原終端系統，並新增一個終端系統，有兩意思給指令分別啟動動態與靜態。在開始run後要執行python3 main.py，遇到執行時沒有flask模組。就要去chmod u+x init-replit讓程式可以執行，讓他幫其安裝對應模組。最後在./init-replit。網站就會給一個阜可以開啟動態。 要在python3 mhttp.senver 啟動一個模組，因系統帶有一個動態一個靜態，靜態還有一個index，更且有一個index可以啟動，帶進編輯器。index阻礙小輸送快速，約0秒就跳進content跟index，只要用這指令啟用靜態就可以看到更改了，改版會力馬有反應。每一次阜號都是不一樣安全性高。 code每月給定數量相同，編輯可以在介面外，在上傳時開啟就好，使用完後要記得關閉，每月用量平均好就可以一直免費使用。 \n', 'tags': '', 'url': '1.html'}, {'title': '2', 'text': '練習2: 請各分組製作一個 Web-based 網誌與簡報, 說明如何在\xa0 CoppeliaSim \xa0環境中, 利用 IPv6\xa0 ZeroMQ Remote API \xa0Python 進行兩個自由度的鋼球平衡檯自動控制系統模擬? \n 答: \n ZeroMQ遠端API 共分了7種不同的程式語言。 \n 1.Python客戶端 2.C++客戶端 3.Java客戶端 4.Matlab用戶端 5.Octave用戶端 6.Lua客戶端 7.Rust用戶端 \n 每個語言都需要套件 1.Python客戶端:$ python3 -m pip install coppeliasim-zmqremoteapi-client 2.C++客戶端:jsoncons和cppzmq套件 3.Java客戶端:Apache Maven 建構ex. $ export COPPELIASIM_ROOT_DIR=path/to/CoppeliaSim/exec/folder/or/resources/folder/on/macOS $ cd zmqRemoteApi/clients/java $ mvn package -D"GENERATE_INCLUDE_OBJECTS=sim,simIK" \n #注意需確保您的資料夾名稱不包含任何空格，並且 CoppeliaSim 正在運行（API 函數從 CoppeliaSim 取得)前面只考慮了 sim 和 simIK 命名空間，您可以根據需要添加更多命名空間# 4.Matlab用戶端:需要捆綁的JeroMQ，如果尚不存在，它會自動安裝 5.Octave用戶端:需要 Octave 6.4+、octave 通訊和 Zeromq 軟體包 6.Lua客戶端:目前，僅在 CoppeliaSim 腳本內支援 Lua 用戶端，也就是支援API用戶端程式碼 7.Rust用戶端: Samuel Cavalcanti 提供 \n 上面為各程式語言對於ZeroMQ遠端API應用程式與 CoppeliaSim 連接的多種方式及要連接所需要的插件程式庫，後續能續分下去，上述指示統整。 \n', 'tags': '', 'url': '2.html'}, {'title': '3', 'text': '建立 foot_basket_ball 模擬場景 \n \n', 'tags': '', 'url': '3.html'}, {'title': 'cmsimde', 'text': "SMap  - SiteMap - 依照階次列出網站的所有頁面. \n EditA  - Edit All page - 將所有頁面放入編輯模式中, 主要用來處理頁面搬遷, 刪除或決定衝突頁面內容版本. \n Edit  - Edit page - 先選擇要編輯的單一頁面後, 再點選 Edit, 即可進入單一頁面的編輯模式. \n Config  - Configure Site - 編輯頁面標題與管理者密碼. \n Search  - 動態頁面內容的關鍵字搜尋. \n IUpload  - Image file Upload - 圖檔的上傳功能, 可以上傳 jpg, png 與 gif 檔案, 其中若在手機上傳圖檔, 系統會自動將圖片檔案縮小為 800x800 大小. \n IList  - Image file List - 列出可以直接在頁面編輯模式中引用的圖片檔案. \n FUpload  - File Upload - 一般檔案的上傳功能, 目前可以上傳的檔案副檔名包括 'jpg', 'png', 'gif', '7z', 'pdf', 'zip', 'ttt', 'stl', 'txt', 'html', 'mp4' 等, 使用者可以自行修改. \n FList  - File List - 列出可以直接在頁面編輯模式中引用的上傳檔案. \n Logout  - 登出頁面編輯模式. \n Convert  - 將動態網站中位於 config/content.htm 檔案, 透過分頁設定轉為 content 目錄中的靜態網頁. \n acp  - git add, git commit 與 git push, 通常只有在 localhost 或自架主機上利用網頁表單協助將倉儲改版內容推向 Github 倉儲. \n SStatic  - Start Static Site - 利用 Python 啟動網站伺服功能, 可以讓使用者檢查轉檔後的靜態網站內容. \n RStatic  - Replit Static Site URL - 僅用於 Replit 模式, 當使用者按下 SStatic 後, 可以按下 RStatic 進入當下尚未推向 Github Pages 的靜態網站. \n 80  - 由 init.py 中 static_port 所決定的連結字串, 一般不使用 80, 只有在 Replit 中為了與動態網站共用 port, 才特別設為 80. \n \n", 'tags': '', 'url': 'cmsimde.html'}, {'title': 'Replit', 'text': 'https://replit.com \n 利用 init_replit 指令安裝所需 Python 模組 chmod u+x init_replit ./init_replit \n On Replit: \n .replit: python3 main.py \n chmod u+x cms init_replit \n ./init_replit \n for cmsimde_site (not needed): git submodule update --init --recursive \n for cmsimde: pip install flask flask_cors bs4 lxml pelican markdown gevent \n password generator:\xa0 https://mde.tw/cmsite/content/Brython.html?src=https://gist.githubusercontent.com/mdecycu/b92b16621dd0246c352cf13d6463b333/raw/0bfa669750aba3abe48554509bbd43d65b6e5c82/hashlib_password_generator.py \xa0 \n \n for IPv6 only Ubuntu: .ssh 目錄中的 config, 將 SSH session 名稱設為 github.com: Host github.com User git Hostname github.com ProxyCommand /usr/bin/ncat --proxy p4.cycu.org:3128 --proxy-type http %h %p for Replit: .ssh 目錄中的 config, 將 SSH session 名稱設為 github.com: Host github.com User git Hostname github.co #since Replit works for IPv4, therefore no ProxyCommand setting needed #ProxyCommand /usr/bin/ncat --proxy p4.cycu.org:3128 --proxy-type http %h %p \n \n \n', 'tags': '', 'url': 'Replit.html'}, {'title': 'Brython', 'text': 'https://en.wikipedia.org/wiki/Python_（程式語言） \n 例子： \n https://gist.github.com/mdecycu/d9082d678096bd58378d6afe2c7fa05d \n https://www.geeksforgeeks.org/python-programming-examples/ \n https://www.programiz.com/python-programming/examples \n https://www.freecodecamp.org/news/python-code-examples-sample-script-coding-tutorial-for-beginners/ \n Python教學： \n https://docs.python.org/3/tutorial/ \n Python 的非正式介紹 \n 縮排（Python 採用 4 個 Spaces 縮排，以介面執行範圍） \n 變數（ Python 關鍵字 ） \n 註（#單行註解、三單標註或三雙標註標註多行註解） \n 數 (整數 int(), 浮點數 float()) \n 字串 （字符串） \n print (Python 內建函數,  print() 函式) \n Python是控制流程工具 \n 為了 \n 如果 \n 範圍 \n 打開 \n 讀 \n 清單 \n 元組 \n 字典 \n 功能 \n 嘗試...除了 \n 休息 \n 經過 \n 類別 \n 此頁面示範如何在同一頁面下納入多個線上Ace編輯器與執行按鈕（ practice_html.txt 動態頁面超檔案）。 \n Practice_html.txt 動態頁面超檔案應該可以在啟動 Brython 時，設定會將 .py 檔案放入 downloads/py 目錄中引用。 \n 也即將所有對應的 html 也使用 Brython 產生，然後編寫為 類別 後，在範例匯入時透過 實例 引用。 \n <!-- 啟動 Brython --> \n<腳本> \n視窗.onload=函數(){ \nbrython({debug:1, pythonpath:[\'./../cmsimde/static/\',\'./../downloads/py/\']}); \n} \n</腳本> \n 從1累加到100： \n 1 加到 100 \n 將 iterable 與 iterator 相關說明 ，利用 Brython 與 Ace Editor 整理在此頁面。 \n  導入 brython 程式庫  \n \n \n \n \n  啟動 Brython  \n \n \n \n  導入 FileSaver 與 filereader  \n \n \n \n \n  導入 ace  \n \n \n \n \n \n \n  導入 gearUtils-0.9.js Cango 齒輪繪圖程式庫  \n \n \n \n \n \n \n  請注意, 這裡使用 Javascript 將 localStorage["kw_py_src1"] 中存在近端瀏覽器的程式碼, 由使用者決定存檔名稱 \n \n \n \n \n \n \n  add 1 to 100 開始  \n \n \n  add 1 to 100 結束 \n  editor1 開始  \n  用來顯示程式碼的 editor 區域  \n \n  以下的表單與按鈕與前面的 Javascript doSave 函式以及 FileSaver.min.js 互相配合  \n  存擋表單開始  \n 檔案名稱： .py   \n  存擋表單結束  \n \n  執行與清除按鈕開始  \n 跑步   輸出   明確輸出區 清晰的繪圖區 重新載入 \n  執行與清除按鈕結束  \n \n  程式執行 ouput 區  \n \n  Brython 程式執行的結果, 都以 brython_div1 作為切入位置  \n \n  editor1 結束   ##########################################  \n 從1累加到100第2部分： \n 1 加到 100 cango_三_齒輪 BS蛇 人工智慧俄羅斯方塊 旋轉塊 \n  請注意, 這裡使用 Javascript 將 localStorage["kw_py_src2"] 中存在近端瀏覽器的程式碼, 由使用者決定存檔名稱 \n \n \n \n  add 1 to 100 part2 開始  \n \n \n  add 1 to 100 part2 結束 \n  editor2 開始  \n  用來顯示程式碼的 editor 區域  \n \n  以下的表單與按鈕與前面的 Javascript doSave 函式以及 FileSaver.min.js 互相配合  \n  存擋表單開始  \n 檔案名稱： .py   \n  存擋表單結束  \n \n  執行與清除按鈕開始  \n 跑步   輸出   明確輸出區 清晰的繪圖區 重新載入 \n  執行與清除按鈕結束  \n \n  程式執行 ouput 區  \n \n  Brython 程式執行的結果, 都以 brython_div1 作為切入位置  \n \n  editor2 結束  \n \n \n', 'tags': '', 'url': 'Brython.html'}]};