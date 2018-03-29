String.prototype.toTitleCase = function(n) {
   var s = this;
   if (1 !== n) s = s.toLowerCase();
   return s.replace(/(^|\s)[a-z]/g,function(f){return f.toUpperCase()});
}

var tables = [];
var table_ids = [];
var loaders = [];
var expanded = true;
$(window).resize(function() {
    scaleFormHeight(expanded)
});
$(document).ready(function() {
    $('input.sw-checkbox').bootstrapSwitch({
        size: 'small',
        onText: 'Yes',
        offText: 'No',
    });

    if($('#ribbon').length > 0) {
        setupRibbon();
        scaleFormHeight(true);
    }

    $('#table_data').DataTable({
        "scrollX": true,
        "scrollY": '50vh',
        "scrollCollapse": true,
        "searching": false,
        "paging": false,
        "ordering": false,
        "lengthChange": false,
        "info": false,
    });
    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();

    if($('.alert').length > 0) {
        var windowWidth = window.innerWidth;
        var objWidth = 400;
        var left = (windowWidth / 2) - (objWidth / 2);
        $('.alert').css('left', left + 'px');
        setTimeout('hideAlert()', 15000);
    }

    InitJSTree("folder-view");
    InitJSTree("copy_move_folders");
    InitJSTree("extract_folders");
});

function DrawFolderTree(id, root_folder, folder_html) {
    $("#" + id).jstree('destroy');
    $('#' + id).empty();
    var folder_html = '<ul>' +
        '<li class="jstree-open">' +
            '<a href="' + root_folder + '" class="jstree-clicked"><strong>' + root_folder + '</strong></a>' +
            folder_html + 
        '</li>' +
    '</ul>'
    $('#' + id).html(folder_html);
    InitJSTree(id);
}

function InitJSTree(id) {
    
    $('#' + id).bind("select_node.jstree", function (e, data) {
                var href = data.node.a_attr.href
                if(id == 'folder-view') {
                    SetFolder(href);
                }
                else if(id == 'copy_move_folders') {
                    $('#copy_move_dest_path').val(href);
                }
                else if(id == 'extract_folders') {
                    $('#extract_dest_path').val(href);
                }
                return data.instance.open_node(data.node);
    }).jstree({
        "core" : {
            "multiple" : false,
            'themes': {'dots': false}
        },
        'plugins': ['changed', 'html_data'],
        
    });
}

function hideAlert() {
    $('.alert').fadeOut("slow");
}

