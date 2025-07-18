$(document).ready(function() {
    // 创建数据库
    window.db = new Dexie('MyNotes');
    // 定义数据库版本和表结构
    db.version(1).stores({
        notes: 'id, notes'
    });

    // 查询一条数据
    async function get_note(id) {
        return await db.notes.get(id);
    }

    // 页面填充数据
    fetch('data/starred_repos.json?t_='+Date.now(),{headers: {'Cache-Control': 'no-cache'}})
        .then(response => response.json())
        .then(repos => {
            //收集语言类型并去重
            let languages = new Set([]);
            repos.forEach(repo => {
                let HTML = `
                    <div class="repo">
                        <div class="item">
                            <h4><a href="${repo.html_url}" target="_blank">${repo.full_name}</a></h4>
                            <p>Stars: ${repo.stargazers_count}</p>
                            <p>${repo.description || 'No description'}</p>
                            <p class="language">Language: ${repo.language || 'Unknown'}</p>
                            <p>Note: <button class="save_notes" id="${repo.id}">保存</button></p>
                            <textarea class="notes" id="note_${repo.id}"></textarea>
                        </div>
                    </div>
                `;
                languages.add(`${repo.language || 'Unknown'}`);
                // 展示到页面
                $('#repos').append(HTML);
            });
            return Array.from(languages);
        })
        .then(languages => {
            // 语言过滤控件
            $(language_filter).append(`<option value="All">All</option>`);
            languages.forEach(item => {
                $(language_filter).append(`<option value="${item}">${item}</option>`);
            });
            // 过滤事件绑定
            $(language_filter).change(function(){
                let language = $(language_filter).val();
                if('All' == language){
                    $(".repo").show();
                }else{
                    $(".repo").hide();
                    $("p.language").each(function(){
                        if($(this).text() == "Language: "+language){
                            $(this).parent().parent().show();
                        }
                    });
                }
            });
        })
        .then(function() {
            // 把备注加载到页面
            $(".notes").each(function() {
                const _this = $(this);
                const id = _this.attr("id").replace("note_", '');
                get_note(id).then(function(notes) {
                    if (notes !== undefined) {
                        _this.val(notes.notes);
                    }
                });
            });
        })
        .catch(error => console.error('Error loading repos:', error));

    // 保存数据按钮
    $("#repos").delegate(".save_notes", "click", function() {
        const id = $(this).attr("id");
        const note_id = "note_" + id;
        const notes = $("#" + note_id).val();
        db.notes.put({
            "id": id,
            "notes": notes
        }).then(alert("操作完成,数据已经保存到浏览器缓存"));
    });

    // 下载文件
    function downloadJson(jsonString, filename) {
        const blob = new Blob([jsonString], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    // 导出按钮
    $("#exportBtn").click(async function() {
        try {
            const exportData = {};
            
            for (const tableName of ['notes']) {
                if (db[tableName]) {
                    exportData[tableName] = await db[tableName].toArray();
                }
            }
            const jsonString = JSON.stringify(exportData, null, 2);
            downloadJson(jsonString, 'notes.json');
        } catch (error) {
            console.error('导出失败:', error);
        }
    });

    // 导入数据
    async function importNotes(jsonData) {
        try {
            // 开始事务
            await db.transaction('rw', db.tables, async () => {
                // 清空现有数据（可选）
                await Promise.all(db.tables.map(table => table.clear()));
                
                // 导入每张表的数据
                for (const tableName in jsonData) {
                    if (db[tableName]) {
                        await db[tableName].bulkAdd(jsonData[tableName]);
                    }
                }
            });
            
            console.log('数据导入成功');
        } catch (error) {
            console.error('导入失败:', error);
        }
    }

    // 导入按钮
    $("#importBtn").click(function() {
        $("#fileInput").click();
    });

    $("#fileInput").change(async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const fileContent = await file.text();
            const notesData = JSON.parse(fileContent);
            
            if (confirm('导入数据会先清空浏览器缓存的数据 是否继续？')) {
                await importNotes(notesData);
                alert('导入成功!');
                location.reload();
            }
        } catch (error) {
            console.error('Error importing notes:', error);
            alert('导入失败');
        }

        $("#fileInput").val("");
    });

    // 载入数据
    $("#loadBtn").click(async () => {
        fetch('data/notes.json?t_='+Date.now(),{headers: {'Cache-Control': 'no-cache'}})
            .then(response => response.json())
            .then(async data => {
                try {
                    if (confirm('导入数据会先清空浏览器缓存的数据 是否继续？')) {
                        await importNotes(data);
                        alert('载入成功!');
                        location.reload();
                    }
                } catch (error) {
                    console.error('Error importing notes:', error);
                    alert('载入失败');
                }
            })
            .catch(error => console.error('Error loading repos:', error));
    });
    // 只读化
    $("#readonly").click(function(){
        $('textarea').each(function() {
            var $textarea = $(this);
            var $div = $('<div></div>');
            
            // 保留内容
            $div.text($textarea.val());
            
            // 保留ID、类、样式和其他属性
            $textarea.attr('id') && $div.attr('id', $textarea.attr('id'));
            $textarea.attr('class') && $div.addClass($textarea.attr('class'));
            
            // 替换元素
            $textarea.replaceWith($div);
        });
    });
});