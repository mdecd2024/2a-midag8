# coding: utf-8

"""Flask Main program
"""

from flask import Flask, send_from_directory, request, redirect, \
    render_template, session, make_response, url_for, flash
from flask_cors import CORS
import random
import math
import os
# 利用 nocache.py 建立 @nocache decorator, 讓頁面不會留下 cache
from nocache import nocache
import re
import math
import hashlib
# use quote_plus() to generate URL
import urllib.parse
# use cgi.escape() to resemble php htmlspecialchars()
# use cgi.escape() or html.escape to generate data for textarea tag, otherwise Editor can not deal with some Javascript code.
# for python 3.8 import html to replace cgi
from html import escape as html_escape
#import cgi
import os
import sys
# for new parse_content function
# 為了使用 bs4.element, 改為 import bs4
import bs4
# for ssavePage and savePage
import shutil
# for merge_sequence
from difflib import SequenceMatcher
import inspect
# 針對單一頁面有許多 html 標註時, 增大遞迴圈數設定
sys.setrecursionlimit(1000000)

# get the parent directory of the file
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 
_curdir = os.path.join(os.getcwd(), parentdir)
import init
# for start_static function
#import os
import subprocess
import threading
import http.server, ssl

try:
    # 新增 user.py 使用者自訂延伸程式功能, 先前版本若要升級至新版本, 必須新增 user.py 檔案
    import user
except:
    pass

# 產生亂數 token 需要 random 與 string 模組
import string

# for start_static to get wan address
import socket

# 由 init.py 中的 uwsgi = False 或 True 決定在 uwsgi 模式或近端模式執行

# 確定程式檔案所在目錄
config_dir = _curdir + "/config/"
static_dir = _curdir + "/static/"
download_dir = _curdir + "/downloads/"
image_dir = _curdir + "/images/"

# 利用 init.py 啟動, 建立所需的相關檔案
initobj = init.Init()
# 取 init.py 中 Init 類別中的 class uwsgi 變數 (static variable) 設定
uwsgi = init.Init.uwsgi
ip = init.Init.ip
dynamic_port = init.Init.dynamic_port
static_port = init.Init.static_port

# 必須先將 download_dir 設為 static_folder, 然後才可以用於 download 方法中的 app.static_folder 的呼叫
app = Flask(__name__)
CORS(app, support_credentials=False)

# 設置隨後要在 blueprint 應用程式中引用的 global 變數
app.config['config_dir'] = config_dir
app.config['static_dir'] = static_dir
app.config['download_dir'] = download_dir

# 使用 session 必須要設定 secret_key
# In order to use sessions you have to set a secret key
# set the secret key.  keep this really secret:
#secret_key = os.urandom(24).hex()
#app.secret_key = secret_key
# check if fixed secret_key can allow multiple cmsimde on same session
app.secret_key = "eyJhZG1pbl8yczIwIjoxfQ.YOZamA.ft1Mus8eZ6m0QPXOBNLv0UBn6VQ"

try:
    # register userapp blueprint app in user.py
    app.register_blueprint(user.userapp)
except:
    pass


@app.route('/acpform')
def acpform():

    """acp form routine
    """

    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if not isAdmin():
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Login</h1><form method='post' action='checkLogin'> \
                Password:<input type='password' name='password'> \
    <input type='submit' value='login'></form> \
    </section></div></body></html>"
    else:
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Acp From</h1><form method='post' action='doAcp'> \
                Commit Messages:<textarea name='commit' rows='1' cols='80'></textarea> \
    <input type='submit' value='acp'></form> \
    </section></div></body></html>"


def password_generator(size=4, chars=string.ascii_lowercase + string.digits):

    """Generate random password
    """

    return ''.join(random.choice(chars) for _ in range(size))


# 定義 password_generator() 後就可以產生 token
token = password_generator()
@app.route('/checkLogin', methods=['POST'])
def checkLogin():

    """Check user login process
    """

    password = request.form["password"]
    # for Replit, need to setup on the secrets tab for key "config"
    if os.getenv("config") != None:
        saved_password = os.getenv("config")
    else:
        site_title, saved_password = parse_config()
    hashed_password = hashlib.sha512(password.encode('utf-8')).hexdigest()
    if hashed_password == saved_password:
        # 為了讓多 cmsimde 可以在同一個瀏覽器共存, 因此讓每一個 session 不同
        session['admin_'+token] = 1
        # 看起來送至 client 端的不是 admin_token, 而是編碼過的 secret_key
        return redirect('/edit_page')
    return redirect('/')


def checkMath():

    """Use LaTeX Equation rendering
    """

    outstring = '''
<!-- 啟用 LaTeX equations 編輯 -->
  <!-- <script>
  MathJax = {
    tex: {inlineMath: [['$', '$'], ['\\(', '\\)']]}
  };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>-->
    '''
    return outstring


def correct_url():

    """get the correct url for http and https edit mode
        to replace original request.url under set_admin_css, set_css and set_footer
    """
    # fix the following in order to work in codespaces
    #url = request.url
    url = request.script_root + request.path
    if request.is_secure:
        return url
    else:
        url = url.replace("http://", "https://", 1)
        return url


@app.route('/delete_file', methods=['POST'])
def delete_file():

    """Delete user uploaded files
    """

    if not isAdmin():
        return redirect("/login")
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    # for multiple files selection
    filename = request.form.getlist('filename')
    if filename is None:
        outstring = "no file selected!"
        return set_css() + "<div class='container'><nav>" + \
                   directory + "</nav><section><h1>Delete Error</h1>" + \
                   outstring + "<br/><br /></body></html>"
    outstring = "delete all these files?<br /><br />"
    outstring += "<form method='post' action='doDelete'>"
    # only one file is selected
    if isinstance(filename, str):
        outstring += filename + "<input type='hidden' name='filename' value='" + \
                            filename + "'><br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            outstring += filename[index] + "<input type='hidden' name='filename' value='" + \
                                filename[index]+"'><br />"
    outstring += "<br /><input type='submit' value='delete'></form>"

    return set_css() + "<div class='container'><nav>" + \
               directory + "</nav><section><h1>Download List</h1>" + \
               outstring + "<br/><br /></body></html>"


@app.route('/doDelete', methods=['POST'])
def doDelete():

    """Action to delete user uploaded files
    """

    if not isAdmin():
        return redirect("/login")
    # delete files
    # allow multiple files selection
    filename = request.form.getlist('filename')
    outstring = "all these files will be deleted:<br /><br />"
    # only select one file
    if isinstance(filename, str):
        try:
            os.remove(download_dir + "/" + filename)
            outstring += filename + " deleted!"
        except:
            outstring += filename + "Error, can not delete files!<br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            try:
                os.remove(download_dir + "/" + filename[index])
                outstring += filename[index] + " deleted!<br />"
            except:
                outstring += filename[index] + "Error, can not delete files!<br />"

    head, level, page = parse_content()
    directory = render_menu(head, level, page)

    return set_css() + "<div class='container'><nav>" + \
               directory + "</nav><section><h1>Download List</h1>" + \
               outstring + "<br/><br /></body></html>"


@app.route('/doAcp', methods=['POST'])
def doAcp():

    """Action to execute actForm inputs
    """

    if not isAdmin():
        return redirect("/login")
    else:
        commit_messages = request.form['commit']
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        # execute acp.bat with commit_messages
        if os.name == 'nt':
            os.system("acp.bat \"" + commit_messages + "\"")
        else:
            os.system("./acp \"" + commit_messages + "\"")

        return set_css() + "<div class='container'><nav>"+ \
                   directory + "</nav><section><h1>Acp done</h1>Acp done</section></div></body></html>"


@app.route('/doSearch', methods=['POST'])
def doSearch():

    """Action to search content.htm using keyword
    """

    if not isAdmin():
        return redirect("/login")
    else:
        keyword = request.form['keyword']
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        match = ""
        for index in range(len(head)):
            if (keyword != "" or None) and (keyword.lower() in page[index].lower() or \
            keyword.lower() in head[index].lower()): \
                match += "<a href='/get_page/" + head[index] + "'>" + \
                                head[index] + "</a><br />"
        return set_css() + "<div class='container'><nav>"+ \
                   directory + "</nav><section><h1>Search Result</h1>keyword: " + \
                   keyword.lower() + "<br /><br />in the following pages:<br /><br />" + \
                   match + "</section></div></body></html>"


@app.route('/download/', methods=['GET'])
def download():

    """Download file using URL
    """

    filename = request.args.get('filename')
    type = request.args.get('type')
    if type == "files":
        return send_from_directory(download_dir, filename=filename)
    else:
        # for image files
        return send_from_directory(image_dir, filename=filename)


@app.route('/download_list', methods=['GET'])
def download_list():

    """List files in downloads directory
    """

    if not isAdmin():
        return redirect("/login")
    else:
        if not request.args.get('edit'):
            edit= 1
        else:
            edit = request.args.get('edit')
        if not request.args.get('page'):
            page = 1
        else:
            page = request.args.get('page')
        if not request.args.get('item_per_page'):
            item_per_page = 10
        else:
            item_per_page = request.args.get('item_per_page')

        # only use lower case keyword to search filename
        session.pop('download_keyword', "")

        if not request.args.get('keyword'):
            keyword = ""
        else:
            keyword = request.args.get('keyword')

        session['download_keyword'] = keyword
        # turn all english char of the filenames into lower cases
        origFiles = os.listdir(download_dir)
        files = []
        #lowerCaseFiles = []
        for i in range(len(origFiles)):
            filename = origFiles[i]
            lowerFilename = ""
            for j in range(len(filename)):
                uchar = filename[j]
                if uchar >= u'\u4e00' and uchar<=u'\u9fa5':
                    lowerFilename += uchar
                else:
                    lowerFilename += uchar.lower()
            # check if lowerFilename contains keyword
            if str(keyword) in lowerFilename:
                files.append(filename)    
    files.sort()
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = "<form method='post' action='delete_file'>"
    notlast = False
    if total_rows > 0:
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "download_list?&amp;page=1&amp;item_per_page=" + str(item_per_page) + \
                                "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "download_list?&amp;page=" + str(page_num) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Previous</a> "

        span = 10

        for index in range(int(page)-span, int(page)+span):
            if index>= 0 and index< totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "download_list?&amp;page=" + str(page_now) + "&amp;item_per_page=" + \
                                        str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
                    outstring += "'>"+str(page_now) + "</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(nextpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(totalpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>>></a><br /><br />"

        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            outstring += downloadlist_access_list(files, starti, endi) + "<br />"
        else:
            outstring += "<br /><br />"
            outstring += downloadlist_access_list(files, starti, total_rows) + "<br />"

        if int(page) > 1:
            outstring += "<a href='"
            outstring += "download_list?&amp;page=1&amp;item_per_page=" + str(item_per_page) + \
                                "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "download_list?&amp;page=" + str(page_num) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Previous</a> "

        span = 10

        for index in range(int(page)-span, int(page)+span):
        #for ($j=$page-$range;$j<$page+$range;$j++)
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page)+" </font>"
                else:
                    outstring += "<a href='"
                    outstring += "download_list?&amp;page=" + str(page_now) + \
                                        "&amp;item_per_page=" + str(item_per_page) + \
                                        "&amp;keyword=" + str(session.get('download_keyword'))
                    outstring += "'>" + str(page_now)+"</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(nextpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(totalpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>>></a>"
    else:
        outstring += "no data!"
    outstring += "<br /><br /><input type='submit' value='delete'><input type='reset' value='reset'></form>"

    head, level, page = parse_content()
    directory = render_menu(head, level, page)

    return set_css() + "<div class='container'><nav>" + \
               directory + "</nav><section><h1>Download List</h1>" + outstring + "<br/><br /></body></html>"