function setupRibbon()
{
    var file_menu = [{ // {Object} [optional] file tab menu commands
         hint: "Click to see the file menu", // {String} [optional] hint for the header item
         name: "file", // {String} [required] menu name
         label: "File"
    }];
    if($('#logged_in').html().length == 0) {
        // Not Logged In
        var new_commands = [{
            hint: "Log In",
            name: "login", // {String} [required] command identifier
            label: "Log In",
            icon: "login.png", // {String} [optional] item icon
        }];

        var ribbons = [{
            label: "Login", // {String} [required]
            width: "40%",
            tools: [{
                type: 'buttons',
                size: 'large',
                items: 'break',
                commands:[{
                    hint: 'Login',
                    label: 'Login',
                    name: 'login',
                    icon: 'login.png'
                }]
            }]
        }]
    }
    else {
        var new_commands = [{
            hint: "Change Root Folder",
            name: "change-folder", // {String} [required] command identifier
            label: "Change Root",
            icon: "change_folder.png", // {String} [optional] item icon
        },
        {
            hint: "Log Out",
            name: "logout", // {String} [required] command identifier
            label: "Log Out",
            icon: "logout.png", // {String} [optional] item icon
        }];
        if($('#manager').length > 0) {
            var ribbons = [{
                label: "File/Folder Actions", // {String} [required]
                width: "40%",
                tools: [{
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'New Folder',
                        label: 'New Folder',
                        name: 'new-folder',
                        icon: 'new_folder.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'New File',
                        label: 'New File',
                        name: 'new-file',
                        icon: 'new_file.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Copy',
                        label: 'Copy',
                        name: 'copy',
                        icon: 'copy.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Move File',
                        label: 'Move File',
                        name: 'move-file',
                        icon: 'move_file.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Upload',
                        label: 'Upload',
                        name: 'upload',
                        icon: 'upload.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Download',
                        label: 'Download',
                        name: 'download',
                        icon: 'download.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Delete',
                        label: 'Delete',
                        name: 'delete',
                        icon: 'delete.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Properties',
                        label: 'Properties',
                        name: 'properties',
                        icon: 'properties.png'
                    }]
                }]
            }, 
            {
                label: 'Editor',
                width: "20%",
                tools: [{
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Rename',
                        label: 'Rename',
                        name: 'rename',
                        icon: 'rename.png'
                    }]
                }, 
                {
                    type: 'split-button',
                    size: 'large',
                    commands: [{
                        hint: 'Edit',
                        label: 'Edit',
                        name: 'edit',
                        icon: 'edit.png'
                    }]
                },
                {
                    type: 'split-button',
                    size: 'large',
                    commands: [{
                        hint: 'View',
                        label: 'View',
                        name: 'view',
                        icon: 'view.png'
                    }]
                }]
            }, 
            {
                label: 'Archive',
                width: "20%",
                tools: [{
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Compress',
                        label: 'Compress',
                        name: 'compress',
                        icon: 'compress.png'
                    }]
                }, 
                {
                    type: 'split-button',
                    size: 'large',
                    commands: [{
                        hint: 'Extract',
                        label: 'Extract',
                        name: 'extract',
                        icon: 'extract.png'
                    }]
                }]
            },
            {
                label: 'Repository',
                width: "10%",
                tools: [{
                    type: 'split-button',
                    size: 'large',
                    commands:[{
                        hint: 'Commit',
                        label: 'Commit Changes',
                        name: 'tfs-commit',
                        icon: 'tfs-commit.png'
                    }]
                }]
            }];
        }
        else {
            ribbons = [];
        }
    }
    for(var idx = 0; idx < new_commands.length; idx ++) {
        var cmd = new_commands[idx];
        file_menu.push(cmd);
    }

    window.ribbon1 = new window.AcidJs.Ribbon({
        //appIconUrl: "my-custom-app-icon.png", // {String} [optional] top left application icon
        //flat: true, // {Boolean} [optional] applies flat ribbon styles as in MS Office 2013 and above
        boundingBox: $("#ribbon"), // {jQueryDomObject} [required] ribbon bar placeholder element
        //cssClasses: [ // {Array} [optional] additional CSS classes to be applied to the boundingBox. Default: []
        //    "css-class-abc",
        //    "css-class-def",
        //    "css-class-ghi"
        //],
        loadCss: false, // {Boolean} [optional] if set to false, the stylesheet of the ribbon will not be loaded from the control, but you will have to register it on the page via the <link /> tag
        appRoot: "/static/img/", // {String} [optional] by default, URLS of the ribbon are resolved from the root. Here you can specify different folder
        //width: "1300px", // {String} [optional] width (max-width) of the ribbon in pixels of percentage. default: "100%"
        //minwidth: "1200px", // {String} [optional] min-width of the ribbon in pixels of percentage. default: "auto"
        config: {
            defaultSelectedTab: 0, // {Number} [optional] default selected tab, default: 0
            fileTabMenu: file_menu,
            tabs: [{
                label: "Home", // {String} [required] label for the tab button
                hint: "Go home", // {String} [optional] label for the tab button
                name: "tab-home", // {String} [optional] id of the tab. if not set, a GUID will be used
                enabled: true, // {Boolean} [optional] default: true
                visible: true, // {Boolean} [optional] default: true
                //props: { // {Object} [optional] custom tab properties (check http://ribbonjs.com/demos-custom-tool-and-tab-props for more info)
                //    tabSomething: 1,
                //    tabAnything: {},
                //    someArray: [1, 2, 3, 4]
                //},
                ribbons: ribbons
            }]
        }
    });

    window.ribbon1.getBoundingBox().on("acidjs-ribbon-tool-clicked", function(e, data){
        window.console.info("acidjs.ribbon event fired", e.type, data);
        $('.acidjs-ui-ribbon-dropdown').removeClass('acidjs-ui-ribbon-dropdown-open');
        
        if(data['command'] == 'new-folder') {
            NewItem('Folder');
        }
        else if(data['command'] == 'new-file') {
            NewItem('File');
        }
        else if(data['command'] == 'copy' || data['command'] == 'move-file')
        {
            CopyMove(data['command']);
        }
        else if(data['command'] == 'upload')
        {
            UploadFile();
        }
        else if(data['command'] == 'download')
        {
            DownloadFile();
        }
        else if(data['command'] == 'delete')
        {
            DeleteFiles();
        }
        else if(data['command'] == 'properties')
        {
            Properties();
        }
        else if(data['command'] == 'rename')
        {
            RenameFile();
        }
        else if(data['command'] == 'view')
        {
            ViewFile();
        }
        else if(data['command'] == 'edit')
        {
            EditFile();
        }
        else if(data['command'] == 'compress')
        {
            Compress();
        }
        else if(data['command'] == 'extract')
        {
            Extract();
        }
        else if(data['command'] == 'tfs-commit')
        {
            TFSCommit();
        }
        else if(data['command'] == 'logout') {
            location.href = "/logout";
        }
        else if(data['command'] == "login") {
            location.href = "/login";
        }
        else if(data['command'] == "change-folder") {
            location.href = "/change_folder";
        }
    });

    window.ribbon1.getBoundingBox().on("acidjs-ribbon-tab-changed", function(e, data){
        window.console.info("acidjs.ribbon event fired", e.type, data);
        $('.acidjs-ui-ribbon-dropdown').removeClass('acidjs-ui-ribbon-dropdown-open');
    });

    window.ribbon1.getBoundingBox().on("acidjs-ribbon-toggle", function(e, data){
        window.console.info("acidjs.ribbon event fired", e.type, data);
        scaleFormHeight(data['expanded']);
        expanded = data['expanded'];
    });

    window.ribbon1.getBoundingBox().on("acidjs-ribbon-ready", function(e, data){
        window.console.info("acidjs.ribbon event fired", e.type, data);

        // set some tools as disabled by default
        window.ribbon1.disableTools([
            'copy',
            'move-file',
            'download',
            'rename',
            'edit',
            'view',
            'compress',
            'extract',
            'tfs-commit',
            'delete',
            'properties'
        ]);

        if($('#manager').length <= 0) {
            window.ribbon1.disableTools(['change-folder']);
        }
        else {
            if(tfsEnabled()) {
                window.ribbon1.enableTools(['tfs-commit']);
            }
        }
    });

    window.ribbon1.init();
}

function tfsEnabled()
{
    var tfs = $('#tfs').val();
    if(tfs == true || tfs == 'true' || tfs == 'True') {
        return true;
    }
    return false;
}

function scaleFormHeight(ex) {
    ex = typeof ex !== 'undefined' ? ex : expanded;
    if(ex == true) {
        var height = window.innerHeight - 165;
    }
    else {
        var height = window.innerHeight - 60;
    }
    //alert(height);
    $('#folder-view').css('height', height + 'px');
    $('#file-view').css('height', height + 'px');
    $('.ace_editor').css('height', height + 'px');
}

function GetDateAsString(today) {
    year = today.getFullYear().toString();
    month = today.getMonth() + 1;
    if(month < 10) {
        month = '0' + month.toString();
    }
    else {
        month = month.toString();
    }
    day = today.getDate();
    if(day < 10) {
        day = '0' + day.toString();
    }
    else {
        day = day.toString();
    }

    return year + month + day;
}
function SelectAll(cls)
{
    $('.' + cls).each(function() {
        if(!$(this).is(':checked'))
            {
                $(this).click();
            }
    })
}

function UnSelectAll(chk_class) {
    $('.' + chk_class).each(function() {
        if($(this).is(':checked'))
        {
            $(this).click();
        }
    });
}

function ShowLoader(action, id) {
    if(loaders.length == 0) {
        var title = document.title;
        title = '[Busy] ' + title;
        document.title = title;
    }
    $('#' + id).show();
    $('#' + id + '_action').html(action);
    loaders.push(id);
}
function HideLoader(id)
{
    idx = loaders.indexOf(id);
    if(idx > -1) {
        loaders.splice(idx,1);
    }
    if(loaders.length == 0) {
        var title = document.title;
        title = title.replace('[Busy] ', '');
        document.title = title;
    }
    $('#' + id).hide();
}

function ShowModalLoader(modal, action)
{
    ShowLoader(action, modal + '_modal_loading');
    $('#' + modal + '_modal_content').hide();
}

function HideModalLoader(modal)
{
    HideLoader(modal + '_modal_loading');
    $('#' + modal + '_modal_content').show()
}


function HandleErrors(obj) {
    errors = "";
    for(var e = 0; e < obj.Errors.length; e ++) {
        errors += obj.Errors[e].Message + "\n";
    }
    return errors;
}