def downloadlist_access_list(files, starti, endi):

    """List files function for download_list
    """

    # different extension files, associated links were provided
    # popup window to view images, video or STL files, other files can be downloaded directly
    # files are all the data to list, from starti to endi
    # add file size
    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileExtension = fileExtension.lower()
        fileSize = sizeof_fmt(os.path.getsize(download_dir+"/"+files[index]))
        # images files
        if fileExtension == ".png" or fileExtension == ".jpg" or fileExtension == ".gif":
            outstring += '<input type="checkbox" name="filename" value="' + \
                              files[index] + '"><a href="javascript:;" onClick="window.open(\'/images/' +  \
                              files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + \
                              files[index] + '</a> (' + str(fileSize) + ')<br />'
        # stl files
        elif fileExtension == ".stl":
            outstring += '<input type="checkbox" name="filename" value="' + \
                              files[index] + '"><a href="javascript:;" onClick="window.open(\'/static/viewstl.html?src=' + '/downloads/' + \
                              files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + \
                              files[index] + '</a> (' + str(fileSize) + ')<br />'
        # flv files
        elif fileExtension == ".flv":
            outstring += '<input type="checkbox" name="filename" value="' + \
                              files[index] + '"><a href="javascript:;" onClick="window.open(\'/flvplayer?filepath=/downloads/' + \
            files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> (' + str(fileSize) + ')<br />'
        # direct download files
        else:
            outstring += "<input type='checkbox' name='filename' value='" + files[index] + \
                              "'><a href='./../downloads/" + files[index] + "'>" + files[index] + \
                              "</a> (" + str(fileSize) + ")<br />"
    return outstring


# downloads 方法主要將位於 downloads 目錄下的檔案送回瀏覽器
@app.route('/downloads/<path:path>')
def downloads(path):

    """Send files in downloads directory
    """

    return send_from_directory(_curdir+"/downloads/", path)


def downloadselect_access_list(files, starti, endi):

    """Accompanied with file_selector

    與 file_selector 搭配的取檔程式
    """

    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileSize = os.path.getsize(download_dir + "/" + files[index])
        outstring += '''<input type="checkbox" name="filename" value="''' + \
                          files[index] + '''"><a href="#" onclick='window.setLink("/downloads/''' + \
                          files[index] + '''",0); return false;'>''' + files[index] + \
                          '''</a> (''' + str(sizeof_fmt(fileSize)) + ''')<br />'''
    return outstring


@app.route('/edit_config', defaults={'edit': 1})
@app.route('/edit_config/<path:edit>')
def edit_config(edit):

    """Config edit html form
    """

    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if not isAdmin():
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Login</h1><form method='post' action='checkLogin'> \
                 Password:<input type='password' name='password'> \
                 <input type='submit' value='login'></form> \
                 </section></div></body></html>"
    else:
        site_title, password = parse_config()
        # edit config file
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Edit Config</h1><form method='post' action='saveConfig'> \
                 Site Title:<input type='text' name='site_title' value='"+site_title+"' size='50'><br /> \
                 Password:<input type='text' name='password' value='"+password+"' size='50'><br /> \
                 <input type='hidden' name='password2' value='"+password+"'> \
                 <input type='submit' value='send'></form> \
                 </section></div></body></html>"


# edit all page content
@app.route('/edit_page', defaults={'edit': 1})
@app.route('/edit_page/<path:edit>')
def edit_page(edit):

    """Page edit html form
    """

    # check if administrator
    if not isAdmin():
        return redirect('/login')
    else:
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        pagedata =file_get_contents(config_dir + "content.htm")
        #outstring = tinymce_editor(directory, cgi.escape(pagedata))
        # for python 3.8
        outstring = tinymce_editor(directory, html_escape(pagedata))
        return outstring


def editorfoot():

    """Add editor foot html
    """

    return '''<body>'''


def editorhead():

    """Add editor head html
    """

    return '''
    <br />
<!--<script src="//cdn.tinymce.com/4/tinymce.min.js"></script>-->
<!--<script src="/static/tinymce4/tinymce/tinymce.min.js"></script>-->
<!-- for ipv6 to work -->
<!-- <script src="https://mde.tw/cmstemplate/cmsimde/static/tinymce4/tinymce/tinymce.min.js"></script>-->
<!-- may work for local, ipv4 and ipv6 editing -->
<script src="/static/tinymce4/tinymce/tinymce.min.js"></script>
<script src="/static/tinymce4/tinymce/plugins/sh4tinymce/plugin.min.js"></script>
<link rel = "stylesheet" href = "/static/tinymce4/tinymce/plugins/sh4tinymce/style/style.css">
<script>
tinymce.init({
  selector: "textarea",
  height: 500,
  element_format : "html",
  language : "en",
  valid_elements : '*[*]',
  extended_valid_elements: "script[language|type|src]",
  plugins: [
    'advlist autolink lists link image charmap print preview hr anchor pagebreak',
    'searchreplace wordcount visualblocks visualchars code fullscreen',
    'insertdatetime media nonbreaking save table contextmenu directionality',
    'emoticons template paste textcolor colorpicker textpattern imagetools sh4tinymce'
  ],
  toolbar1: 'insertfile save undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
  toolbar2: 'link image | print preview media | forecolor backcolor emoticons | code sh4tinymce',
  relative_urls: false,
  toolbar_items_size: 'small',
  file_picker_callback: function(callback, value, meta) {
        cmsFilePicker(callback, value, meta);
    },
  templates: [
    { title: 'Test template 1', content: 'Test 1' },
    { title: 'Test template 2', content: 'Test 2' }
  ],
  content_css: [
    '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
    '//www.tinymce.com/css/codepen.min.css'
  ]
});

function cmsFilePicker(callback, value, meta) {
    tinymce.activeEditor.windowManager.open({
        title: 'Uploaded File Browser',
        url: '/file_selector?type=' + meta.filetype,
        width: 800,
        height: 550,
    }, {
        oninsert: function (url, objVals) {
            callback(url, objVals);
        }
    });
};
</script>
'''


@app.route('/error_log')
def error_log(self, info="Error"):

    """ Return error log
    """

    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section><h1>ERROR</h1>" + info + "</section></div></body></html>"


@app.route('/favicon.ico')
def favicon():

    """Add favicon
    """

    return send_from_directory(_curdir, 'favicon.ico', mimetype='image/vnd.microsoft.icon')


def file_get_contents(filename):

    """Return filename content
    """

    # open file in utf-8 and return file content
    with open(filename, encoding="utf-8") as file:
        return file.read()