function CreateDynamicOption(value, text, selected) {
    var sel = ""
    if(typeof selected !== undefined && selected != undefined) {
        sel = "selected" 
    }
    return "<option class='dynamic_option' value='" + value + "' " + sel + ">" + text + "</option>";
}
function CreateDynamicListOption(value, text) {
    return "<li class='dynamic_option' id='" + value + "'>" + text + "</li>";
}

function SingleDimArrayAsString(arr, delim) {
    var str = "";
    for(var f = 0; f < arr.length; f ++) {
        if(str != "") {
            str += "|"
        }
        str += arr[f];
    }
    return str;
}

function PopulateDataTable(field_names, data, table_id) {
    table_id = typeof table_id !== 'undefined' ? table_id : 'de_data_table';
    var columns = [];
    
    for(var f = 0; f < field_names.length; f ++) {
        columns.push({
            data: field_names[f],
            title: field_names[f]
        });
    }

    _DestroyDataTable(table_id);

    var de_table = $('#' + table_id).DataTable( {
      "destroy": true,
      "data": data,
      "columns": columns
    });

    _AppendDataTable(de_table, table_id);
}

function _DestroyDataTable(table_id) {
    idx = arrayIndex(table_id, table_ids)
    if(idx != null) {
        tables[idx].destroy();
        tables.splice(idx, 1);
        table_ids.splice(idx, 1);
        $('#' + table_id + '_body').empty();
    }
}

function _DestroyOnlyDataTable(table_id) {
    idx = arrayIndex(table_id, table_ids)
    if(idx != null) {
        tables[idx].destroy();
        tables.splice(idx, 1);
        table_ids.splice(idx, 1);
    }
}

function _AppendDataTable(table, table_id) {
    tables.push(table);
    table_ids.push(table_id);
}

function arrayCompare(a1, a2) {
    if (a1.length != a2.length) return false;
    var length = a2.length;
    for (var i = 0; i < length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(typeof haystack[i] == 'object') {
            if(arrayCompare(haystack[i], needle)) return true;
        } else {
            if(haystack[i] == needle) return true;
        }
    }
    return false;
}

function arrayIndex(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i ++) {
        if(haystack[i] == needle) {
            return i;
        }
    }
    return null;
}
function addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
}

function AjaxCall(ajax_url, data, method, success_callback, error_callback) {
    $.ajax({
        type: method,
        url: ajax_url,
        data: data,
        success: success_callback,
        error: error_callback
    });
}

function GenerateAlias(obj_id, alias_id) {
    var alias = $('#' + obj_id).val().toLowerCase().replace(/ /g, '_');
    alias_field = $('#' + alias_id);
    if (alias_field.length > 0) {
        current_alias = alias_field.val();
        if(current_alias == "") {
            $('#' + alias_id).val(alias);
        }
    }
}

function ToggleAll(cls) {
    if($('#' + cls + '_all').is(':checked')) {
        SelectAll(cls);
    }
    else {
        UnSelectAll(cls);
    }
}

function DisableButton(button) {
    $('#' + button).attr('disabled', 'disabled');
}

function AbleButton(button) {
    $('#' + button).removeAttr('disabled');
}

function ListCheckCount(folder_type) {
    var cnt = 0;
    $('.' + folder_type + '_check').each(function() {
        if($(this).is(':checked')) {
            cnt += 1;
        }
    });

    return cnt;
}

function CheckedRows(folder_type) {
    ids = []
    $('.' + folder_type + '_check').each(function() {
        if($(this).is(':checked')) {
            ids.push($(this).val());
        }
    });

    return ids;
}

function ChangeShowRows(tool) {
    var rows = $('#show_rows').val();
    if(location.href.indexOf('?') == -1) {
        location.href = tool + "?r=" + rows;
    }
    else {
        location.href = tool + "&r=" + rows;
    }
}

function ResetModal(modal) {
    $('#' + modal).find('input').each(function() {
        $(this).empty();
    });
    $('#' + modal).find('select').each(function() {
        $(this).val('');
    });
}


function SubmitForm(form_type) {
    $('#' + form_type + "_form").submit();
}

function HideProjectDisableRootBox(url) {
    $('#project_selection').hide();
    $('#root_folder').val(url);
    $('#root_folder').attr('readonly', 'readonly');
}

function ShowProjectSelection() {
    $('#project_selection').show();
    ProjectSelectionChanged();
    $('#root_folder').attr('readonly', 'readonly');
}

function EnableRootBox() {
    $('#project_selection').hide();
    $('#root_folder').val('');
    $('#root_folder').removeAttr('readonly');
}

function ProjectSelectionChanged()
{
    var project = $('#project').val();
    var name_number = project.split(' - ');
    $('#root_folder').val('/projects/' + name_number[0]);
}

function SetFolder(path) {
    path = typeof path !== 'undefined' ? path : $('#current_folder').val();
    $('#current_folder').val(path);
    AjaxCall('/ajax/folder/get', {'path': path}, "POST", SetFolderSuccess, AjaxError)
}

function SetFolderSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        _DestroyDataTable('file_table');
        for(var idx = 0; idx < obj.Results.items.length; idx ++) {
            var item = obj.Results.items[idx];
            var html = '<tr>' + 
                '<td style="width:25px;text-align:center;"><input type="checkbox" class="file_table_check" id="file_table_check_' + item.id + '" value="' + item.id + '|' + item.path + '" onClick="FileFolderClicked();" /></td>' + 
                '<td style="width:35px;text-align:center;"><img src="/static/img/doc_icons/' + item.icon + '" alt="' + item.mime + '" title="' + item.mime + '" /></td>' +
                '<td style="width:300px;">' + item.name + '</td>' + 
                '<td style="width:100px;">' + item.size + '</td>' +
                '<td style="width:150px;">' + item.mtime + '</td>' +
            '<input type="hidden" name="edit" id="item_edit_' + item.id + '" value="' + item.edit + '" />' + 
            '<input type="hidden" name="view" id="item_view_' + item.id + '" value="' + item.view + '" />' + 
            '<input type="hidden" name="extract" id="item_extract_' + item.id + '" value="' + item.extract + '" />' + 
            '<input type="hidden" name="copy" id="item_copy_' + item.id + '" value="' + item.copy + '" />' + 
            '<input type="hidden" name="move" id="item_move_' + item.id + '" value="' + item.move + '" />' +
            '<input type="hidden" name="download" id="item_download_' + item.id + '" value="' + item.download + '" />' + 
            '</tr>';
            $('#file_table_body').append(html);
        }
        var table = $('#file_table').DataTable({
            "scrollX": true,
            "scrollY": '50vh',
            "scrollCollapse": true,
            "searching": false,
            "paging": false,
            "ordering": false,
            "lengthChange": false,
            "info": false,
        });
        _AppendDataTable(table, 'file_table');
        $('#tfs').val(obj.Results.tfs);
        FileFolderClicked();
    }
    else {
        alert(HandleErrors(obj));
    }
}

function AjaxError(msg) {
    console.log(msg);
    alert(msg);
}
function HandleErrors(obj) {
    errors = "";
    for(var e = 0; e < obj.Errors.length; e ++) {
        errors += obj.Errors[e].Message + "\n";
    }
    return errors;
}

function FileFolderClicked() {
    var checked = CheckedRows('file_table');
    window.ribbon1.disableTools([
        'copy',
        'move-file',
        'download',
        'rename',
        'edit',
        'view',
        'compress',
        'extract',
        'delete',
        'properties',
        'tfs-commit'
    ]);
    var enabled = []
    if(checked.length > 0) {
        enabled.push('delete');
        enabled.push('compress');
        enabled.push('move-file');
    }

    if(tfsEnabled()) {
        enabled.push('tfs-commit');
    }

    for(var idx = 0; idx < checked.length; idx ++) {
        var item = checked[idx].split('|');
        var id = item[0];

        var edit = $('#item_edit_' + id).val();
        var view = $('#item_view_' + id).val();
        var extract = $('#item_extract_' + id).val();
        var copy = $('#item_copy_' + id).val();
        var move = $('#item_move_' + id).val();
        var download = $('#item_download_' + id).val();
        //alert(name);
        if(checked.length == 1) {
            if(move == 'true') {
                enabled.push('rename');
            }
            if(copy == 'true') {
                enabled.push('copy');
            }
            if(extract == 'true') {
                enabled.push('extract');
            }
            if(edit == 'true') {
                enabled.push('edit');
            }
            if(view == 'true') {
                enabled.push('view');
            }
            if(download == 'true') {
                enabled.push('download');
            }
            enabled.push('properties');
            
        }
    }

    window.ribbon1.enableTools(enabled);
}