# 與 file_selector 配合, 用於 Tinymce4 編輯器的檔案選擇
def file_lister(directory, type=None, page=1, item_per_page=10):

    """Return file list
    """

    files = os.listdir(directory)
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = file_selector_script()
    notlast = False
    if total_rows > 0:
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + \
                              "&amp;page=1&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + \
                              "&amp;page=" + str(page_num) + \
                              "&amp;item_per_page=" +str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index>= 0 and index< totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "file_selector?type=" + type + "&amp;page=" + \
                                      str(page_now) + "&amp;item_per_page=" + \
                                      str(item_per_page) + "&amp;keyword=" + \
                                      str(session.get('download_keyword'))
                    outstring += "'>" + str(page_now)+"</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(nextpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(totalpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>>></a><br /><br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            if type == "file":
                outstring += downloadselect_access_list(files, starti, endi) + "<br />"
            else:
                outstring += imageselect_access_list(files, starti, endi) + "<br />"
        else:
            outstring += "<br /><br />"
            if type == "file":
                outstring += downloadselect_access_list(files, starti, total_rows) + "<br />"
            else:
                outstring += imageselect_access_list(files, starti, total_rows) + "<br />"
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + \
                              "&amp;page=1&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(page_num) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>Previous</a>"
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>"+str(page)+" </font>"
                else:
                    outstring += "<a href='"
                    outstring += "file_selector?type=" + type + "&amp;page=" + \
                                       str(page_now) + "&amp;item_per_page=" + \
                                       str(item_per_page) + "&amp;keyword=" + \
                                       str(session.get('download_keyword'))
                    outstring += "'>" + str(page_now) + "</a> "
        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(nextpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(totalpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>>></a>"
    else:
        outstring += "no data!"

    if type == "file":
        return outstring+"<br /><br /><a href='fileuploadform'>file upload</a>"
    else:
        return outstring+"<br /><br /><a href='imageuploadform'>image upload</a>"


# 配合 Tinymce4 讓使用者透過 html editor 引用所上傳的 files 與 images
@app.route('/file_selector', methods=['GET'])
def file_selector():

    """Return file selected
    """

    if not isAdmin():
        return redirect("/login")
    else:
        if not request.args.get('type'):
            type= "file"
        else:
            type = request.args.get('type')
        if not request.args.get('page'):
            page = 1
        else:
            page = request.args.get('page')
        if not request.args.get('item_per_page'):
            item_per_page = 10
        else:
            item_per_page = request.args.get('item_per_page')
        if not request.args.get('keyword'):
            keyword = None
        else:
            keyword = request.args.get('keyword')

        if type == "file":

            return file_lister(download_dir, type, page, item_per_page)
        elif type == "image":
            return file_lister(image_dir, type, page, item_per_page)


def file_selector_script():

    """Return file selector Javascript
    """

    return '''
<script language="javascript" type="text/javascript">
$(function(){
    $('.a').on('click', function(event){
        setLink();
    });
});

function setLink (url, objVals) {
    top.tinymce.activeEditor.windowManager.getParams().oninsert(url, objVals);
    top.tinymce.activeEditor.windowManager.close();
    return false;
}
</script>
'''


@app.route('/fileaxupload', methods=['POST'])
# ajax jquery chunked file upload for flask
def fileaxupload():

    """Write uploaded file to server
    """

    if isAdmin():
        # need to consider if the uploaded filename already existed.
        # right now all existed files will be replaced with the new files
        filename = request.args.get("ax-file-name")
        flag = request.args.get("start")
        if flag == "0":
            file = open(_curdir + "/downloads/" + filename, "wb")
        else:
            file = open(_curdir + "/downloads/" + filename, "ab")
        file.write(request.stream.read())
        file.close()
        return "files uploaded!"
    else:
        return redirect("/login")


@app.route('/fileuploadform', defaults={'edit':1})
@app.route('/fileuploadform/<path:edit>')
def fileuploadform(edit):

    """Return file upload form html
    """

    if isAdmin():
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        return set_css() + "<div class='container'><nav>"+ \
                 directory + "</nav><section><h1>file upload</h1>" + \
                 '''<script src="/static/jquery.js" type="text/javascript"></script>
<script src="/static/axuploader.js" type="text/javascript"></script>
<script>
$(document).ready(function(){
$('.prova').axuploader({url:'fileaxupload', allowExt:['jpg','png','gif','7z','pdf','zip','ttt','stl','txt','html','mp4'],
finish:function(x,files)
    {
        alert('All files have been uploaded: '+files);
    },
enable:true,
remotePath:function(){
return 'downloads/';
}
});
});
</script>
<div class="prova"></div>
<input type="button" onclick="$('.prova').axuploader('disable')" value="asd" />
<input type="button" onclick="$('.prova').axuploader('enable')" value="ok" />
</section></body></html>
'''
    else:
        return redirect("/login")


@app.route('/flvplayer')
# 需要檢視能否取得 filepath 變數
def flvplayer(filepath=None):

    """Return old flv file viewer
    """

    outstring = '''
<object type="application/x-shockwave-flash" data="''' + static_dir + '''player_flv_multi.swf" width="320" height="240">
     <param name="movie" value="player_flv_multi.swf" />
     <param name="allowFullScreen" value="true" />
     <param name="FlashVars" value="flv=''' + filepath + '''&amp;width=320&amp;height=240&amp;showstop=1&amp;showvolume=1&amp;showtime=1
     &amp;startimage=''' + static_dir + '''startimage_en.jpg&amp;showfullscreen=1&amp;bgcolor1=189ca8&amp;bgcolor2=085c68
     &amp;playercolor=085c68" />
</object>
'''
    return outstring


@app.route('/generate_pages')
def generate_pages():

    """Convert content.htm to static html files in  content directory
    """

    # 必須決定如何處理重複標題頁面的轉檔
    # 確定程式檔案所在目錄, 在 Windows 有最後的反斜線
    #_curdir = os.path.join(os.getcwd(), os.path.dirname(__file__))
    # 根據 content.htm 內容, 逐一產生各頁面檔案
    # 在此也要同時配合 render_menu2, 產生對應的 anchor 連結
    # check if administrator
    if not isAdmin():
        return redirect('/login')
    else:
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        # 處理重複標題 head 數列， 重複標題則按照次序加上 1, 2, 3...
        newhead = []
        for i, v in enumerate(head):
            # 各重複標題總數
            totalcount = head.count(v)
            # 目前重複標題出現總數
            count = head[:i].count(v)
            # 針對重複標題者, 附加目前重複標題出現數 +1, 未重複採原標題
            newhead.append(v + "-" + str(count + 1) if totalcount > 1 else v)
        # 刪除 content 目錄中所有 html 檔案
        filelist = [ f for f in os.listdir(_curdir + "/content/") if f.endswith(".html") ]
        for f in filelist:
            os.remove(os.path.join(_curdir + "/content/", f))
        # 這裡需要建立專門寫出 html 的 write_page
        # index.html
        with open(_curdir + "/content/index.html", "w", encoding="utf-8") as f:
            f.write(get_page2(None, newhead, 0))
        # sitemap
        with open(_curdir + "/content/sitemap.html", "w", encoding="utf-8") as f:
            # 為了修改為動態與靜態網頁雙向轉檔, 這裡需要 newhead pickle
            # sitemap2 需要 newhead
            f.write(sitemap2(newhead))
        # 以下轉檔, 改用 newhead 數列

        def visible(element):
            if element.parent.name in ['style', 'script', '[document]', 'head', 'title']:
                return False
            elif re.match('<!--.*-->', str(element.encode('utf-8'))):
                return False
            return True

        search_content = []
        # generate each page html under content directory
        for i in range(len(newhead)):
            # 在此必須要將頁面中的 /images/ 字串換為 images/, /downloads/ 換為 downloads/
            # 因為 Flask 中靠 /images/ 取檔案, 但是一般 html 則採相對目錄取檔案
            # 此一字串置換在 get_page2 中進行
            # 加入 tipue search 模式
            get_page_content = []
            html_doc = get_page2(newhead[i], newhead, 0, get_page_content)
            """
            # html = "<meta property='head' content='H1'>"
            soup = BeautifulSoup(html)
            title = soup.find("meta", property="head")
            print(title["content"])
            """
            html_doc = html_doc.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta property="head" content="H'+str(level[i])+'">')
            soup = bs4.BeautifulSoup(" ".join(get_page_content), "lxml")
            search_content.append({"title": newhead[i], "text": " ".join(filter(visible, soup.findAll(text=True))), "tags": "", "url": newhead[i] + ".html"})
            with open(_curdir + "/content/" + newhead[i] + ".html", "w", encoding="utf-8") as f:
                # 增加以 newhead 作為輸入
                f.write(html_doc)
        # GENERATE js file
        with open(_curdir + "/content/tipuesearch_content.js", "w", encoding="utf-8") as f:
            f.write("var tipuesearch = {\"pages\": " + str(search_content) + "};")
        return set_css() + "<div class='container'><nav>" + \
                     directory + "</nav><section><h1>Generate Pages</h1>" + \
                     "已經將網站轉為靜態網頁!" + \
                     "</section></div></body></html>"


# seperate page need heading and edit variables, if edit=1, system will enter edit mode
# single page edit will use ssavePage to save content, it means seperate save page
@app.route('/get_page')
@app.route('/get_page/<heading>', defaults={'edit': 0})
@app.route('/get_page/<heading>/<int:edit>')
def get_page(heading, edit):

    """Get dynamic page content
    """

    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if heading is None:
        heading = head[0]
    # 因為同一 heading 可能有多頁, 因此不可使用 head.index(heading) 搜尋 page_order
    page_order_list, page_content_list = search_content(head, page, heading)
    return_content = ""
    pagedata = ""
    outstring = ""
    outstring_duplicate = ""
    pagedata_duplicate = ""
    outstring_list = []
    for i in range(len(page_order_list)):
        #page_order = head.index(heading)
        page_order = page_order_list[i]
        if page_order == 0:
            last_page = ""
        else:
            last_page = head[page_order-1] + " << <a href='/get_page/" + \
                             head[page_order-1] + "'>Previous</a>"
        if page_order == len(head) - 1:
            # no next page
            next_page = ""
        else:
            next_page = "<a href='/get_page/"+ head[page_order+1] + \
                              "'>Next</a> >> " + head[page_order+1]
        if len(page_order_list) > 1:
            return_content += last_page + " " + next_page + \
                                      "<br /><h1>" + heading + "</h1>" + \
                                      page_content_list[i] + "<br />"+ \
                                      last_page + " " + next_page + "<br /><hr>"
            pagedata_duplicate = "<h"+level[page_order] + ">" + heading + \
                                          "</h"+level[page_order] + ">" + page_content_list[i]
            outstring_list.append(last_page + " " + next_page + "<br />" + tinymce_editor(directory, html_escape(pagedata_duplicate), page_order))
        else:
            return_content += last_page + " " + next_page + "<br /><h1>" +\
                                      heading + "</h1>" + page_content_list[i] + "<br />" + last_page + " " + next_page

        pagedata += "<h"+level[page_order] + ">" + heading + "</h" + level[page_order] + ">" + page_content_list[i]
        # 利用 html_escape() 將 specialchar 轉成只能顯示的格式
        outstring += last_page + " " + next_page + "<br />" + tinymce_editor(directory, html_escape(pagedata), page_order)

    # edit=0 for viewpage
    if edit == 0:
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section>" + return_content + "</section></div>" + checkMath() + "</body></html>"
    # enter edit mode
    else:
        # check if administrator
        if not isAdmin():
            redirect(url_for('login'))
        else:
            if len(page_order_list) > 1:
                # 若碰到重複頁面頁印, 且要求編輯, 則導向 edit_page
                #return redirect("/edit_page")
                for i in range(len(page_order_list)):
                    outstring_duplicate += outstring_list[i] + "<br /><hr>"
                return outstring_duplicate
            else:
                return outstring


def get_page2(heading, head, edit, get_page_content = None):

    """Get page content and replace certain string for static site
    """

    not_used_head, level, page = parse_content()
    # 直接在此將 /images/ 換為 ./../images/, /downloads/ 換為 ./../downloads/, 以 content 為基準的相對目錄設定

    page = [w.replace('src="/images/', 'src="./../images/') for w in page]
    page = [w.replace('href="/downloads/', 'href="./../downloads/') for w in page]
    # 假如有 src="/static/ace/ 則換為 src="./../static/ace/
    page = [w.replace('src="/static/', 'src="./../cmsimde/static/') for w in page]
    # 假如有 src=/downloads 則換為 src=./../../downloads
    page = [w.replace('src="/downloads', 'src="./../downloads') for w in page]
    # 假如有 pythonpath:['/static/' 則換為 ./../cmsimde/static/
    page = [w.replace("pythonpath:['/static/'", "pythonpath:['./../cmsimde/static/'") for w in page]
    # 針對 wink3 假如有 data-dirname="/static" 換為 data-dirname="./../cmsimde/static"
    page = [w.replace("data-dirname=\"/static\"", "data-dirname=\"./../cmsimde/static\"") for w in page]
    # 假如有 /get_page 則需額外使用 regex 進行字串代換, 表示要在靜態網頁直接取網頁 (尚未完成)
    #page = [w.replace('/get_page', '') for w in page]

    directory = render_menu2(head, level, page)
    if heading is None:
        heading = head[0]
    # 因為同一 heading 可能有多頁, 因此不可使用 head.index(heading) 搜尋 page_order
    page_order_list, page_content_list = search_content(head, page, heading)
    if get_page_content != None:
        get_page_content.extend(page_content_list)
    return_content = ""
    pagedata = ""
    outstring = ""
    outstring_duplicate = ""
    pagedata_duplicate = ""
    outstring_list = []
    for i in range(len(page_order_list)):
        page_order = page_order_list[i]
        if page_order == 0:
            last_page = ""
        else:
            #last_page = head[page_order-1]+ " << <a href='/get_page/" + head[page_order-1] + "'>Previous</a>"
            last_page = head[page_order-1] + " << <a href='"+head[page_order-1] + ".html'>Previous</a>"
        if page_order == len(head) - 1:
            # no next page
            next_page = ""
        else:
            #next_page = "<a href='/get_page/"+head[page_order+1] + "'>Next</a> >> " + head[page_order+1]
            next_page = "<a href='" + head[page_order+1] + ".html'>Next</a> >> " + head[page_order+1]
        if len(page_order_list) > 1:
            return_content += last_page + " " + next_page + "<br /><h1>" + \
                                      heading + "</h1>" + page_content_list[i] + \
                                      "<br />" + last_page + " "+ next_page + "<br /><hr>"
            pagedata_duplicate = "<h"+level[page_order] + ">" + heading + "</h" + level[page_order]+">"+page_content_list[i]
            outstring_list.append(last_page + " " + next_page + "<br />" + tinymce_editor(directory, html_escape(pagedata_duplicate), page_order))
        else:
            return_content += last_page + " " + next_page + "<br /><h1>" + \
                                      heading + "</h1>" + page_content_list[i] + \
                                      "<br />" + last_page + " " + next_page

        pagedata += "<h" + level[page_order] + ">" + heading + \
                          "</h" + level[page_order] + ">" + page_content_list[i]
        # 利用 html_escape() 將 specialchar 轉成只能顯示的格式
        outstring += last_page + " " + next_page + "<br />" + tinymce_editor(directory, html_escape(pagedata), page_order)

    # edit=0 for viewpage
    if edit == 0:
        return set_css2() + '''<div class='container'><nav>
        '''+ \
        directory + "<div id=\"tipue_search_content\">" + return_content + \
        '''</div>

    <!-- footer -->
      <div class="container">
        <div class="row pt-3 mx-auto">
            <p>
            <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
            Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | This template is made with <i class="icon-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank" >Colorlib</a>
            <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
            </p>
        </div>
      </div>
    <!-- for footer -->

        </div> <!-- for site wrap -->
            <!-- <script src="../cmsimde/static/chimper/js/jquery-3.3.1.min.js"></script> -->
            <script src="../cmsimde/static/chimper/js/jquery-migrate-3.0.1.min.js"></script>
            <script src="../cmsimde/static/chimper/js/jquery-ui.js"></script>
            <script src="../cmsimde/static/chimper/js/popper.min.js"></script>
            <script src="../cmsimde/static/chimper/js/bootstrap.min.js"></script>
            <script src="../cmsimde/static/chimper/js/owl.carousel.min.js"></script>
            <script src="../cmsimde/static/chimper/js/jquery.stellar.min.js"></script>
            <script src="../cmsimde/static/chimper/js/jquery.countdown.min.js"></script>
            <script src="../cmsimde/static/chimper/js/jquery.magnific-popup.min.js"></script>
            <script src="../cmsimde/static/chimper/js/bootstrap-datepicker.min.js"></script>
            <script src="../cmsimde/static/chimper/js/aos.js"></script>
            <!--
            <script src="../cmsimde/static/chimper/js/typed.js"></script>
                    <script>
                    var typed = new Typed('.typed-words', {
                    strings: ["Web Apps"," WordPress"," Mobile Apps"],
                    typeSpeed: 80,
                    backSpeed: 80,
                    backDelay: 4000,
                    startDelay: 1000,
                    loop: true,
                    showCursor: true
                    });
                    </script>
            -->
            <script src="../cmsimde/static/chimper/js/main.js"></script>
        ''' + checkMath() + '''</body></html>
        '''
    # enter edit mode
    else:
        # check if administrator
        if not isAdmin():
            redirect(url_for('login'))
        else:
            if len(page_order_list) > 1:
                # 若碰到重複頁面頁印, 且要求編輯, 則導向 edit_page
                #return redirect("/edit_page")
                for i in range(len(page_order_list)):
                    outstring_duplicate += outstring_list[i] + "<br /><hr>"
                return outstring_duplicate
            else:
                return outstring


def get_wan_address():

    """get wide area network address
    """

    try:
        ipv4_address = get_wan_ipv4_address()
        if ipv4_address:
            return ipv4_address

        ipv6_address = get_wan_ipv6_address()
        if ipv6_address:
            return ipv6_address
    except socket.gaierror:
        pass

    return 'localhost'


def get_wan_ipv4_address():

    """get IPv4 wide area network address
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(("8.8.8.8", 80))  # Use Google Public DNS as the external host
        ip_address = sock.getsockname()[0]
        sock.close()
        return ip_address
    except socket.error:
        return None


def get_wan_ipv6_address():

    """get IPv6 wide area network address
    """

    try:
        sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
        sock.connect(("2001:4860:4860::8888", 80))  # Use Google Public DNS as the external host
        ip_address = sock.getsockname()[0]
        sock.close()
        return ip_address
    except socket.error:
        return None


@app.route('/image_delete_file', methods=['POST'])
def image_delete_file():

    """Delete image file
    """

    if not isAdmin():
        return redirect("/login")
    filename = request.form['filename']
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if filename is None:
        outstring = "no file selected!"
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Delete Error</h1>" + \
                 outstring + "<br/><br /></body></html>"
    outstring = "delete all these files?<br /><br />"
    outstring += "<form method='post' action='image_doDelete'>"
    # only one file is selected
    if isinstance(filename, str):
        outstring += filename + "<input type='hidden' name='filename' value='" + \
                          filename + "'><br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            outstring += filename[index] + "<input type='hidden' name='filename' value='" + \
                              filename[index] + "'><br />"
    outstring += "<br /><input type='submit' value='delete'></form>"
    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section><h1>Download List</h1>" + \
             outstring + "<br/><br /></body></html>"


@app.route('/image_doDelete', methods=['POST'])
def image_doDelete():

    """Delete file action
    """

    if not isAdmin():
        return redirect("/login")
    # delete files
    filename = request.form['filename']
    outstring = "all these files will be deleted:<br /><br />"
    # only select one file
    if isinstance(filename, str):
        try:
            os.remove(image_dir + "/" + filename)
            outstring += filename + " deleted!"
        except:
            outstring += filename + "Error, can not delete files!<br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            try:
                os.remove(image_dir + "/" + filename[index])
                outstring += filename[index] + " deleted!<br />"
            except:
                outstring += filename[index] + "Error, can not delete files!<br />"
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section><h1>Image List</h1>" + \
             outstring + "<br/><br /></body></html>"


@app.route('/image_list', methods=['GET'])
def image_list():

    """List image files
    """

    if not isAdmin():
        return redirect("/login")
    else:
        if not request.args.get('edit'):
            edit= 1
        else:
            edit = request.args.get('edit')
        if not request.args.get('page'):
            page = 1
        else:
            page = request.args.get('page')
        if not request.args.get('item_per_page'):
            item_per_page = 10
        else:
            item_per_page = request.args.get('item_per_page')

        # only use lower case keyword to search filename
        session.pop('image_keyword', "")

        if not request.args.get('keyword'):
            keyword = ""
        else:
            keyword = request.args.get('keyword')

        session['image_keyword'] = keyword

        # turn all english char of the filenames into lower cases
        origFiles = os.listdir(image_dir)
        files = []
        #lowerCaseFiles = []
        for i in range(len(origFiles)):
            filename = origFiles[i]
            lowerFilename = ""
            for j in range(len(filename)):
                uchar = filename[j]
                if uchar >= u'\u4e00' and uchar<=u'\u9fa5':
                    lowerFilename += uchar
                else:
                    lowerFilename += uchar.lower()
            # check if lowerFilename contains keyword
            if str(keyword) in lowerFilename:
                files.append(filename) 

    files.sort()
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = "<form method='post' action='image_delete_file'>"
    notlast = False
    if total_rows > 0:
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "image_list?&amp;page=1&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "image_list?&amp;page=" + str(page_num) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index >= 0 and index < totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "image_list?&amp;page=" + str(page_now) + \
                                      "&amp;item_per_page=" + str(item_per_page) + \
                                      "&amp;keyword=" + str(session.get('image_keyword'))
                    outstring += "'>" + str(page_now) + "</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(nextpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(totalpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>>></a><br /><br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            outstring += imagelist_access_list(files, starti, endi) + "<br />"
        else:
            outstring += "<br /><br />"
            outstring += imagelist_access_list(files, starti, total_rows) + "<br />"

        if int(page) > 1:
            outstring += "<a href='"
            outstring += "image_list?&amp;page=1&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "image_list?&amp;page=" + str(page_num) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "image_list?&amp;page=" + str(page_now) + \
                                      "&amp;item_per_page=" + str(item_per_page) + \
                                      "&amp;keyword=" + str(session.get('image_keyword'))
                    outstring += "'>"+str(page_now) + "</a> "
        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(nextpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(totalpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>>></a>"
    else:
        outstring += "no data!"
    outstring += "<br /><br /><input type='submit' value='delete'><input type='reset' value='reset'></form>"

    head, level, page = parse_content()
    directory = render_menu(head, level, page)

    return set_css() + "<div class='container'><nav>"+ \
             directory + "</nav><section><h1>Image List</h1>" + \
             outstring + "<br/><br /></body></html>"


@app.route('/imageaxupload', methods=['POST'])
# ajax jquery chunked file upload for flask
def imageaxupload():

    """Write uploaded image files
    """

    if isAdmin():
        # need to consider if the uploaded filename already existed.
        # right now all existed files will be replaced with the new files
        filename = request.args.get("ax-file-name")
        flag = request.args.get("start")
        if flag == "0":
            file = open(_curdir + "/images/" + filename, "wb")
        else:
            file = open(_curdir + "/images/" + filename, "ab")
        file.write(request.stream.read())
        file.close()
        return "image files uploaded!"
    else:
        return redirect("/login")


def imagelist_access_list(files, starti, endi):

    """Access files of image direcroty
    """

    # different extension files, associated links were provided
    # popup window to view images, video or STL files, other files can be downloaded directly
    # files are all the data to list, from starti to endi
    # add file size
    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileExtension = fileExtension.lower()
        fileSize = sizeof_fmt(os.path.getsize(image_dir + "/" + files[index]))
        # images files
        if fileExtension == ".png" or fileExtension == ".jpg" or fileExtension == ".gif":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + \
                              '"><a href="javascript:;" onClick="window.open(\'/images/' + \
                              files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + \
                              files[index] + '</a> (' + str(fileSize) + ')<br />'
    return outstring


# 與 file_selector 搭配的取影像檔程式
def imageselect_access_list(files, starti, endi):

    """Access selected image file
    """

    outstring = '''<head>
<style>
a.xhfbfile {padding: 0 2px 0 0; line-height: 1em;}
a.xhfbfile img{border: none; margin: 6px;}
a.xhfbfile span{display: none;}
a.xhfbfile:hover span{
    display: block;
    position: relative;
    left: 150px;
    border: #aaa 1px solid;
    padding: 2px;
    background-color: #ddd;
}
a.xhfbfile:hover{
    background-color: #ccc;
    opacity: .9;
    cursor:pointer;
}
</style>
</head>
'''
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileSize = os.path.getsize(image_dir+"/"+files[index])
        outstring += '''<a class="xhfbfile" href="#" onclick='window.setLink("/images/'''+ \
                          files[index] + '''",0); return false;'>''' + \
                          files[index] + '''<span style="position: absolute; z-index: 4;"><br /> \
                          <img src="/images/''' + files[index] + '''" width="150px"/></span></a> \
                          (''' + str(sizeof_fmt(fileSize)) + ''')<br />'''
    return outstring


@app.route('/imageuploadform', defaults={'edit': 1})
@app.route('/imageuploadform/<path:edit>')
def imageuploadform(edit):

    """Image files upload form
    """

    if isAdmin():
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>image files upload</h1>" + '''
<script src="/static/jquery.js" type="text/javascript"></script>
<script src="/static/axuploader.js" type="text/javascript"></script>
<script>
$(document).ready(function(){
$('.prova').axuploader({url:'imageaxupload', allowExt:['jpg','png','gif'],
finish:function(x,files)
    {
        alert('All files have been uploaded: '+files);
    },
enable:true,
remotePath:function(){
return 'images/';
}
});
});
</script>
<div class="prova"></div>
<input type="button" onclick="$('.prova').axuploader('disable')" value="asd" />
<input type="button" onclick="$('.prova').axuploader('enable')" value="ok" />
</section></body></html>
'''
    else:
        return redirect("/login")


@app.route('/')
def index():

    """Index page of dynamic site
    """

    head, level, page = parse_content()
    # 2018.12.13, 將空白轉為"+" 號, 會導致連線錯誤, 改為直接取頁面標題
    #return redirect("/get_page/" + urllib.parse.quote_plus(head[0], encoding="utf-8"))
    return redirect("/get_page/" + head[0])
    # the following will never execute
    directory = render_menu(head, level, page)
    if heading is None:
        heading = head[0]
    # 因為同一 heading 可能有多頁, 因此不可使用 head.index(heading) 搜尋 page_order
    page_order_list, page_content_list = search_content(head, page, heading)
    return_content = ""
    for i in range(len(page_order_list)):
        #page_order = head.index(heading)
        page_order = page_order_list[page_order_list[i]]
        if page_order == 0:
            last_page = ""
        else:
            last_page = head[page_order-1] + " << <a href='/get_page/" + \
                             head[page_order-1] + "'>Previous</a>"
        if page_order == len(head) - 1:
            # no next page
            next_page = ""
        else:
            next_page = "<a href='/get_page/" + head[page_order+1] + \
                              "'>Next</a> >> " + head[page_order+1]
        return_content += last_page + " " + next_page + "<br /><h1>" + \
                                  heading + "</h1>" + page_content_list[page_order_list[i]] + \
                                  "<br />" + last_page + " " + next_page

    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section>" + return_content + "</section></div></body></html>"


def isAdmin():

    """Check if is adminitrator
    """

    if session.get('admin_'+token) == 1:
            return True
    else:
        return False


# use to check directory variable data
@app.route('/listdir')
def listdir():

    """List directory content
    """

    return download_dir + "," + config_dir


@app.route('/load_list')
def load_list(item_per_page=5, page=1, filedir=None, keyword=None):

    """Load searched files
    """

    files = os.listdir(config_dir+filedir+"_programs/")
    if keyword is None:
        pass
    else:
        session['search_keyword'] = keyword
        files = [s for s in files if keyword in s]
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = '''<script>
function keywordSearch(){
    var oform = document.forms["searchform"];
    // 取elements集合中 name 屬性為 keyword 的值
    var getKeyword = oform.elements.keyword.value;
    // 改為若表單為空, 則列出全部資料
    //if(getKeyword != ""){
        window.location = "?brython&keyword="+getKeyword;
    //}
}
</script>
    <form name="searchform">
    <input type="text" id="keyword" />
    <input type="button" id="send" value="查詢" onClick="keywordSearch()"/> 
    </form>
'''
    outstring += "<form name='filelist' method='post' action=''>"
    notlast = False
    if total_rows > 0:
        # turn off the page selector on top
        '''
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "brython?&amp;page=1&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>{{</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "brython?&amp;page="+str(page_num)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index>= 0 and index< totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>"+str(page)+" </font>"
                else:
                    outstring += "<a href='"
                    outstring += "brython?&amp;page="+str(page_now)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
                    outstring += "'>"+str(page_now)+"</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "brython?&amp;page="+str(nextpage)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "brython?&amp;page="+str(totalpage)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>}}</a><br /><br />"
        '''
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            outstring += loadlist_access_list(files, starti, endi, filedir) + "<br />"
        else:
            outstring += "<br /><br />"
            outstring += loadlist_access_list(files, starti, total_rows, filedir) + "<br />"

        if int(page) > 1:
            outstring += "<a href='"
            outstring += "/"+filedir + "?&amp;page=1&amp;item_per_page=" + str(item_per_page)+"&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>{{</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "/"+filedir + "?&amp;page=" + str(page_num)+"&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>Previous</a> "
        span = 5
        for index in range(int(page)-span, int(page)+span):
        #for ($j=$page-$range;$j<$page+$range;$j++)
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "/" + filedir + "?&amp;page=" + str(page_now) + \
                                      "&amp;item_per_page=" + str(item_per_page) + \
                                      "&amp;keyword="+str(session.get('search_keyword'))
                    outstring += "'>" + str(page_now) + "</a> "
        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "/" + filedir + "?&amp;page=" + str(nextpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "/" + filedir + "?&amp;page=" + str(totalpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>}}</a>"
    else:
        outstring += "no data!"
    #outstring += "<br /><br /><input type='submit' value='load'><input type='reset' value='reset'></form>"
    outstring += "<br /><br /></form>"

    return outstring


def loadlist_access_list(files, starti, endi, filedir):

    """Access loaded file list
    """

    # different extension files, associated links were provided
    # popup window to view images, video or STL files, other files can be downloaded directly
    # files are all the data to list, from starti to endi
    # add file size
    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileExtension = fileExtension.lower()
        fileSize = sizeof_fmt(os.path.getsize(config_dir + filedir + "_programs/" + files[index]))
        # images files
        if fileExtension == ".png" or fileExtension == ".jpg" or fileExtension == ".gif":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + \
                              '"><a href="javascript:;" onClick="window.open(\'/downloads/'+ \
                            files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> (' + str(fileSize) + ')<br />'
        # stl files
        elif fileExtension == ".stl":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + '"><a href="javascript:;" onClick="window.open(\'/static/viewstl.html?src=/static/' +  \
            files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> ('+str(fileSize)+')<br />'
        # flv files
        elif fileExtension == ".flv":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + '"><a href="javascript:;" onClick="window.open(\'/flvplayer?filepath=/downloads/' +  \
            files[index]+'\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> ('+str(fileSize)+')<br />'
        # py files
        elif fileExtension == ".py":
            outstring += '<input type="radio" name="filename" value="' + files[index] + '">' + files[index] + ' (' + str(fileSize) + ')<br />'
        # direct download files
        else:
            outstring += "<input type='checkbox' name='filename' value='" + files[index] + \
                             "'><a href='/" + filedir + "_programs/" + files[index] + "'>" + files[index] + "</a> (" + str(fileSize) + ")<br />"
    return outstring


@app.route('/login')
def login():

    """Login routine
    """

    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if not isAdmin():
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Login</h1><form method='post' action='checkLogin'> \
                Password:<input type='password' name='password'> \
    <input type='submit' value='login'></form> \
    </section></div></body></html>"
    else:
        return redirect('/edit_page')


@app.route('/logout')
def logout():

    """Logout routine
    """

    session.pop('admin_'+token , None)
    flash('已經登出!')
    return redirect(url_for('login'))


@app.route('/local_blog')
def local_blog():

    """Generate local blog files from markdown directory
    """

    if isAdmin():
        os.system("pelican markdown -o blog -s local_publishconf.py")
        head, level, page = parse_content()
        directory = render_menu(head, level, page)

        return set_css() + "<div class='container'><nav>" + \
                   directory + "</nav><section><h1>Local blog generated</h1>" + \
                   "Blog generated!<br/><br /></body></html>"
    else:
        return redirect("/login")


@app.route('/markdown_action', methods=['POST'])
def markdown_action():

    """Action for markdown_form
    """

    if isAdmin():
        import html
        markdown_dir = _curdir + "/markdown/"
        title = request.form['title']
        body = request.form['body']
        # see if need to unescape back to the original html
        body = html.unescape(body)
        # Create the markdown directory if it doesn't exist
        if not os.path.exists(markdown_dir):
            os.makedirs(markdown_dir)

        # Save the content to a file with the title as the filename
        filename = os.path.join(markdown_dir, f'{title}.md')
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(body.replace('\r\n', '\n'))

        head, level, page = parse_content()
        directory = render_menu(head, level, page)

        return set_css() + "<div class='container'><nav>" + \
                   directory + "</nav><section><h1>Markdown saved</h1>" + \
                   filename + " saved!<br/><br /><a href='/local_blog'>local_blog</a></body></html>"
    else:
        return redirect("/login")


@app.route('/markdown_form', methods=['GET'])
def markdown_form():

    """Web-based markdown file edit form
    """

    if isAdmin():
        try:
            file_to_edit = request.args.get('file')
        except:
            file_to_edit = ""
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        markdown_dir = _curdir + "/markdown/"
        filenames = [filename for filename in os.listdir(markdown_dir) if filename.endswith('.md')] if os.path.exists(markdown_dir) else []
        file_list = 'Existed Files: '
        for filename in filenames:
            file_list += f'{filename}, '
        if file_to_edit:
            edit_filename = os.path.join(markdown_dir, file_to_edit+".md")
        else:
            edit_filename = ""
        if os.path.exists(edit_filename):
            with open(edit_filename, 'r', encoding='utf-8') as file:
                content = file.read()
            # need to html.escape the content
            content = html_escape(content)
            outstring =  file_list + '''
            <form method="POST" action="/markdown_action">
                <label for="title">Title:</label>
                <input type="text" name="title" id="title" value=''' + file_to_edit+''' required>.md<br><br>
                <label for="body">Body:</label><br>
                <textarea name="body" id="body" rows="10" cols="50" required>'''+ content+'''</textarea><br><br>
                <input type="submit" value="Save">
            </form>
            '''
        else:
            outstring =  file_list + '''
            <form method="POST" action="markdown_action">
                <label for="title">Title:</label>
                <input type="text" name="title" id="title" required>.md<br><br>
                <label for="body">Body:</label><br>
                <textarea name="body" id="body" rows="10" cols="50" required>
---
Title: this is a template
Date: 2023-06-17 11:00
Category: Misc
Tags: 2023FallCAD
Slug: 2023-Fall-Intro-to-computer-aided-design
Author: yen
---

this is a template.

<!-- PELICAN_END_SUMMARY -->

Solid Edge
----
<pre class="brush:jscript">
</pre>
<pre class="brush: python">
</pre>
                </textarea><br><br>
                <input type="submit" value="Save">
            </form>
            '''
        return set_css() + "<div class='container'><nav>" + \
           directory + "</nav><section><h1>Markdown form</h1>" + \
           outstring + "</body></html>"
    else:
        return redirect("/login")


def parse_config():

    """Parse config
    """

    # if there is no config/config automatically generate one with content "admin"
    if not os.path.isfile(config_dir+"config"):
        # create config file if there is no config file
        # default password is admin
        password = "admin"
        hashed_password = hashlib.sha512(password.encode('utf-8')).hexdigest()
        with open(config_dir + "config", "w", encoding="utf-8") as f:
            f.write(hashed_password)

    # if there is no config/sitetitle automatically generate one with content "cmsimde"
    if not os.path.isfile(config_dir+"sitetitle"):
        # default sitetitle is "cmsimde"
        with open(config_dir + "sitetitle", "w", encoding="utf-8") as f:
            f.write("cmsimde")

    # read site_title from config/sitetitle
    site_title = file_get_contents(config_dir + "sitetitle")
    password = file_get_contents(config_dir + "config")

    return site_title, password


def _remove_h123_attrs(soup):

    """Remove h1-h3 tag attribute
    """

    tag_order = 0
    for tag in soup.find_all(['h1', 'h2', 'h3']):
        # 假如標註內容沒有字串
        #if len(tag.text) == 0:
        if len(tag.contents) ==0:
            # 且該標註為排序第一
            if tag_order == 0:
                tag.string = "First"
            else:
          # 若該標註非排序第一, 則移除無內容的標題標註
                tag.extract()
        # 針對單一元件的標題標註
        elif len(tag.contents) == 1:
            # 若內容非為純文字, 表示內容為其他標註物件
            if tag.get_text() == "":
                # 且該標註為排序第一
                if tag_order == 0:
                    # 在最前方插入標題
                    tag.insert_before(soup.new_tag('h1', 'First'))
                else:
                    # 移除 h1, h2 或 h3 標註, 只留下內容
                    tag.replaceWithChildren()
            # 表示單一元件的標題標註, 且標題為單一字串者
            else:
                # 判定若其排序第一, 則將 tag.name 為 h2 或 h3 者換為 h1
                if tag_order == 0 and tag.name != "h1":
                    tag.name = "h1"
            # 針對其餘單一字串內容的標註, 則保持原樣
        # 針對內容一個以上的標題標註
        #elif len(tag.contents) > 1:
        else:
            # 假如該標註內容長度大於 1
            # 且該標註為排序第一
            if tag_order == 0:
                # 先移除 h1, h2 或 h3 標註, 只留下內容
                #tag.replaceWithChildren()
                # 在最前方插入標題
                tag.insert_before(soup.new_tag('h1', 'First'))
            else:
                # 只保留標題內容,  去除 h1, h2 或 h3 標註
                # 為了與前面的內文區隔, 先在最前面插入 br 標註
                tag.insert_before(soup.new_tag('br'))
                # 再移除非排序第一的 h1, h2 或 h3 標註, 只留下內容
                tag.replaceWithChildren()
        tag_order = tag_order + 1

    return soup


def parse_content():

    """Use bs4 and re module functions to parse content.htm
    """

    #from pybean import Store, SQLiteWriter
    # if no content.db, create database file with cms table
    '''
    if not os.path.isfile(config_dir+"content.db"):
        library = Store(SQLiteWriter(config_dir+"content.db", frozen=False))
        cms = library.new("cms")
        cms.follow = 0
        cms.title = "head 1"
        cms.content = "content 1"
        cms.memo = "first memo"
        library.save(cms)
        library.commit()
    '''
    # if no content.htm, generate a head 1 and content 1 file
    if not os.path.isfile(config_dir+"content.htm"):
        return "Error: no content.htm"
        '''
        # create content.htm if there is no content.htm
        with open(config_dir + "content.htm", "w", encoding="utf-8") as f:
            f.write("<h1>head 1</h1>content 1")
        '''
    subject = file_get_contents(config_dir+"content.htm")
    # deal with content without content
    if subject == "":
        return "Error: no data in content.htm"
        '''
        # create content.htm if there is no content.htm
        with open(config_dir + "content.htm", "w", encoding="utf-8") as f:
            f.write("<h1>head 1</h1>content 1")
        subject = "<h1>head 1</h1>content 1"
        '''
    # initialize the return lists
    head_list = []
    level_list = []
    page_list = []
    # make the soup out of the html content
    soup = bs4.BeautifulSoup(subject, 'html.parser')
    # 嘗試解讀各種情況下的標題
    soup = _remove_h123_attrs(soup)
    # 改寫 content.htm 後重新取 subject
    with open(config_dir + "content.htm", "wb") as f:
        f.write(soup.encode("utf-8"))
    subject = file_get_contents(config_dir+"content.htm")
    # get all h1, h2, h3 tags into list
    htag= soup.find_all(['h1', 'h2', 'h3'])
    n = len(htag)
    # get the page content to split subject using each h tag
    temp_data = subject.split(str(htag[0]))
    if len(temp_data) > 2:
        subject = str(htag[0]).join(temp_data[1:])
    else:
        subject = temp_data[1]
    if n >1:
            # i from 1 to i-1
            for i in range(1, len(htag)):
                head_list.append(htag[i-1].text.strip())
                # use name attribute of h* tag to get h1, h2 or h3
                # the number of h1, h2 or h3 is the level of page menu
                level_list.append(htag[i-1].name[1])
                temp_data = subject.split(str(htag[i]))
                if len(temp_data) > 2:
                    subject = str(htag[i]).join(temp_data[1:])
                else:
                    subject = temp_data[1]
                # cut the other page content out of htag from 1 to i-1
                cut = temp_data[0]
                # add the page content
                page_list.append(cut)
    # last i
    # add the last page title
    head_list.append(htag[n-1].text.strip())
    # add the last level
    level_list.append(htag[n-1].name[1])
    temp_data = subject.split(str(htag[n-1]))
    # the last subject
    subject = temp_data[0]
    # cut the last page content out
    cut = temp_data[0]
    # the last page content
    page_list.append(cut)
    return head_list, level_list, page_list


def remove_special_characters(text):

    """Removes special characters from the given text.
    """
    # Define the set of special characters to remove
    special_chars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '[', ']', '{', '}', '|', '\\', '/',
                     ':', ';', '<', '>', ',', '.', '?', '`', '~', "'", '"']
    # Remove special characters from the text
    cleaned_text = ''.join(char for char in text if char not in special_chars)

    return cleaned_text


def render_menu(head, level, page, sitemap=0):

    """允許使用者在 h1 標題後直接加上 h3 標題, 或者隨後納入 h4 之後作為標題標註
    """

    directory = ""
    # 從 level 數列第一個元素作為開端
    current_level = level[0]
    # 若是 sitemap 則僅列出樹狀架構而沒有套用 css3menu 架構
    if sitemap:
        directory += "<ul>"
    else:
        directory += "<ul id='css3menu1' class='topmenu'>"
    # 逐一配合 level 數列中的各標題階次, 一一建立對應的表單或 sitemap
    for index in range(len(head)):
        # 用 this_level 取出迴圈中逐一處理的頁面對應層級, 注意取出值為 str
        this_level = level[index]
        # 若處理中的層級比上一層級高超過一層, 則將處理層級升級 (處理 h1 後直接接 h3 情況)
        if (int(this_level) - int(current_level)) > 1:
            #this_level = str(int(this_level) - 1)
            # 考慮若納入 h4 也作為標題標註, 相鄰層級可能大於一層, 因此直接用上一層級 + 1
            this_level = str(int(current_level) + 1)
        # 若處理的階次比目前已經處理的階次大, 表示位階較低
        # 其實當 level[0] 完全不會報告此一區塊
        # 從正在處理的標題階次與前一個元素比對, 若階次低, 則要加入另一區段的 unordered list 標頭
        # 兩者皆為 str 會轉為整數後比較
        if this_level > current_level:
            directory += "<ul>"
            directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
        # 假如正在處理的標題與前一個元素同位階, 則必須再判定是否為另一個 h1 的樹狀頭
        elif this_level == current_level:
            # 若正在處理的標題確實為樹狀頭, 則標上樹狀頭開始標註
            if this_level == 1:
                # 這裡還是需要判定是在建立 sitemap 模式或者選單模式
                if sitemap:
                    directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index]+"</a>"
                else:
                    directory += "<li class='topmenu'><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
            #  假如不是樹狀頭, 則只列出對應的 list
            else:
                directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
        # 假如正處理的元素比上一個元素位階更高, 必須要先關掉前面的低位階區段
        else:
            directory += "</li>"*(int(current_level) - int(level[index]))
            directory += "</ul>"*(int(current_level) - int(level[index]))
            if this_level == 1:
                if sitemap:
                    directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
                else:
                    directory += "<li class='topmenu'><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
            else:
                directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
        current_level = this_level
    directory += "</li></ul>"
    return directory


def render_menu2(head, level, page, sitemap=0):

    """Render menu for static site
    """

    site_title, password = parse_config()
    directory = '''
    <div class="site-wrap">

    <div class="site-mobile-menu">
      <div class="site-mobile-menu-header">
        <div class="site-mobile-menu-close mt-3">
          <span class="icon-close2 js-menu-toggle"></span>
        </div>
      </div>
      <div class="site-mobile-menu-body"></div>
    </div>

            <header class="site-navbar py-4 bg-white" role="banner">
              <div class="container">
                <div class="row align-items-center">
                <h1>''' + site_title + '''</h1>
                <div class="pl-4">
                    <form>
                    <input type="text" placeholder="Search" name="q" id="tipue_search_input" pattern=".{2,}" title="At least 2 characters" required>
                    </form>
                </div>
                  <!-- <div class="col-11 col-xl-2">
                    <h1 class="mb-0 site-logo"><a href="index.html" class="text-black h2 mb-0">''' + site_title + '''</a></h1> 
                  </div>
                  -->
                  <div class="col-12 col-md-10 d-none d-xl-block">
                    <nav class="site-navigation position-relative text-right" role="navigation">
    '''

    # 從 level 數列第一個元素作為開端, 第一個一定非 level 1 不可
    current_level = level[0]
    # 若是 sitemap 則僅列出樹狀架構而沒有套用 css3menu 架構
    if sitemap:
        directory += '''<ul>
<li>
<form>
<div class="tipue_search_group">
<input type="text" name="q" id="tipue_search_input" pattern=".{2,}" title="At least 2 characters" required><button type="submit" class="tipue_search_button"><div class="tipue_search_icon">&#9906;</div></button>
</div>
</form>
</li>
        '''
    else:
        directory += '''<ul class='site-menu js-clone-nav mr-auto d-none d-lg-block'>'''
    # 納入主頁與表單
    directory += '''
                        <li class="active has-children"><a href="index.html">Home</a>
                        <ul class="dropdown">
                            <li><a href="sitemap.html">SMap</a></li>
                            <li><a href="./../reveal/index.html">reveal</a></li>
                            <li><a href="./../blog/index.html">blog</a></li>
                        </ul>
                      </li>
                     '''
    # 逐一配合 level 數列中的各標題階次, 一一建立對應的表單或 sitemap
    for index in range(len(head)):
        # 用 this_level 取出迴圈中逐一處理的頁面對應層級, 注意取出值為 str
        this_level = level[index]
        # 若處理中的層級比上一層級高超過一層, 則將處理層級升級 (處理 h1 後直接接 h3 情況)
        if (int(this_level) - int(current_level)) > 1:
            #this_level = str(int(this_level) - 1)
            # 考慮若納入 h4 也作為標題標註, 相鄰層級可能大於一層, 因此直接用上一層級 + 1
            this_level = str(int(current_level) + 1)
        # 若處理的階次比目前已經處理的階次大, 表示位階較低
        # 其實當 level[0] 完全不會報告此一區塊
        # 從正在處理的標題階次與前一個元素比對, 若階次低, 則要加入另一區段的 unordered list 標頭
        # 兩者皆為 str 會轉為整數後比較
        # 目前的位階在上一個標題之後
        if this_level > current_level:
            directory += "<ul class='dropdown'>"
            # 是否加上 class=has-children, 視下一個而定
            # 目前處理的標題, 並不是最後一個, 因此有下一個標題待處理
            if index < (len(head)-1):
                next_level = level[index+1]
                if this_level < next_level:
                    # 表示要加上 class=dropdown
                    directory += "<li class='has-children'><a href='" + head[index] + ".html'>" + head[index] + "</a>"
                else:
                    directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
            else:
                #表示為最後一個
                directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        # 假如正在處理的標題與前一個元素同位階, 則必須再判定是否為另一個 h1 的樹狀頭
        # 目前標題與上一個標題相同
        elif this_level == current_level:
            # 是否加上 class=has-children, 視下一個而定
            # 目前處理的標題, 並不是最後一個, 因此有下一個標題待處理
            if index < (len(head)-1):
                next_level = level[index+1]
                if this_level < next_level:
                    # 表示要加上 class=dropdown
                    directory += "<li class='has-children'><a href='" + head[index] + ".html'>" + head[index] + "</a>"
                else:
                    directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
            else:
                #表示為最後一個
                directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        # 假如正處理的元素比上一個元素位階更高, 必須要先關掉前面的低位階區段
        else:
            directory += "</li>"*(int(current_level) - int(level[index]))
            directory += "</ul>"*(int(current_level) - int(level[index]))
            if index < (len(head)-1):
                next_level = level[index+1]
                if this_level < next_level:
                    # 表示要加上 class=dropdown
                    directory += "<li class='has-children'><a href='" + head[index] + ".html'>" + head[index] + "</a>"
                else:
                    directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
            else:
                #表示為最後一個
                directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        current_level = this_level
    directory += '''</li>
                      </ul>
                </nav>
              </div>
              <div class="d-inline-block d-xl-none ml-md-0 mr-auto py-3" style="position: relative; top: 3px;"><a href="#" class="site-menu-toggle js-menu-toggle text-black"><span class="icon-menu h3"></span></a></div>
              </div>

            </div>
          </div>

        </header>
    '''
    return directory


def render_menu3(head, level, page, sitemap=0):

    """Render menu for static sitemap
    """

    directory = ""
    current_level = level[0]
    if sitemap:
        directory += "<ul>"
    else:
        # before add tipue search function
        #directory += "<ul id='css3menu1' class='topmenu'>"
        directory += "<ul id='css3menu1' class='topmenu'><div class=\"tipue_search_group\"><input style=\"width: 6vw;\" type=\"text\" name=\"q\" id=\"tipue_search_input\" pattern=\".{2,}\" title=\"Press enter key to search\" required></div>"
    for index in range(len(head)):
        this_level = level[index]
        # 若處理中的層級比上一層級高超過一層, 則將處理層級升級 (處理 h1 後直接接 h3 情況)
        if (int(this_level) - int(current_level)) > 1:
            #this_level = str(int(this_level) - 1)
            this_level = str(int(current_level) + 1)
        if this_level > current_level:
            directory += "<ul>"
            #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
            # 改為連結到 content/標題.html
            directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        elif this_level == current_level:
            if this_level == 1:
                if sitemap:
                    # 改為連結到 content/標題.html
                    #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
                else:
                    #directory += "<li class='topmenu'><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li class='topmenu'><a href='content/" + head[index] + ".html'>" + head[index] + "</a>"
            else:
                #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        else:
            directory += "</li>"*(int(current_level) - int(level[index]))
            directory += "</ul>"*(int(current_level) - int(level[index]))
            if this_level == 1:
                if sitemap:
                    #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
                else:
                    #directory += "<li class='topmenu'><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li class='topmenu'><a href='" + head[index] + ".html'>" + head[index] + "</a>"
            else:
                #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        current_level = this_level
    directory += "</li></ul>"
    return directory


@app.route('/saveConfig', methods=['POST'])
def saveConfig():

    """Save Config setup file
    """

    if not isAdmin():
        return redirect("/login")
    site_title = request.form['site_title']
    password = request.form['password']
    password2 = request.form['password2']
    if site_title is None or password is None:
        return error_log("no content to save!")
    old_site_title, old_password = parse_config()
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if site_title is None or password is None or password2 != old_password or password == '':
        return set_css() + "<div class='container'><nav>" + \
                directory + "</nav><section><h1>Error!</h1><a href='/'>Home</a></body></html>"
    else:
        if password == password2 and password == old_password:
            hashed_password = old_password
        else:
            hashed_password = hashlib.sha512(password.encode('utf-8')).hexdigest()
        # save password to config/config, sitetitle to config/sitetitle
        # save sitetitle
        file = open(config_dir + "sitetitle", "w", encoding="utf-8")
        file.write(site_title)
        file.close()
        # save password
        file = open(config_dir + "config", "w", encoding="utf-8")
        file.write(hashed_password)
        file.close()
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>config file saved</h1><a href='/'>Home</a></body></html>"


@app.route('/savePage', methods=['POST'])
def savePage():

    """Save all pages function
    """

    page_content = request.form['page_content']
    # when element_format : "html", need to remove the annoying comment to prevent brython exec
    page_content = page_content.replace('// <![CDATA[', '')
    page_content = page_content.replace('// ]]>', '')
    # check if administrator
    if not isAdmin():
        return redirect("/login")
    if page_content is None:
        return error_log("no content to save!")
    # 在插入新頁面資料前, 先複製 content.htm 一分到 content_backup.htm
    shutil.copy2(config_dir + "content.htm", config_dir + "content_backup.htm")
    # in Windows client operator, to avoid textarea add extra \n
    # for ajax save comment the next line
    #page_content = page_content.replace("\n","")
    with open(config_dir + "content.htm", "w", encoding="utf-8") as f:
        f.write(page_content)
    return redirect("/edit_page")


def search_content(head, page, search):

    """Search content
    """

    find = lambda searchList, elem: [[i for i, x in enumerate(searchList) if x == e] for e in elem]
    search_result = find(head, [search])[0]
    page_order = []
    page_content = []
    for i in range(len(search_result)):
        # 印出次序
        page_order.append(search_result[i])
        # 標題為 head[search_result[i]]
        #  頁面內容則為 page[search_result[i]]
        page_content.append(page[search_result[i]])
        # 從 page[次序] 印出頁面內容
    # 準備傳回 page_order 與 page_content 等兩個數列
    return page_order, page_content


@app.route('/search_form', defaults={'edit': 1})
@app.route('/search_form/<path:edit>')
def search_form(edit):

    """Form of keyword search
    """

    if isAdmin():
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Search</h1> \
                 <form method='post' action='doSearch'> \
                 keywords:<input type='text' name='keyword'> \
                 <input type='submit' value='search'></form> \
                 </section></div></body></html>"
    else:
        return redirect("/login")


# setup static directory
@app.route('/static/<path:path>')
def send_file(path):

    """Send file function
    """

    return app.send_static_file(static_dir + path)


@app.route('/images/<path:path>')
def send_images(path):

    """Send image files
    """

    return send_from_directory(_curdir + "/images/", path)


# setup static directory
@app.route('/static/')
def send_static():

    """Send static files
    """

    return app.send_static_file('index.html')


# set_admin_css for administrator
def set_admin_css():

    """Set css for admin
    """

    server_ip = get_wan_address() or 'localhost'
    if "." in server_ip:
        server_address = str(server_ip) + ":" + str(static_port)
    else:
        server_address = "[" + str(server_ip) + "]:" + str(static_port)

    outstring = '''<!doctype html>
<html><head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>''' + init.Init.site_title + '''</title> \
<link rel="stylesheet" type="text/css" href="/static/cmsimply.css">
''' + syntaxhighlight()

    outstring += '''
<script src="/static/jquery.js"></script>
<script type="text/javascript">
$(function(){
    $("ul.topmenu> li:has(ul) > a").append('<div class="arrow-right"></div>');
    $("ul.topmenu > li ul li:has(ul) > a").append('<div class="arrow-right"></div>');
});
</script>
'''
    # SSL for uwsgi operation
    if uwsgi:
        outstring += '''
<script type="text/javascript">
if ((location.href.search(/http:/) != -1) && (location.href.search(/login/) != -1)) \
window.location= 'https://' + location.host + location.pathname + location.search;
</script>
'''
    site_title, password = parse_config()
    outstring += '''
</head><header><h1>''' + site_title + '''</h1> \
<confmenu>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/sitemap">SMap</a></li>
<li><a href="/edit_page">EditA</a></li>
<li><a href="''' + str(correct_url()) + '''/1">Edit</a></li>
<li><a href="/edit_config">Config</a></li>
<li><a href="/search_form">Search</a></li>
<li><a href="/imageuploadform">IUpload</a></li>
<li><a href="/image_list">IList</a></li>
<li><a href="/fileuploadform">FUpload</a></li>
<li><a href="/download_list">FList</a></li>
<li><a href="/logout">Logout</a></li>
<li><a href="/generate_pages">Convert</a></li>
'''
    # under uwsgi mode no start_static and static_port anchor links
    if uwsgi != True:
        outstring += '''
<li><a href="/acpform">acp</a></li>
<li><a href="/start_static/">SStatic</a></li>
<li><a href="/">RStatic</a></li>
<li><a href="http://'''+ server_address + '''">''' + str(static_port) + '''</a></li>
'''
    outstring += '''
</ul>
</confmenu></header>
'''
    return outstring


def set_css():

    """Set css for dynamic site
    """

    server_ip = get_wan_address() or 'localhost'
    if "." in server_ip:
        server_address = str(server_ip) + ":" + str(static_port)
    else:
        server_address = "[" + str(server_ip) + "]:" + str(static_port)

    outstring = '''<!doctype html>
<html><head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>''' + init.Init.site_title + '''</title> \
<link rel="stylesheet" type="text/css" href="/static/cmsimply.css">
<link rel="shortcut icon" href="/static/favicons.png">
''' + syntaxhighlight()

    outstring += '''
<script src="/static/jquery.js"></script>
<!-- for wink3 客製化關閉-->
<!--
<link rel="stylesheet" type="text/css" href="/static/winkPlayer.css" />
<script type="text/javascript" src="/static/winkPlayer.js"></script>
-->
<script type="text/javascript">
$(function(){
    $("ul.topmenu> li:has(ul) > a").append('<div class="arrow-right"></div>');
    $("ul.topmenu > li ul li:has(ul) > a").append('<div class="arrow-right"></div>');
});
</script>
'''
    if uwsgi:
        outstring += '''
<script type="text/javascript">
if ((location.href.search(/http:/) != -1) && (location.href.search(/login/) != -1)) \
window.location= 'https://' + location.host + location.pathname + location.search;
</script>
'''
    site_title, password = parse_config()
    outstring += '''
</head><header><h1>''' + site_title + '''</h1> \
<confmenu>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/sitemap">SMap</a></li>
'''
    if isAdmin():
        outstring += '''
<li><a href="/edit_page">EditA</a></li>
<li><a href="''' + str(correct_url()) + '''/1">Edit</a></li>
<li><a href="/edit_config">Config</a></li>
<li><a href="/search_form">Search</a></li>
<li><a href="/imageuploadform">IUpload</a></li>
<li><a href="/image_list">IList</a></li>
<li><a href="/fileuploadform">FUpload</a></li>
<li><a href="/download_list">FList</a></li>
<li><a href="/logout">Logout</a></li>
<li><a href="/generate_pages">Convert</a></li>
'''
        # under uwsgi mode no start_static and static_port  anchor links
        # only added when user login as admin
        if uwsgi != True:
            outstring += '''
<li><a href="/acpform">acp</a></li>
<li><a href="/start_static/">SStatic</a></li>
<li><a href="/">RStatic</a></li>
<li><a href="http://'''+ server_address + '''">''' + str(static_port) + '''</a></li>
'''
    else:
        outstring += '''
<li><a href="/login">Login</a></li>
'''
    outstring += '''
</ul>
</confmenu></header>
'''
    return outstring


def set_css2():

    """Set css for static site
    """

    static_head = '''
        <head>
        <title>''' + init.Init.site_title + '''</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link href="https://fonts.googleapis.com/css?family=Quicksand:300,400,500,700,900" rel="stylesheet">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/fonts/icomoon/style.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/bootstrap.min.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/magnific-popup.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/jquery-ui.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/owl.carousel.min.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/owl.theme.default.min.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/bootstrap-datepicker.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/fonts/flaticon/font/flaticon.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/aos.css">
        <link rel="stylesheet" href="./../cmsimde/static/chimper/css/style.css">
        <link rel="shortcut icon" href="./../cmsimde/static/favicons.png">

        <style type='text/css'>
            .site-section {
            background-color: #FFFF;
            padding: 40px 40px;
            }
            body > div > div.dropdown.open {
                display: block;
            }
        </style>
    '''
    outstring = '''<!DOCTYPE html><html>''' + static_head + '''
        <!-- <script src="./../cmsimde/static/jquery.js"></script> -->
        <!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> -->
        <script src="../cmsimde/static/chimper/js/jquery-3.3.1.min.js"></script>
        <link rel="stylesheet" href="./../cmsimde/static/tipuesearch/css/normalize.min.css">
        <script src="./../cmsimde/static/tipuesearch/tipuesearch_set.js"></script>
        <script src="tipuesearch_content.js"></script>
        <link rel="stylesheet" href="./../cmsimde/static/tipuesearch/css/tipuesearch.css">
        <script src="./../cmsimde/static/tipuesearch/tipuesearch.js"></script>
        <!-- for Wink3 客製化關閉 -->
        <!--
        <link rel="stylesheet" type="text/css" href="./../cmsimde/static/winkPlayer.css" />
        <script type="text/javascript" src="./../cmsimde/static/winkPlayer.js"></script>
        -->
        <script>
            /* original tipuesearch
            $(document).ready(function() {
                 $('#tipue_search_input').tipuesearch();
            });
            */
            // customed doSearch
            function doSearch() {
                $('#tipue_search_input').tipuesearch({
                    newWindow: true, 
                    minimumLength: 2,
                    wholeWords: false, // for search 中文
                });
            }
            $(document).ready(doSearch);
        </script>
        ''' + syntaxhighlight2()

    site_title, password = parse_config()
    if uwsgi:
        outstring += '''
<script type="text/javascript">
if ((location.href.search(/http:/) != -1) && (location.href.search(/login/) != -1)) \
window.location= 'https://' + location.host + location.pathname + location.search;
</script></head><body>
'''
    else:
        outstring += '''
</head>
<body>
'''
    return outstring


def set_footer():

    """Footer for page
    """

    return "<footer> \
        <a href='/edit_page'>EditA</a>| \
        <a href='" + str(correct_url) + "/1'>Edit</a>| \
        <a href='edit_config'>Config</a> \
        <a href='login'>Login</a>| \
        <a href='logout'>Logout</a> \
        <br />Powered by <a href='http://cmsimple.cycu.org'>CMSimply</a> \
        </footer> \
        </body></html>"


@app.route('/sitemap', defaults={'edit': 1})
@app.route('/sitemap/<path:edit>')
def sitemap(edit):

    """Sitemap for dynamic site
    """

    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    sitemap = render_menu(head, level, page, sitemap=1)
    return set_css() + "<div class='container'><nav>" + directory + \
             "</nav><section><h1>SMap</h1>" + sitemap + \
             "</section></div></body></html>"


def sitemap2(head):

    """Sitemap for static content generation
    """

    edit = 0
    not_used_head, level, page = parse_content()
    directory = render_menu2(head, level, page)
    # 先改為使用 render_menu3 而非 render_menu2
    sitemap = render_menu3(head, level, page, sitemap=1)
    # add tipue search id
    return set_css2() + "<div class='container'><nav>" + directory + \
             "</nav><section><h1>SMap</h1><div id=\"tipue_search_content\"></div>" + sitemap + \
             "</section></div></body></html>"


def sizeof_fmt(num):

    """Size formate
    """

    for x in ['bytes','KB','MB','GB']:
        if num < 1024.0:
            return "%3.1f%s" % (num, x)
        num /= 1024.0
    return "%3.1f%s" % (num, 'TB')


@app.route('/ssavePage', methods=['POST'])
def ssavePage():

    """Seperate save page function
    """

    page_content = request.form['page_content']
    # add an action for submit general save or collaborative csave
    # default value for action is "save", this is for editor menu Save button
    try:
        action = request.form['action']
    except:
        action = "save"
    # when element_format : "html", need to remove the annoying comment to prevent brython exec
    page_content = page_content.replace('// <![CDATA[', '')
    page_content = page_content.replace('// ]]>', '')
    # page_order 就是目前編輯後希望存檔的頁面順序, 以 hidden form 提供
    # 因為單頁編輯, 因此編輯頁面的次序在 content.htm 中為絕對值
    # 但一旦單頁編輯後產生新的頁面, 此 page_order 就應該重新讀取, 此即是各單頁編輯若建立其他分頁內容, 無法直接以 ajax 將內容送進 content.htm, 而必須存檔後 reload 頁面.
    page_order = request.form['page_order']
    if not isAdmin():
        return redirect("/login")
    if page_content is None:
        return error_log("no content to save!")
    # 請注意, 若啟用 fullpage plugin 這裡的 page_content tinymce4 會自動加上 html 頭尾標註
    # for ajax save comment the next line
    #page_content = page_content.replace("\n","")
    head, level, page = parse_content()
    original_head_title = head[int(page_order)]
    # 在插入新頁面資料前, 先複製 content.htm 一分到 content_backup.htm
    shutil.copy2(config_dir + "content.htm", config_dir + "content_backup.htm")
    if page_content != "":
        with open(config_dir + "content.htm", "w", encoding="utf-8") as file:
            for index in range(len(head)):
                if index == int(page_order):
                    if action == "save":
                        file.write(page_content)
                    else:
                        # make orig and new html content into list
                        newSoup = bs4.BeautifulSoup(page_content, "html.parser")
                        newList =[str(tag) for tag in newSoup.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'pre', 'ol', 'ul', 'script', 'table'])]
                        oldPage = page[index]
                        oldSoup = bs4.BeautifulSoup(oldPage, "html.parser")
                        oldList =[snTosr(tag) for tag in oldSoup.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'pre', 'ol', 'ul', 'script', 'table'])]
                        mergedList = merge_sequences(oldList, newList)
                        newContent = ""
                        for i in range(len(mergedList)):
                            newContent += mergedList[i]
                        file.write(newContent)
                else:
                    file.write("<h"+str(level[index])+ ">" + str(head[index]) + "</h" + \
                                  str(level[index])+">"+str(page[index]))
    else:
        return error_log("Error: no content to save!")
    # if every ssavePage generate_pages needed
    #generate_pages()

    # if head[int(page_order)] still existed and equal original_head_title, go back to origin edit status, otherwise go to "/"
    # here the content is modified, we need to parse the new page_content again
    head, level, page = parse_content()
    # for debug
    # print(original_head_title, head[int(page_order)])
    # 嘗試避免因最後一個標題刪除儲存後產生 internal error 問題
    if original_head_title is None:
        return redirect("/")
    try:
        if original_head_title == head[int(page_order)]:
            #edit_url = "/get_page/" + urllib.parse.quote_plus(head[int(page_order)]) + "&edit=1"
            #edit_url = "/get_page/" + urllib.parse.quote_plus(original_head_title) + "/1"
            edit_url = "/get_page/" + original_head_title + "/1"
            return redirect(edit_url)
        else:
            return redirect("/")
    except:
        return redirect("/")


@app.route('/start_static/')
def start_static():
    """Start local static server in http"""

    if isAdmin():
        server_address = get_wan_address() or 'localhost'
        server_port = static_port

        # Determine address family based on server_address
        address_family = socket.AF_INET if ':' not in server_address else socket.AF_INET6

        httpd = http.server.HTTPServer((server_address, server_port), http.server.SimpleHTTPRequestHandler, bind_and_activate=False)
        httpd.socket = socket.socket(address_family, socket.SOCK_STREAM)
        httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        if address_family == socket.AF_INET6:
            httpd.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
            httpd.socket.bind((server_address, server_port, 0, 0))
        else:
            httpd.socket.bind((server_address, server_port))

        httpd.server_activate()
        httpd.serve_forever()
    else:
        return redirect("/login")


def syntaxhighlight():

    """Return syntaxhighlight needed scripts
    """

    return '''
<script type="text/javascript" src="/static/syntaxhighlighter/shCore.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushBash.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushDiff.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushJScript.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushJava.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushPython.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushSql.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushHaxe.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushXml.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushPhp.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushPowerShell.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushLua.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushMojo.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushCpp.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushCss.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushCSharp.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushDart.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushRust.js"></script>
<link type="text/css" rel="stylesheet" href="/static/syntaxhighlighter/css/shCoreDefault.css"/>
<script type="text/javascript">SyntaxHighlighter.all();</script>
<!-- 暫時不用
<script src="/static/fengari-web.js"></script>
<script type="text/javascript" src="/static/Cango-13v08-min.js"></script>
<script type="text/javascript" src="/static/CangoAxes-4v01-min.js"></script>
<script type="text/javascript" src="/static/gearUtils-05.js"></script>
-->
<!-- for Brython 暫時不用
<script src="https://scrum-3.github.io/web/brython/brython.js"></script>
<script src="https://scrum-3.github.io/web/brython/brython_stdlib.js"></script>
-->
<style>
img.add_border {
    border: 3px solid blue;
}
</style>
'''


def syntaxhighlight2():

    """Return syntaxhighlight for static pages
    """

    return '''
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shCore.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushBash.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushDiff.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushJScript.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushJava.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushPython.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushSql.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushHaxe.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushXml.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushPhp.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushPowerShell.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushLua.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushMojo.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushCpp.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushCss.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushCSharp.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushDart.js"></script>
<script type="text/javascript" src="./../cmsimde/static/syntaxhighlighter/shBrushRust.js"></script>
<link type="text/css" rel="stylesheet" href="./../cmsimde/static/syntaxhighlighter/css/shCoreDefault.css"/>
<script type="text/javascript">SyntaxHighlighter.all();</script>
<!-- 暫時不用
<script src="./../cmsimde/static/fengari-web.js"></script>
<script type="text/javascript" src="./../cmsimde/static/Cango-13v08-min.js"></script>
<script type="text/javascript" src="./../cmsimde/static/CangoAxes-4v01-min.js"></script>
<script type="text/javascript" src="./../cmsimde/static/gearUtils-05.js"></script>
-->
<!-- for Brython 暫時不用
<script src="https://scrum-3.github.io/web/brython/brython.js"></script>
<script src="https://scrum-3.github.io/web/brython/brython_stdlib.js"></script>
-->
<style>
img.add_border {
    border: 3px solid blue;
}
</style>
'''


def tinymce_editor(menu_input=None, editor_content=None, page_order=None):

    """Tinymce editor scripts
    """

    sitecontent =file_get_contents(config_dir + "content.htm")
    editor = set_admin_css() + editorhead() + '''</head>''' + editorfoot()
    # edit all pages
    if page_order is None:
        outstring = editor + "<div class='container'><nav>" + \
                        menu_input + "</nav><section><form onsubmit='return save_all_data(this)'> \
                        <textarea class='simply-editor' name='page_content' cols='50' rows='15'>" +  \
                        editor_content + "</textarea><input type='button' onClick='save_all()' value='save'>"
        outstring +="""
        <script>
        // leave  warning when modification not saved
        window.addEventListener('beforeunload', function(e) {
        var myPageIsDirty = tinymce.activeEditor.isDirty()
        if(myPageIsDirty) {
            //following two lines will cause the browser to ask the user if they
            //want to leave. The text of this dialog is controlled by the browser.
            e.preventDefault(); //per the standard
            e.returnValue = ''; //required for Chrome
        }
        //else: user is allowed to leave without a warning dialog
        });

        function tempAlert(msg,duration)
            {
             var el = document.createElement("div");
             el.setAttribute("style","position:absolute;top:40%;left:20%;background-color:lightgreen;");
             el.innerHTML = msg;
             setTimeout(function(){
              el.parentNode.removeChild(el);
             },duration);
             document.body.appendChild(el);
            }

        function save_all(){
            tinymce.activeEditor.execCommand('mceSave');
        }

        function save_all_data(form) {
                var page_content = $('textarea#page_content').val();

                $.ajax({
                    type: "POST",
                    url: "/savePage",
                    data: {"page_content": page_content},
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        alert(XMLHttpRequest.status);
                        alert(XMLHttpRequest.readyState);
                        alert(textStatus);
                    },
                    success: function() {
                        //document.getElementById("notice").innerHTML = "saved!";
                        parser = new DOMParser();
                        parsed = parser.parseFromString(page_content, 'text/html');
                        paragraphs = parsed.querySelectorAll('h1, h2, h3');
                        //alert(paragraphs.length)
                        //tempAlert("saved!", 700);

                        if (paragraphs.length > 1 || paragraphs.length == 0)
                        {
                            // when no title page will cause reload to error page
                            //window.location.reload();
                            document.location.href="/";
                        }
                        else
                        {
                            tempAlert("saved!", 700);
                        }
                    }
                 }); 
        }
        </script>
        """
        outstring += "</form></section></body></html>"
    else:
        # add viewpage button while single page editing
        head, level, page = parse_content()
        outstring = "<p id='notice'></p>"
        outstring  += editor + "<div class='container'><nav>" + \
                        menu_input+"</nav><section><form onsubmit='return save_data(this)'> \
                        <textarea class='simply-editor' id='page_content' name='page_content' cols='50' rows='15'>" + \
                        editor_content + "</textarea><input type='hidden'  id='page_order' name='page_order' value='" + \
                        str(page_order) + "'>"
        # add an extra collaborative save button
        outstring += """<input type="button" onClick="ssave()"  value="save">"""
        outstring += """<input type="button" onClick="cssave()"  value="csave">"""

        outstring +="""
        <script>
        // leave  warning when modification not saved
        window.addEventListener('beforeunload', function(e) {
        var myPageIsDirty = tinymce.activeEditor.isDirty()
        if(myPageIsDirty) {
            //following two lines will cause the browser to ask the user if they
            //want to leave. The text of this dialog is controlled by the browser.
            e.preventDefault(); //per the standard
            e.returnValue = ''; //required for Chrome
        }
        //else: user is allowed to leave without a warning dialog
        });

        function tempAlert(msg,duration)
            {
             var el = document.createElement("div");
             el.setAttribute("style","position:absolute;top:40%;left:20%;background-color:lightgreen;");
             el.innerHTML = msg;
             setTimeout(function(){
              el.parentNode.removeChild(el);
             },duration);
             document.body.appendChild(el);
            }

        // default action is "save"
        var action ="save";

        function cssave(){
            action = "csave";
            tinymce.activeEditor.execCommand('mceSave');
        }

        function ssave(){
            action = "save";
            tinymce.activeEditor.execCommand('mceSave');
        }

        function save_data(form) {
                var page_content = $('textarea#page_content').val();
                var page_order = $('#page_order').val();

                $.ajax({
                    type: "POST",
                    url: "/ssavePage",
                    data: {"page_content": page_content, "page_order": page_order, "action": action},
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        alert(XMLHttpRequest.status);
                        alert(XMLHttpRequest.readyState);
                        alert(textStatus);
                    },
                    success: function() {
                        //document.getElementById("notice").innerHTML = "saved!";
                        parser = new DOMParser();
                        parsed = parser.parseFromString(page_content, 'text/html');
                        paragraphs = parsed.querySelectorAll('h1, h2, h3');
                        //alert(paragraphs.length)
                        //tempAlert("saved!", 700);

                        if (paragraphs.length > 1 || paragraphs.length == 0 )
                        {
                            //window.location.reload();
                            document.location.href="/";
                        }
                        else
                        {
                            tempAlert("saved!", 700);
                        }
                    }
                 }); 
        }
        </script>
        """
        outstring += '''<input type=button onClick="location.href='/get_page/''' + \
                    head[page_order] + \
                    ''''" value='viewpage'></form></section></body></html>'''
    return outstring

def unique(items):

    """Make items element unique
    """

    found = set([])
    keep = []
    count = {}
    for item in items:
        if item not in found:
            count[item] = 0
            found.add(item)
            keep.append(item)
        else:
            count[item] += 1
            keep.append(str(item) + "_" + str(count[item]))
    return keep


def merge_sequences(list1, list2):

    """Merge sequences
    """

    # Exit if list2 is empty
    if not len(list2):
        return list1
    # Copy the content of list2 into merged list
    merged = list2.copy()

    # Create a list for storing temporary elements
    elements = []
    # Create a variable for storing previous element found in both lists
    previous = None

    # Loop through the elements of list1
    for e in list1:
        # Append the element to "elements" list if it's not in list2
        if e not in merged:
            elements.append(e)

        # If it is in list2 (is a common element)
        else:

            # Loop through the stored elements
            for x in elements:
                # Insert all the stored elements after the previous common element
                merged.insert(previous and merged.index(previous) + 1 or 0, x)
            # Save new common element to previous
            previous = e
            # Empty temporary elements
            del elements[:]

    # If no more common elements were found but there are elements still stored
    if len(elements):
        # Insert them after the previous match
        for e in elements:
            merged.insert(previous and merged.index(previous) + 1 or 0, e)
    # Return the merged list
    return merged


# replace slash n with slash r
def snTosr(tag):

    """Replace slash n with slash r
    """

    tagStr = str(tag)
    # 只要編輯區標註有跳行內容者, 都需要轉換跳行符號
    if tag.name in ["pre", "script"]:
        return tagStr.replace("\n", "\r")
    else:
        return tagStr
if __name__ == "__main__":
    app.run()