function FolderUp()
{
    var path = $('#current_folder').val();
    var path_parts = path.split('/');
    path_parts.pop()
    path = path_parts.join('/');

    GoToPath('folder-view', path);
}

function GoToPath(id, path) {
    $('#' + id + ' a').each(function() {
        if($(this).attr('href') == path) {
            $(this).click();
            /*$('html, body').animate({
                scrollTop: $("#" + $(this).attr('id')).offset().top
            }, 2000);*/
        }
    });
}

function TraverseOpenTree(id) {
    var current_folder = $('#current_folder').val();
    var root_folder = $('#root_folder').val();
    var r_folder_spl = root_folder.split('/');
    var c_folder_spl = current_folder.split('/');
    var path_arr = []
    for(var idx = 0; idx < c_folder_spl.length; idx ++) {
        path_arr.push(c_folder_spl[idx]);
        if(path_arr.length >= r_folder_spl.length) {
            path = path_arr.join('/');
            GoToPath(id, path)
        }
    }
}



function NewItem(type)
{
    $('#new_item_title').html(type);
    $('#new_item_current_folder').html($('#current_folder').val() + '/');
    if(type == 'Folder') {
        $('#go_to_item_text').html('Open Folder Upon Creation');
    }
    else {
        $('#go_to_item_text').html('Open File for Editing');
    }
    $('#new_item_modal').modal('show');
}

function NewItemSubmit()
{
    ShowModalLoader('new_item', 'Creating Item');
    var new_item_type = $('#new_item_title').html().toLowerCase();
    var current_folder = $('#current_folder').val();
    var new_item_name = $('#new_item_name').val();
    var go_to_item = $('#go_to_item').is(':checked');

    var data = {'current_folder': current_folder, 'name': new_item_name, 'go_to_item': go_to_item, 'root_folder': $('#root_folder').val()}
    var url = '/ajax/' + new_item_type + '/new';

    AjaxCall(url, data, "POST", NewItemSubmitSuccess, NewItemSubmitError);
}

function NewItemSubmitSuccess(data)
{
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        if(results.item_type == 'folder')
        {
            DrawFolderTree('folder-view', results.root_folder, results.folder_html);
            DrawFolderTree('copy_move_folders', results.root_folder, results.folder_html);
            DrawFolderTree('extract_folders', results.root_folder, results.folder_html);
            setTimeout(ProcessResult, 1500, results);
        }
        else {
            ProcessResult(results);
        }
    }
    else {
        alert(HandleErrors(obj));
        HideModalLoader('new_item');
    }
}

function NewItemSubmitError(msg) {
    AjaxError(msg);
    HideModalLoader('new_item');
}

function ProcessResult(results) {

    if(results.item_type == 'folder') {
        TraverseOpenTree('folder-view');
        GoToPath('folder-view', results.path);
    }
    else {
        SetFolder($('#current_folder').val());
        if(results.go_to_item)
        {
            if(results.file_editable) {
                EditFile(results.path);
            }
            else if(results.file_viewable) {
                ViewFile(results.path);
            }
        }   
    }
    HideModalLoader('new_item');
    $('#new_item_modal').modal('hide');
}

function CopyMove(action) {
    $('#copy_move_action').val(action);
    $('#copy_move_title').html(action);
    $('#copy_move_file').val(CheckedRows('file_table')[0]);
    TraverseOpenTree('copy_move_folders');
    GoToPath('copy_move_folders', $('#current_folder').val());
    $('#copy_move_modal').modal('show');
}
function CopyMoveSubmit() {
    var action = $('#copy_move_action').val();
    ShowModalLoader('copy_move', action + 'ing file');
    var dest_path = $('#copy_move_dest_path').val();
    var files = CheckedRows('file_table');
    var overwrite = $('#copy_move_overwrite').is(':checked');
    var url = '/ajax/file/' + action
    var data = {'dest_path': dest_path, 'files': files, 'current_folder': $('#current_folder').val(), 'overwrite': overwrite}

    AjaxCall(url, data, "POST", CopyMoveSubmitSuccess, CopyMoveSubmitError);
}
function CopyMoveSubmitSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        GoToPath('folder-view', results.path);
        $('#copy_move_modal').modal('hide');
    }
    else {
        alert(HandleErrors(obj));
    }
    HideModalLoader('copy_move');
}
function CopyMoveSubmitError(msg) {
    AjaxError(msg);
    HideModalLoader('copy_move');
}
function UploadFile() {
    $('#upload_dest_path').val($('#current_folder').val());
    $('#upload_modal').modal('show');
}
function DownloadFile()
{
    var dl_file = CheckedRows('file_table')[0];
    var dl_file_spl = dl_file.split('/');
    window.open('/download?dl=' + dl_file_spl[dl_file_spl.length - 1]);
}
function DeleteFiles() {
    var checked_items = ListCheckCount('file_table');
    $('#delete_title').html(checked_items);

    $('#delete_modal').modal('show');   
}

function DeleteSubmit()
{
    ShowModalLoader('delete', 'Deleting Files');
    var files = CheckedRows('file_table');
    var url = '/ajax/file/delete'
    var data = {'files': files}

    AjaxCall(url, data, "POST", DeleteSubmitSuccess, DeleteSubmitError);
}
function DeleteSubmitSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        DrawFolderTree('folder-view', $('#root_folder').val(), results.folders);
        DrawFolderTree('copy_move_folders', $('#root_folder').val(), results.folders);
        DrawFolderTree('extract_folders', $('#root_folder').val(), results.folders);
        TraverseOpenTree('folder-view');
        GoToPath('folder-view', $('#current_folder').val());
        $('#delete_modal').modal('hide');
    }
    else {
        alert(HandleErrors(obj));
        
    }
    HideModalLoader('delete');
}
function DeleteSubmitError(msg) {
    AjaxError(msg);
    HideModalLoader('delete');
}
function Properties()
{
    $('#properties_modal').modal('show');
    ShowModalLoader('properties', 'Getting Properties');
    var dl_file = CheckedRows('file_table')[0];
    var url = '/ajax/file/properties'
    var data = {'file': dl_file}
    AjaxCall(url, data, "POST", PropertiesSuccess, PropertiesError);
}
function PropertiesSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        $('#properties_icon').attr('src', '/static/img/doc_icons/' + results.icon);
        $('#properties_icon').attr('alt', results.mime);
        $('#properties_icon').attr('title', results.mime);

        $('#properties_name').html(results.name);
        $('#properties_mime').html(results.mime);
        $('#properties_size').html(results.size);
        $('#properties_owner').html(results.uid + '/' + results.gid);
        $('#properties_created').html(results.ctime);
        $('#properties_modified').html(results.mtime);
        $('#properties_accessed').html(results.atime);
    }
    else {
        alert(HandleErrors(obj));
        $('#properties_modal').modal('hide');
        
    }
    HideModalLoader('properties');
}
function PropertiesError(msg) {
    AjaxError(msg);
    HideModalLoader('delete');
    $('#properties_modal').modal('hide');
}
function RenameFile() {
    $('#rename_current_folder').html($('#current_folder').val() + '/');
    $('#rename_file').val(CheckedRows('file_table')[0]);
    $('#rename_modal').modal('show');
}
function RenameFileSubmit() {
    ShowModalLoader('rename', 'Renaming file');
    var dest_path = $('#current_folder').val();
    var rename_name = $('#rename_name').val();
    var file = $('#rename_file').val();

    var url = '/ajax/file/rename';
    var data = {'dest_path': dest_path, 'file': file, 'new_name': rename_name}
    AjaxCall(url, data, "POST", RenameFileSubmitSuccess, RenameFileSubmitError);
}

function RenameFileSubmitSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        GoToPath('folder-view', results.path);
        $('#rename_modal').modal('hide');
    }
    else {
        alert(HandleErrors(obj));
    }
    HideModalLoader('rename');
}

function RenameFileSubmitError(msg) {
    AjaxError(msg);
    HideModalLoader('rename');
}

function ViewFile(filename)
{
    dl_file = typeof filename !== 'undefined' ? filename : CheckedRows('file_table')[0];
    var dl_file_spl = dl_file.split('/');
    window.open('/view?f=' + dl_file_spl[dl_file_spl.length - 1]);
}

function EditFile(filename)
{
    dl_file = typeof filename !== 'undefined' ? filename : CheckedRows('file_table')[0];
    var dl_file_spl = dl_file.split('/');
    window.open('/edit?f=' + dl_file_spl[dl_file_spl.length - 1]);
}

function Compress()
{
    $('#compress_current_folder').html($('#current_folder').val() + '/');
    $('#compress_modal').modal('show');
}

function CompressSubmit()
{
    ShowModalLoader('compress', 'Creating archive');
    var dest_path = $('#current_folder').val();
    var compress_name = $('#compress_name').val();
    var compress_type = $('#compress_type').val();
    var compress_overwrite = $('#compress_overwrite').is(':checked');
    var files = CheckedRows('file_table');

    var url = "/ajax/file/compress"
    var data = {'dest_path': dest_path, 'name': compress_name, 'type': compress_type, 'files': files, 'overwrite': compress_overwrite}
    AjaxCall(url, data, "POST", CompressSubmitSuccess, CompressSubmitError);
}
function CompressSubmitSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        GoToPath('folder-view', results.path);
        $('#compress_modal').modal('hide');
    }
    else {
        alert(HandleErrors(obj));
    }
    HideModalLoader('compress');
}

function CompressSubmitError(msg) {
    AjaxError(msg);
    HideModalLoader('compress');
}
function Extract() {
    var selected_file = CheckedRows('file_table')[0]
    $('#extract_file').val(selected_file);
    $('#extract_title').html(selected_file.split('|')[0]);
    TraverseOpenTree('extract_folders');
    GoToPath('extract_folders', $('#current_folder').val());
    $('#extract_modal').modal('show');
}
function ExtractSubmit() {
    ShowModalLoader('extract', 'Extracting archive');
    var dest_path = $('#extract_dest_path').val();
    var file = $('#extract_file').val();
    var overwrite = $('#extract_overwrite').is(':checked');
    var go_to_item = $('#extract_go_to_item').is(':checked');
    var url = '/ajax/file/extract';
    var data = {'dest_path': dest_path, 'file': file, 'current_folder': $('#current_folder').val(), 'overwrite': overwrite, 'go_to_item': go_to_item}

    AjaxCall(url, data, "POST", ExtractSubmitSuccess, ExtractSubmitError);
}
function ExtractSubmitSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        DrawFolderTree('folder-view', $('#root_folder').val(), results.folders);
        DrawFolderTree('copy_move_folders', $('#root_folder').val(), results.folders);
        DrawFolderTree('extract_folders', $('#root_folder').val(), results.folders);
        TraverseOpenTree('folder-view');
        GoToPath('folder-view', results.path);
        $('#extract_modal').modal('hide');
    }
    else {
        alert(HandleErrors(obj));
    }
    HideModalLoader('extract');
}
function ExtractSubmitError(msg) {
    AjaxError(msg);
    HideModalLoader('extract');
}
function SaveContent(file, content, close_after) {
    var url = '/ajax/file/save';
    var data = {'file': file, 'content': content, 'close_after': close_after}
    AjaxCall(url, data, "POST", SaveContentSuccess, AjaxError);
}
function SaveContentSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        alert('Content Saved');
        if(results.close_after) {
            window.close();
        }
    }
    else {
        alert(HandleErrors(obj));
    }
}
function TFSCommit() {
    if(!tfsEnabled()) {
        alert('Folder not TFS Enabled');
        return false;
    }

    $('#tfs_modal').modal('show');
}

function TFSCommitSubmit() {
    ShowModalLoader('tfs', 'Committing Changes to TFS');
    var current_folder = $('#current_folder').val();
    var commit_message = $('#tfs_commit_message').val();
    if(commit_message == '') {
        alert('Enter a commit message');
        return false;
    }

    var url = '/ajax/tfs/commit';
    var data = {'path': current_folder, 'message': commit_message};

    AjaxCall(url, data, "POST", TFSCommitSubmitSuccess, TFSCommitSubmitError);
}

function TFSCommitSubmitSuccess(data) {
    obj = JSON.parse(data);
    if(obj.Status == "OK") {
        var results = obj.Results;
        DrawFolderTree('folder-view', $('#root_folder').val(), results.folders);
        DrawFolderTree('copy_move_folders', $('#root_folder').val(), results.folders);
        DrawFolderTree('extract_folders', $('#root_folder').val(), results.folders);
        TraverseOpenTree('folder-view');
        GoToPath('folder-view', $('#current_folder').val());
        alert(results.message);
        
        $('#tfs_modal').modal('hide');
    }
    else {
        alert(HandleErrors(obj));
    }
    HideModalLoader('tfs');
}
function TFSCommitSubmitError(msg) {
    AjaxError(msg);
    HideModalLoader('tfs');
}